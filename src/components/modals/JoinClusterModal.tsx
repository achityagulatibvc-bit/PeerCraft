import React, { useState } from "react";
import { Key, Check, Copy, X, ShieldCheck, ArrowRight } from "lucide-react";

interface JoinClusterModalProps {
  isOpen: boolean;
  onClose: () => void;
  clusterSecret: string;
}

export const JoinClusterModal: React.FC<JoinClusterModalProps> = ({
  isOpen,
  onClose,
  clusterSecret,
}) => {
  const [copied, setCopied] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [joining, setJoining] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(clusterSecret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;

    setJoining(true);
    setTimeout(() => {
      setJoining(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Co-Host Cluster Access</h3>
              <p className="text-xs text-slate-400">Share your cluster compute without sharing cloud passwords</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Share Invite Code Card (For Host) */}
        <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>Your Cluster Invite Code</span>
            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Scoped Lease
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={clusterSecret}
              className="flex-1 bg-slate-900 border border-slate-700/70 rounded-xl px-4 py-2.5 text-xs font-mono text-cyan-300 font-bold focus:outline-none"
            />
            <button
              onClick={handleCopyCode}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-md"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Send this code to friends whose PCs will act as co-hosts. The Cloudflare Worker will automatically deliver temporary database leases.
          </p>
        </div>

        {/* 2. Join as Peer Node (For Co-Host Friend) */}
        <form onSubmit={handleJoin} className="space-y-3 pt-2 border-t border-slate-800">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Or Join Another Peer's Cluster
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Paste cluster invite code (e.g. PEERCRAFT_DEV_SHARED_SECRET)..."
              value={joinCodeInput}
              onChange={(e) => setJoinCodeInput(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={joining || !joinCodeInput.trim()}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-black transition-all flex items-center gap-1.5 shrink-0 shadow-lg shadow-emerald-600/30"
            >
              {success ? (
                <>
                  <Check className="w-4 h-4" /> Connected
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4" /> {joining ? "Connecting..." : "Join"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
