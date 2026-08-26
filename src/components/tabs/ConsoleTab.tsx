import React, { useState, useRef, useEffect } from "react";
import { Terminal, Send, Trash2, Copy, Check } from "lucide-react";

export const ConsoleTab: React.FC = () => {
  const [commandInput, setCommandInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [copied, setCopied] = useState(false);
  const consoleBottomRef = useRef<HTMLDivElement>(null);

  const [logs, setLogs] = useState([
    {
      id: "1",
      time: "14:00:01",
      source: "Paper",
      level: "INFO",
      text: "Starting Minecraft PaperMC server 1.20.4 (b498)...",
    },
    {
      id: "2",
      time: "14:00:02",
      source: "Paper",
      level: "WARN",
      text: "SERVER IS RUNNING IN OFFLINE/CRACKED MODE (online-mode=false)",
    },
    {
      id: "3",
      time: "14:00:04",
      source: "Velocity",
      level: "INFO",
      text: "Modern proxy forwarding secret verified with Overworld & Nether shards.",
    },
    {
      id: "4",
      time: "14:00:08",
      source: "Paper",
      level: "INFO",
      text: 'Done (5.421s)! For help, type "help"',
    },
    {
      id: "5",
      time: "14:02:15",
      source: "Velocity",
      level: "INFO",
      text: "Player 'ShadowCrafter_99' [Cracked Client] connected via mc.peercraft.live",
    },
  ]);

  useEffect(() => {
    consoleBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const handleSendCommand = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!commandInput.trim()) return;

    const cmd = commandInput.trim();
    const time = new Date().toLocaleTimeString();

    const cmdLog = {
      id: Date.now().toString(),
      time,
      source: "ADMIN",
      level: "EXEC",
      text: `> ${cmd}`,
    };

    let reply = `Dispatched command: ${cmd}`;
    if (cmd.startsWith("/op ")) reply = `Made ${cmd.replace("/op ", "")} a server operator`;
    else if (cmd.startsWith("/gamemode ")) reply = `Set game mode to ${cmd.split(" ")[1] || "survival"}`;
    else if (cmd.startsWith("/tps")) reply = "TPS from last 1m, 5m, 15m: 20.0, 20.0, 20.0 (MSPT: 12.1ms)";
    else if (cmd.startsWith("/save-all")) reply = "Saved the game. World flushed to disk.";
    else if (cmd.startsWith("/say ")) reply = `[Server] ${cmd.replace("/say ", "")}`;

    const replyLog = {
      id: (Date.now() + 1).toString(),
      time,
      source: "Paper",
      level: "INFO",
      text: reply,
    };

    setLogs((prev) => [...prev, cmdLog, replyLog]);
    setCommandHistory((prev) => [...prev, cmd]);
    setHistoryIndex(-1);
    setCommandInput("");
  };

  const quickCommands = [
    { label: "/tps", cmd: "/tps" },
    { label: "/save-all", cmd: "/save-all flush" },
    { label: "Day", cmd: "/time set day" },
    { label: "Clear Weather", cmd: "/weather clear" },
    { label: "Creative", cmd: "/gamemode creative ServerAdmin" },
    { label: "Survival", cmd: "/gamemode survival ServerAdmin" },
    { label: "Reload", cmd: "/reload confirm" },
  ];

  return (
    <div className="max-w-6xl mx-auto flex flex-col h-[calc(100vh-140px)] space-y-4 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Live Server Terminal</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Execute in-game commands and view real-time PaperMC output.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const txt = logs.map((l) => `[${l.time}] [${l.source}/${l.level}] ${l.text}`).join("\n");
              navigator.clipboard.writeText(txt);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 flex items-center gap-1.5 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy Logs"}
          </button>
          <button
            onClick={() => setLogs([])}
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-rose-400 transition-all"
            title="Clear"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Terminal Window */}
      <div className="flex-1 bg-[#070a10] border border-slate-800 rounded-3xl flex flex-col overflow-hidden shadow-2xl">
        <div className="px-4 py-2.5 bg-slate-950/90 border-b border-slate-800/80 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono font-bold text-slate-400">papermc@overworld-console</span>
        </div>

        {/* Feed */}
        <div className="flex-1 p-5 font-mono text-xs overflow-y-auto space-y-1.5 bg-[#06080e]">
          {logs.map((l) => (
            <div key={l.id} className="flex items-start gap-2 leading-relaxed">
              <span className="text-slate-600 select-none">[{l.time}]</span>
              <span
                className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase ${
                  l.level === "ERROR"
                    ? "bg-rose-500/20 text-rose-400"
                    : l.level === "WARN"
                    ? "bg-amber-500/20 text-amber-300"
                    : l.level === "EXEC"
                    ? "bg-purple-500/20 text-purple-300"
                    : "bg-blue-500/15 text-blue-400"
                }`}
              >
                {l.source}
              </span>
              <span
                className={
                  l.level === "ERROR"
                    ? "text-rose-400 font-bold"
                    : l.level === "WARN"
                    ? "text-amber-300"
                    : l.level === "EXEC"
                    ? "text-cyan-300 font-bold"
                    : "text-slate-200"
                }
              >
                {l.text}
              </span>
            </div>
          ))}
          <div ref={consoleBottomRef} />
        </div>

        {/* Command Bar */}
        <form
          onSubmit={handleSendCommand}
          className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
        >
          <span className="text-cyan-400 font-mono font-bold pl-2">&gt;</span>
          <input
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowUp" && commandHistory.length > 0) {
                e.preventDefault();
                const next = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
                setHistoryIndex(next);
                setCommandInput(commandHistory[next]);
              } else if (e.key === "ArrowDown" && historyIndex !== -1) {
                e.preventDefault();
                const next = historyIndex + 1;
                if (next >= commandHistory.length) {
                  setHistoryIndex(-1);
                  setCommandInput("");
                } else {
                  setHistoryIndex(next);
                  setCommandInput(commandHistory[next]);
                }
              }
            }}
            placeholder="Type a command (e.g. /op, /gamemode, /tps, /say, /whitelist)..."
            className="flex-1 bg-transparent border-0 text-sm font-mono text-white placeholder:text-slate-600 focus:outline-none focus:ring-0"
          />
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30 flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            Send
          </button>
        </form>
      </div>

      {/* Quick Command Chips */}
      <div className="flex items-center gap-2 flex-wrap text-xs">
        <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Quick Commands:</span>
        {quickCommands.map((qc) => (
          <button
            key={qc.label}
            onClick={() => setCommandInput(qc.cmd)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 font-mono text-xs font-semibold transition-all"
          >
            {qc.label}
          </button>
        ))}
      </div>
    </div>
  );
};
