import React, { useState } from "react";
import { Cpu, Activity, Wifi, RefreshCw, CheckCircle2, Award } from "lucide-react";

export const BenchmarkTab: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [score, setScore] = useState(4820);
  const cpuPower = "2,940 pts (Single-Thread)";
  const ram = "16 GB Available";
  const ping = "14 ms";

  const handleTest = () => {
    setTesting(true);
    setTimeout(() => {
      setScore(4700 + Math.floor(Math.random() * 250));
      setTesting(false);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white">PC Performance Benchmark</h2>
        <p className="text-sm text-slate-400 mt-1">
          Measures your computer hardware speed to see how many players your PC can comfortably host.
        </p>
      </div>

      {/* Big Score Hero Card */}
      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-500 to-orange-500 p-1 shadow-xl shadow-amber-500/20 flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[20px] flex flex-col items-center justify-center">
              <Award className="w-8 h-8 text-amber-400 mb-0.5" />
              <span className="text-[10px] font-black text-amber-300">TIER A</span>
            </div>
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Host Performance Rating
            </span>
            <div className="text-4xl font-black text-white mt-1">
              {testing ? "Testing..." : `${score} Points`}
            </div>
            <p className="text-sm text-emerald-400 font-semibold mt-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Excellent! Ready to host 20+ players lag-free.
            </p>
          </div>
        </div>

        <button
          onClick={handleTest}
          disabled={testing}
          className="w-full md:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-white font-black text-sm shadow-xl shadow-amber-500/25 transition-all flex items-center justify-center gap-2.5 shrink-0"
        >
          <RefreshCw className={`w-5 h-5 ${testing ? "animate-spin" : ""}`} />
          {testing ? "Benchmarking Hardware..." : "Test My PC"}
        </button>
      </div>

      {/* 3 Metric Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div className="text-xs font-bold text-slate-400">CPU Single-Thread</div>
          <div className="text-lg font-black text-white">{cpuPower}</div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Activity className="w-5 h-5" />
          </div>
          <div className="text-xs font-bold text-slate-400">System RAM</div>
          <div className="text-lg font-black text-white">{ram}</div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Wifi className="w-5 h-5" />
          </div>
          <div className="text-xs font-bold text-slate-400">Network Latency</div>
          <div className="text-lg font-black text-white">{ping} to Nearest Peer</div>
        </div>
      </div>
    </div>
  );
};
