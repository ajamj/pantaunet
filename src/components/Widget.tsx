import { ArrowDown, ArrowUp } from "lucide-react";

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

interface WidgetProps {
  stats: NetworkStats | null;
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

export function Widget({ stats }: WidgetProps) {
  return (
    <div className="h-screen w-full bg-black/50 backdrop-blur-md rounded-lg flex items-center justify-around px-2 text-white overflow-hidden border border-white/10 select-none data-[tauri-drag-region]:cursor-default" data-tauri-drag-region>
      <div className="flex items-center gap-1" data-tauri-drag-region>
        <ArrowDown className="w-4 h-4 text-green-500" />
        <span className="text-xs font-bold font-mono">
          {stats ? formatSpeed(stats.download_speed) : "0.0 B/s"}
        </span>
      </div>
      <div className="h-4 w-[1px] bg-white/20" />
      <div className="flex items-center gap-1" data-tauri-drag-region>
        <ArrowUp className="w-4 h-4 text-blue-500" />
        <span className="text-xs font-bold font-mono">
          {stats ? formatSpeed(stats.upload_speed) : "0.0 B/s"}
        </span>
      </div>
    </div>
  );
}

export default Widget;