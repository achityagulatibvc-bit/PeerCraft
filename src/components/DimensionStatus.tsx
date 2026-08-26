import React from "react";
import { Compass, Flame } from "lucide-react";

interface DimensionMetrics {
  name: string;
  dimensionKey: "overworld" | "nether_end";
  icon: React.ReactNode;
  tps: number;
  players: number;
  chunksLoaded: number;
  memoryMb: number;
  status: "ONLINE" | "MIGRATING" | "DEGRADED" | "OFFLINE";
  color: string;
}

interface DimensionStatusProps {
  overworldMetrics?: Partial<DimensionMetrics>;
  netherMetrics?: Partial<DimensionMetrics>;
}

export const DimensionStatus: React.FC<DimensionStatusProps> = ({
  overworldMetrics,
  netherMetrics,
}) => {
  const dimensions: DimensionMetrics[] = [
    {
      name: "The Overworld",
      dimensionKey: "overworld",
      icon: <Compass className="w-5 h-5 text-emerald-400" />,
      tps: overworldMetrics?.tps ?? 20.0,
      players: overworldMetrics?.players ?? 0,
      chunksLoaded: overworldMetrics?.chunksLoaded ?? 1024,
      memoryMb: overworldMetrics?.memoryMb ?? 3400,
      status: (overworldMetrics?.status as any) ?? "ONLINE",
      color: "emerald",
    },
    {
      name: "The Nether & The End",
      dimensionKey: "nether_end",
      icon: <Flame className="w-5 h-5 text-purple-400" />,
      tps: netherMetrics?.tps ?? 20.0,
      players: netherMetrics?.players ?? 0,
      chunksLoaded: netherMetrics?.chunksLoaded ?? 480,
      memoryMb: netherMetrics?.memoryMb ?? 1800,
      status: (netherMetrics?.status as any) ?? "ONLINE",
      color: "purple",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {dimensions.map((dim) => (
        <div
          key={dim.dimensionKey}
          className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center">
                {dim.icon}
              </div>
              <div>
                <h4 className="text-base font-bold text-white tracking-tight">{dim.name}</h4>
                <span className="text-xs text-slate-400 font-mono">
                  {dim.dimensionKey === "overworld" ? "world/" : "world_nether/ & world_the_end/"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                dim.status === "ONLINE"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : dim.status === "MIGRATING"
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  : "bg-red-500/10 text-red-400 border border-red-500/20"
              }`}>
                {dim.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 text-center">
            <div>
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Tick Rate</span>
              <div className="text-sm font-bold font-mono text-emerald-400 mt-0.5">
                {dim.tps.toFixed(1)} <span className="text-[10px] text-slate-500">TPS</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Active Players</span>
              <div className="text-sm font-bold font-mono text-white mt-0.5">
                {dim.players}
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Loaded Chunks</span>
              <div className="text-sm font-bold font-mono text-slate-200 mt-0.5">
                {dim.chunksLoaded}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
