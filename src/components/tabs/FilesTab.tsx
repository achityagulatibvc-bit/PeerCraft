import React, { useState } from "react";
import { Folder, FileCode, Save, Check } from "lucide-react";

interface ServerFile {
  name: string;
  type: "file" | "dir";
  size: string;
  path: string;
  content?: string;
}

export const FilesTab: React.FC = () => {
  const initialFiles: ServerFile[] = [
    {
      name: "server.properties",
      type: "file",
      size: "707 B",
      path: "/server.properties",
      content: `# PeerCraft Overworld Instance Properties
server-port=25565
online-mode=false
enforce-secure-profile=false
allow-nether=true
allow-end=true
view-distance=8
simulation-distance=6
max-players=20
enable-rcon=true
rcon.port=25575
rcon.password=PEERCRAFT_INTERNAL_RCON_PASS_SECURE
motd=\\u00A7bPeerCraft \\u00A77- \\u00A7aAsymmetric Cluster \\u00A7e[Cracked OK]`,
    },
    {
      name: "paper-global.yml",
      type: "file",
      size: "554 B",
      path: "/config/paper-global.yml",
      content: `proxies:
  bungee-cord:
    online-mode: false
  velocity:
    enabled: true
    online-mode: false
    secret: "PEERCRAFT_SHARED_VELOCITY_SECRET_KEY_HEX"

timings:
  enabled: false`,
    },
    {
      name: "velocity.toml",
      type: "file",
      size: "781 B",
      path: "/velocity.toml",
      content: `[servers]
overworld = "127.0.0.1:25565"
nether_end = "127.0.0.1:25566"
try = ["overworld"]

bind = "0.0.0.0:25577"
online-mode = false
force-key-authentication = false
player-info-forwarding-mode = "modern"
forwarding-secret-file = "velocity.secret"`,
    },
    {
      name: "spigot.yml",
      type: "file",
      size: "2.1 KB",
      path: "/spigot.yml",
      content: `settings:
  save-user-cache-on-stop-only: false
  sample-count: 12
messages:
  whitelist: You are not whitelisted on this server!
  server-full: The server is full!`,
    },
    {
      name: "bukkit.yml",
      type: "file",
      size: "1.2 KB",
      path: "/bukkit.yml",
      content: `settings:
  allow-end: true
  warn-on-overload: true
spawn-limits:
  monsters: 70
  animals: 10`,
    },
    {
      name: "eula.txt",
      type: "file",
      size: "24 B",
      path: "/eula.txt",
      content: `eula=true`,
    },
    {
      name: "ops.json",
      type: "file",
      size: "120 B",
      path: "/ops.json",
      content: `[
  {
    "uuid": "00000000-0000-0000-0009-01f81014e304",
    "name": "ServerAdmin",
    "level": 4
  }
]`,
    },
    {
      name: "plugins",
      type: "dir",
      size: "4 items",
      path: "/plugins",
    },
    {
      name: "world",
      type: "dir",
      size: "420 MB",
      path: "/world",
    },
  ];

  const [files] = useState<ServerFile[]>(initialFiles);
  const [selectedFile, setSelectedFile] = useState<ServerFile>(initialFiles[0]);
  const [editorText, setEditorText] = useState(initialFiles[0].content || "");
  const [savedToast, setSavedToast] = useState(false);

  const handleSelectFile = (file: ServerFile) => {
    if (file.type === "file") {
      setSelectedFile(file);
      setEditorText(file.content || "");
    }
  };

  const handleSave = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col h-[calc(100vh-140px)] space-y-4 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-black text-white">Server File Manager</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Browse and edit configuration files directly with live syntax saving.
        </p>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
        {/* Left: Files List */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex flex-col overflow-hidden">
          <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider">Files</span>
            <span className="text-[11px] font-mono text-slate-500">/servers/overworld</span>
          </div>

          <div className="flex-1 overflow-y-auto mt-3 space-y-1.5">
            {files.map((file) => (
              <button
                key={file.path}
                onClick={() => handleSelectFile(file)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs transition-all ${
                  selectedFile.path === file.path
                    ? "bg-blue-600/20 text-blue-300 border border-blue-500/40"
                    : "text-slate-300 hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  {file.type === "dir" ? (
                    <Folder className="w-4 h-4 text-amber-400 shrink-0" />
                  ) : (
                    <FileCode className="w-4 h-4 text-cyan-400 shrink-0" />
                  )}
                  <span className="font-mono truncate">{file.name}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">{file.size}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Big Editor */}
        <div className="md:col-span-2 bg-[#070a10] border border-slate-800 rounded-3xl flex flex-col overflow-hidden shadow-2xl">
          <div className="px-5 py-3 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-cyan-400" />
              <span className="font-mono text-xs font-bold text-white">{selectedFile.path}</span>
            </div>

            <div className="flex items-center gap-2">
              {savedToast && (
                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Saved!
                </span>
              )}
              <button
                onClick={handleSave}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30 flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                Save File
              </button>
            </div>
          </div>

          <div className="flex-1 p-5 bg-[#06080e] overflow-hidden flex flex-col">
            <textarea
              value={editorText}
              onChange={(e) => setEditorText(e.target.value)}
              className="flex-1 w-full h-full bg-transparent text-slate-100 font-mono text-xs leading-relaxed resize-none focus:outline-none border-0 selection:bg-blue-600/40"
              spellCheck={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
