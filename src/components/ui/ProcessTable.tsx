import React, { useState, useMemo } from "react";
import { Download, Upload, Shield, ShieldAlert, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { useAppStore } from "../../store/appStore";

interface Process {
  pid: number;
  name: string;
  download_speed: string;
  upload_speed: string;
  total_download: string;
  total_upload: string;
  // Raw values for sorting
  download_speed_raw?: number;
  upload_speed_raw?: number;
  total_download_raw?: number;
  total_upload_raw?: number;
}

interface ProcessTableProps {
  processes: Process[];
  loading?: boolean;
}

type SortField = "name" | "pid" | "download_speed" | "upload_speed" | "total_download" | "total_upload";
type SortOrder = "asc" | "desc";

export const ProcessTable: React.FC<ProcessTableProps> = ({ processes, loading }) => {
  const { blockedApps, blockApp, allowApp } = useAppStore();
  const [sortField, setSortField] = useState<SortField>("download_speed");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const sortedProcesses = useMemo(() => {
    const sorted = [...processes];
    sorted.sort((a, b) => {
      let valA: any;
      let valB: any;

      if (sortField === "name") {
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
      } else if (sortField === "pid") {
        valA = a.pid;
        valB = b.pid;
      } else {
        valA = (a as any)[`${sortField}_raw`] ?? 0;
        valB = (b as any)[`${sortField}_raw`] ?? 0;
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [processes, sortField, sortOrder]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 opacity-30" />;
    return sortOrder === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
            <th 
              className="pb-3 font-medium cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
              onClick={() => handleSort("name")}
            >
              <div className="flex items-center gap-1">
                Process <SortIcon field="name" />
              </div>
            </th>
            <th 
              className="pb-3 font-medium cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
              onClick={() => handleSort("pid")}
            >
              <div className="flex items-center gap-1">
                PID <SortIcon field="pid" />
              </div>
            </th>
            <th 
              className="pb-3 font-medium text-right cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
              onClick={() => handleSort("download_speed")}
            >
              <div className="flex items-center justify-end gap-1">
                <Download className="w-4 h-4 inline mr-1 text-emerald-500" />
                Down <SortIcon field="download_speed" />
              </div>
            </th>
            <th 
              className="pb-3 font-medium text-right cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
              onClick={() => handleSort("upload_speed")}
            >
              <div className="flex items-center justify-end gap-1">
                <Upload className="w-4 h-4 inline mr-1 text-sky-500" />
                Up <SortIcon field="upload_speed" />
              </div>
            </th>
            <th 
              className="pb-3 font-medium text-right cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
              onClick={() => handleSort("total_download")}
            >
              <div className="flex items-center justify-end gap-1">
                Total Down <SortIcon field="total_download" />
              </div>
            </th>
            <th 
              className="pb-3 font-medium text-right cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
              onClick={() => handleSort("total_upload")}
            >
              <div className="flex items-center justify-end gap-1">
                Total Up <SortIcon field="total_upload" />
              </div>
            </th>
            <th className="pb-3 font-medium text-center">Access</th>
          </tr>
        </thead>
        <tbody>
          {sortedProcesses.map((proc, idx) => {
            const isBlocked = blockedApps.includes(proc.name);
            return (
              <tr
                key={`${proc.pid}-${proc.name}`}
                className={`border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors ${
                  isBlocked ? "opacity-50" : "hover:bg-gray-50 dark:hover:bg-gray-700/30"
                }`}
              >
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">#{idx + 1}</span>
                    <span className={`font-medium truncate max-w-[150px] ${isBlocked ? "line-through text-gray-400" : ""}`}>
                      {proc.name}
                    </span>
                  </div>
                </td>
                <td className="py-3 text-xs text-gray-500 dark:text-gray-400">
                  {proc.pid}
                </td>
                <td className="py-3 text-right text-emerald-500 text-sm font-medium">
                  {proc.download_speed}
                </td>
                <td className="py-3 text-right text-sky-500 text-sm font-medium">
                  {proc.upload_speed}
                </td>
                <td className="py-3 text-right text-gray-600 dark:text-gray-400 text-xs font-mono">
                  {proc.total_download}
                </td>
                <td className="py-3 text-right text-gray-600 dark:text-gray-400 text-xs font-mono">
                  {proc.total_upload}
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
          {sortedProcesses.length === 0 && (
            <tr>
              <td colSpan={7} className="py-8 text-center text-gray-500">
                {loading ? "Loading..." : "No network data available"}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
