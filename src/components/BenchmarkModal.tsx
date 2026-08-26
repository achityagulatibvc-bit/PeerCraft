import React from "react";
import { Cpu, MemoryStick, Wifi, Zap, CheckCircle2, RotateCw } from "lucide-react";

export interface BenchmarkData {
  cpuSingleThreadScore: number;
  availableRamMb: number;
  upstreamBandwidthMbps: number;
  pingMs: number;
  compositeScore: number;
}

interface BenchmarkModalProps {
  isOpen: boolean;
  isBenchmarking: boolean;
  benchmarkData: BenchmarkData | null;
  onRunBenchmark: () => void;
  onClose: () => void;
}

export const BenchmarkModal: React.FC<BenchmarkModalProps> = ({
  isOpen,
  isBenchmarking,
  benchmarkData,
  onRunBenchmark,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Glowing header accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500"></div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              Hardware Benchmark & Role Fitness
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Measures single-thread compute, memory, and bandwidth to determine cluster role.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg font-bold p-1"
          >
            ✕
          </button>
        </div>

        {isBenchmarking ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin"></div>
              <Cpu className="w-6 h-6 text-blue-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-200">Running 2-Second Micro-Benchmark...</p>
              <p className="text-xs text-slate-500">Testing single-thread ALU/FPU iterations & RAM allocation</p>
            </div>
          </div>
        ) : benchmarkData ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Single-Thread CPU</span>
                  <div className="text-lg font-bold font-mono text-white mt-0.5">
                    {benchmarkData.cpuSingleThreadScore} <span className="text-xs text-slate-500">ops/ms</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <MemoryStick className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Available RAM</span>
                  <div className="text-lg font-bold font-mono text-white mt-0.5">
                    {(benchmarkData.availableRamMb / 1024).toFixed(1)} <span className="text-xs text-slate-500">GB</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Wifi className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Upstream Speed</span>
                  <div className="text-lg font-bold font-mono text-white mt-0.5">
                    {benchmarkData.upstreamBandwidthMbps} <span className="text-xs text-slate-500">Mbps</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Ping to Edge</span>
                  <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
                    {benchmarkData.pingMs} <span className="text-xs text-slate-500">ms</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-transparent border border-blue-500/20 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Composite Fitness Score</span>
                <div className="text-2xl font-black font-mono text-white mt-0.5">
                  {benchmarkData.compositeScore.toFixed(1)}
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Target Role:</span>
                <div className="text-sm font-bold text-emerald-400">
                  {benchmarkData.compositeScore >= 1200 
                    ? "Eligible for Primary (Overworld)" 
                    : benchmarkData.compositeScore >= 800 
                    ? "Eligible for Secondary (Nether/End)" 
                    : "Eligible for Edge Proxy"}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 text-sm">
            No local benchmark data available yet.
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onRunBenchmark}
            disabled={isBenchmarking}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50"
          >
            <RotateCw className={`w-4 h-4 ${isBenchmarking ? "animate-spin" : ""}`} />
            {isBenchmarking ? "Benchmarking..." : "Re-Run Benchmark"}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
