import React from "react";

interface StatusBadgeProps {
  online: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ online }) => {
  return (
    <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
      online 
        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
        : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${online ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
      {online ? "Online" : "Offline"}
    </div>
  );
};
