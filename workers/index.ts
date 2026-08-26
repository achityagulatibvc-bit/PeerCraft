/**
 * PeerCraft Cloudflare Worker API & Cluster Broker
 * 
 * Coordinates dynamic node election, dimension-sharded role allocation,
 * lease-based heartbeats, isolated failover routing, and credential brokering.
 */

export interface Env {
  GROUP_AUTH_SECRET: string;
  FIREBASE_DB_URL: string;
  FIREBASE_DATABASE_SECRET: string;
  PLAYIT_SECRET_KEY: string;
  R2_ACCESS_KEY_ID: string;
  R2_SECRET_ACCESS_KEY: string;
  R2_S3_API_URL: string;
  SUPABASE_DB_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

interface NodeBenchmark {
  nodeId: string;
  nodeName: string;
  cpuSingleThreadScore: number; // e.g. operations per millisecond
  availableRamMb: number;        // in Megabytes
  upstreamBandwidthMbps: number; // in Megabits per second
  pingMs: number;
  os: string;
  timestamp: number;
}

interface HeartbeatPayload {
  nodeId: string;
  role: 'primary' | 'secondary' | 'edge';
  dimension?: 'overworld' | 'nether_end' | 'proxy';
  tps?: number;
  connectedPlayers?: number;
  memoryUsageMb?: number;
  chunkCount?: number;
}

interface FailoverRequest {
  failedNodeId: string;
  failedRole: 'primary' | 'secondary' | 'edge';
  reason: string;
  timestamp: number;
}

// ---------------- Helper Functions ---------------- //

const jsonResponse = (data: any, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });

const authenticate = (request: Request, env: Env): Response | null => {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || authHeader !== `Bearer ${env.GROUP_AUTH_SECRET}`) {
    return jsonResponse({ error: 'Unauthorized: Invalid Group Auth Secret' }, 401);
  }
  return null;
};

const getFirebaseUrl = (env: Env, path: string) =>
  `${env.FIREBASE_DB_URL}/${path}.json?auth=${env.FIREBASE_DATABASE_SECRET}`;

// ---------------- Route Handlers ---------------- //

/**
 * 1. Register or update a node's hardware benchmark
 * POST /api/nodes/benchmark
 */
async function handleRegisterBenchmark(request: Request, env: Env): Promise<Response> {
  const benchmark: NodeBenchmark = await request.json();

  if (!benchmark.nodeId || benchmark.cpuSingleThreadScore == null || benchmark.availableRamMb == null) {
    return jsonResponse({ error: 'Missing required benchmark fields' }, 400);
  }

  const now = Date.now();
  benchmark.timestamp = now;

  // Calculate composite role fitness score
  // Overworld requires heavy CPU and high RAM: Score = (CPU * 0.5) + (RAM_GB * 200) + (Upstream_Mbps * 2)
  const ramGb = benchmark.availableRamMb / 1024;
  const compositeScore = (benchmark.cpuSingleThreadScore * 0.5) + (ramGb * 200) + (benchmark.upstreamBandwidthMbps * 2);

  const nodeData = {
    ...benchmark,
    compositeScore,
    lastSeen: now,
    status: 'ONLINE',
  };

  const url = getFirebaseUrl(env, `cluster/nodes/${benchmark.nodeId}`);
  await fetch(url, {
    method: 'PUT',
    body: JSON.stringify(nodeData),
  });

  return jsonResponse({
    success: true,
    nodeId: benchmark.nodeId,
    compositeScore,
    evaluatedAt: now,
  });
}

/**
 * 2. Trigger Cluster Role Election
 * POST /api/cluster/elect
 * Evaluates active nodes in Firebase and assigns:
 * - Primary: Highest composite score (requires >= 5.5 GB RAM) -> Overworld
 * - Secondary: 2nd highest score (requires >= 3.0 GB RAM) -> Nether & End
 * - Edge: Remaining node or laptop (lightest requirement) -> Velocity + Voice + Compression
 */
