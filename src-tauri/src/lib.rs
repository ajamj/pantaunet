use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::time::Duration;
use sysinfo::{Networks, System};
use tauri::{
    menu::{MenuBuilder, MenuItemBuilder},
    tray::{TrayIconBuilder, TrayIconEvent},
    AppHandle, Manager,
};

mod network;
use network::get_network_stats;

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
    previous_stats: Mutex<HashMap<u32, (u64, u64)>>,
    last_total_down: Mutex<u64>,
    last_total_up: Mutex<u64>,
    last_update: Mutex<i64>,
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

#[tauri::command]
fn get_network_usage(state: tauri::State<'_, Arc<AppState>>) -> Result<NetworkStats, String> {
    let system = state.system.lock().map_err(|e| e.to_string())?;
    let networks = state.networks.lock().map_err(|e| e.to_string())?;
    let previous_stats = state.previous_stats.lock().map_err(|e| e.to_string())?;
    let last_total_down = *state.last_total_down.lock().map_err(|e| e.to_string())?;
    let last_total_up = *state.last_total_up.lock().map_err(|e| e.to_string())?;

    let current_time = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map_err(|e| e.to_string())?
        .as_secs() as i64;

    let (total_download, total_upload) = get_network_stats(&networks);

    let delta_time = if state.last_update.lock().is_ok() {
        let last = *state.last_update.lock().unwrap();
        if last > 0 {
            (current_time - last).max(1) as f64
        } else {
            1.0
        }
    } else {
        1.0
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

    let mut current_stats: HashMap<u32, (u64, u64)> = HashMap::new();
    let mut processes: Vec<ProcessNetworkUsage> = Vec::new();

    for (pid, process) in system.processes() {
        let pid_u32 = pid.as_u32();
        let name = process.name().to_string_lossy().to_string();

        let net_usage = sysinfo::Networks::new_with_refreshed_list();
        let (download, upload) = get_network_stats(&net_usage);

        let prev = previous_stats.get(&pid_u32).copied().unwrap_or((0, 0));

        let speed_down = if delta_time > 0.0 && prev.0 > 0 {
            ((download.saturating_sub(prev.0)) as f64 / delta_time) as u64
        } else {
            0
        };
        let speed_up = if delta_time > 0.0 && prev.1 > 0 {
            ((upload.saturating_sub(prev.1)) as f64 / delta_time) as u64
        } else {
            0
        };

        current_stats.insert(pid_u32, (download, upload));

        if download > 0 || upload > 0 || speed_down > 0 || speed_up > 0 {
            processes.push(ProcessNetworkUsage {
                pid: pid_u32,
                name,
                download_bytes: download,
                upload_bytes: upload,
                download_speed: speed_down,
                upload_speed: speed_up,
            });
        }
    }

    processes.sort_by(|a, b| {
        (b.download_speed + b.upload_speed).cmp(&(a.download_speed + a.upload_speed))
    });

    processes.truncate(20);

    *state.previous_stats.lock().unwrap() = current_stats;
    *state.last_total_down.lock().unwrap() = total_download;
    *state.last_total_up.lock().unwrap() = total_upload;
    *state.last_update.lock().unwrap() = current_time;

    Ok(NetworkStats {
        processes,
        total_download,
        total_upload,
        download_speed,
        upload_speed,
        timestamp: current_time,
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

fn setup_tray(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let show_item = MenuItemBuilder::with_id("show", "Show Window").build(app)?;
    let quit_item = MenuItemBuilder::with_id("quit", "Quit").build(app)?;

    let menu = MenuBuilder::new(app)
        .item(&show_item)
        .separator()
        .item(&quit_item)
        .build()?;

    let _tray = TrayIconBuilder::new()
        .menu(&menu)
        .tooltip("Pantaunet - Internet Monitor")
        .on_menu_event(|app, event| match event.id().as_ref() {
            "show" => {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
            "quit" => {
                app.exit(0);
            }
            _ => {}
        })
        .on_tray_icon_event(|tray, event| match event {
            TrayIconEvent::Click { .. } => {
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
        previous_stats: Mutex::new(HashMap::new()),
        last_total_down: Mutex::new(0),
        last_total_up: Mutex::new(0),
        last_update: Mutex::new(0),
    });

    let state_clone = app_state.clone();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_store::Builder::new().build())
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
            get_system_info
        ])
        .setup(move |app| {
            setup_tray(app.handle())?;

            let state = state_clone.clone();
            std::thread::spawn(move || loop {
                std::thread::sleep(Duration::from_secs(1));
                if let Ok(mut system) = state.system.lock() {
                    system.refresh_all();
                }
                if let Ok(mut networks) = state.networks.lock() {
                    networks.refresh();
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
