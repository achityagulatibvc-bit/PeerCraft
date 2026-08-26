import React from "react";
import { Server, Cpu, Layers, Radio, ShieldCheck, Activity, Globe, HardDrive } from "lucide-react";

export interface ClusterRoleInfo {
  node_id: string;
  node_name: string;
  role: string;
  dimension?: string;
  port?: number;
  status: string;
  tps?: number;
  connected_players?: number;
}

interface ClusterTopologyProps {
  roles: {
    primary?: ClusterRoleInfo;
    secondary?: ClusterRoleInfo;
    edge?: ClusterRoleInfo;
  };
  currentNodeId: string;
}

export const ClusterTopology: React.FC<ClusterTopologyProps> = ({ roles, currentNodeId }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* Primary Node: Overworld */}
      <div className={`relative p-5 rounded-2xl border transition-all duration-300 ${
        roles.primary?.node_id === currentNodeId 
          ? "bg-slate-900/90 border-blue-500/60 shadow-lg shadow-blue-500/10" 
          : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">Primary Node</span>
                {roles.primary?.node_id === currentNodeId && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30">YOU</span>
                )}
              </div>
              <h3 className="text-base font-bold text-white tracking-tight">Overworld Instance</h3>
            </div>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            roles.primary?.status === "ACTIVE" 
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
            {roles.primary?.status || "OFFLINE"}
          </span>
        </div>

        <div className="space-y-2.5 text-xs text-slate-400">
          <div className="flex justify-between py-1 border-b border-slate-800/80">
            <span className="text-slate-500">Host Machine</span>
            <span className="font-mono text-slate-200">{roles.primary?.node_name || "Unassigned"}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800/80">
            <span className="text-slate-500">Internal Port</span>
            <span className="font-mono text-slate-200">{roles.primary?.port || 25565}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800/80">
            <span className="text-slate-500">Heap / GC Profile</span>
            <span className="text-slate-200">6–8 GB Aikar G1GC</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-500">Live TPS</span>
            <span className="font-mono font-bold text-emerald-400">
              {roles.primary?.tps ? `${roles.primary.tps.toFixed(1)} / 20.0` : "20.0 / 20.0"}
            </span>
          </div>
        </div>
      </div>

      {/* Secondary Node: Nether & End */}
      <div className={`relative p-5 rounded-2xl border transition-all duration-300 ${
        roles.secondary?.node_id === currentNodeId 
          ? "bg-slate-900/90 border-purple-500/60 shadow-lg shadow-purple-500/10" 
          : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">Secondary Node</span>
                {roles.secondary?.node_id === currentNodeId && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30">YOU</span>
                )}
              </div>
              <h3 className="text-base font-bold text-white tracking-tight">Nether & End Instance</h3>
            </div>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            roles.secondary?.status === "ACTIVE" 
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
            {roles.secondary?.status || "OFFLINE"}
          </span>
        </div>

        <div className="space-y-2.5 text-xs text-slate-400">
          <div className="flex justify-between py-1 border-b border-slate-800/80">
            <span className="text-slate-500">Host Machine</span>
            <span className="font-mono text-slate-200">{roles.secondary?.node_name || "Unassigned"}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800/80">
            <span className="text-slate-500">Internal Port</span>
            <span className="font-mono text-slate-200">{roles.secondary?.port || 25566}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800/80">
            <span className="text-slate-500">Heap / GC Profile</span>
            <span className="text-slate-200">3–4 GB Tuned G1GC</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-500">Failover Isolation</span>
            <span className="text-purple-300 font-medium">Independent Domain</span>
          </div>
        </div>
      </div>

      {/* Edge / Aux Node: Velocity Proxy + Voice */}
      <div className={`relative p-5 rounded-2xl border transition-all duration-300 ${
        roles.edge?.node_id === currentNodeId 
          ? "bg-slate-900/90 border-cyan-500/60 shadow-lg shadow-cyan-500/10" 
          : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Edge / Aux Node</span>
                {roles.edge?.node_id === currentNodeId && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-cyan-500/20 text-cyan-300 rounded-full border border-cyan-500/30">YOU</span>
                )}
              </div>
              <h3 className="text-base font-bold text-white tracking-tight">Velocity Ingress & Relay</h3>
            </div>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            roles.edge?.status === "ACTIVE" 
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
            {roles.edge?.status || "OFFLINE"}
          </span>
        </div>

        <div className="space-y-2.5 text-xs text-slate-400">
          <div className="flex justify-between py-1 border-b border-slate-800/80">
            <span className="text-slate-500">Host Machine</span>
            <span className="font-mono text-slate-200">{roles.edge?.node_name || "Unassigned"}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800/80">
            <span className="text-slate-500">Ingress Ports</span>
            <span className="font-mono text-slate-200">25577 (MC) / 24454 (UDP)</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800/80">
            <span className="text-slate-500">Services</span>
            <span className="text-slate-200">Velocity + Voice + R2 Offloader</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-500">Public Domain</span>
            <span className="text-cyan-300 font-mono">mc.peercraft.live</span>
          </div>
        </div>
      </div>
    </div>
  );
};
