import React, { useEffect, useState, useMemo } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Clock, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { formatBytes } from "../../utils/format";
import { useAppStore } from "../../store/appStore";

interface ProcessHistory {
  name: string;
  download_bytes: number;
  upload_bytes: number;
}

type SortField = "name" | "download_bytes" | "upload_bytes" | "total";
type SortOrder = "asc" | "desc";

interface TimeRange {
  label: string;
  value: number; // seconds
}

const TIME_RANGES: TimeRange[] = [
  { label: "Last Hour", value: 3600 },
  { label: "Last 6 Hours", value: 21600 },
  { label: "Last 24 Hours", value: 86400 },
  { label: "Last 7 Days", value: 604800 },
  { label: "All Time", value: 0 },
];

export const HistoryTab: React.FC = () => {
  const { historyTimeRange, setHistoryTimeRange } = useAppStore();
  const [history, setHistory] = useState<ProcessHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>("total");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const now = Math.floor(Date.now() / 1000);
      const since = historyTimeRange === 0 ? 0 : now - historyTimeRange;
      const data = await invoke<ProcessHistory[]>("get_history", { since });
      setHistory(data);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 60000);
    return () => clearInterval(interval);
  }, [historyTimeRange]);

  const sortedHistory = useMemo(() => {
    const sorted = [...history];
    sorted.sort((a, b) => {
      let valA: number | string;
      let valB: number | string;

      if (sortField === "name") {
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
      } else if (sortField === "total") {
        valA = a.download_bytes + a.upload_bytes;
        valB = b.download_bytes + b.upload_bytes;
      } else {
        valA = a[sortField];
        valB = b[sortField];
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [history, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 opacity-30" />;
    return sortOrder === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Clock className="w-6 h-6 text-indigo-500" />
          Network Usage History
        </h2>
        
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          {TIME_RANGES.map((range) => (
            <button
              key={range.label}
              onClick={() => setHistoryTimeRange(range.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                historyTimeRange === range.value
                  ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                <th 
                  className="pb-3 font-medium cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 group"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center gap-1">
                    Process <SortIcon field="name" />
                  </div>
                </th>
                <th 
                  className="pb-3 font-medium text-right cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                  onClick={() => handleSort("download_bytes")}
                >
                  <div className="flex items-center justify-end gap-1">
                    Download <SortIcon field="download_bytes" />
                  </div>
                </th>
                <th 
                  className="pb-3 font-medium text-right cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                  onClick={() => handleSort("upload_bytes")}
                >
                  <div className="flex items-center justify-end gap-1">
                    Upload <SortIcon field="upload_bytes" />
                  </div>
                </th>
                <th 
                  className="pb-3 font-medium text-right cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                  onClick={() => handleSort("total")}
                >
                  <div className="flex items-center justify-end gap-1">
                    Total <SortIcon field="total" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedHistory.map((proc, idx) => (
                <tr
                  key={proc.name}
                  className="border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                >
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">#{idx + 1}</span>
                      <span className="font-medium truncate max-w-[200px]">
                        {proc.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 text-right text-green-500 text-sm">
                    {formatBytes(proc.download_bytes)}
                  </td>
                  <td className="py-3 text-right text-blue-500 text-sm">
                    {formatBytes(proc.upload_bytes)}
                  </td>
                  <td className="py-3 text-right font-mono text-xs font-semibold">
                    {formatBytes(proc.download_bytes + proc.upload_bytes)}
                  </td>
                </tr>
              ))}
              {!loading && sortedHistory.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-500">
                    No historical data found for this period.
                  </td>
                </tr>
              )}
              {loading && sortedHistory.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
