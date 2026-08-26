import React, { useState } from "react";
import { HardDrive, Plus } from "lucide-react";

interface BackupItem {
  id: string;
  name: string;
  size: string;
  date: string;
}

export const BackupsTab: React.FC = () => {
  const [backups, setBackups] = useState<BackupItem[]>([
    {
      id: "1",
      name: "world_snapshot_auto_1400.tar.gz",
      size: "412.5 MB",
      date: "Today at 14:00 (Auto)",
    },
    {
      id: "2",
      name: "world_pre_cluster_handoff.tar.gz",
      size: "398.2 MB",
      date: "Yesterday at 22:45",
    },
  ]);

  const [creating, setCreating] = useState(false);

  const handleCreate = () => {
    setCreating(true);
    setTimeout(() => {
      setBackups((prev) => [
        {
          id: Date.now().toString(),
          name: `world_manual_${new Date().toISOString().slice(0, 10)}.tar.gz`,
          size: "418.0 MB",
          date: "Just now",
        },
        ...prev,
      ]);
      setCreating(false);
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">World Backups</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Instantaneous world snapshots saved locally and synced to Cloudflare R2.
          </p>
        </div>
        <button
          onClick={handleCreate}
          disabled={creating}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/25 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {creating ? "Saving Snapshot..." : "Create Backup Now"}
        </button>
      </div>

      <div className="space-y-3">
        {backups.map((b) => (
          <div
            key={b.id}
            className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between shadow-xl"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <HardDrive className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm font-mono">{b.name}</h3>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                  <span>{b.size}</span>
                  <span>•</span>
                  <span>{b.date}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => alert(`Restoring ${b.name}...`)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all"
            >
              Restore World
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
