import React, { useState } from "react";
import { Users, Shield, Ban, Globe, Plus, Trash2, Check } from "lucide-react";

interface PlayerItem {
  id: string;
  name: string;
  uuid?: string;
  reason?: string;
  level?: number;
}

export const PlayersTab: React.FC = () => {
  const [subTab, setSubTab] = useState<"ops" | "whitelist" | "banned" | "banned_ips">("ops");
  const [inputName, setInputName] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const [ops, setOps] = useState<PlayerItem[]>([
    { id: "1", name: "ServerAdmin", level: 4, uuid: "00000000-0000-0000-0009-01f81014e304" },
    { id: "2", name: "AlexCraft", level: 4 },
  ]);

  const [whitelist, setWhitelist] = useState<PlayerItem[]>([
    { id: "1", name: "ServerAdmin" },
    { id: "2", name: "AlexCraft" },
    { id: "3", name: "ShadowCrafter_99" },
  ]);

  const [bannedPlayers, setBannedPlayers] = useState<PlayerItem[]>([
    { id: "1", name: "Griefer_X", reason: "X-Ray and griefing at spawn" },
  ]);

  const [bannedIps, setBannedIps] = useState<PlayerItem[]>([
    { id: "1", name: "192.168.1.105", reason: "Spam bot connection" },
  ]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputName.trim()) return;
    const name = inputName.trim();

    if (subTab === "ops") {
      setOps((prev) => [...prev, { id: Date.now().toString(), name, level: 4 }]);
      showToast(`Added ${name} as server operator`);
    } else if (subTab === "whitelist") {
      setWhitelist((prev) => [...prev, { id: Date.now().toString(), name }]);
      showToast(`Added ${name} to whitelist`);
    } else if (subTab === "banned") {
      setBannedPlayers((prev) => [...prev, { id: Date.now().toString(), name, reason: "Banned by Admin" }]);
      showToast(`Banned player ${name}`);
    } else if (subTab === "banned_ips") {
      setBannedIps((prev) => [...prev, { id: Date.now().toString(), name, reason: "Banned by Admin" }]);
      showToast(`Banned IP ${name}`);
    }

    setInputName("");
  };

  const handleRemove = (id: string, name: string) => {
    if (subTab === "ops") setOps((prev) => prev.filter((p) => p.id !== id));
    else if (subTab === "whitelist") setWhitelist((prev) => prev.filter((p) => p.id !== id));
    else if (subTab === "banned") setBannedPlayers((prev) => prev.filter((p) => p.id !== id));
    else if (subTab === "banned_ips") setBannedIps((prev) => prev.filter((p) => p.id !== id));
    showToast(`Removed ${name}`);
  };

  const currentList =
    subTab === "ops"
      ? ops
      : subTab === "whitelist"
      ? whitelist
      : subTab === "banned"
      ? bannedPlayers
      : bannedIps;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Player Management</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage server operators, whitelist access, and player / IP bans.
          </p>
        </div>

        {toast && (
          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
            <Check className="w-3.5 h-3.5" /> {toast}
          </span>
        )}
      </div>

      {/* 4 Aternos Subtabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900 rounded-2xl border border-slate-800">
        {[
          { id: "ops", label: "Operators (Ops)", icon: Shield },
          { id: "whitelist", label: "Whitelist", icon: Users },
          { id: "banned", label: "Banned Players", icon: Ban },
          { id: "banned_ips", label: "Banned IPs", icon: Globe },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id as any)}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Add Player Input Form */}
      <form onSubmit={handleAdd} className="flex gap-3">
        <input
          type="text"
          placeholder={
            subTab === "banned_ips"
              ? "Enter IP address (e.g. 192.168.1.100)..."
              : "Enter Minecraft player username..."
          }
          value={inputName}
          onChange={(e) => setInputName(e.target.value)}
          className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-5 py-3 text-xs font-bold text-white focus:outline-none focus:border-blue-500 placeholder:text-slate-600 shadow-inner"
        />
        <button
          type="submit"
          className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </form>

      {/* Player List Table / Grid */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
          <span>{currentList.length} Entries in {subTab.toUpperCase()}</span>
        </div>

        <div className="divide-y divide-slate-800/60">
          {currentList.length === 0 ? (
            <div className="text-center py-12 text-slate-600 text-xs italic">
              No entries currently in this list.
            </div>
          ) : (
            currentList.map((player) => (
              <div
                key={player.id}
                className="p-4 flex items-center justify-between hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  {/* Player Head Icon (Using Crafatar API with fallback) */}
                  <div className="w-9 h-9 rounded-xl bg-slate-800 overflow-hidden border border-slate-700/80 shrink-0 flex items-center justify-center">
                    {subTab === "banned_ips" ? (
                      <Globe className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <img
                        src={`https://mc-heads.net/avatar/${player.name}/36`}
                        alt={player.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as any).src = "https://mc-heads.net/avatar/Steve/36";
                        }}
                      />
                    )}
                  </div>

                  <div>
                    <div className="text-sm font-bold text-white">{player.name}</div>
                    {player.reason && (
                      <div className="text-xs text-rose-400/90">{player.reason}</div>
                    )}
                    {player.level && (
                      <div className="text-[10px] text-blue-400 font-bold">OP Level {player.level} (Full Permissions)</div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleRemove(player.id, player.name)}
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
