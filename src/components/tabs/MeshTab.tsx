import React from "react";
import { Radio, Compass, Flame } from "lucide-react";

export const MeshTab: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white">Cluster Nodes & Dimensions</h2>
        <p className="text-sm text-slate-400 mt-1">
          Workload is automatically split across peer computers to keep gameplay lag-free.
        </p>
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
              YOU (Host)
            </span>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white">The Overworld</h3>
            <p className="text-xs text-slate-400 mt-1">Main world terrain & player builds</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Health / Speed:</span>
              <span className="font-bold text-emerald-400">20.0 TPS (100%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Active Players:</span>
              <span className="font-bold text-white">3 Online</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Internal Port:</span>
              <span className="font-mono text-cyan-300">25565</span>
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
              Active Peer
            </span>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white">Nether & The End</h3>
            <p className="text-xs text-slate-400 mt-1">Hosted on Alex-Gaming-Rig</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Health / Speed:</span>
              <span className="font-bold text-emerald-400">20.0 TPS (100%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Active Players:</span>
              <span className="font-bold text-white">1 Online</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Internal Port:</span>
              <span className="font-mono text-purple-300">25566</span>
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
              Anycast Relay
            </span>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white">Velocity Gateway</h3>
            <p className="text-xs text-slate-400 mt-1">Player connection bridge & voice</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Domain:</span>
              <span className="font-mono font-bold text-cyan-300">mc.peercraft.live</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Cracked Mode:</span>
              <span className="font-bold text-amber-400">Supported</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Public Port:</span>
              <span className="font-mono text-slate-300">25577</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
