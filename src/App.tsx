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
  Eye,
  EyeOff,
} from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { Store } from "@tauri-apps/plugin-store";
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";
import { Widget } from "./components/Widget";

// Settings store — persisted across sessions
const store = new (Store as any)("settings.json");

interface AppSettings {
  theme: string;
  usageThresholdMB: number;
  speedThresholdMBps: number;
  updateIntervalMs: number;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: "dark",
  usageThresholdMB: 1000,
  speedThresholdMBps: 10,
  updateIntervalMs: 1000,
};

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

function App() {
  const [stats, setStats] = useState<NetworkStats | null>(null);
  const [history, setHistory] = useState<
    { time: string; download: number; upload: number; downloadStr: string; uploadStr: string }[]
  >([]);
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [usageThreshold, setUsageThreshold] = useState(
    DEFAULT_SETTINGS.usageThresholdMB * 1024 * 1024
  );
  const [speedThreshold, setSpeedThreshold] = useState(
    DEFAULT_SETTINGS.speedThresholdMBps * 1024 * 1024
  );
  const [updateInterval, setUpdateInterval] = useState(
    DEFAULT_SETTINGS.updateIntervalMs
  );
  const [showSpeed, setShowSpeed] = useState(true);
  const [showDynamicIcon, setShowDynamicIcon] = useState(true);
  const [showDesktopWidget, setShowDesktopWidget] = useState(false);
  const lastNotified = useRef<number>(0);
  const lastSpeedNotified = useRef<number>(0);

  const [formattedStats, setFormattedStats] = useState<{
    total_download: string;
    total_upload: string;
    download_speed: string;
    upload_speed: string;
    processes: { pid: number; name: string; download_speed: string; upload_speed: string; total: string }[];
  } | null>(null);

  // Helper to format via backend
  const formatBytes = (bytes: number) => invoke<string>("format_bytes_command", { bytes });
  const formatSpeed = (bytesPerSec: number) => invoke<string>("format_speed_command", { bytesPerSec });

  // Update formatted stats when raw stats change
  useEffect(() => {
    if (!stats) return;

    const updateFormatted = async () => {
      const [total_download, total_upload, download_speed, upload_speed] = await Promise.all([
        formatBytes(stats.total_download),
        formatBytes(stats.total_upload),
        formatSpeed(stats.download_speed),
        formatSpeed(stats.upload_speed)
      ]);

      const processes = await Promise.all(stats.processes.slice(0, 10).map(async (p) => ({
        pid: p.pid,
        name: p.name,
        download_speed: await formatSpeed(p.download_speed),
        upload_speed: await formatSpeed(p.upload_speed),
        total: await formatBytes(p.download_bytes + p.upload_bytes)
      })));

      setFormattedStats({
        total_download,
        total_upload,
        download_speed,
        upload_speed,
        processes
      });
    };

    updateFormatted();
  }, [stats]);

  // Data export functions
  async function exportCSV() {
    const date = new Date().toISOString().split("T")[0];
    const filename = `pantaunet-export-${date}.csv`;

    let csv = "Time,Download Bytes,Upload Bytes\n";
    for (const row of history) {
      csv += `${row.time},${row.download},${row.upload}\n`;
    }

    if (stats) {
      csv += "\n\nSummary\n";
      csv += `Total Download,${stats.total_download}\n`;
      csv += `Total Upload,${stats.total_upload}\n`;
      csv += `Timestamp,${stats.timestamp}\n`;
    }

    if (stats && stats.processes.length > 0) {
      csv +=
        "\n\nProcess,Download Bytes,Upload Bytes,Download Speed,Upload Speed\n";
      for (const proc of stats.processes) {
        csv += `${proc.name},${proc.download_bytes},${proc.upload_bytes},${proc.download_speed},${proc.upload_speed}\n`;
      }
    }

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function exportJSON() {
    const date = new Date().toISOString().split("T")[0];
    const filename = `pantaunet-export-${date}.json`;

    const data = {
      exportedAt: new Date().toISOString(),
      history,
      summary: stats
        ? {
            totalDownload: stats.total_download,
            totalUpload: stats.total_upload,
            timestamp: stats.timestamp,
          }
        : null,
      processes: stats?.processes || [],
    };

    const json = JSON.stringify(data, null, 2);

    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  useEffect(() => {
    const init = async () => {
      // Load persisted settings
      const savedTheme = await store.get("theme") as string | null;
      const savedUsageThreshold = await store.get("usageThresholdMB") as number | null;
      const savedSpeedThreshold = await store.get("speedThresholdMBps") as number | null;
      const savedInterval = await store.get("updateIntervalMs") as number | null;
      const savedWidgetVisible = await store.get("widgetVisible") as boolean | null;
      const savedDynamicIcon = await store.get("dynamicIconEnabled") as boolean | null;

      if (savedTheme) setDarkMode(savedTheme === "dark");
      if (savedUsageThreshold !== null && savedUsageThreshold !== undefined) {
        setUsageThreshold(savedUsageThreshold * 1024 * 1024);
      }
      if (savedSpeedThreshold !== null && savedSpeedThreshold !== undefined) {
        setSpeedThreshold(savedSpeedThreshold * 1024 * 1024);
      }
      if (savedInterval !== null && savedInterval !== undefined) {
        setUpdateInterval(savedInterval);
      }

      // Default dynamic icon to true if not set
      if (savedDynamicIcon === null || savedDynamicIcon === undefined) {
        setShowDynamicIcon(true);
        await invoke("set_dynamic_icon_enabled", { enabled: true });
      } else {
        setShowDynamicIcon(savedDynamicIcon);
        await invoke("set_dynamic_icon_enabled", { enabled: savedDynamicIcon });
      }

      // Restore widget visibility
      const windowLabel = (window as any).__TAURI_INTERNALS__?.metadata?.windowLabel;
      if (windowLabel === "main") {
        const isVisible = savedWidgetVisible || false;
        setShowDesktopWidget(isVisible);
        
        const { getCurrentWindow } = await import("@tauri-apps/api/window");
        const appWindow = getCurrentWindow();
        const widgetWindow = await (appWindow as any).getWebviewWindow("widget");
        if (widgetWindow && isVisible) {
          await widgetWindow.show();
        }
      }

      setLoading(false);

      // Request notification permission
      const granted = await isPermissionGranted();
      if (!granted) {
        await requestPermission();
      }
    };
    init();

    const unlistenSpeed = listen("toggle-speed", () => {
      setShowSpeed((prev) => !prev);
    });

    const unlistenTheme = listen<string>("theme-changed", async (event) => {
      const newTheme = event.payload;
      setDarkMode(newTheme === "dark");
      await store.set("theme", newTheme);
      await store.save();
    });

    const unlistenWidget = listen("widget-visibility-changed", async (event: any) => {
      const visible = event.payload;
      setShowDesktopWidget(visible);
      await store.set("widgetVisible", visible);
      await store.save();
    });

    const interval = setInterval(async () => {
      try {
        const data = await invoke<NetworkStats>("get_network_usage");
        setStats(data);

        const now = new Date();
        const time = `${now.getHours().toString().padStart(2, "0")}:${now
          .getMinutes()
          .toString()
          .padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;

        const ds = await formatSpeed(data.download_speed);
        const us = await formatSpeed(data.upload_speed);

        setHistory((prev) => {
          const newHistory = [
            ...prev,
            {
              time,
              download: data.download_speed,
              upload: data.upload_speed,
              downloadStr: ds,
              uploadStr: us,
            },
          ];
          return newHistory.slice(-60);
        });

        // Usage threshold notification
        const oneHourAgo = Date.now() - 3600000;
        if (
          data.total_download > usageThreshold &&
          lastNotified.current < oneHourAgo
        ) {
          lastNotified.current = Date.now();
          if (await isPermissionGranted()) {
            sendNotification({
              title: "Pantaunet - Usage Alert",
              body: `Total download exceeded ${Math.round(usageThreshold / (1024 * 1024))} MB`,
            });
          }
        }

        // Speed threshold notification
        if (
          (data.download_speed > speedThreshold ||
            data.upload_speed > speedThreshold) &&
          lastSpeedNotified.current < oneHourAgo
        ) {
          lastSpeedNotified.current = Date.now();
          if (await isPermissionGranted()) {
            sendNotification({
              title: "Pantaunet - Speed Alert",
              body: `Network speed exceeded ${Math.round(speedThreshold / (1024 * 1024))} MB/s`,
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch network stats:", err);
      }
    }, updateInterval);

    return () => {
      clearInterval(interval);
      unlistenSpeed.then((fn) => fn());
      unlistenTheme.then((fn) => fn());
      unlistenWidget.then((fn) => fn());
    };
  }, [usageThreshold, updateInterval, speedThreshold]);

  const windowLabel = (window as any).__TAURI_INTERNALS__?.metadata?.windowLabel;

  if (windowLabel === "widget") {
    return <Widget stats={stats} downloadStr={formattedStats?.download_speed} uploadStr={formattedStats?.upload_speed} />;
  }

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
              onClick={() => setShowSpeed(!showSpeed)}
              className={`p-2 rounded-lg transition-colors ${
                showSpeed
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
              title={showSpeed ? "Hide Real-time Speed" : "Show Real-time Speed"}
            >
              {showSpeed ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </button>
            {showSpeed && formattedStats && (
              <div className="flex items-center gap-3 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-1">
                  <ArrowDown className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-green-500">
                    {formattedStats.download_speed}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <ArrowUp className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-blue-500">
                    {formattedStats.upload_speed}
                  </span>
                </div>
              </div>
            )}
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
            <main className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-80px)]">
            {/* Speed Meters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <ArrowDown className="w-6 h-6 text-green-500" />
                <span className="text-gray-500 dark:text-gray-400">Download</span>
              </div>
              <div className="text-4xl font-bold text-green-500">
                {formattedStats ? formattedStats.download_speed : "---"}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Total: {formattedStats ? formattedStats.total_download : "---"}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <ArrowUp className="w-6 h-6 text-blue-500" />
                <span className="text-gray-500 dark:text-gray-400">Upload</span>
              </div>
              <div className="text-4xl font-bold text-blue-500">
                {formattedStats ? formattedStats.upload_speed : "---"}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Total: {formattedStats ? formattedStats.total_upload : "---"}
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
                  />
                  <Tooltip
                    labelFormatter={(label) => `Time: ${label}`}
                    formatter={(_value, name, props) => {
                      const entry = props.payload;
                      return [name === "Download" ? entry.downloadStr : entry.uploadStr, name];
                    }}
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
                  {formattedStats?.processes.map((proc, idx) => (
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
                        {proc.download_speed}
                      </td>
                      <td className="py-3 text-right text-blue-500">
                        {proc.upload_speed}
                      </td>
                      <td className="py-3 text-right">
                        {proc.total}
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
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6 sticky top-0 bg-white dark:bg-gray-800 py-1">
                <h2 className="text-xl font-bold">Settings</h2>
                <button
                  onClick={() => setSettingsOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Windows Integration Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-blue-500 uppercase tracking-wider">Windows Integration</h3>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div>
                      <p className="font-medium">Dynamic Tray Icon</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Display live speeds in the system tray</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showDynamicIcon}
                        onChange={async (e) => {
                          const enabled = e.target.checked;
                          setShowDynamicIcon(enabled);
                          await store.set("dynamicIconEnabled", enabled);
                          await store.save();
                          await invoke("set_dynamic_icon_enabled", { enabled });
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div>
                      <p className="font-medium">Desktop Widget</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Floating window on your desktop</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showDesktopWidget}
                        onChange={async (e) => {
                          const enabled = e.target.checked;
                          setShowDesktopWidget(enabled);
                          await invoke("toggle_widget");
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                {/* Theme Selection */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Appearance</h3>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex-1 justify-center">
                      <input
                        type="radio"
                        name="theme"
                        value="dark"
                        checked={darkMode}
                        onChange={async () => {
                          setDarkMode(true);
                          await store.set("theme", "dark");
                          await store.save();
                        }}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span>🌙 Dark</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex-1 justify-center">
                      <input
                        type="radio"
                        name="theme"
                        value="light"
                        checked={!darkMode}
                        onChange={async () => {
                          setDarkMode(false);
                          await store.set("theme", "light");
                          await store.save();
                        }}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span>☀️ Light</span>
                    </label>
                  </div>
                </div>

                {/* Notifications Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Notifications</h3>
                  
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-500">
                      Usage Notification Threshold (MB)
                    </label>
                    <input
                      type="number"
                      value={Math.round(usageThreshold / (1024 * 1024))}
                      onChange={async (e) => {
                        const mb = parseInt(e.target.value) || 0;
                        setUsageThreshold(mb * 1024 * 1024);
                        await store.set("usageThresholdMB", mb);
                        await store.save();
                      }}
                      className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border-0 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-500">
                      Speed Notification Threshold (MB/s)
                    </label>
                    <input
                      type="number"
                      value={Math.round(speedThreshold / (1024 * 1024))}
                      onChange={async (e) => {
                        const mbps = parseInt(e.target.value) || 0;
                        setSpeedThreshold(mbps * 1024 * 1024);
                        await store.set("speedThresholdMBps", mbps);
                        await store.save();
                      }}
                      className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border-0 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                {/* Update Interval */}
                <div>
                  <label className="block text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Update Frequency
                  </label>
                  <select
                    value={updateInterval}
                    onChange={async (e) => {
                      const interval = parseInt(e.target.value);
                      setUpdateInterval(interval);
                      await store.set("updateIntervalMs", interval);
                      await store.save();
                    }}
                    className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border-0 focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                  >
                    <option value={500}>High (500ms)</option>
                    <option value={1000}>Normal (1s)</option>
                    <option value={2000}>Balanced (2s)</option>
                    <option value={5000}>Low (5s)</option>
                    <option value={10000}>Minimal (10s)</option>
                  </select>
                </div>

                {/* Data Export */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Maintenance
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={exportCSV}
                      disabled={!stats || history.length === 0}
                      className="flex-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                    >
                      Export CSV
                    </button>
                    <button
                      onClick={exportJSON}
                      disabled={!stats || history.length === 0}
                      className="flex-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                    >
                      Export JSON
                    </button>
                  </div>
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