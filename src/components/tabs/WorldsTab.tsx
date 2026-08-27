import React, { useState } from "react";
import {
  Upload,
  Download,
  RotateCcw,
  Sparkles,
  Compass,
  Flame,
  Moon,
  Check,
} from "lucide-react";

interface WorldDimension {
  id: string;
  name: string;
  folder: string;
  size: string;
  icon: React.ReactNode;
  nodeAssigned: string;
}

export const WorldsTab: React.FC = () => {
  const [dimensions] = useState<WorldDimension[]>([
    {
      id: "world",
      name: "The Overworld",
      folder: "world/",
      size: "420 MB",
      icon: <Compass className="w-6 h-6 text-blue-400" />,
      nodeAssigned: "Primary Node (Port 25565)",
    },
    {
      id: "world_nether",
      name: "The Nether",
      folder: "world_nether/",
      size: "185 MB",
      icon: <Flame className="w-6 h-6 text-purple-400" />,
      nodeAssigned: "Secondary Node (Port 25566)",
    },
    {
      id: "world_the_end",
      name: "The End",
      folder: "world_the_end/",
      size: "45 MB",
      icon: <Moon className="w-6 h-6 text-cyan-400" />,
      nodeAssigned: "Secondary Node (Port 25566)",
    },
  ]);

  const [toast, setToast] = useState<string | null>(null);
  const [generateModal, setGenerateModal] = useState(false);
  const [seed, setSeed] = useState("");
  const [worldType, setWorldType] = useState("default");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setGenerateModal(false);
    showToast(`Generated new Overworld world with seed: ${seed || "random"}`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Worlds & Dimensions</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Download, upload, reset, or generate custom seeds for each dimension shard.
          </p>
        </div>

        {toast && (
          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
            <Check className="w-3.5 h-3.5" /> {toast}
          </span>
        )}
      </div>

      {/* World Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {dimensions.map((dim) => (
          <div
            key={dim.id}
            className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 shadow-xl flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700/60 flex items-center justify-center">
                  {dim.icon}
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
                  {dim.size}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-black text-white">{dim.name}</h3>
                <div className="text-xs text-slate-400 font-mono mt-0.5">{dim.folder}</div>
                <div className="text-[11px] text-cyan-400 mt-1 font-medium">{dim.nodeAssigned}</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-4 border-t border-slate-800">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => showToast(`Downloaded ${dim.name} as ZIP archive`)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-blue-400" />
                  Download
                </button>
                <button
                  onClick={() => showToast(`Uploading ZIP to ${dim.folder}...`)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5 text-emerald-400" />
                  Upload
                </button>
              </div>

              {dim.id === "world" ? (
                <button
                  onClick={() => setGenerateModal(true)}
                  className="w-full px-3 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Generate New World
                </button>
              ) : (
                <button
                  onClick={() => showToast(`Reset ${dim.name} dimension chunks.`)}
                  className="w-full px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/25 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Dimension
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Generate World Modal */}
      {generateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl space-y-5">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-400" />
              Generate World
            </h3>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Seed (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Leave empty for random seed"
                  value={seed}
                  onChange={(e) => setSeed(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  World Type
                </label>
                <select
                  value={worldType}
                  onChange={(e) => setWorldType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="default">Default</option>
                  <option value="flat">Superflat</option>
                  <option value="largeBiomes">Large Biomes</option>
                  <option value="amplified">Amplified</option>
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setGenerateModal(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30"
                >
                  Generate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
