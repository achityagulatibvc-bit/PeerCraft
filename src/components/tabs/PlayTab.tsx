import React, { useState } from "react";
import {
  Copy,
  Check,
  ShieldCheck,
  Users,
  Play,
  Square,
  Zap,
  Gamepad2,
  Wifi,
} from "lucide-react";

interface PlayTabProps {
  clusterRunning: boolean;
  onToggleCluster: () => void;
  onNavigateTab: (tab: string) => void;
  isAdmin: boolean;
}

export const PlayTab: React.FC<PlayTabProps> = ({
  clusterRunning,
  onToggleCluster,
  onNavigateTab,
  isAdmin,
}) => {
  const [copied, setCopied] = useState(false);
  const serverIp = "mc.peercraft.live";

  const handleCopy = () => {
    navigator.clipboard.writeText(serverIp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
      {/* Big Hero Card: 1-Click Join */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 p-8 shadow-2xl">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="px-3.5 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                SERVER ONLINE
              </span>
              <span className="px-3.5 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                CRACKED & TLAUNCHER ALLOWED
              </span>
            </div>

            <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
              PeerCraft Minecraft World
            </h2>
            <p className="text-slate-400 text-sm lg:text-base max-w-xl leading-relaxed">
              Decentralized peer-to-peer Minecraft host. Join directly from TLauncher, SKLauncher, or Official Minecraft Java Edition.
            </p>
          </div>

          {/* Primary Big Power Toggle */}
          <button
            onClick={onToggleCluster}
            className={`px-8 py-4 rounded-2xl text-base font-black transition-all shadow-xl flex items-center justify-center gap-3 shrink-0 ${
              clusterRunning
                ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30"
                : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-emerald-500/30"
            }`}
          >
            {clusterRunning ? (
              <>
                <Square className="w-5 h-5 fill-current" />
                Stop Server
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                Launch Server
              </>
            )}
          </button>
        </div>

        {/* Big 1-Click Copy Bar */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Server Address (IP)
            </span>
            <div className="text-2xl font-mono font-black text-cyan-300 mt-0.5">
              {serverIp}
            </div>
          </div>

          <button
            onClick={handleCopy}
            className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 self-start sm:self-auto"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5 text-emerald-300" />
                <span className="text-emerald-200">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                Copy Server IP
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3 Large Simple Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Online Players */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-400">Capacity: 20 Max</span>
          </div>
          <div>
            <div className="text-3xl font-black text-white">4 Players</div>
            <p className="text-xs text-slate-400 mt-1">Currently in Overworld & Nether</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => onNavigateTab("players")}
              className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
            >
              Manage Players &rarr;
            </button>
          )}
        </div>

        {/* Card 2: Server Performance */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Wifi className="w-6 h-6" />
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300">
              Smooth
            </span>
          </div>
          <div>
            <div className="text-3xl font-black text-emerald-400">20.0 TPS</div>
            <p className="text-xs text-slate-400 mt-1">Zero tick drop (100% Health)</p>
          </div>
          <button
            onClick={() => onNavigateTab("mesh")}
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
          >
            View Shards &rarr;
          </button>
        </div>

        {/* Card 3: PC Rig Benchmark */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Zap className="w-6 h-6" />
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300">
              Optimal Host
            </span>
          </div>
          <div>
            <div className="text-3xl font-black text-amber-400">Ready</div>
            <p className="text-xs text-slate-400 mt-1">Your PC is ready to host</p>
          </div>
          <button
            onClick={() => onNavigateTab("benchmark")}
            className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1"
          >
            Test Speed &rarr;
          </button>
        </div>
      </div>

      {/* How to Join Guide - Simple & Clear */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Gamepad2 className="w-5 h-5 text-cyan-400" />
          How to Join in 3 Simple Steps:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
              1
            </span>
            <div className="font-bold text-white text-sm">Open Minecraft</div>
            <p className="text-slate-400 leading-relaxed">
              Launch TLauncher, SKLauncher, or official Minecraft (Version 1.20.4+).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
              2
            </span>
            <div className="font-bold text-white text-sm">Click Multiplayer</div>
            <p className="text-slate-400 leading-relaxed">
              Go to Multiplayer &gt; Direct Connection (or Add Server).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
              3
            </span>
            <div className="font-bold text-white text-sm">Paste Address & Join</div>
            <p className="text-slate-400 leading-relaxed">
              Paste <strong className="text-cyan-300 font-mono">mc.peercraft.live</strong> and click Join Server!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
