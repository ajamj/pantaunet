use sysinfo::{Networks, System};
use crate::monitor_error::MonitorError;
use crate::monitor_trait::{MonitoringTrait, GlobalStats, ProcessStats};
use std::sync::Mutex;

pub struct WindowsMonitor {
    system: Mutex<System>,
    networks: Mutex<Networks>,
    last_total_down: Mutex<u64>,
    last_total_up: Mutex<u64>,
    last_update: Mutex<i64>,
}

impl WindowsMonitor {
    pub fn new() -> Self {
        Self {
            system: Mutex::new(System::new_all()),
            networks: Mutex::new(Networks::new_with_refreshed_list()),
            last_total_down: Mutex::new(0),
            last_total_up: Mutex::new(0),
            last_update: Mutex::new(0),
        }
    }
}

impl MonitoringTrait for WindowsMonitor {
    fn get_global_stats(&self, delta_time: f64) -> Result<GlobalStats, MonitorError> {
        let mut networks = self.networks.lock().map_err(|_| MonitorError::Internal("Failed to lock networks".to_string()))?;
        networks.refresh(true);
        
        let (total_download, total_upload) = get_network_stats(&networks);
        let is_online = is_online(&networks);

        let mut last_down = self.last_total_down.lock().map_err(|_| MonitorError::Internal("Failed to lock last_down".to_string()))?;
        let mut last_up = self.last_total_up.lock().map_err(|_| MonitorError::Internal("Failed to lock last_up".to_string()))?;

        let download_speed = if *last_down > 0 {
            (total_download.saturating_sub(*last_down) as f64 / delta_time) as u64
        } else {
            0
        };
        let upload_speed = if *last_up > 0 {
            (total_upload.saturating_sub(*last_up) as f64 / delta_time) as u64
        } else {
            0
        };

        *last_down = total_download;
        *last_up = total_upload;

        Ok(GlobalStats {
            total_download,
            total_upload,
            download_speed,
            upload_speed,
            is_online,
        })
    }

    fn get_process_stats(&self, delta_time: f64) -> Result<Vec<ProcessStats>, MonitorError> {
        let mut system = self.system.lock().map_err(|_| MonitorError::Internal("Failed to lock system".to_string()))?;
        system.refresh_all();

        let mut processes = Vec::new();
        for (pid, process) in system.processes() {
            let name = process.name().to_string_lossy().to_string();
            if name.is_empty() {
                continue;
            }

            let disk_usage = process.disk_usage();
            let download_bytes = disk_usage.read_bytes;
            let upload_bytes = disk_usage.written_bytes;

            if download_bytes == 0 && upload_bytes == 0 {
                continue;
            }

            processes.push(ProcessStats {
                pid: pid.as_u32(),
                name,
                download_bytes,
                upload_bytes,
                download_speed: (download_bytes as f64 / delta_time) as u64,
                upload_speed: (upload_bytes as f64 / delta_time) as u64,
            });
        }

        processes.sort_by(|a, b| {
            let total_a = a.download_bytes + a.upload_bytes;
            let total_b = b.download_bytes + b.upload_bytes;
            total_b.cmp(&total_a)
        });

        Ok(processes)
    }
}

pub fn get_network_stats(networks: &Networks) -> (u64, u64) {
    let mut total_download: u64 = 0;
    let mut total_upload: u64 = 0;

    for (_name, network) in networks.iter() {
        total_download += network.total_received();
        total_upload += network.total_transmitted();
    }

    (total_download, total_upload)
}

pub fn is_online(networks: &Networks) -> bool {
    networks.iter().any(|(_name, network)| {
        network.received() > 0 || network.transmitted() > 0
    })
}
