use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::time::Duration;
use sysinfo::{Networks, System};
use tauri::{
    menu::{MenuBuilder, MenuItemBuilder},
    tray::{TrayIconBuilder, TrayIconEvent},
    AppHandle, Emitter, Manager,
};

mod network;
pub mod icon_generator;
use network::{get_network_stats, is_online};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProcessNetworkUsage {
    pub pid: u32,
    pub name: String,
    pub download_bytes: u64,
    pub upload_bytes: u64,
    pub download_speed: u64,
    pub upload_speed: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkStats {
    pub processes: Vec<ProcessNetworkUsage>,
    pub total_download: u64,
    pub total_upload: u64,
    pub download_speed: u64,
    pub upload_speed: u64,
    pub timestamp: i64,
}

pub struct AppState {
    system: Mutex<System>,
    networks: Mutex<Networks>,
    last_total_down: Mutex<u64>,
    last_total_up: Mutex<u64>,
    last_update: Mutex<i64>,
    theme: Mutex<String>, // "dark" or "light"
}

fn format_bytes(bytes: u64) -> String {
    const KB: u64 = 1024;
    const MB: u64 = KB * 1024;
    const GB: u64 = MB * 1024;

    if bytes >= GB {
        format!("{:.2} GB", bytes as f64 / GB as f64)
    } else if bytes >= MB {
        format!("{:.2} MB", bytes as f64 / MB as f64)
    } else if bytes >= KB {
        format!("{:.2} KB", bytes as f64 / KB as f64)
    } else {
        format!("{} B", bytes)
    }
}

fn format_speed(bytes_per_sec: u64) -> String {
    const KB: u64 = 1024;
    const MB: u64 = KB * 1024;

    if bytes_per_sec >= MB {
        format!("{:.1} MB/s", bytes_per_sec as f64 / MB as f64)
    } else if bytes_per_sec >= KB {
        format!("{:.1} KB/s", bytes_per_sec as f64 / KB as f64)
    } else {
        format!("{} B/s", bytes_per_sec)
    }
}

/// Returns per-process IO statistics.
///
/// Note: On Windows, `disk_usage()` uses GetProcessIoCounters which reports ALL I/O
/// (disk + network + device). Per-process values include both disk and network activity.
/// This is a documented v1 limitation. A v2 upgrade path uses ETW or GetPerTcpConnectionEStats
/// for network-only accuracy.
#[tauri::command]
fn get_network_usage(state: tauri::State<'_, Arc<AppState>>) -> Result<NetworkStats, String> {
    let system = state.system.lock().map_err(|e| e.to_string())?;
    let networks = state.networks.lock().map_err(|e| e.to_string())?;
    let last_total_down = *state.last_total_down.lock().map_err(|e| e.to_string())?;
    let last_total_up = *state.last_total_up.lock().map_err(|e| e.to_string())?;

    let current_time_sec = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map_err(|e| e.to_string())?
        .as_secs() as i64;

    let (total_download, total_upload) = get_network_stats(&networks);

    let delta_time = {
        let last = *state.last_update.lock().map_err(|e| e.to_string())?;
        if last > 0 {
            ((current_time_sec - last).max(1)) as f64
        } else {
            1.0
        }
    };

    let download_speed = if delta_time > 0.0 {
        ((total_download.saturating_sub(last_total_down)) as f64 / delta_time) as u64
    } else {
        0
    };
    let upload_speed = if delta_time > 0.0 {
        ((total_upload.saturating_sub(last_total_up)) as f64 / delta_time) as u64
    } else {
        0
    };

    let mut processes: Vec<ProcessNetworkUsage> = Vec::new();

    for (pid, process) in system.processes() {
        let pid_u32 = pid.as_u32();
        let name = process.name().to_string_lossy().to_string();

        if name.is_empty() {
            continue;
        }

        let disk_usage = process.disk_usage();
        // sysinfo 0.33: read_bytes/written_bytes are already deltas since last refresh
        let download_bytes = disk_usage.read_bytes;
        let upload_bytes = disk_usage.written_bytes;

        // Skip processes with zero IO activity
        if download_bytes == 0 && upload_bytes == 0 {
            continue;
        }

        // Speed = delta / refresh_interval (delta_time is ~1 second from background thread)
        let download_speed = (download_bytes as f64 / delta_time) as u64;
        let upload_speed = (upload_bytes as f64 / delta_time) as u64;

        processes.push(ProcessNetworkUsage {
            pid: pid_u32,
            name,
            download_bytes,
            upload_bytes,
            download_speed,
            upload_speed,
        });
    }

    // Sort by total bandwidth descending
    processes.sort_by(|a, b| {
        let total_a = a.download_bytes + a.upload_bytes;
        let total_b = b.download_bytes + b.upload_bytes;
        total_b.cmp(&total_a)
    });

    // Keep top 20
    processes.truncate(20);

    *state.last_total_down.lock().unwrap() = total_download;
    *state.last_total_up.lock().unwrap() = total_upload;
    *state.last_update.lock().unwrap() = current_time_sec;

    Ok(NetworkStats {
        processes,
        total_download,
        total_upload,
        download_speed,
        upload_speed,
        timestamp: current_time_sec,
    })
}

#[tauri::command]
fn format_bytes_command(bytes: u64) -> String {
    format_bytes(bytes)
}

#[tauri::command]
fn format_speed_command(bytes_per_sec: u64) -> String {
    format_speed(bytes_per_sec)
}

#[tauri::command]
fn get_system_info() -> HashMap<String, String> {
    let mut info = HashMap::new();
    let system = System::new_all();

    info.insert(
        "os".to_string(),
        System::name().unwrap_or_else(|| "Unknown".to_string()),
    );
    info.insert(
        "hostname".to_string(),
        System::host_name().unwrap_or_else(|| "Unknown".to_string()),
    );
    info.insert("cpu_count".to_string(), system.cpus().len().to_string());
    info.insert(
        "total_memory".to_string(),
        format_bytes(system.total_memory()),
    );

    info
}

#[tauri::command]
fn test_dynamic_icon(app_handle: AppHandle) -> Result<(), String> {
    let buffer = icon_generator::generate_tray_icon(1024 * 1024, 1024 * 512);
    if let Some(tray) = app_handle.tray_by_id("main") {
        let icon = tauri::image::Image::new_owned(buffer, 32, 32);
        tray.set_icon(Some(icon)).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn toggle_widget(app_handle: AppHandle) -> Result<(), String> {
    if let Some(window) = app_handle.get_webview_window("widget") {
        let is_visible = window.is_visible().unwrap_or(false);
        if is_visible {
            window.hide().map_err(|e| e.to_string())?;
        } else {
            window.show().map_err(|e| e.to_string())?;
            window.set_focus().map_err(|e| e.to_string())?;
        }
        let _ = app_handle.emit("widget-visibility-changed", !is_visible);
    }
    Ok(())
}

fn setup_tray(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let show_item = MenuItemBuilder::with_id("show", "Show Window").build(app)?;
    let hide_item = MenuItemBuilder::with_id("hide", "Hide Window").build(app)?;
    let widget_item = MenuItemBuilder::with_id("toggle_widget", "Toggle Widget").build(app)?;
    let theme_item = MenuItemBuilder::with_id("toggle_theme", "Toggle Theme: Dark → Light").build(app)?;
    let speed_item = MenuItemBuilder::with_id("speed", "Toggle Speed Display").build(app)?;
    let separator1 = tauri::menu::PredefinedMenuItem::separator(app)?;
    let quit_item = tauri::menu::PredefinedMenuItem::quit(app, Some("Quit"))?;

    let menu = MenuBuilder::new(app)
        .item(&show_item)
        .item(&hide_item)
        .separator()
        .item(&widget_item)
        .item(&theme_item)
        .separator()
        .item(&speed_item)
        .item(&separator1)
        .item(&quit_item)
        .build()?;

    // Build initial tooltip with theme
    let theme_emoji = "🌙";
    let tooltip = format!("{} Dark — Pantaunet", theme_emoji);

    let _tray = TrayIconBuilder::with_id("main")
        .icon(app.default_window_icon().unwrap().clone())
        .menu(&menu)
        .tooltip(&tooltip)
        .on_menu_event(|app, event| match event.id().as_ref() {
            "show" => {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
            "hide" => {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.hide();
                }
            }
            "toggle_widget" => {
                let _ = toggle_widget(app.clone());
            }
            "toggle_theme" => {
                if let Some(state) = app.try_state::<Arc<AppState>>() {
                    let mut theme = state.theme.lock().unwrap();
                    let new_theme = if *theme == "dark" {
                        "light".to_string()
                    } else {
                        "dark".to_string()
                    };
                    *theme = new_theme.clone();

                    // Update menu item label (stored for future dynamic update)
                    let _new_label = if new_theme == "dark" {
                        "Toggle Theme: Light → Dark"
                    } else {
                        "Toggle Theme: Dark → Light"
                    };

                    // Update tooltip
                    let tooltip_emoji = if new_theme == "dark" { "🌙" } else { "☀️" };
                    let tooltip = format!("{} {} — Pantaunet", tooltip_emoji, new_theme);
                    if let Some(tray) = app.tray_by_id("main") {
                        let _ = tray.set_tooltip(Some(&tooltip));
                    }

                    // Emit event to frontend
                    let _ = app.emit("theme-changed", new_theme);
                }
            }
            "speed" => {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.emit("toggle-speed", ());
                }
            }
            "quit" => {
                app.exit(0);
            }
            _ => {}
        })
        .on_tray_icon_event(|tray, event| match event {
            TrayIconEvent::Click {
                button: tauri::tray::MouseButton::Left,
                ..
            } => {
                let app = tray.app_handle();
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
            _ => {}
        })
        .build(app)?;

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app_state = Arc::new(AppState {
        system: Mutex::new(System::new_all()),
        networks: Mutex::new(Networks::new_with_refreshed_list()),
        last_total_down: Mutex::new(0),
        last_total_up: Mutex::new(0),
        last_update: Mutex::new(0),
        theme: Mutex::new("dark".to_string()),
    });

    let state_clone = app_state.clone();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(
            tauri_plugin_log::Builder::new()
                .target(tauri_plugin_log::Target::new(
                    tauri_plugin_log::TargetKind::LogDir {
                        file_name: Some("pantaunet".into()),
                    },
                ))
                .build(),
        )
        .manage(app_state.clone())
        .invoke_handler(tauri::generate_handler![
            get_network_usage,
            format_bytes_command,
            format_speed_command,
            get_system_info,
            test_dynamic_icon,
            toggle_widget
        ])
        .setup(move |app| {
            setup_tray(app.handle())?;

            // Background monitoring loop (1s refresh)
            let state = state_clone.clone();
            let app_handle = app.handle().clone();
            std::thread::spawn(move || loop {
                std::thread::sleep(Duration::from_secs(1));

                // 1. Refresh system/networks and get stats
                let mut total_download = 0;
                let mut total_upload = 0;
                let mut is_connected = false;

                if let Ok(mut system) = state.system.lock() {
                    system.refresh_all();
                }

                if let Ok(mut networks) = state.networks.lock() {
                    networks.refresh(true);
                    let (down, up) = get_network_stats(&networks);
                    total_download = down;
                    total_upload = up;
                    is_connected = is_online(&networks);
                }

                // 2. Calculate speeds
                let current_time_sec = std::time::SystemTime::now()
                    .duration_since(std::time::UNIX_EPOCH)
                    .unwrap_or_default()
                    .as_secs() as i64;

                let delta_time = {
                    let mut last = state.last_update.lock().unwrap();
                    let delta = if *last > 0 {
                        (current_time_sec - *last).max(1) as f64
                    } else {
                        1.0
                    };
                    *last = current_time_sec;
                    delta
                };

                let (down_speed, up_speed) = {
                    let mut last_down = state.last_total_down.lock().unwrap();
                    let mut last_up = state.last_total_up.lock().unwrap();

                    let ds = if *last_down > 0 {
                        (total_download.saturating_sub(*last_down) as f64 / delta_time) as u64
                    } else {
                        0
                    };
                    let us = if *last_up > 0 {
                        (total_upload.saturating_sub(*last_up) as f64 / delta_time) as u64
                    } else {
                        0
                    };

                    *last_down = total_download;
                    *last_up = total_upload;

                    (ds, us)
                };

                // 3. Update Tray
                if let Some(tray) = app_handle.tray_by_id("main") {
                    // Update Icon
                    let buffer = icon_generator::generate_tray_icon(down_speed, up_speed);
                    let icon = tauri::image::Image::new_owned(buffer, 32, 32);
                    let _ = tray.set_icon(Some(icon));

                    // Update Tooltip (Simple version for Wave 07-02)
                    let status = if is_connected { "Online" } else { "Offline" };
                    let tooltip = format!("Pantaunet: {}\nDown: {}\nUp: {}", 
                        status, 
                        format_speed(down_speed), 
                        format_speed(up_speed)
                    );
                    let _ = tray.set_tooltip(Some(&tooltip));
                }
            });

            // Verify window initialization
            let main_window = app.get_webview_window("main");
            let widget_window = app.get_webview_window("widget");

            match (main_window, widget_window) {
                (Some(_), Some(_)) => {
                    println!("Tauri: Multi-window setup confirmed (main, widget)");
                }
                _ => {
                    eprintln!("Tauri Warning: Could not find all configured windows in setup");
                }
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
