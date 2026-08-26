import React, { useState } from "react";
import { Terminal, Copy, Trash2, Check } from "lucide-react";

interface ConsoleLog {
  id: string;
  timestamp: string;
  source: "velocity" | "overworld" | "nether_end" | "system";
  level: "INFO" | "WARN" | "ERROR";
  message: string;
}

interface ConsoleViewerProps {
  logs: ConsoleLog[];
  onClearLogs?: () => void;
}

export const ConsoleViewer: React.FC<ConsoleViewerProps> = ({ logs, onClearLogs }) => {
  const [activeTab, setActiveTab] = useState<"all" | "velocity" | "overworld" | "nether_end">("all");
  const [copied, setCopied] = useState(false);

  const filteredLogs = logs.filter((log) => {
    if (activeTab === "all") return true;
    return log.source === activeTab;
  });

  const handleCopy = () => {
    const text = filteredLogs.map((l) => `[${l.timestamp}] [${l.source.toUpperCase()}/${l.level}] ${l.message}`).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl bg-slate-900/80 border border-slate-800/80 flex flex-col h-72 overflow-hidden shadow-xl">
      {/* Top Bar / Tabs */}
      <div className="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Cluster Console</span>
        </div>

        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          {(["all", "velocity", "overworld", "nether_end"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab === "all" ? "All Output" : tab === "velocity" ? "Velocity" : tab === "overworld" ? "Overworld" : "Nether/End"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            title="Copy Logs"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
          </button>
          {onClearLogs && (
            <button
              onClick={onClearLogs}
              title="Clear Logs"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Log Feed */}
      <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-1.5 bg-[#090d14]">
        {filteredLogs.length === 0 ? (
          <div className="text-slate-600 italic text-center py-10">No log output available for this stream.</div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className="flex items-start gap-2 leading-relaxed">
              <span className="text-slate-600 select-none">[{log.timestamp}]</span>
              <span
                className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase ${
                  log.source === "velocity"
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                    : log.source === "overworld"
                    ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                    : log.source === "nether_end"
                    ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                    : "bg-slate-700 text-slate-300"
                }`}
              >
                {log.source}
              </span>
              <span
                className={`font-semibold ${
                  log.level === "ERROR"
                    ? "text-red-400 font-bold"
                    : log.level === "WARN"
                    ? "text-amber-400"
                    : "text-slate-300"
                }`}
              >
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
