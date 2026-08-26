import React, { useState } from "react";
import { Sliders, ShieldCheck, Check } from "lucide-react";

export const SettingsTab: React.FC = () => {
  const [pvp, setPvp] = useState(true);
  const [difficulty, setDifficulty] = useState("hard");
  const [viewDistance, setViewDistance] = useState(8);
  const [maxRam, setMaxRam] = useState(8);
  const [motd, setMotd] = useState("PeerCraft - Dynamic Sharded Minecraft Cluster [Cracked OK]");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Server Settings</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure gameplay rules, cracked mode security, and memory allocation.
          </p>
        </div>
        <button
          onClick={handleSave}
          className="px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/25 flex items-center gap-2"
        >
          {saved ? <Check className="w-4 h-4 text-emerald-300" /> : <Sliders className="w-4 h-4" />}
          {saved ? "Settings Saved!" : "Save Changes"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gameplay Box */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
          <h3 className="font-bold text-white text-base">Gameplay Rules</h3>

          {/* Cracked Mode Status */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Cracked Mode (Online-Mode)
              </div>
              <p className="text-xs text-slate-400">Allows TLauncher players</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
              FALSE (CRACKED)
            </span>
          </div>

          {/* PvP Toggle */}
          <div className="flex items-center justify-between py-2 border-b border-slate-800/80">
            <div>
              <div className="text-sm font-bold text-white">Player Combat (PvP)</div>
              <p className="text-xs text-slate-400">Allow players to fight each other</p>
            </div>
            <input
              type="checkbox"
              checked={pvp}
              onChange={(e) => setPvp(e.target.checked)}
              className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
            />
          </div>

          {/* Difficulty */}
          <div className="flex items-center justify-between py-2 border-b border-slate-800/80">
            <div>
              <div className="text-sm font-bold text-white">World Difficulty</div>
              <p className="text-xs text-slate-400">Hostility of mobs and hunger</p>
            </div>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
            >
              <option value="peaceful">Peaceful</option>
              <option value="easy">Easy</option>
              <option value="normal">Normal</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {/* View Distance */}
          <div className="space-y-2 py-2">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-white">View Distance</span>
              <span className="font-mono text-cyan-300 font-bold">{viewDistance} Chunks</span>
            </div>
            <input
              type="range"
              min={4}
              max={16}
              value={viewDistance}
              onChange={(e) => setViewDistance(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>
        </div>

        {/* Hardware & JVM Box */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
          <h3 className="font-bold text-white text-base">Memory & Performance</h3>

          {/* RAM Slider */}
          <div className="space-y-2 py-2">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-white">Max RAM Allocation (-Xmx)</span>
              <span className="font-mono text-purple-300 font-bold">{maxRam} GB RAM</span>
            </div>
            <input
              type="range"
              min={3}
              max={16}
              value={maxRam}
              onChange={(e) => setMaxRam(Number(e.target.value))}
              className="w-full accent-purple-600 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500">
              Recommended: 6-8 GB for smooth 20+ player sharding.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <div className="text-xs font-bold text-white">Aikar's Garbage Collector</div>
            <p className="text-xs text-slate-400">
              Pre-configured tuned G1GC parameters are active for zero tick-drop.
            </p>
          </div>

          {/* MOTD */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-bold text-white">Server Message of the Day (MOTD)</label>
            <input
              type="text"
              value={motd}
              onChange={(e) => setMotd(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-2xl text-xs text-white font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
