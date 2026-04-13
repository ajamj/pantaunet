import React from "react";
import { Download, Upload, Shield, ShieldAlert } from "lucide-react";
import { useAppStore } from "../../store/appStore";

interface Process {
  pid: number;
  name: string;
  download_speed: string;
  upload_speed: string;
  total: string;
}

interface ProcessTableProps {
  processes: Process[];
  loading?: boolean;
}

export const ProcessTable: React.FC<ProcessTableProps> = ({ processes, loading }) => {
  const { blockedApps, blockApp, allowApp } = useAppStore();

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
            <th className="pb-3 font-medium">Process</th>
            <th className="pb-3 font-medium">PID</th>
            <th className="pb-3 font-medium text-right">
              <Download className="w-4 h-4 inline mr-1" />
              Download
            </th>
            <th className="pb-3 font-medium text-right">
              <Upload className="w-4 h-4 inline mr-1" />
              Upload
            </th>
            <th className="pb-3 font-medium text-right">Total</th>
            <th className="pb-3 font-medium text-center">Access</th>
          </tr>
        </thead>
        <tbody>
          {processes.map((proc, idx) => {
            const isBlocked = blockedApps.includes(proc.name);
            return (
              <tr
                key={proc.pid}
                className={`border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors ${
                  isBlocked ? "opacity-50" : "hover:bg-gray-50 dark:hover:bg-gray-700/30"
                }`}
              >
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">#{idx + 1}</span>
                    <span className={`font-medium truncate max-w-[200px] ${isBlocked ? "line-through text-gray-400" : ""}`}>
                      {proc.name}
                    </span>
                  </div>
                </td>
                <td className="py-3 text-gray-500 dark:text-gray-400">
                  {proc.pid}
                </td>
                <td className="py-3 text-right text-green-500">
                  {proc.download_speed}
                </td>
                <td className="py-3 text-right text-blue-500">
                  {proc.upload_speed}
                </td>
                <td className="py-3 text-right font-mono text-xs">
                  {proc.total}
                </td>
                <td className="py-3 text-center">
                  <button
                    onClick={() => isBlocked ? allowApp(proc.name) : blockApp(proc.name)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isBlocked 
                        ? "bg-rose-100 text-rose-600 hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-400" 
                        : "bg-emerald-100 text-emerald-600 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400"
                    }`}
                    title={isBlocked ? "Allow Internet Access" : "Block Internet Access"}
                  >
                    {isBlocked ? <ShieldAlert className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                  </button>
                </td>
              </tr>
            );
          })}
          {processes.length === 0 && (
            <tr>
              <td colSpan={6} className="py-8 text-center text-gray-500">
                {loading ? "Loading..." : "No network data available"}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
