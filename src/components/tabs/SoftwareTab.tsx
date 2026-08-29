import React, { useState, useEffect } from "react";
import { Check, Download, AlertTriangle, ArrowLeft, Plus, Sparkles } from "lucide-react";

interface SoftwareOption {
  id: string;
  name: string;
  category: "plugins" | "vanilla" | "mods" | "proxy";
  description: string;
  badge?: string;
  color: string;
  versions: string[];
}

export const SoftwareTab: React.FC = () => {
  const [softwares, setSoftwares] = useState<SoftwareOption[]>([
    {
      id: "vanilla",
      name: "Vanilla",
      category: "vanilla",
      description: "Official Mojang Minecraft server engine. Standard survival gameplay without plugins or mods.",
      badge: "ACTIVE",
      color: "emerald",
      versions: ["26.1.2 (Active)", "26.2", "1.21.4 (Latest)", "1.21.1", "1.21.0", "1.20.4", "1.20.2"],
    },
    {
      id: "paper",
      name: "Paper / Bukkit",
      category: "plugins",
      description: "High performance Minecraft server software with plugin support. Recommended for PeerCraft cluster.",
      badge: "RECOMMENDED",
      color: "blue",
      versions: ["26.1.2", "1.21.4 (Latest)", "1.21.1", "1.21.0", "1.20.4", "1.20.2", "1.19.4"],
    },
    {
      id: "purpur",
      name: "Purpur",
      category: "plugins",
      description: "Drop-in Paper replacement designed for configurability and high gameplay optimization.",
      badge: "OPTIMIZED",
      color: "purple",
      versions: ["26.1.2", "1.21.4 (Latest)", "1.21.1", "1.21.0", "1.20.4"],
    },
    {
      id: "fabric",
      name: "Fabric",
      category: "mods",
      description: "Lightweight, modular modding toolchain for modern Minecraft versions.",
      badge: "MODS",
      color: "cyan",
      versions: ["26.1.2", "1.21.4", "1.21.1", "1.21.0", "1.20.4"],
    },
    {
      id: "forge",
      name: "Forge",
      category: "mods",
      description: "Classic modded Minecraft server with support for thousands of Forge mods.",
      badge: "MODPACKS",
      color: "amber",
      versions: ["1.20.1", "1.19.2", "1.18.2", "1.16.5", "1.12.2"],
    },
    {
      id: "velocity",
      name: "Velocity Proxy",
      category: "proxy",
      description: "Next-generation proxy software that connects the Overworld and Nether/End peer nodes.",
      badge: "CLUSTER GATEWAY",
      color: "teal",
      versions: ["3.3.0-SNAPSHOT (26.1.2 Ready)"],
    },
  ]);

  useEffect(() => {
    const loadPaperVersions = async () => {
      if ((window as any).__TAURI_IPC__) {
        try {
          const { invoke } = await import("@tauri-apps/api/tauri");
          const realVersions = await invoke<string[]>("fetch_software_versions");
          if (realVersions && realVersions.length > 0) {
            setSoftwares((prev) =>
              prev.map((sw) =>
                sw.id === "paper" ? { ...sw, versions: ["26.1.2", ...realVersions.slice(0, 8)] } : sw
              )
            );
          }
        } catch (err) {
          console.warn("Could not fetch dynamic Paper versions:", err);
        }
      }
    };
    loadPaperVersions();
  }, []);

  const [selectedSoftware, setSelectedSoftware] = useState<SoftwareOption | null>(null);
  const [installedSoftware, setInstalledSoftware] = useState("vanilla");
  const [installedVersion, setInstalledVersion] = useState("26.1.2");
  const [installing, setInstalling] = useState(false);
  const [successToast, setSuccessToast] = useState(false);
  const [customVersionInput, setCustomVersionInput] = useState("");

  const handleInstall = (version: string) => {
    if (!selectedSoftware) return;
    setInstalling(true);
    setTimeout(() => {
      setInstalledSoftware(selectedSoftware.id);
      setInstalledVersion(version);
      setInstalling(false);
      setSelectedSoftware(null);
      setSuccessToast(true);
      setTimeout(() => setSuccessToast(false), 2500);
    }, 1200);
  };

  const handleApplyCustomVersion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customVersionInput.trim()) return;
    setInstalledSoftware("vanilla");
    setInstalledVersion(customVersionInput.trim());
    setCustomVersionInput("");
    setSuccessToast(true);
    setTimeout(() => setSuccessToast(false), 2500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Software & Versions</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Switch server engine and Minecraft versions with 1-click installation or custom snapshots.
          </p>
        </div>

        {successToast && (
          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
            <Check className="w-3.5 h-3.5" /> Installed {installedSoftware.toUpperCase()} {installedVersion}
          </span>
        )}
      </div>

      {/* Custom Version & Snapshot Quick Input Card */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Custom Minecraft Release / Snapshot</h3>
              <p className="text-xs text-slate-400">
                Currently running: <strong className="text-emerald-400">{installedSoftware.toUpperCase()} {installedVersion}</strong>
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleApplyCustomVersion} className="flex gap-3 pt-1">
          <input
            type="text"
            placeholder="Type any custom version or snapshot (e.g. 26.1.2, 26.2, 1.21.4, 24w40a)..."
            value={customVersionInput}
            onChange={(e) => setCustomVersionInput(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3 text-xs font-bold text-white focus:outline-none focus:border-blue-500 font-mono shadow-inner"
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            Apply Version
          </button>
        </form>
      </div>

      {/* Software Detail / Version Picker View */}
      {selectedSoftware ? (
        <div className="space-y-6">
          <button
            onClick={() => setSelectedSoftware(null)}
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Software List
          </button>

          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-white">{selectedSoftware.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{selectedSoftware.description}</p>
              </div>
              {selectedSoftware.badge && (
                <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-500/15 text-blue-300 border border-blue-500/30">
                  {selectedSoftware.badge}
                </span>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                Installing a new software version will retain your world data and player inventories in Supabase, but will update the server JAR.
              </span>
            </div>

            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Select Minecraft Version:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedSoftware.versions.map((ver) => {
                  const isCurrent = installedSoftware === selectedSoftware.id && (installedVersion === ver || ver.startsWith(installedVersion));
                  return (
                    <div
                      key={ver}
                      className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-sm font-bold text-white">{ver}</div>
                        <div className="text-[11px] text-slate-500">Java Edition 21 Runtime</div>
                      </div>
                      {isCurrent ? (
                        <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Installed
                        </span>
                      ) : (
                        <button
                          onClick={() => handleInstall(ver)}
                          disabled={installing}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <Download className="w-3.5 h-3.5" />
                          {installing ? "Installing..." : "Install"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Software List Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {softwares.map((sw) => {
            const isInstalled = installedSoftware === sw.id;
            return (
              <div
                key={sw.id}
                onClick={() => setSelectedSoftware(sw)}
                className={`p-6 rounded-3xl bg-slate-900 border transition-all cursor-pointer space-y-4 hover:border-blue-500/50 shadow-xl ${
                  isInstalled ? "border-emerald-500/60 shadow-emerald-500/10" : "border-slate-800"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400 font-black text-base">
                      {sw.name[0]}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">{sw.name}</h3>
                      <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                        {sw.category}
                      </span>
                    </div>
                  </div>

                  {isInstalled ? (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Active ({installedVersion})
                    </span>
                  ) : sw.badge ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-500/15 text-blue-300 border border-blue-500/25">
                      {sw.badge}
                    </span>
                  ) : null}
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">{sw.description}</p>

                <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-xs text-slate-500">
                  <span>{sw.versions.length} versions available</span>
                  <span className="text-blue-400 font-bold hover:underline">Select version →</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
