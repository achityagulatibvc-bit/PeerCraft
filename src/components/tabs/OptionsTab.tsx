import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Sword,
  Terminal,
  Plane,
  Bird,
  Skull,
  Flame,
  Shield,
  Check,
} from "lucide-react";

export const OptionsTab: React.FC = () => {
  const [saved, setSaved] = useState(false);

  const [options, setOptions] = useState({
    slots: 20,
    gamemode: "survival",
    difficulty: "hard",
    whitelist: false,
    cracked: true,
    pvp: true,
    command_blocks: true,
    fly: false,
    animals: true,
    monsters: true,
    villagers: true,
    nether: true,
    spawn_protection: 16,
    motd: "PeerCraft Asymmetric Cluster [Cracked OK]",
    server_port: 25565,
  });

  useEffect(() => {
    const loadRealOptions = async () => {
      if ((window as any).__TAURI_IPC__) {
        try {
          const { invoke } = await import("@tauri-apps/api/tauri");
          const realOpts = await invoke<any>("get_server_options", { dimension: "overworld" });
          if (realOpts) {
            setOptions(realOpts);
          }
        } catch (err) {
          console.warn("Could not load server.properties from Tauri:", err);
        }
      }
    };
    loadRealOptions();
  }, []);

  const saveOptionsToBackend = async (newOpts: typeof options) => {
    setSaved(true);
    if ((window as any).__TAURI_IPC__) {
      try {
        const { invoke } = await import("@tauri-apps/api/tauri");
        await invoke("set_server_options", { dimension: "overworld", options: newOpts });
      } catch (err) {
        console.error("Failed to write server.properties:", err);
      }
    }
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleOption = (key: keyof typeof options) => {
    setOptions((prev) => {
      const updated = {
        ...prev,
        [key]: !prev[key],
      };
      saveOptionsToBackend(updated);
      return updated;
    });
  };

  const updateField = (key: keyof typeof options, value: any) => {
    setOptions((prev) => {
      const updated = {
        ...prev,
        [key]: value,
      };
      saveOptionsToBackend(updated);
      return updated;
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Server Options</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure server properties, game rules, and player access rules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {saved && (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
              <Check className="w-3.5 h-3.5" /> Saved to server.properties
            </span>
          )}
        </div>
      </div>

      {/* Main Settings Grid */}
      <div className="space-y-6">
        {/* Server Branding & Multiplayer Server List Live Preview */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Server Branding & Multiplayer List Preview
          </span>

          {/* Minecraft Server List Card Preview */}
          <div className="p-4 rounded-2xl bg-[#111622] border border-slate-800 flex items-center justify-between font-mono text-xs shadow-inner">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-emerald-400 shrink-0 overflow-hidden font-bold">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span>peercraft.server</span>
                  <span className="text-[10px] font-sans font-black bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">
                    1.20.4
                  </span>
                </div>
                <div className="text-xs text-emerald-400">{options.motd}</div>
                <div className="text-[10px] text-slate-500 font-sans">
                  Cracked Allowed • Husksync Supabase Active
                </div>
              </div>
            </div>

            <div className="text-right space-y-1">
              <div className="text-xs font-bold text-slate-300">
                0 / {options.slots}
              </div>
              <div className="flex items-center justify-end gap-0.5">
                <span className="w-1 h-3 rounded-sm bg-emerald-400" />
                <span className="w-1 h-3.5 rounded-sm bg-emerald-400" />
                <span className="w-1 h-4 rounded-sm bg-emerald-400" />
                <span className="w-1 h-4.5 rounded-sm bg-emerald-400" />
                <span className="w-1 h-5 rounded-sm bg-emerald-400" />
              </div>
            </div>
          </div>

          {/* MOTD Input */}
          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Server Description (MOTD)
            </label>
            <input
              type="text"
              value={options.motd}
              onChange={(e) => updateField("motd", e.target.value)}
              placeholder="Enter server description shown in Minecraft multiplayer list..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>
        </div>

        {/* Core Dropdowns & Inputs */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 shadow-xl">
          {/* Slots */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Slots (Max Players)
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={options.slots}
              onChange={(e) => updateField("slots", parseInt(e.target.value) || 20)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Gamemode */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Gamemode
            </label>
            <select
              value={options.gamemode}
              onChange={(e) => updateField("gamemode", e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-blue-500"
            >
              <option value="survival">Survival</option>
              <option value="creative">Creative</option>
              <option value="adventure">Adventure</option>
              <option value="spectator">Spectator</option>
            </select>
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Difficulty
            </label>
            <select
              value={options.difficulty}
              onChange={(e) => updateField("difficulty", e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-blue-500"
            >
              <option value="peaceful">Peaceful</option>
              <option value="easy">Easy</option>
              <option value="normal">Normal</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {/* Spawn Protection */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Spawn Protection
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={options.spawn_protection}
              onChange={(e) => updateField("spawn_protection", parseInt(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* The Classic Aternos Toggle Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Cracked / Offline Mode (Highlighted!) */}
          <div className="p-5 rounded-2xl bg-slate-900 border-2 border-amber-500/40 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Cracked (online-mode=false)</div>
                <div className="text-xs text-amber-300/80">Allows TLauncher, SKLauncher & unofficial accounts</div>
              </div>
            </div>
            <button
              onClick={() => toggleOption("cracked")}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                options.cracked ? "bg-amber-500" : "bg-slate-800"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  options.cracked ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Whitelist */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Whitelist</div>
                <div className="text-xs text-slate-400">Only allowed players can join</div>
              </div>
            </div>
            <button
              onClick={() => toggleOption("whitelist")}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                options.whitelist ? "bg-emerald-500" : "bg-slate-800"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  options.whitelist ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* PvP */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <Sword className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">PvP (Player vs Player)</div>
                <div className="text-xs text-slate-400">Allow players to damage each other</div>
              </div>
            </div>
            <button
              onClick={() => toggleOption("pvp")}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                options.pvp ? "bg-emerald-500" : "bg-slate-800"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  options.pvp ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Command Blocks */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Command Blocks</div>
                <div className="text-xs text-slate-400">Enable command block execution</div>
              </div>
            </div>
            <button
              onClick={() => toggleOption("command_blocks")}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                options.command_blocks ? "bg-emerald-500" : "bg-slate-800"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  options.command_blocks ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Flight */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Plane className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Flight</div>
                <div className="text-xs text-slate-400">Allow survival flying without kicks</div>
              </div>
            </div>
            <button
              onClick={() => toggleOption("fly")}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                options.fly ? "bg-emerald-500" : "bg-slate-800"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  options.fly ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Animals */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Bird className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Animals</div>
                <div className="text-xs text-slate-400">Spawn passive wildlife and livestock</div>
              </div>
            </div>
            <button
              onClick={() => toggleOption("animals")}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                options.animals ? "bg-emerald-500" : "bg-slate-800"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  options.animals ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Monsters */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
                <Skull className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Monsters</div>
                <div className="text-xs text-slate-400">Spawn zombies, skeletons, and hostile mobs</div>
              </div>
            </div>
            <button
              onClick={() => toggleOption("monsters")}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                options.monsters ? "bg-emerald-500" : "bg-slate-800"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  options.monsters ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Nether */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Nether Dimension</div>
                <div className="text-xs text-slate-400">Enable Nether portals (Secondary Node)</div>
              </div>
            </div>
            <button
              onClick={() => toggleOption("nether")}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                options.nether ? "bg-emerald-500" : "bg-slate-800"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  options.nether ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
