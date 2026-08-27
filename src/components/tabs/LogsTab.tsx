import React, { useState } from "react";
import { Search, Copy, Check, Share2 } from "lucide-react";

export const LogsTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [copied, setCopied] = useState(false);
  const [sharedToast, setSharedToast] = useState(false);

  const rawLogs = [
    "[14:00:00] [Server thread/INFO]: Starting minecraft server version 1.20.4",
    "[14:00:00] [Server thread/INFO]: Loading properties",
    "[14:00:01] [Server thread/INFO]: This server is running Paper version git-Paper-498 (MC: 1.20.4) (Implementing API version 1.20.4-R0.1-SNAPSHOT)",
    "[14:00:01] [Server thread/INFO]: [HuskSync] Enabling HuskSync v3.4.2",
    "[14:00:02] [Server thread/INFO]: [HuskSync] Connected to Supabase PostgreSQL database successfully.",
    "[14:00:02] [Server thread/WARN]: **** SERVER IS RUNNING IN OFFLINE/CRACKED MODE!",
    "[14:00:02] [Server thread/WARN]: The server will make no attempt to authenticate usernames. Beware.",
    "[14:00:03] [Server thread/INFO]: Preparing level 'world'",
    "[14:00:04] [Server thread/INFO]: Preparing start region for dimension minecraft:overworld",
    "[14:00:05] [Server thread/INFO]: Time elapsed: 1250 ms",
    "[14:00:06] [Server thread/INFO]: Running delayed init tasks",
    "[14:00:06] [Server thread/INFO]: [Velocity] Registered backend modern forwarding secret",
    "[14:00:07] [Server thread/INFO]: Done (7.123s)! For help, type \"help\"",
    "[14:02:10] [User Authenticator #1/INFO]: UUID of player ShadowCrafter_99 is 00000000-0000-0000-0009-01f81014e304",
    "[14:02:10] [Server thread/INFO]: ShadowCrafter_99[/127.0.0.1:54320] logged in with entity id 124 at ([world]0.5, 64.0, 0.5)",
    "[14:02:10] [Server thread/INFO]: [HuskSync] Synchronized data snapshot for ShadowCrafter_99 from Supabase in 42ms.",
  ];

  const filteredLogs = rawLogs.filter((line) =>
    line.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(rawLogs.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    setSharedToast(true);
    setTimeout(() => setSharedToast(false), 2500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white">Server Log</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Full diagnostic server log history and crash report inspection.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            {sharedToast ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            {sharedToast ? "Uploaded to mclo.gs!" : "Share Log"}
          </button>
          <button
            onClick={handleCopy}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Filter log output (e.g. error, HuskSync, player name)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono shadow-inner"
        />
      </div>

      {/* Log Feed Display Box */}
      <div className="rounded-3xl bg-[#080c14] border border-slate-800 p-6 font-mono text-xs overflow-y-auto max-h-[calc(100vh-280px)] space-y-1.5 shadow-2xl">
        {filteredLogs.length === 0 ? (
          <div className="text-slate-600 italic text-center py-12">No matching log lines found.</div>
        ) : (
          filteredLogs.map((line, i) => {
            const isWarn = line.includes("/WARN");
            const isError = line.includes("/ERROR") || line.includes("Exception");
            return (
              <div
                key={i}
                className={`leading-relaxed whitespace-pre-wrap ${
                  isError
                    ? "text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded"
                    : isWarn
                    ? "text-amber-400"
                    : "text-slate-300"
                }`}
              >
                {line}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
