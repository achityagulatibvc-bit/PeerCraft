import React, { useState } from "react";
import {
  Play,
  Square,
  RotateCw,
  Copy,
  Check,
  Server,
  Layers,
  Users,
  HardDrive,
  Globe,
  ShieldCheck,
  ArrowRight,
  Flame,
  Compass,
} from "lucide-react";

interface ServerTabProps {
  clusterRunning: boolean;
  onToggleCluster: () => void;
  onNavigateTab: (tab: string) => void;
  serverIp: string;
}

export const ServerTab: React.FC<ServerTabProps> = ({
  clusterRunning,
  onToggleCluster,
  onNavigateTab,
  serverIp,
}) => {
  const [copiedIp, setCopiedIp] = useState(false);
  const [copiedDynIp, setCopiedDynIp] = useState(false);
  const [restartPending, setRestartPending] = useState(false);

  const dynIp = "peercraft.playit.gg:25577";

  const handleCopyIp = () => {
    navigator.clipboard.writeText(serverIp);
    setCopiedIp(true);
    setTimeout(() => setCopiedIp(false), 2000);
  };

  const handleCopyDynIp = () => {
    navigator.clipboard.writeText(dynIp);
    setCopiedDynIp(true);
    setTimeout(() => setCopiedDynIp(false), 2000);
  };

  const handleRestart = () => {
    setRestartPending(true);
    setTimeout(() => {
      setRestartPending(false);
    }, 2500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn select-none">
      {/* 1. Main Aternos-style Server Status Hero Banner */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-7 shadow-2xl relative overflow-hidden">
        {/* Ambient subtle glow based on status */}
        <div
          className={`absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none ${
            clusterRunning ? "bg-emerald-500/10" : "bg-rose-500/10"
          }`}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Server Identity & Status */}
          <div className="flex items-center gap-5">
            {/* Minecraft Server Avatar / Icon */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 p-1 shadow-xl flex items-center justify-center shrink-0 border border-emerald-500/30">
              <div className="w-full h-full bg-slate-950 rounded-[12px] flex items-center justify-center relative overflow-hidden">
                <Server className="w-9 h-9 text-emerald-400" />
                <div className="absolute bottom-1 right-1">
                  <span
                    className={`w-3.5 h-3.5 rounded-full border-2 border-slate-950 block ${
                      clusterRunning ? "bg-emerald-400 animate-pulse" : "bg-rose-500"
                    }`}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
                  peercraft.server
                </h1>
                <span
                  className={`px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                    clusterRunning
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                      : "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                  }`}
                >
                  {restartPending ? "Restarting..." : clusterRunning ? "Online" : "Offline"}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                PeerCraft Asymmetric Dynamic Cluster • Vanilla/Paper 1.20.4
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/25 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Cracked Allowed (TLauncher / SKLauncher)
                </span>
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/25 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  HuskSync Supabase PostgreSQL Active (38ms)
                </span>
              </div>
            </div>
          </div>

          {/* Big Action Buttons (Start / Stop / Restart) */}
          <div className="flex items-center gap-3 shrink-0">
            {clusterRunning ? (
              <>
                <button
                  onClick={handleRestart}
                  disabled={restartPending}
                  className="px-5 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold transition-all border border-slate-700 flex items-center gap-2 shadow-lg"
                >
                  <RotateCw className={`w-4 h-4 text-cyan-400 ${restartPending ? "animate-spin" : ""}`} />
                  Restart
                </button>
                <button
                  onClick={onToggleCluster}
                  className="px-7 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-black transition-all shadow-xl shadow-rose-600/30 flex items-center gap-2.5"
                >
                  <Square className="w-4 h-4 fill-current" />
                  Stop Server
                </button>
              </>
            ) : (
              <button
                onClick={onToggleCluster}
                className="px-9 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-base font-black transition-all shadow-2xl shadow-emerald-500/40 flex items-center gap-3"
              >
                <Play className="w-5 h-5 fill-current" />
                Start Server
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Connection Info Cards (Address & DynIP) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Address Card */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Server Address
            </span>
            <div className="text-xl font-mono font-black text-cyan-300 mt-1">
              {serverIp}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Primary public domain via Anycast</p>
          </div>

          <button
            onClick={handleCopyIp}
            className="px-4 py-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
          >
            {copiedIp ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copiedIp ? "Copied!" : "Copy"}
          </button>
        </div>

        {/* Dynamic IP Card */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Direct Ingress (DynIP)
            </span>
            <div className="text-xl font-mono font-black text-slate-200 mt-1">
              {dynIp}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Direct Playit.gg tunnel route</p>
          </div>

          <button
            onClick={handleCopyDynIp}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
          >
            {copiedDynIp ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copiedDynIp ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      {/* 3. Aternos-style Server Properties & Specifications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Software & Version */}
        <div
          onClick={() => onNavigateTab("software")}
          className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 cursor-pointer transition-all space-y-3 group shadow-md"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold uppercase tracking-wider">Software</span>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-black text-sm">
              P
            </div>
            <div>
              <div className="text-base font-black text-white">Paper / Bukkit</div>
              <div className="text-xs text-slate-400 font-mono">1.20.4 (Build #498)</div>
            </div>
          </div>
        </div>

        {/* Card 2: Players */}
        <div
          onClick={() => onNavigateTab("players")}
          className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all space-y-3 group shadow-md"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold uppercase tracking-wider">Players</span>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-black text-white">4 / 20 Online</div>
              <div className="text-xs text-emerald-400 font-medium">Slots Unlocked</div>
            </div>
          </div>
        </div>

        {/* Card 3: RAM & Heap */}
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold uppercase tracking-wider">Memory (RAM)</span>
            <span className="font-mono text-emerald-400 font-bold">42%</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <HardDrive className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="text-base font-black text-white font-mono">3.4 GB / 8.0 GB</div>
              {/* RAM Progress Bar */}
              <div className="mt-1.5 w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full w-[42%]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Cluster Health & Dimensions Telemetry */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Asymmetric Cluster Dimension Status
            </h3>
          </div>
          <button
            onClick={() => onNavigateTab("mesh")}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
          >
            Manage Nodes & Mesh <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">The Overworld</div>
              <div className="text-[11px] text-emerald-400 font-mono">20.0 TPS (Node A :25565)</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Nether & The End</div>
              <div className="text-[11px] text-emerald-400 font-mono">20.0 TPS (Node B :25566)</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Velocity Proxy</div>
              <div className="text-[11px] text-cyan-300 font-mono">Ingress :25577 (Edge Node)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
