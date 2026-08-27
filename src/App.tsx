import { useState } from "react";
import {
  Server,
  Terminal,
  FileText,
  Sliders,
  Boxes,
  Users,
  Folder,
  Globe,
  HardDrive,
  Layers,
  Zap,
  Copy,
  Check,
  ChevronRight,
} from "lucide-react";

import { ServerTab } from "./components/tabs/ServerTab";
import { ConsoleTab } from "./components/tabs/ConsoleTab";
import { LogsTab } from "./components/tabs/LogsTab";
import { OptionsTab } from "./components/tabs/OptionsTab";
import { SoftwareTab } from "./components/tabs/SoftwareTab";
import { PlayersTab } from "./components/tabs/PlayersTab";
import { FilesTab } from "./components/tabs/FilesTab";
import { WorldsTab } from "./components/tabs/WorldsTab";
import { BackupsTab } from "./components/tabs/BackupsTab";
import { MeshTab } from "./components/tabs/MeshTab";
import { BenchmarkTab } from "./components/tabs/BenchmarkTab";

export function App() {
  const [activeTab, setActiveTab] = useState<string>("server");
  const [clusterRunning, setClusterRunning] = useState(true);
  const [copiedIp, setCopiedIp] = useState(false);

  const serverIp = "mc.peercraft.live";

  const handleToggleCluster = async () => {
    const nextState = !clusterRunning;
    setClusterRunning(nextState);
    if ((window as any).__TAURI_IPC__) {
      try {
        const { invoke } = await import("@tauri-apps/api/tauri");
        if (nextState) {
          await invoke("start_assigned_node", { dimension: "overworld" });
        } else {
          await invoke("stop_assigned_node", { dimension: "overworld" });
        }
      } catch (err) {
        console.error("Cluster toggle error:", err);
      }
    }
  };

  const handleCopyIp = () => {
    navigator.clipboard.writeText(serverIp);
    setCopiedIp(true);
    setTimeout(() => setCopiedIp(false), 2000);
  };

  const navItems = [
    { id: "server", label: "Server", icon: Server },
    { id: "console", label: "Console", icon: Terminal },
    { id: "log", label: "Log", icon: FileText },
    { id: "options", label: "Options", icon: Sliders },
    { id: "software", label: "Software", icon: Boxes },
    { id: "players", label: "Players", icon: Users },
    { id: "files", label: "Files", icon: Folder },
    { id: "worlds", label: "Worlds", icon: Globe },
    { id: "backups", label: "Backups", icon: HardDrive },
    { id: "mesh", label: "Cluster Mesh", icon: Layers },
    { id: "benchmark", label: "PC Benchmark", icon: Zap },
  ];

  return (
    <div className="flex h-screen bg-[#070a12] text-slate-100 font-sans overflow-hidden select-none">
      {/* 1. Authentic Aternos Left Navigation Sidebar */}
      <aside className="w-60 bg-slate-950/95 border-r border-slate-800/80 flex flex-col justify-between shrink-0">
        <div>
          {/* Top Brand Banner */}
          <div className="p-5 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-0.5 shadow-lg shadow-blue-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Server className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
              <div>
                <h1 className="text-base font-black tracking-tight text-white leading-tight">
                  PeerCraft
                </h1>
                <span className="text-[10px] font-bold text-slate-400">
                  Minecraft Cluster Host
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-blue-200" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Server Quick Status Indicator */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950">
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  clusterRunning ? "bg-emerald-400 animate-pulse" : "bg-rose-500"
                }`}
              />
              <span className="text-xs font-bold text-slate-200">
                {clusterRunning ? "Server Online" : "Server Offline"}
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">v1.21.4</span>
          </div>
        </div>
      </aside>

      {/* 2. Main Content View Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#090d16]">
        {/* Top Header Bar */}
        <header className="h-16 px-8 bg-slate-950/70 border-b border-slate-800/80 flex items-center justify-between backdrop-blur-md shrink-0">
          {/* Active Breadcrumb / Title */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              peercraft.server
            </span>
            <span className="text-slate-600">/</span>
            <h2 className="text-sm font-black text-white capitalize">
              {navItems.find((i) => i.id === activeTab)?.label || "Server"}
            </h2>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            {/* Quick IP Widget */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-mono font-bold text-white">{serverIp}</span>
              <button
                onClick={handleCopyIp}
                className="p-1 text-slate-400 hover:text-white transition-colors"
                title="Copy IP"
              >
                {copiedIp ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Quick Status Toggle Button */}
            <button
              onClick={handleToggleCluster}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 ${
                clusterRunning
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30"
                  : "bg-rose-600 hover:bg-rose-500 text-white"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  clusterRunning ? "bg-emerald-400 animate-pulse" : "bg-rose-400"
                }`}
              />
              {clusterRunning ? "Online" : "Offline"}
            </button>
          </div>
        </header>

        {/* Scrollable View Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {activeTab === "server" && (
            <ServerTab
              clusterRunning={clusterRunning}
              onToggleCluster={handleToggleCluster}
              onNavigateTab={(tab) => setActiveTab(tab)}
              serverIp={serverIp}
            />
          )}

          {activeTab === "console" && <ConsoleTab />}

          {activeTab === "log" && <LogsTab />}

          {activeTab === "options" && <OptionsTab />}

          {activeTab === "software" && <SoftwareTab />}

          {activeTab === "players" && <PlayersTab />}

          {activeTab === "files" && <FilesTab />}

          {activeTab === "worlds" && <WorldsTab />}

          {activeTab === "backups" && <BackupsTab />}

          {activeTab === "mesh" && <MeshTab />}

          {activeTab === "benchmark" && <BenchmarkTab />}
        </main>
      </div>
    </div>
  );
}

export default App;