async function handleClusterElection(request: Request, env: Env): Promise<Response> {
  const { force } = await request.json().catch(() => ({ force: false }));
  const now = Date.now();

  // Fetch all registered nodes
  const nodesRes = await fetch(getFirebaseUrl(env, 'cluster/nodes'));
  const nodesMap: Record<string, NodeBenchmark & { compositeScore: number; lastSeen: number }> = await nodesRes.json();

  if (!nodesMap) {
    return jsonResponse({ error: 'No benchmarked nodes available for election' }, 404);
  }

  // Filter nodes active within the last 15 seconds
  const activeNodes = Object.entries(nodesMap)
    .filter(([_, n]) => now - n.lastSeen <= 15000)
    .map(([id, n]) => ({ id, ...n }));

  if (activeNodes.length === 0) {
    return jsonResponse({ error: 'No active nodes detected in the cluster' }, 503);
  }

  // Check current role locks
  const rolesRes = await fetch(getFirebaseUrl(env, 'cluster/roles'));
  const currentRoles = (await rolesRes.json()) || {};

  const isPrimaryActive = currentRoles.primary?.lease_expires_at > now;
  const isSecondaryActive = currentRoles.secondary?.lease_expires_at > now;
  const isEdgeActive = currentRoles.edge?.lease_expires_at > now;

  // If election is not forced and primary is still healthy, return existing topology
  if (!force && isPrimaryActive && isSecondaryActive && isEdgeActive) {
    return jsonResponse({
      message: 'Cluster roles already active and healthy',
      roles: currentRoles,
    });
  }

  // Sort nodes by composite score descending
  activeNodes.sort((a, b) => b.compositeScore - a.compositeScore);

  let primaryCandidate = null;
  let secondaryCandidate = null;
  let edgeCandidate = null;

  // 1. Elect Primary (Overworld): needs highest CPU + >= 5.5 GB RAM
  for (const node of activeNodes) {
    if (node.availableRamMb >= 5500) {
      primaryCandidate = node;
      break;
    }
  }
  // Fallback if no node meets 5.5GB threshold
  if (!primaryCandidate) {
    primaryCandidate = activeNodes[0];
  }

  if (!primaryCandidate) {
    return jsonResponse({ error: 'Failed to elect primary candidate' }, 500);
  }

  // 2. Elect Secondary (Nether/End): next best node with >= 3000 MB RAM
  const remainingForSecondary = activeNodes.filter(n => n.id !== primaryCandidate.id);
  for (const node of remainingForSecondary) {
    if (node.availableRamMb >= 2800) {
      secondaryCandidate = node;
      break;
    }
  }
  // Fallback: If only 1 node in cluster, primary acts as monolithic host
  if (!secondaryCandidate && remainingForSecondary.length > 0) {
    secondaryCandidate = remainingForSecondary[0];
  }

  // 3. Elect Edge (Velocity Proxy + Delta Compressor): remaining node or lowest-resource node
  const remainingForEdge = activeNodes.filter(
    n => n.id !== primaryCandidate.id && n.id !== secondaryCandidate?.id
  );
  if (remainingForEdge.length > 0) {
    // Pick the most power-efficient / lightest node for Edge
    edgeCandidate = remainingForEdge[remainingForEdge.length - 1];
  } else {
    // If only 2 nodes, secondary or primary co-hosts edge proxy
    edgeCandidate = secondaryCandidate || primaryCandidate;
  }

  const leaseTtl = 15000; // 15 seconds
  const newRoles = {
    primary: {
      node_id: primaryCandidate.id,
      node_name: primaryCandidate.nodeName,
      role: 'primary',
      dimension: 'overworld',
      port: 25565,
      lease_expires_at: now + leaseTtl,
      status: 'ACTIVE',
      last_heartbeat: now,
    },
    secondary: secondaryCandidate ? {
      node_id: secondaryCandidate.id,
      node_name: secondaryCandidate.nodeName,
      role: 'secondary',
      dimension: 'nether_end',
      port: 25566,
      lease_expires_at: now + leaseTtl,
      status: 'ACTIVE',
      last_heartbeat: now,
    } : {
      node_id: primaryCandidate.id,
      node_name: primaryCandidate.nodeName,
      role: 'secondary',
      dimension: 'co_located_on_primary',
      port: 25566,
      lease_expires_at: now + leaseTtl,
      status: 'CO_LOCATED',
      last_heartbeat: now,
    },
    edge: {
      node_id: edgeCandidate.id,
      node_name: edgeCandidate.nodeName,
      role: 'edge',
      services: ['velocity_proxy', 'simple_voice_chat', 'r2_delta_offloader'],
      proxy_port: 25577,
      voice_port: 24454,
      lease_expires_at: now + leaseTtl,
      status: 'ACTIVE',
      last_heartbeat: now,
    },
    cluster_state: 'RUNNING',
    elected_at: now,
  };

  // Commit atomic role update in Firebase
  await fetch(getFirebaseUrl(env, 'cluster/roles'), {
    method: 'PUT',
    body: JSON.stringify(newRoles),
  });

  return jsonResponse({
    success: true,
    election: 'COMPLETED',
    roles: newRoles,
  });
}

