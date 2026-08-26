import React, { useState } from "react";

interface Player {
  uuid: string;
  name: string;
  isCracked: boolean;
  isOp: boolean;
  dimension: string;
  ping: number;
}

export const PlayersTab: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([
    {
      uuid: "00000000-0000-0000-0009-01f81014e304",
      name: "ServerAdmin",
      isCracked: false,
      isOp: true,
      dimension: "Overworld",
      ping: 8,
    },
    {
      uuid: "e839121a-49bf-33b0-91bc-318029ab0f9a",
      name: "ShadowCrafter_99",
      isCracked: true,
      isOp: false,
      dimension: "Overworld",
      ping: 28,
    },
    {
      uuid: "f1a23456-7890-4abc-def1-234567890abc",
      name: "Alex_Miner",
      isCracked: true,
      isOp: false,
      dimension: "Nether",
      ping: 34,
    },
    {
      uuid: "a9988776-5544-3322-1100-aabbccddeeff",
      name: "EnderSlayer",
      isCracked: false,
      isOp: false,
      dimension: "The End",
      ping: 42,
    },
  ]);

  const toggleOp = (name: string) => {
    setPlayers((prev) =>
      prev.map((p) => (p.name === name ? { ...p, isOp: !p.isOp } : p))
    );
  };

  const kickPlayer = (name: string) => {
    setPlayers((prev) => prev.filter((p) => p.name !== name));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Player Management</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage online players (both TLauncher/cracked and Mojang accounts).
          </p>
        </div>
        <span className="px-3.5 py-1.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-bold text-white">
          {players.length} Players Online
        </span>
      </div>

      {/* Players List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {players.map((p) => (
          <div
            key={p.uuid}
            className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between shadow-xl"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-base shadow-md">
                {p.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-base">{p.name}</h3>
                  {p.isOp && (
                    <span className="px-2 py-0.5 text-[9px] font-black bg-rose-500/20 text-rose-300 rounded border border-rose-500/30">
                      OP
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                  <span className="text-cyan-300 font-semibold">{p.dimension}</span>
                  <span>•</span>
                  <span className="font-mono text-emerald-400">{p.ping}ms</span>
                  <span>•</span>
                  <span className={p.isCracked ? "text-amber-400 font-semibold" : "text-slate-400"}>
                    {p.isCracked ? "Cracked" : "Mojang"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleOp(p.name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  p.isOp
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
                }`}
              >
                {p.isOp ? "De-OP" : "Make OP"}
              </button>
              <button
                onClick={() => kickPlayer(p.name)}
                className="px-3 py-1.5 rounded-xl bg-rose-900/40 hover:bg-rose-800 text-rose-200 border border-rose-700/50 text-xs font-bold transition-all"
              >
                Kick
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
