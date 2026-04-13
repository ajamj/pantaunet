use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::time::Duration;
use tauri::{
    menu::{MenuBuilder, MenuItemBuilder},
    tray::{TrayIconBuilder, TrayIconEvent},
    AppHandle, Emitter, Manager,
};

mod network;
pub mod icon_generator;
mod monitor_error;
mod monitor_trait;
mod mock_monitor;
mod utils;

use monitor_trait::MonitoringTrait;
use network::WindowsMonitor;
use utils::{format_bytes, format_speed};

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
    pub monitor: Box<dyn MonitoringTrait + Send + Sync>,
    last_update: Mutex<i64>,
    theme: Mutex<String>, // "dark" or "light"
    show_dynamic_icon: Mutex<bool>,
}

#[tauri::command]
fn get_network_usage(state: tauri::State<'_, Arc<AppState>>) -> Result<NetworkStats, String> {
    let current_time_sec = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map_err(|e| e.to_string())?
        .as_secs() as i64;

    let delta_time = {
        let mut last = state.last_update.lock().map_err(|e| e.to_string())?;
        let delta = if *last > 0 {
            ((current_time_sec - *last).max(1)) as f64
        } else {
            1.0
        };
        *last = current_time_sec;
        delta
    };

    let global_stats = state.monitor.get_global_stats(delta_time).map_err(|e| e.to_string())?;
    let processes_stats = state.monitor.get_process_stats(delta_time).map_err(|e| e.to_string())?;

    let processes = processes_stats.into_iter().take(20).map(|p| ProcessNetworkUsage {
        pid: p.pid,
        name: p.name,
        download_bytes: p.download_bytes,
        upload_bytes: p.upload_bytes,
        download_speed: p.download_speed,
        upload_speed: p.upload_speed,
    }).collect();

    Ok(NetworkStats {
        processes,
        total_download: global_stats.total_download,
        total_upload: global_stats.total_upload,
        download_speed: global_stats.download_speed,
        upload_speed: global_stats.upload_speed,
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
    use sysinfo::System;
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
fn set_dynamic_icon_enabled(state: tauri::State<'_, Arc<AppState>>, enabled: bool) -> Result<(), String> {
    if let Ok(mut show) = state.show_dynamic_icon.lock() {
        *show = enabled;
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
        monitor: Box::new(WindowsMonitor::new()),
        last_update: Mutex::new(0),
        theme: Mutex::new("dark".to_string()),
        show_dynamic_icon: Mutex::new(true),
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
            toggle_widget,
            set_dynamic_icon_enabled
        ])
        .setup(move |app| {
            setup_tray(app.handle())?;

            // Background monitoring loop (1s refresh)
            let state = state_clone.clone();
            let app_handle = app.handle().clone();
            let mut last_dynamic_icon_state = true;

            std::thread::spawn(move || loop {
                std::thread::sleep(Duration::from_secs(1));

                // 1. Calculate delta time and get current time
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

                // 2. Refresh stats using trait
                let global_stats = match state.monitor.get_global_stats(delta_time) {
                    Ok(stats) => stats,
                    Err(_) => continue,
                };
                let process_stats = match state.monitor.get_process_stats(delta_time) {
                    Ok(stats) => stats,
                    Err(_) => Vec::new(),
                };

                // 3. Update Tray
                if let Some(tray) = app_handle.tray_by_id("main") {
                    let is_dynamic_enabled = *state.show_dynamic_icon.lock().unwrap();

                    // Update Icon
                    if is_dynamic_enabled {
                        let buffer = icon_generator::generate_tray_icon(global_stats.download_speed, global_stats.upload_speed);
                        let icon = tauri::image::Image::new_owned(buffer, 32, 32);
                        let _ = tray.set_icon(Some(icon));
                        last_dynamic_icon_state = true;
                    } else if last_dynamic_icon_state {
                        // Reset to default icon once when disabled
                        if let Some(icon) = app_handle.default_window_icon() {
                            let _ = tray.set_icon(Some(icon.clone()));
                        }
                        last_dynamic_icon_state = false;
                    }

                    // Update Tooltip
                    let status = if global_stats.is_online { "Online" } else { "Offline" };
                    let mut tooltip = format!(
                        "Pantaunet: {}\nDown: {} | Up: {}",
                        status,
                        format_speed(global_stats.download_speed),
                        format_speed(global_stats.upload_speed)
                    );

                    if !process_stats.is_empty() {
                        tooltip.push_str("\n---");
                        for (i, proc) in process_stats.iter().take(3).enumerate() {
                            tooltip.push_str(&format!(
                                "\n{}. {}: {}",
                                i + 1,
                                proc.name,
                                format_speed(proc.download_speed + proc.upload_speed)
                            ));
                        }
                    }

                    let _ = tray.set_tooltip(Some(&tooltip));
                }
            });

            // Verify window initialization and enforce properties
            let main_window = app.get_webview_window("main");
            let widget_window = app.get_webview_window("widget");

            if let Some(widget) = widget_window.as_ref() {
                // Strictly enforce Always on Top
                let _ = widget.set_always_on_top(true);
            }

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
