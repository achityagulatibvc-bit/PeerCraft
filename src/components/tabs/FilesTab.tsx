import React, { useState, useEffect } from "react";
import { Folder, FileCode, Save, Check, RefreshCw } from "lucide-react";

interface ServerFile {
  name: string;
  type: "file" | "dir";
  size: string;
  path: string;
  content?: string;
}

export const FilesTab: React.FC = () => {
  const defaultFiles: ServerFile[] = [
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
motd=\u00A7bPeerCraft \u00A77- \u00A7aAsymmetric Cluster \u00A7e[Cracked OK]`,
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
  ];

  const [dimension, setDimension] = useState<"overworld" | "nether_end" | "velocity">("overworld");
  const [files, setFiles] = useState<ServerFile[]>(defaultFiles);
  const [selectedFile, setSelectedFile] = useState<ServerFile>(defaultFiles[0]);
  const [editorText, setEditorText] = useState(defaultFiles[0].content || "");
  const [savedToast, setSavedToast] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadFiles = async (dim = dimension) => {
    if ((window as any).__TAURI_IPC__) {
      try {
        setLoading(true);
        const { invoke } = await import("@tauri-apps/api/tauri");
        const list = await invoke<any[]>("list_sandbox_files", { dimension: dim, subpath: "" });
        if (list && list.length > 0) {
          const mapped: ServerFile[] = list.map((item) => ({
            name: item.name,
            type: item.is_dir ? "dir" : "file",
            size: item.is_dir ? "folder" : `${Math.round(item.size_bytes / 1024)} KB`,
            path: item.path,
          }));
          setFiles(mapped);
          const firstFile = mapped.find((f) => f.type === "file");
          if (firstFile) {
            handleSelectFile(firstFile, dim);
          }
        }
      } catch (err) {
        console.warn("Failed to load real sandbox files, using defaults:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadFiles(dimension);
  }, [dimension]);

  const handleSelectFile = async (file: ServerFile, dim = dimension) => {
    if (file.type === "file") {
      setSelectedFile(file);
      if ((window as any).__TAURI_IPC__) {
        try {
          const { invoke } = await import("@tauri-apps/api/tauri");
          const content = await invoke<string>("read_sandbox_file", { dimension: dim, filePath: file.path });
          setEditorText(content);
          return;
        } catch (err) {
          console.warn("Could not read file from backend:", err);
        }
      }
      setEditorText(file.content || "");
    }
  };

  const handleSave = async () => {
    if ((window as any).__TAURI_IPC__) {
      try {
        const { invoke } = await import("@tauri-apps/api/tauri");
        await invoke("write_sandbox_file", {
          dimension,
          filePath: selectedFile.path,
          content: editorText,
        });
      } catch (err) {
        console.error("Save error:", err);
      }
    }
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col h-[calc(100vh-140px)] space-y-4 animate-fadeIn">
      {/* Top Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">File Manager & Config Editor</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Edit server properties, paper configs, and whitelists directly in your browser or desktop app.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            {(["overworld", "nether_end", "velocity"] as const).map((dim) => (
              <button
                key={dim}
                onClick={() => setDimension(dim)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  dimension === dim
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {dim === "overworld" ? "Overworld" : dim === "nether_end" ? "Nether/End" : "Velocity"}
              </button>
            ))}
          </div>

          <button
            onClick={() => loadFiles(dimension)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            title="Refresh Files"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main 2-Column File Interface */}
      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Left: File Tree List */}
        <div className="w-72 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col overflow-hidden shrink-0">
          <div className="p-4 border-b border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400">
            {dimension.toUpperCase()} Files
          </div>
          <div className="flex-1 p-2 overflow-y-auto space-y-1">
            {files.map((file) => {
              const isSelected = selectedFile?.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => handleSelectFile(file)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold"
                      : "text-slate-300 hover:bg-slate-800/80"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    {file.type === "dir" ? (
                      <Folder className="w-4 h-4 text-amber-400 shrink-0" />
                    ) : (
                      <FileCode className="w-4 h-4 text-cyan-400 shrink-0" />
                    )}
                    <span className="truncate">{file.name}</span>
                  </div>
                  <span className={`text-[10px] ${isSelected ? "text-blue-200" : "text-slate-500"}`}>
                    {file.size}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Code/Config Editor Area */}
        <div className="flex-1 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col overflow-hidden shadow-2xl">
          <div className="px-6 py-3.5 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 font-bold">
              <FileCode className="w-4 h-4 text-cyan-400" />
              <span>{selectedFile?.path || "/server.properties"}</span>
            </div>

            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/30"
            >
              {savedToast ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span className="text-emerald-200">Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  Save Changes
                </>
              )}
            </button>
          </div>

          <div className="flex-1 p-4 bg-[#080c14] overflow-hidden">
            <textarea
              value={editorText}
              onChange={(e) => setEditorText(e.target.value)}
              className="w-full h-full bg-transparent font-mono text-xs text-slate-200 leading-relaxed resize-none focus:outline-none selection:bg-cyan-500 selection:text-white"
              spellCheck={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
