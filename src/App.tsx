import { useState } from "react";
import {
  Server,
  Gamepad2,
  Layers,
  Zap,
  Terminal,
  Folder,
  Boxes,
  Users,
  Sliders,
  HardDrive,
  Globe,
  Copy,
  Check,
  Lock,
  Unlock,
} from "lucide-react";
import { PlayTab } from "./components/tabs/PlayTab";
import { MeshTab } from "./components/tabs/MeshTab";
import { BenchmarkTab } from "./components/tabs/BenchmarkTab";
import { ConsoleTab } from "./components/tabs/ConsoleTab";
import { FilesTab } from "./components/tabs/FilesTab";
import { PluginsTab } from "./components/tabs/PluginsTab";
import { PlayersTab } from "./components/tabs/PlayersTab";
import { SettingsTab } from "./components/tabs/SettingsTab";
import { BackupsTab } from "./components/tabs/BackupsTab";
import { AdminAuthModal } from "./components/AdminAuthModal";

export function App() {
  const [activeTab, setActiveTab] = useState<string>("play");
  const [isAdmin, setIsAdmin] = useState(true);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [clusterRunning, setClusterRunning] = useState(true);
  const [copiedIp, setCopiedIp] = useState(false);

  const serverIp = "mc.peercraft.live";

  const handleCopyIp = () => {
    navigator.clipboard.writeText(serverIp);
    setCopiedIp(true);
    setTimeout(() => setCopiedIp(false), 2000);
  };

  const navItems = [
    // Normal Player Tabs
    { id: "play", label: "Play & Connect", icon: Gamepad2, group: "PLAYER" },
    { id: "mesh", label: "Nodes & Mesh", icon: Layers, group: "PLAYER" },
    { id: "benchmark", label: "PC Benchmark", icon: Zap, group: "PLAYER" },

    // Admin Tabs
    { id: "console", label: "Live Terminal", icon: Terminal, group: "ADMIN", adminOnly: true },
    { id: "files", label: "File Manager", icon: Folder, group: "ADMIN", adminOnly: true },
    { id: "plugins", label: "Paper Plugins", icon: Boxes, group: "ADMIN", adminOnly: true },
    { id: "players", label: "Player Manager", icon: Users, group: "ADMIN", adminOnly: true },
    { id: "settings", label: "Server Settings", icon: Sliders, group: "ADMIN", adminOnly: true },
    { id: "backups", label: "World Backups", icon: HardDrive, group: "ADMIN", adminOnly: true },
  ];

  return (
    <div className="flex h-screen bg-[#070a12] text-slate-100 font-sans overflow-hidden select-none">
      {/* 1. Sleek Left Sidebar */}
      <aside className="w-64 bg-slate-950/90 border-r border-slate-800/80 flex flex-col justify-between shrink-0">
        {/* Top App Identity */}
        <div>
          <div className="p-6 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-0.5 shadow-lg shadow-blue-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Server className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight text-white leading-none">
                  PeerCraft
                </h1>
                <span className="inline-block mt-1 text-[10px] font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30">
                  Cracked OK
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-230px)]">
            {/* Player Group */}
            <div className="space-y-1">
              <span className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-500">
                Player Mode
              </span>
              {navItems
                .filter((item) => item.group === "PLAYER")
                .map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
                        isActive
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </button>
                  );
                })}
            </div>

            {/* Admin Group */}
            {isAdmin && (
              <div className="space-y-1 pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between px-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400">
                    Admin Tools
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                </div>
                {navItems
                  .filter((item) => item.group === "ADMIN")
                  .map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
                          isActive
                            ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/30"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </button>
                    );
                  })}
              </div>
            )}
          </nav>
        </div>

        {/* Sidebar Footer: Admin Switcher */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950">
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-400">Role:</span>
              <span className="font-black text-cyan-300">
                {isAdmin ? "Admin (Elevated)" : "Player"}
              </span>
            </div>
            <button
              onClick={() => setAdminModalOpen(true)}
              className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-slate-200 transition-all flex items-center justify-center gap-1.5"
            >
              {isAdmin ? (
                <>
                  <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                  Admin Options
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  Unlock Admin
                </>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Main Content View Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#090d16]">
        {/* Top Header Bar */}
        <header className="h-16 px-8 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between backdrop-blur-md shrink-0">
          {/* Active Tab Heading */}
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black text-white capitalize">
              {navItems.find((i) => i.id === activeTab)?.label || "PeerCraft"}
            </h2>
          </div>

          {/* Top Quick Actions */}
          <div className="flex items-center gap-3">
            {/* Quick IP widget */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span className="font-mono font-bold text-white">{serverIp}</span>
              <button
                onClick={handleCopyIp}
                className="p-1 text-slate-400 hover:text-white transition-colors"
                title="Copy IP"
              >
                {copiedIp ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Quick Status Toggle */}
            <button
              onClick={() => setClusterRunning(!clusterRunning)}
              className={`px-4 py-1.5 rounded-2xl text-xs font-bold transition-all shadow-md flex items-center gap-2 ${
                clusterRunning
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30"
                  : "bg-rose-600 hover:bg-rose-500 text-white"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${clusterRunning ? "bg-emerald-400 animate-pulse" : "bg-rose-400"}`} />
              {clusterRunning ? "Server Running" : "Server Stopped"}
            </button>
          </div>
        </header>

        {/* Scrollable View Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {activeTab === "play" && (
            <PlayTab
              clusterRunning={clusterRunning}
              onToggleCluster={() => setClusterRunning(!clusterRunning)}
              onNavigateTab={(tab) => setActiveTab(tab)}
              isAdmin={isAdmin}
            />
          )}

          {activeTab === "mesh" && <MeshTab />}

          {activeTab === "benchmark" && <BenchmarkTab />}

          {activeTab === "console" && <ConsoleTab />}

          {activeTab === "files" && <FilesTab />}

          {activeTab === "plugins" && <PluginsTab />}

          {activeTab === "players" && <PlayersTab />}

          {activeTab === "settings" && <SettingsTab />}

          {activeTab === "backups" && <BackupsTab />}
        </main>
      </div>

      {/* Admin Auth Modal */}
      <AdminAuthModal
        isOpen={adminModalOpen}
        isAdmin={isAdmin}
        onAuthenticate={(success) => {
          setIsAdmin(success);
          if (!success && activeTab !== "play" && activeTab !== "mesh" && activeTab !== "benchmark") {
            setActiveTab("play");
          }
        }}
        onClose={() => setAdminModalOpen(false)}
      />
    </div>
  );
}

export default App;