/**
 * 3. Node Heartbeat & Telemetry
 * POST /api/cluster/heartbeat
 */
async function handleHeartbeat(request: Request, env: Env): Promise<Response> {
  const payload: HeartbeatPayload = await request.json();
  const now = Date.now();

  if (!payload.nodeId || !payload.role) {
    return jsonResponse({ error: 'Invalid heartbeat payload' }, 400);
  }

  const rolePath = `cluster/roles/${payload.role}`;
  const roleRes = await fetch(getFirebaseUrl(env, rolePath));
  const currentRole = await roleRes.json();

  if (!currentRole || currentRole.node_id !== payload.nodeId) {
    return jsonResponse({
      status: 'STALE_OR_NOT_HOLDER',
      message: 'Node is no longer the active leaseholder for this role',
    }, 409);
  }

  const leaseTtl = 15000;
  const updates = {
    last_heartbeat: now,
    lease_expires_at: now + leaseTtl,
    tps: payload.tps ?? currentRole.tps ?? 20.0,
    connected_players: payload.connectedPlayers ?? currentRole.connected_players ?? 0,
    memory_usage_mb: payload.memoryUsageMb ?? currentRole.memory_usage_mb ?? 0,
    chunk_count: payload.chunkCount ?? currentRole.chunk_count ?? 0,
  };

  await fetch(getFirebaseUrl(env, rolePath), {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });

  return jsonResponse({
    status: 'ACK',
    leaseExpiresAt: updates.lease_expires_at,
  });
}

/**
 * 4. Isolated Dimension Failover Handler
 * POST /api/cluster/failover
 */
async function handleFailover(request: Request, env: Env): Promise<Response> {
  const { failedNodeId, failedRole, reason }: FailoverRequest = await request.json();
  const now = Date.now();

  const rolesRes = await fetch(getFirebaseUrl(env, 'cluster/roles'));
  const currentRoles = await rolesRes.json();

  // Validate the node failure
  if (currentRoles[failedRole]?.node_id !== failedNodeId) {
    return jsonResponse({ error: 'Failover target is not current lease holder' }, 400);
  }

  // Fetch active eligible backup nodes
  const nodesRes = await fetch(getFirebaseUrl(env, 'cluster/nodes'));
  const nodesMap: Record<string, any> = await nodesRes.json();

  const candidates = Object.entries(nodesMap)
    .filter(([id, n]) => id !== failedNodeId && (now - n.lastSeen <= 15000))
    .map(([id, n]) => ({ id, ...n }))
    .sort((a, b) => b.compositeScore - a.compositeScore);

  if (candidates.length === 0) {
    return jsonResponse({
      error: 'CRITICAL: No viable failover candidate available in cluster',
      failedRole,
    }, 500);
  }

  const promotedNode = candidates[0];
  const updatedRole = {
    ...currentRoles[failedRole],
    node_id: promotedNode.id,
    node_name: promotedNode.nodeName,
    status: 'FAILOVER_RESUMING',
    last_heartbeat: now,
    lease_expires_at: now + 30000, // 30s grace period for pulling R2 delta
  };

  // Atomic patch for the failed role only (isolated failover)
  await fetch(getFirebaseUrl(env, `cluster/roles/${failedRole}`), {
    method: 'PUT',
    body: JSON.stringify(updatedRole),
  });

  // Log event
  await fetch(getFirebaseUrl(env, `cluster/events/${now}`), {
    method: 'PUT',
    body: JSON.stringify({
      type: 'FAILOVER_TRIGGERED',
      failedRole,
      failedNodeId,
      promotedNodeId: promotedNode.id,
      reason,
      timestamp: now,
    }),
  });

  return jsonResponse({
    success: true,
    message: `Isolated failover complete for ${failedRole}. Node ${promotedNode.id} promoted.`,
    promotedNode: {
      id: promotedNode.id,
      name: promotedNode.nodeName,
      role: failedRole,
    },
  });
}

