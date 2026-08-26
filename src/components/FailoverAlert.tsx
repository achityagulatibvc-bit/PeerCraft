import React from "react";
import { AlertTriangle, RefreshCw, CheckCircle, ShieldAlert } from "lucide-react";

export interface FailoverEvent {
  active: boolean;
  failedRole?: "primary" | "secondary" | "edge";
  failedDimension?: string;
  promotedNodeName?: string;
  progressPercent?: number;
  message?: string;
}

interface FailoverAlertProps {
  failover: FailoverEvent | null;
}

export const FailoverAlert: React.FC<FailoverAlertProps> = ({ failover }) => {
  if (!failover || !failover.active) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 text-amber-200">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
          <AlertTriangle className="w-5 h-5 animate-pulse" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Dimension-Isolated Failover In Progress
            </span>
            <span className="text-xs text-amber-300/80">• Overworld Uninterrupted</span>
          </div>
          <p className="text-xs text-amber-100 mt-0.5">
            {failover.message ||
              `Secondary host disconnected. Migrating ${failover.failedDimension || "Nether"} delta to ${
                failover.promotedNodeName || "Backup Node"
              }...`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
          <span className="text-xs font-mono font-bold text-amber-300">
            {failover.progressPercent || 45}%
          </span>
        </div>
      </div>
      {/* Progress Bar */}
      <div className="mt-3 w-full bg-amber-950/40 rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-amber-400 h-full rounded-full transition-all duration-500"
          style={{ width: `${failover.progressPercent || 45}%` }}
        ></div>
      </div>
    </div>
  );
};
