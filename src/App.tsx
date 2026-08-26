import { useState } from "react";
import {
  Server,
  Play,
  Square,
  Zap,
  Globe,
  Users,
  Copy,
  Check,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  Layers,
  Terminal,
} from "lucide-react";
import { ClusterTopology, ClusterRoleInfo } from "./components/ClusterTopology";
import { BenchmarkModal, BenchmarkData } from "./components/BenchmarkModal";
import { DimensionStatus } from "./components/DimensionStatus";
import { FailoverAlert, FailoverEvent } from "./components/FailoverAlert";
import { ConsoleViewer } from "./components/ConsoleViewer";
import { PterodactylPanel } from "./components/PterodactylPanel";
import { AdminAuthModal } from "./components/AdminAuthModal";

export function App() {
  const [clusterRunning, setClusterRunning] = useState(true);
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [benchmarkOpen, setBenchmarkOpen] = useState(false);
  const [isBenchmarking, setIsBenchmarking] = useState(false);

  // View state & Admin Authentication
  const [isAdmin, setIsAdmin] = useState(true); // Default to true or authenticated for local admin
  const [adminAuthModalOpen, setAdminAuthModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"client" | "pterodactyl">("client");

  const currentNodeId = "node_local_desktop";

  const [benchmarkData, setBenchmarkData] = useState<BenchmarkData>({
    cpuSingleThreadScore: 2940,
    availableRamMb: 16384,
    upstreamBandwidthMbps: 65,
    pingMs: 14,
    compositeScore: 4802.0,
  });

  const [roles] = useState<{
    primary?: ClusterRoleInfo;
    secondary?: ClusterRoleInfo;
    edge?: ClusterRoleInfo;
  }>({
    primary: {
      node_id: currentNodeId,
      node_name: "Desktop-Host (You)",
      role: "primary",
      dimension: "overworld",
      port: 25565,
      status: "ACTIVE",
      tps: 20.0,
      connected_players: 3,
    },
    secondary: {
      node_id: "node_peer_alex",
      node_name: "Alex-Gaming-Rig",
      role: "secondary",
      dimension: "nether_end",
      port: 25566,
      status: "ACTIVE",
      tps: 20.0,
      connected_players: 1,
    },
    edge: {
      node_id: "node_peer_sam",
      node_name: "Sam-Laptop",
      role: "edge",
      status: "ACTIVE",
    },
  });

  const [failover] = useState<FailoverEvent | null>(null);

  const [logs, setLogs] = useState([
    {
      id: "1",
      timestamp: "09:35:10",
      source: "velocity" as const,
      level: "INFO" as const,
      message: "Velocity proxy 3.3.0 initialized on 0.0.0.0:25577 (online-mode=false, force-key-authentication=false).",
    },
    {
      id: "2",
      timestamp: "09:35:12",
      source: "overworld" as const,
      level: "INFO" as const,
      message: "PaperMC Overworld instance bound to internal port 25565 [Cracked/TLauncher Mode]. HuskSync connected.",
    },
    {
      id: "3",
      timestamp: "09:35:13",
      source: "nether_end" as const,
      level: "INFO" as const,
      message: "PaperMC Nether & End instance bound to internal port 25566. World borders synchronized.",
    },
    {
      id: "4",
      timestamp: "09:36:00",
      source: "system" as const,
      level: "INFO" as const,
      message: "Playit Anycast tunnel established: mc.peercraft.live -> Edge:25577 (Offline & Premium Supported)",
    },
  ]);

  const handleCopyDomain = () => {
    navigator.clipboard.writeText("mc.peercraft.live");
    setCopiedDomain(true);
    setTimeout(() => setCopiedDomain(false), 2000);
  };

  const handleRunBenchmark = () => {
    setIsBenchmarking(true);
    setTimeout(() => {
      setBenchmarkData({
        cpuSingleThreadScore: Math.floor(2800 + Math.random() * 300),
        availableRamMb: 16384,
        upstreamBandwidthMbps: Math.floor(50 + Math.random() * 25),
        pingMs: Math.floor(10 + Math.random() * 8),
        compositeScore: 4750 + Math.floor(Math.random() * 150),
      });
      setIsBenchmarking(false);
    }, 2000);
  };

  const toggleCluster = () => {
    setClusterRunning((prev) => !prev);
    const newLog = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
      source: "system" as const,
      level: "INFO" as const,
      message: clusterRunning
        ? "Stopping local node daemons and saving chunks..."
        : "Dynamic cluster elected. Joining mesh as Primary Node (Overworld)...",
    };
    setLogs((l) => [newLog, ...l]);
  };

  return (
    <div className="flex flex-col h-screen bg-[#0b0f17] text-slate-100 overflow-hidden font-sans">
      {/* Top Navigation / App Title Bar */}
      <header className="px-6 py-3.5 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-purple-600 to-cyan-500 p-0.5 shadow-lg shadow-blue-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Server className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black tracking-tight text-white">PeerCraft</h1>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30">
                v0.2.0 Sharded Cluster
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                Cracked Mode (Online-Mode: False)
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Asymmetric Dynamic Distributed Host</p>
          </div>
        </div>

        {/* View Mode Switcher & Admin Role Gate */}
        <div className="flex items-center gap-3">
          {/* Switcher between Player View and Pterodactyl Panel (Only visible/active for Admin) */}
          {isAdmin ? (
            <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-xl p-1 text-xs">
              <button
                onClick={() => setViewMode("client")}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                  viewMode === "client"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Cluster View
              </button>
              <button
                onClick={() => setViewMode("pterodactyl")}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                  viewMode === "pterodactyl"
                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                Pterodactyl Panel
              </button>
            </div>
          ) : null}

          {/* Admin Role Status / Unlock Button */}
          <button
            onClick={() => setAdminAuthModalOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              isAdmin
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
                : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
            }`}
            title="Manage Admin Privileges"
          >
            {isAdmin ? (
              <>
                <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                Admin Mode Active
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                Unlock Admin
              </>
            )}
          </button>

          {/* Public Ingress & Status Widget */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <Globe className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono font-bold text-slate-200">mc.peercraft.live</span>
            <button
              onClick={handleCopyDomain}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              title="Copy Server Address"
            >
              {copiedDomain ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="font-mono font-bold text-white">4</span>
            <span className="text-slate-500">/ 20 Online</span>
          </div>

          <button
            onClick={() => setBenchmarkOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/20 transition-all"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Rig Benchmark
          </button>

          <button
            onClick={toggleCluster}
            className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-xl transition-all shadow-lg ${
              clusterRunning
                ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/25"
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25"
            }`}
          >
            {clusterRunning ? (
              <>
                <Square className="w-3.5 h-3.5" />
                Stop Cluster
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                Launch Cluster
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Body - Conditional Rendering: Pterodactyl Admin View VS Client Mesh View */}
      {viewMode === "pterodactyl" && isAdmin ? (
        <div className="flex-1 overflow-hidden">
          <PterodactylPanel onBackToClient={() => setViewMode("client")} />
        </div>
      ) : (
        <main className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* Failover Alert (if any) */}
          <FailoverAlert failover={failover} />

          {/* Cracked / Offline Mode Status Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                  Server Online-Mode: False (TLauncher / Cracked Clients Supported)
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Both official Mojang and offline cracked players (TLauncher, SKLauncher) can connect directly via <code className="text-cyan-300 font-bold">mc.peercraft.live</code>.
                </p>
              </div>
            </div>
            {isAdmin && (
              <button
                onClick={() => setViewMode("pterodactyl")}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                Open Pterodactyl Panel &rarr;
              </button>
            )}
          </div>

          {/* Section 1: Dynamic Node Cluster Topology */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                  Dynamic Node Role Topology
                </h2>
                <p className="text-xs text-slate-500">
                  Elects roles automatically based on single-thread CPU and available RAM.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Cluster State: <strong className="text-slate-200">RUNNING (3 Nodes)</strong>
              </div>
            </div>
            <ClusterTopology roles={roles} currentNodeId={currentNodeId} />
          </section>

          {/* Section 2: Dimension Metrics (Overworld vs Nether/End) */}
          <section>
            <div className="mb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                Dimension Shard Telemetry
              </h2>
              <p className="text-xs text-slate-500">
                Independent PaperMC instances decoupled across peer machines via Velocity Proxy.
              </p>
            </div>
            <DimensionStatus
              overworldMetrics={{ tps: 20.0, players: 3, chunksLoaded: 1024, memoryMb: 3400, status: "ONLINE" }}
              netherMetrics={{ tps: 20.0, players: 1, chunksLoaded: 480, memoryMb: 1800, status: "ONLINE" }}
            />
          </section>

          {/* Section 3: Live Tabbed Console Viewer */}
          <section>
            <ConsoleViewer logs={logs} onClearLogs={() => setLogs([])} />
          </section>
        </main>
      )}

      {/* Hardware Benchmark Modal */}
      <BenchmarkModal
        isOpen={benchmarkOpen}
        isBenchmarking={isBenchmarking}
        benchmarkData={benchmarkData}
        onRunBenchmark={handleRunBenchmark}
        onClose={() => setBenchmarkOpen(false)}
      />

      {/* Admin Authentication & Passkey Modal */}
      <AdminAuthModal
        isOpen={adminAuthModalOpen}
        isAdmin={isAdmin}
        onAuthenticate={(success) => {
          setIsAdmin(success);
          if (success) setViewMode("pterodactyl");
        }}
        onClose={() => setAdminAuthModalOpen(false)}
      />
    </div>
  );
}

export default App;
