import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { Store } from "@tauri-apps/plugin-store";

const tauriStore = new (Store as any)("settings.json");

interface AppState {
  darkMode: boolean;
  usageThreshold: number;
  speedThreshold: number;
  updateInterval: number;
  showSpeed: boolean;
  showDynamicIcon: boolean;
  showDesktopWidget: boolean;
  historyTimeRange: number;
  
  setDarkMode: (dark: boolean) => Promise<void>;
  setUsageThreshold: (mb: number) => Promise<void>;
  setSpeedThreshold: (mbps: number) => Promise<void>;
  setUpdateInterval: (ms: number) => Promise<void>;
  setShowSpeed: (show: boolean) => void;
  setShowDynamicIcon: (show: boolean) => Promise<void>;
  setShowDesktopWidget: (show: boolean) => void;
  setHistoryTimeRange: (range: number) => Promise<void>;
  
  blockedApps: string[];
  blockApp: (name: string) => Promise<void>;
  allowApp: (name: string) => Promise<void>;

  loadSettings: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  darkMode: true,
  usageThreshold: 1000 * 1024 * 1024,
  speedThreshold: 10 * 1024 * 1024,
  updateInterval: 1000,
  showSpeed: true,
  showDynamicIcon: true,
  showDesktopWidget: false,
  historyTimeRange: 86400, // Default 24h
  blockedApps: [],

  setDarkMode: async (dark) => {
    set({ darkMode: dark });
    await tauriStore.set("theme", dark ? "dark" : "light");
    await tauriStore.save();
  },

  setUsageThreshold: async (mb) => {
    const bytes = mb * 1024 * 1024;
    set({ usageThreshold: bytes });
    await tauriStore.set("usageThresholdMB", mb);
    await tauriStore.save();
  },

  setSpeedThreshold: async (mbps) => {
    const bytes = mbps * 1024 * 1024;
    set({ speedThreshold: bytes });
    await tauriStore.set("speedThresholdMBps", mbps);
    await tauriStore.save();
  },

  setUpdateInterval: async (ms) => {
    set({ updateInterval: ms });
    await tauriStore.set("updateIntervalMs", ms);
    await tauriStore.save();
  },

  setShowSpeed: (show) => set({ showSpeed: show }),

  setShowDynamicIcon: async (show) => {
    set({ showDynamicIcon: show });
    await tauriStore.set("dynamicIconEnabled", show);
    await tauriStore.save();
    await invoke("set_dynamic_icon_enabled", { enabled: show });
  },

  setHistoryTimeRange: async (range) => {
    set({ historyTimeRange: range });
    await tauriStore.set("historyTimeRange", range);
    await tauriStore.save();
  },

  setShowDesktopWidget: async (show) => {
    set({ showDesktopWidget: show });
    await tauriStore.set("widgetVisible", show);
    await tauriStore.save();
    
    try {
      const { WebviewWindow } = await import("@tauri-apps/api/webviewWindow");
      const widgetWindow = await WebviewWindow.getByLabel("widget");
      if (widgetWindow) {
        if (show) {
          await widgetWindow.show();
          await widgetWindow.setFocus();
        } else {
          await widgetWindow.hide();
        }
      }
    } catch (err) {
      console.error("Failed to toggle widget window:", err);
    }
  },

  blockApp: async (name) => {
    try {
      await invoke("block_process", { name, path: name });
      const newBlocked = [...get().blockedApps, name];
      set({ blockedApps: newBlocked });
      await tauriStore.set("blockedApps", newBlocked);
      await tauriStore.save();
    } catch (err) {
      console.error("Failed to block app:", err);
      alert(`Failed to block ${name}. Ensure you have administrator privileges.`);
    }
  },

  allowApp: async (name) => {
    try {
      await invoke("allow_process", { name });
      const newBlocked = get().blockedApps.filter(n => n !== name);
      set({ blockedApps: newBlocked });
      await tauriStore.set("blockedApps", newBlocked);
      await tauriStore.save();
    } catch (err) {
      console.error("Failed to allow app:", err);
      alert(`Failed to allow ${name}. Ensure you have administrator privileges.`);
    }
  },

  loadSettings: async () => {
    const theme = await tauriStore.get("theme") as string | null;
    const usageMB = await tauriStore.get("usageThresholdMB") as number | null;
    const speedMBps = await tauriStore.get("speedThresholdMBps") as number | null;
    const interval = await tauriStore.get("updateIntervalMs") as number | null;
    const dynamicIcon = await tauriStore.get("dynamicIconEnabled") as boolean | null;
    const widgetVisible = await tauriStore.get("widgetVisible") as boolean | null;
    const historyRange = await tauriStore.get("historyTimeRange") as number | null;
    const blockedApps = await tauriStore.get("blockedApps") as string[] | null;

    set({
      darkMode: theme ? theme === "dark" : true,
      usageThreshold: (usageMB || 1000) * 1024 * 1024,
      speedThreshold: (speedMBps || 10) * 1024 * 1024,
      updateInterval: interval || 1000,
      showDynamicIcon: dynamicIcon !== null ? dynamicIcon : true,
      showDesktopWidget: widgetVisible || false,
      historyTimeRange: historyRange !== null ? historyRange : 86400,
      blockedApps: blockedApps || [],
    });
  },
}));
