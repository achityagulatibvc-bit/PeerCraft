import React, { useState } from "react";
import { Boxes, Plus } from "lucide-react";

interface PluginItem {
  id: string;
  name: string;
  version: string;
  desc: string;
  category: string;
  installed: boolean;
  enabled: boolean;
  isCrackedHero?: boolean;
}

export const PluginsTab: React.FC = () => {
  const [plugins, setPlugins] = useState<PluginItem[]>([
    {
      id: "skins-restorer",
      name: "SkinsRestorer",
      version: "15.0.3",
      desc: "Restores custom skins for cracked / offline-mode players (TLauncher). Crucial for cracked servers!",
      category: "Cracked Essential",
      installed: true,
      enabled: true,
      isCrackedHero: true,
    },
    {
      id: "authme",
      name: "AuthMe Reloaded",
      version: "5.6.0",
      desc: "Password login & registration protection for offline servers (/register & /login).",
      category: "Cracked Essential",
      installed: true,
      enabled: true,
      isCrackedHero: true,
    },
    {
      id: "husksync",
      name: "HuskSync",
      version: "3.4.1",
      desc: "Syncs inventory & Ender Chests across Overworld and Nether/End servers seamlessly.",
      category: "Cluster Shard",
      installed: true,
      enabled: true,
    },
    {
      id: "luckperms",
      name: "LuckPerms",
      version: "5.4.102",
      desc: "Permissions and ranks management system with fast web editor.",
      category: "Permissions",
      installed: true,
      enabled: true,
    },
    {
      id: "essentialsx",
      name: "EssentialsX",
      version: "2.20.1",
      desc: "Core commands: /spawn, /warp, /tp, player kits, and economy.",
      category: "Gameplay",
      installed: false,
      enabled: false,
    },
    {
      id: "chunky",
      name: "Chunky",
      version: "1.4.10",
      desc: "Pre-generates world chunks rapidly to remove exploration lag.",
      category: "Optimization",
      installed: true,
      enabled: true,
    },
    {
      id: "geysermc",
      name: "GeyserMC Cross-Play",
      version: "2.2.2",
      desc: "Allows Bedrock Edition (Phone, Xbox, PS4, Switch) players to join PaperMC Java.",
      category: "Cross-Play",
      installed: false,
      enabled: false,
    },
    {
      id: "viaversion",
      name: "ViaVersion",
      version: "4.9.2",
      desc: "Allows older and newer Minecraft versions (1.16 - 1.21+) to connect.",
      category: "Compatibility",
      installed: true,
      enabled: true,
    },
  ]);

  const togglePlugin = (id: string) => {
    setPlugins((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    );
  };

  const installPlugin = (id: string) => {
    setPlugins((prev) =>
      prev.map((p) => (p.id === id ? { ...p, installed: true, enabled: true } : p))
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">PaperMC Plugins Suite</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            1-Click install essential plugins tailored for cracked gameplay and server sharding.
          </p>
        </div>
        <span className="px-3.5 py-1.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300">
          {plugins.filter((p) => p.installed && p.enabled).length} Active Plugins
        </span>
      </div>

      {/* Grid of Big Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {plugins.map((plugin) => (
          <div
            key={plugin.id}
            className={`p-6 rounded-3xl border transition-all flex flex-col justify-between ${
              plugin.installed
                ? "bg-slate-900 border-slate-700/80 shadow-xl"
                : "bg-slate-900/40 border-slate-800/80 hover:border-slate-700"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold">
                    <Boxes className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">{plugin.name}</h3>
                    <span className="text-xs text-slate-500 font-mono">v{plugin.version}</span>
                  </div>
                </div>

                {plugin.isCrackedHero && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Cracked Fix
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-4">{plugin.desc}</p>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {plugin.category}
              </span>

              {plugin.installed ? (
                <button
                  onClick={() => togglePlugin(plugin.id)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    plugin.enabled
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30"
                      : "bg-slate-800 text-slate-400 border border-slate-700 hover:text-white"
                  }`}
                >
                  {plugin.enabled ? "Active" : "Disabled"}
                </button>
              ) : (
                <button
                  onClick={() => installPlugin(plugin.id)}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  1-Click Install
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
