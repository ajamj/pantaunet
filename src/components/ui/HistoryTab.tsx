import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Clock } from "lucide-react";
import { formatBytes } from "../../utils/format";

interface ProcessHistory {
  name: string;
  download_bytes: number;
  upload_bytes: number;
  timestamp: number;
}

export const HistoryTab: React.FC = () => {
  const [history, setHistory] = useState<ProcessHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const since = 0; // Get all history for now
        const data = await invoke<ProcessHistory[]>("get_history", { since });
        setHistory(data);
      } catch (err) {
        console.error("Failed to fetch history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
    const interval = setInterval(fetchHistory, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#0a0a0a] rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Long-Term Network Usage (All Time)
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                <th className="pb-3 font-medium">Process</th>
                <th className="pb-3 font-medium text-right">Download</th>
                <th className="pb-3 font-medium text-right">Upload</th>
                <th className="pb-3 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {history.map((proc, idx) => (
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
                  <td className="py-3 text-right text-green-500">
                    {formatBytes(proc.download_bytes)}
                  </td>
                  <td className="py-3 text-right text-blue-500">
                    {formatBytes(proc.upload_bytes)}
                  </td>
                  <td className="py-3 text-right font-mono text-xs">
                    {formatBytes(proc.download_bytes + proc.upload_bytes)}
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500">
                    {loading ? "Loading historical data..." : "No historical data available"}
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
