import { useEffect } from "react";
import { GripVertical } from "lucide-react";
import { getCurrentWindow, LogicalPosition } from "@tauri-apps/api/window";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { Store } from "@tauri-apps/plugin-store";
import { SpeedDisplay } from "./ui/SpeedDisplay";

const store = new (Store as any)("settings.json");

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
  downloadStr?: string;
  uploadStr?: string;
}

export function Widget({ stats, downloadStr, uploadStr }: WidgetProps) {
  useEffect(() => {
    const initWidget = async () => {
      const appWindow = getCurrentWindow();

      // Load and restore position
      const savedPos = await store.get("widgetPosition") as { x: number; y: number } | null;
      if (savedPos) {
        await appWindow.setPosition(new LogicalPosition(savedPos.x, savedPos.y));
      }

      // Listen for moves to save position
      const unlistenMoved = await appWindow.onMoved(async ({ payload: pos }) => {
        await store.set("widgetPosition", { x: pos.x, y: pos.y });
        await store.save();
      });

      return unlistenMoved;
    };

    const unlistenPromise = initWidget();
    return () => {
      unlistenPromise.then((unlisten) => unlisten());
    };
  }, []);

  const handleMouseDown = () => {
    getCurrentWindow().startDragging();
  };

  const handleDoubleClick = async () => {
    const mainWindow = await WebviewWindow.getByLabel("main");
    if (mainWindow) {
      await mainWindow.show();
      await mainWindow.setFocus();
    }
  };

  const dStr = downloadStr || (stats ? "..." : "0.0 B/s");
  const uStr = uploadStr || (stats ? "..." : "0.0 B/s");

  return (
    <div
      className="group h-10 w-40 bg-[#121212]/80 backdrop-blur-md rounded-lg flex items-center justify-between px-2 text-slate-200/90 overflow-hidden border border-indigo-500/20 select-none cursor-default transition-all duration-300 hover:border-indigo-500/50 hover:shadow-[0_0_10px_rgba(99,102,241,0.3)]"
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      data-tauri-drag-region
    >
      <div className="flex items-center" data-tauri-drag-region>
        <GripVertical className="w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity mr-1" data-tauri-drag-region />
        <div className="flex items-center gap-1" data-tauri-drag-region>
          <SpeedDisplay 
            type="download" 
            value={dStr} 
            iconSize={3.5} 
            textSize="text-[10px]" 
            color="text-emerald-400" 
          />
        </div>
      </div>

      <div className="h-4 w-[1px] bg-white/10" />

      <div className="flex items-center gap-1 pr-1" data-tauri-drag-region>
        <SpeedDisplay 
          type="upload" 
          value={uStr} 
          iconSize={3.5} 
          textSize="text-[10px]" 
          color="text-sky-400" 
        />
      </div>
    </div>
  );
}

export default Widget;