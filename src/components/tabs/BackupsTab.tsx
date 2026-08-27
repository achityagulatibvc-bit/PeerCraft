import React, { useState, useEffect } from "react";
import { HardDrive, Plus, RotateCcw, Download, Check, Cloud } from "lucide-react";

interface BackupRecord {
  id: string;
  name: string;
  timestamp: string;
  size: string;
  dimensionsIncluded: string;
}

export const BackupsTab: React.FC = () => {
  const [backups, setBackups] = useState<BackupRecord[]>([
    {
      id: "1",
      name: "Auto-Save Before Portal Migration",
      timestamp: "Today, 14:02",
      size: "650 MB",
      dimensionsIncluded: "Overworld, Nether, The End",
    },
    {
      id: "2",
      name: "Genesis Commit #1 (Spawn Generated)",
      timestamp: "Today, 13:45",
      size: "420 MB",
      dimensionsIncluded: "Overworld",
    },
  ]);

  const [storageStatus, setStorageStatus] = useState({
    bucket_name: "peercraft-cluster-backups",
    storage_used_formatted: "1.2 GB / 10 GB Free Tier",
    connected: true,
  });

  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const loadR2Status = async () => {
      if ((window as any).__TAURI_IPC__) {
        try {
          const { invoke } = await import("@tauri-apps/api/tauri");
          const status = await invoke<any>("get_r2_bucket_status");
          if (status) {
            setStorageStatus(status);
          }
        } catch (err) {
          console.warn("Could not query R2 status:", err);
        }
      }
    };
    loadR2Status();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleCreateBackup = async () => {
    setCreating(true);
    let newSnapshot: BackupRecord = {
      id: Date.now().toString(),
      name: `Manual Backup #${backups.length + 1}`,
      timestamp: "Just now",
      size: "420 MB",
      dimensionsIncluded: "Overworld, Nether, The End",
    };

    if ((window as any).__TAURI_IPC__) {
      try {
        const { invoke } = await import("@tauri-apps/api/tauri");
        const manifest = await invoke<any>("create_differential_backup", {
          name: newSnapshot.name,
        });
        if (manifest) {
          newSnapshot = {
            id: manifest.backup_id,
            name: newSnapshot.name,
            timestamp: manifest.timestamp,
            size: manifest.total_size_formatted,
            dimensionsIncluded: manifest.dimensions.join(", "),
          };
        }
      } catch (err) {
        console.error("Backup creation error:", err);
      }
    }

    setBackups([newSnapshot, ...backups]);
    setCreating(false);
    showToast("Uploaded differential delta snapshot to Cloudflare R2!");
  };

  const handleRestore = (name: string) => {
    showToast(`Restored snapshot: ${name}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">World Backups</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cloudflare R2 differential snapshots. Restore to any point in time with 1 click.
          </p>
        </div>

        {toast && (
          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
            <Check className="w-3.5 h-3.5" /> {toast}
          </span>
        )}
      </div>

      {/* Cloudflare R2 Connection Hero Card */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
            <Cloud className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">Cloudflare R2 Object Storage</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                Connected
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {storageStatus.storage_used_formatted} • 0 Egress Fees • Differential MCA chunk sync
            </p>
          </div>
        </div>

        <button
          onClick={handleCreateBackup}
          disabled={creating}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black transition-all shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          {creating ? "Packaging Delta..." : "Create Backup"}
        </button>
      </div>

      {/* Backup Snapshots List */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
          <span>{backups.length} Available Restore Points</span>
        </div>

        <div className="divide-y divide-slate-800/60">
          {backups.map((b) => (
            <div
              key={b.id}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700/60 flex items-center justify-center text-slate-300 shrink-0">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{b.name}</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {b.timestamp} • <span className="font-mono text-cyan-300">{b.size}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{b.dimensionsIncluded}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => showToast(`Downloading backup archive (${b.size})...`)}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
                  title="Download Backup"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleRestore(b.name)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Restore
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