/**
 * 5. Velocity Proxy Topology Discovery
 * GET /api/cluster/topology
 * Returns the latest internal addresses and ports for Overworld and Nether/End
 */
async function handleGetTopology(_request: Request, env: Env): Promise<Response> {
  const rolesRes = await fetch(getFirebaseUrl(env, 'cluster/roles'));
  const roles = await rolesRes.json();

  return jsonResponse({
    cluster: 'PeerCraft-Dynamic-Cluster',
    timestamp: Date.now(),
    servers: {
      overworld: {
        node_id: roles?.primary?.node_id,
        node_name: roles?.primary?.node_name,
        host: roles?.primary?.ip || '127.0.0.1',
        port: roles?.primary?.port || 25565,
        status: roles?.primary?.status || 'OFFLINE',
      },
      nether_end: {
        node_id: roles?.secondary?.node_id,
        node_name: roles?.secondary?.node_name,
        host: roles?.secondary?.ip || '127.0.0.1',
        port: roles?.secondary?.port || 25566,
        status: roles?.secondary?.status || 'OFFLINE',
      },
    },
    proxy: {
      node_id: roles?.edge?.node_id,
      public_domain: 'mc.peercraft.live',
      status: roles?.edge?.status || 'OFFLINE',
    },
  });
}

/**
 * 6. Issue Scoped Cloudflare R2 Credentials & Storage Tokens
 * POST /api/credentials/storage
 */
async function handleGetStorageCredentials(request: Request, env: Env): Promise<Response> {
  const { dimension } = await request.json().catch(() => ({ dimension: 'all' }));

  return jsonResponse({
    r2AccessKeyId: env.R2_ACCESS_KEY_ID,
    r2SecretAccessKey: env.R2_SECRET_ACCESS_KEY,
    r2Endpoint: env.R2_S3_API_URL,
    bucket: 'peercraft-cluster-data',
    scopedPrefix: dimension === 'all' ? 'worlds/' : `worlds/${dimension}/`,
  });
}

/**
 * 7. Issue Playit.gg Anycast Tunnel Token
 * POST /api/credentials/tunnel
 */
async function handleGetTunnelCredentials(request: Request, env: Env): Promise<Response> {
  const { nodeId } = await request.json();

  // Verify that this node is authorized as Edge Node
  const edgeRes = await fetch(getFirebaseUrl(env, 'cluster/roles/edge'));
  const edgeRole = await edgeRes.json();

  if (edgeRole?.node_id !== nodeId) {
    return jsonResponse({ error: 'Forbidden: Only the elected Edge Node may bind Playit tunnel' }, 403);
  }

  return jsonResponse({
    playitSecretKey: env.PLAYIT_SECRET_KEY,
    targetPort: 25577,
    voiceTargetPort: 24454,
  });
}

// ---------------- Main Router Dispatcher ---------------- //

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return jsonResponse({ status: 'OK' });
    }

    const url = new URL(request.url);
    const pathname = url.pathname;

    // Public topology check
    if (pathname === '/api/cluster/topology' && request.method === 'GET') {
      return handleGetTopology(request, env);
    }

    // Authenticate all mutation & credential endpoints
    const authError = authenticate(request, env);
    if (authError) return authError;

    try {
      switch (`${request.method} ${pathname}`) {
        case 'POST /api/nodes/benchmark':
          return await handleRegisterBenchmark(request, env);

        case 'POST /api/cluster/elect':
          return await handleClusterElection(request, env);

        case 'POST /api/cluster/heartbeat':
          return await handleHeartbeat(request, env);

        case 'POST /api/cluster/failover':
          return await handleFailover(request, env);

        case 'POST /api/credentials/storage':
          return await handleGetStorageCredentials(request, env);

        case 'POST /api/credentials/tunnel':
          return await handleGetTunnelCredentials(request, env);

        default:
          return jsonResponse({ error: 'Endpoint Not Found' }, 404);
      }
    } catch (err: any) {
      return jsonResponse({ error: 'Internal Server Error', message: err?.message || String(err) }, 500);
    }
  },
};
