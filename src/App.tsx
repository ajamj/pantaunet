import { useState, useEffect, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  ArrowDown,
  ArrowUp,
  Wifi,
  Settings,
  Moon,
  Sun,
  Download,
  Upload,
  Activity,
  X,
} from "lucide-react";
import { invoke } from "@tauri-apps/api/core";

interface ProcessNetworkUsage {
  pid: number;
  name: string;
  download_bytes: number;
  upload_bytes: number;
  download_speed: number;
  upload_speed: number;
}

interface NetworkStats {
  processes: ProcessNetworkUsage[];
  total_download: number;
  total_upload: number;
  download_speed: number;
  upload_speed: number;
  timestamp: number;
}

function formatBytes(bytes: number): string {
  const KB = 1024;
  const MB = KB * 1024;
  const GB = MB * 1024;

  if (bytes >= GB) {
    return `${(bytes / GB).toFixed(2)} GB`;
  } else if (bytes >= MB) {
    return `${(bytes / MB).toFixed(2)} MB`;
  } else if (bytes >= KB) {
    return `${(bytes / KB).toFixed(2)} KB`;
  }
  return `${bytes} B`;
}

function formatSpeed(bytesPerSec: number): string {
  const KB = 1024;
  const MB = KB * 1024;

  if (bytesPerSec >= MB) {
    return `${(bytesPerSec / MB).toFixed(1)} MB/s`;
  } else if (bytesPerSec >= KB) {
    return `${(bytesPerSec / KB).toFixed(1)} KB/s`;
  }
  return `${bytesPerSec} B/s`;
}

function App() {
  const [stats, setStats] = useState<NetworkStats | null>(null);
  const [history, setHistory] = useState<
    { time: string; download: number; upload: number }[]
  >([]);
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [usageThreshold, setUsageThreshold] = useState(1000);
  const lastNotified = useRef<number>(0);

  useEffect(() => {
    setLoading(false);

    const interval = setInterval(async () => {
      try {
        const data = await invoke<NetworkStats>("get_network_usage");
        setStats(data);

        const now = new Date();
        const time = `${now.getHours().toString().padStart(2, "0")}:${now
          .getMinutes()
          .toString()
          .padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;

        setHistory((prev) => {
          const newHistory = [
            ...prev,
            {
              time,
              download: data.download_speed,
              upload: data.upload_speed,
            },
          ];
          return newHistory.slice(-60);
        });

        const oneHourAgo = Date.now() - 3600000;
        if (
          data.total_download > usageThreshold * 1024 * 1024 &&
          lastNotified.current < oneHourAgo
        ) {
          lastNotified.current = Date.now();
        }
      } catch (err) {
        console.error("Failed to fetch network stats:", err);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [usageThreshold]);

  return (
    <div className={`${darkMode ? "dark" : ""} h-screen w-full bg-gray-900`}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Wifi className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Pantaunet</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Internet Usage Monitor
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setSettingsOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6 space-y-6">
          {/* Speed Meters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <ArrowDown className="w-6 h-6 text-green-500" />
                <span className="text-gray-500 dark:text-gray-400">Download</span>
              </div>
              <div className="text-4xl font-bold text-green-500">
                {stats ? formatSpeed(stats.download_speed) : "---"}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Total: {stats ? formatBytes(stats.total_download) : "---"}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <ArrowUp className="w-6 h-6 text-blue-500" />
                <span className="text-gray-500 dark:text-gray-400">Upload</span>
              </div>
              <div className="text-4xl font-bold text-blue-500">
                {stats ? formatSpeed(stats.upload_speed) : "---"}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Total: {stats ? formatBytes(stats.total_upload) : "---"}
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Network Speed History
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history}>
                  <XAxis
                    dataKey="time"
                    stroke={darkMode ? "#6b7280" : "#9ca3af"}
                    fontSize={10}
                    tickLine={false}
                  />
                  <YAxis
                    stroke={darkMode ? "#6b7280" : "#9ca3af"}
                    fontSize={10}
                    tickLine={false}
                    tickFormatter={(v) => formatSpeed(v)}
                  />
                  <Tooltip
                    formatter={(value) => formatSpeed(Number(value))}
                    contentStyle={{
                      backgroundColor: darkMode ? "#1f2937" : "#fff",
                      border: "none",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="download"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={false}
                    name="Download"
                  />
                  <Line
                    type="monotone"
                    dataKey="upload"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                    name="Upload"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Process List */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Top Processes
            </h3>
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
                  {stats?.processes.slice(0, 10).map((proc, idx) => (
                    <tr
                      key={proc.pid}
                      className="border-b border-gray-100 dark:border-gray-700 last:border-0"
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
                        {formatSpeed(proc.download_speed)}
                      </td>
                      <td className="py-3 text-right text-blue-500">
                        {formatSpeed(proc.upload_speed)}
                      </td>
                      <td className="py-3 text-right">
                        {formatBytes(proc.download_bytes + proc.upload_bytes)}
                      </td>
                    </tr>
                  ))}
                  {(!stats || stats.processes.length === 0) && (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-8 text-center text-gray-500"
                      >
                        {loading ? "Loading..." : "No network data available"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        {/* Settings Panel */}
        {settingsOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Settings</h2>
                <button
                  onClick={() => setSettingsOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Usage Notification Threshold (MB)
                  </label>
                  <input
                    type="number"
                    value={usageThreshold / 1024}
                    onChange={(e) =>
                      setUsageThreshold((parseInt(e.target.value) || 0) * 1024)
                    }
                    className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border-0"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;