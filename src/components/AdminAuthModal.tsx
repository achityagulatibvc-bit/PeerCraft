import React, { useState } from "react";
import { Shield, Key, Lock, Unlock, X, CheckCircle2, AlertTriangle } from "lucide-react";

interface AdminAuthModalProps {
  isOpen: boolean;
  isAdmin: boolean;
  onAuthenticate: (success: boolean) => void;
  onClose: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  isAdmin,
  onAuthenticate,
  onClose,
}) => {
  const [passkey, setPasskey] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      passkey.trim().toLowerCase() === "admin" ||
      passkey.trim().toLowerCase() === "peercraft" ||
      passkey.length >= 4
    ) {
      setError("");
      setSuccessMsg("Elevated Administrator access granted.");
      setTimeout(() => {
        onAuthenticate(true);
        setSuccessMsg("");
        setPasskey("");
        onClose();
      }, 600);
    } else {
      setError("Invalid passkey. Default admin key is 'admin' or any 4+ char key.");
    }
  };

  const handleLogout = () => {
    onAuthenticate(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl shadow-blue-500/10 overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 p-0.5 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {isAdmin ? "Admin Security Controls" : "Elevated Admin Access"}
              </h3>
              <p className="text-xs text-slate-400">Pterodactyl PaperMC Management</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isAdmin ? (
          <div className="mt-6 space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-emerald-300">Administrator Privileges Active</h4>
                <p className="text-xs text-slate-300 mt-1">
                  You have full root access to the PaperMC Pterodactyl interface, interactive console, live file editor, plugin installer, and JVM configuration.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Account Role:</span>
                <span className="font-bold text-cyan-400">Cluster Administrator</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Access Level:</span>
                <span className="font-mono text-white">ROOT / RCON ALL</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Server Online Mode:</span>
                <span className="font-bold text-amber-400">FALSE (Cracked / Offline OK)</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-200 hover:text-rose-200 border border-slate-700 hover:border-rose-500/40 text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4 text-rose-400" />
                Relinquish Admin Privileges
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/30"
              >
                Continue to Panel
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed">
              Authenticate to unlock the <strong className="text-cyan-300">Pterodactyl PaperMC Control Panel</strong>, live RCON terminal, file manager, and server configuration suite. Standard players remain in Client Mode.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Admin Passkey / Master Secret
              </label>
              <div className="relative">
                <Key className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  value={passkey}
                  onChange={(e) => setPasskey(e.target.value)}
                  placeholder="Enter admin passkey (e.g. 'admin')"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/90 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                  autoFocus
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Default local passkey is <span className="text-slate-300 font-mono">admin</span> or your cluster token.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 text-xs text-rose-300">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-1/2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2"
              >
                <Unlock className="w-4 h-4" />
                Unlock Admin
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
