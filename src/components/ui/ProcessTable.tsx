import React from "react";
import { Download, Upload } from "lucide-react";

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
          </tr>
        </thead>
        <tbody>
          {processes.map((proc, idx) => (
            <tr
              key={proc.pid}
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
            </tr>
          ))}
          {processes.length === 0 && (
            <tr>
              <td colSpan={5} className="py-8 text-center text-gray-500">
                {loading ? "Loading..." : "No network data available"}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
