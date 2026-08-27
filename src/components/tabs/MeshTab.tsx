import React, { useState, useEffect } from "react";
import { Radio, Compass, Flame, RefreshCw, Key } from "lucide-react";
import { JoinClusterModal } from "../modals/JoinClusterModal";

interface NodeTelemetry {
  node_id?: string;
  node_name?: string;
  host: string;
  port: number;
  status: string;
}

export const MeshTab: React.FC = () => {
  const [topology, setTopology] = useState<{
    overworld: NodeTelemetry;
    nether_end: NodeTelemetry;
    proxy: { node_id?: string; public_domain: string; status: string };
  }>({
    overworld: {
      node_name: "Desktop-Host (You)",
      host: "127.0.0.1",
      port: 25565,
      status: "ACTIVE",
    },
    nether_end: {
      node_name: "Alex-Gaming-Rig",
      host: "127.0.0.1",
      port: 25566,
      status: "ACTIVE",
    },
    proxy: {
      public_domain: "mc.peercraft.live",
      status: "ACTIVE",
    },
  });

  const [loading, setLoading] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  const clusterSecret = "PEERCRAFT_DEV_SHARED_SECRET_2026";

  const loadTopology = async () => {
    if ((window as any).__TAURI_IPC__) {
      try {
        setLoading(true);
        const { invoke } = await import("@tauri-apps/api/tauri");
        const res = await invoke<any>("get_cluster_topology");
        if (res && res.servers) {
          setTopology({
            overworld: res.servers.overworld || topology.overworld,
            nether_end: res.servers.nether_end || topology.nether_end,
            proxy: res.proxy || topology.proxy,
          });
        }
      } catch (err) {
        console.warn("Could not reach Cloudflare Worker topology endpoint, using default local topology:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadTopology();
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn select-none">
      <JoinClusterModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        clusterSecret={clusterSecret}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Cluster Nodes & Dimensions</h2>
          <p className="text-sm text-slate-400 mt-1">
            Workload is automatically split across peer computers to keep gameplay lag-free.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setInviteModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-blue-600/30"
          >
            <Key className="w-3.5 h-3.5" />
            Invite Co-Host
          </button>
          <button
            onClick={loadTopology}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh Topology
          </button>
        </div>
      </div>

      {/* 3 Big Node Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Node 1: Overworld Primary */}
        <div className="p-6 rounded-3xl bg-slate-900 border-2 border-blue-500/50 shadow-xl shadow-blue-500/10 space-y-5">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Compass className="w-6 h-6" />
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Primary Node
            </span>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white">The Overworld</h3>
            <p className="text-xs text-slate-400 mt-1">
              Host: <strong className="text-slate-200">{topology.overworld.node_name || "Assigned Node"}</strong>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Health / Speed:</span>
              <span className="font-bold text-emerald-400">20.0 TPS (100%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Status:</span>
              <span className="font-bold text-emerald-400">{topology.overworld.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Internal Port:</span>
              <span className="font-mono text-cyan-300">:{topology.overworld.port}</span>
            </div>
          </div>
        </div>

        {/* Node 2: Nether & End Secondary */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Flame className="w-6 h-6" />
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Secondary Node
            </span>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white">Nether & The End</h3>
            <p className="text-xs text-slate-400 mt-1">
              Host: <strong className="text-slate-200">{topology.nether_end.node_name || "Assigned Node"}</strong>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Health / Speed:</span>
              <span className="font-bold text-emerald-400">20.0 TPS (100%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Status:</span>
              <span className="font-bold text-emerald-400">{topology.nether_end.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Internal Port:</span>
              <span className="font-mono text-purple-300">:{topology.nether_end.port}</span>
            </div>
          </div>
        </div>

        {/* Node 3: Ingress / Relay */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Radio className="w-6 h-6" />
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Anycast Ingress
            </span>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white">Velocity Gateway</h3>
            <p className="text-xs text-slate-400 mt-1">Playit.gg Anycast Tunnel & Audio</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Domain:</span>
              <span className="font-mono font-bold text-cyan-300">{topology.proxy.public_domain}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Cracked Mode:</span>
              <span className="font-bold text-amber-400">Supported</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Status:</span>
              <span className="font-bold text-emerald-400">{topology.proxy.status}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
