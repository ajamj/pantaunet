use sysinfo::{Networks, System};
use crate::monitor_error::MonitorError;
use crate::monitor_trait::{MonitoringTrait, GlobalStats, ProcessStats};
use std::sync::Mutex;
use std::collections::HashSet;

#[cfg(target_os = "windows")]
use windows::Win32::NetworkManagement::IpHelper::{
    GetExtendedTcpTable, MIB_TCPTABLE_OWNER_PID, TCP_TABLE_OWNER_PID_ALL,
};
#[cfg(target_os = "windows")]
use windows::Win32::Networking::WinSock::AF_INET;

pub struct WindowsMonitor {
    system: Mutex<System>,
    networks: Mutex<Networks>,
    last_total_down: Mutex<u64>,
    last_total_up: Mutex<u64>,
    _last_update: Mutex<i64>, // unused, prefixed with _
}

impl WindowsMonitor {
    pub fn new() -> Self {
        Self {
            system: Mutex::new(System::new_all()),
            networks: Mutex::new(Networks::new_with_refreshed_list()),
            last_total_down: Mutex::new(0),
            last_total_up: Mutex::new(0),
            _last_update: Mutex::new(0),
        }
    }

    #[cfg(target_os = "windows")]
    fn get_active_network_pids(&self) -> HashSet<u32> {
        let mut pids = HashSet::new();
        let mut size = 0;

        // Use AF_INET.0 manually to avoid type issues if needed, but AF_INET is u16.
        let af_inet = AF_INET.0 as u32;

        unsafe {
            let _ = GetExtendedTcpTable(
                None,
                &mut size,
                true,
                af_inet,
                TCP_TABLE_OWNER_PID_ALL,
                0,
            );

            if size > 0 {
                let mut buffer: Vec<u8> = vec![0; size as usize];
                if GetExtendedTcpTable(
                    Some(buffer.as_mut_ptr() as *mut _),
                    &mut size,
                    true,
                    af_inet,
                    TCP_TABLE_OWNER_PID_ALL,
                    0,
                ) == 0 { // NO_ERROR
                    let table = &*(buffer.as_ptr() as *const MIB_TCPTABLE_OWNER_PID);
                    let rows = std::slice::from_raw_parts(
                        table.table.as_ptr(),
                        table.dwNumEntries as usize,
                    );
                    for row in rows {
                        pids.insert(row.dwOwningPid);
                    }
                }
            }
        }
        pids
    }

    #[cfg(not(target_os = "windows"))]
    fn get_active_network_pids(&self) -> HashSet<u32> {
        HashSet::new() // Fallback
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

        // Phase 13: Accurate network-only process matching via active TCP connections
        let active_pids = self.get_active_network_pids();

        let mut processes = Vec::new();
        for (pid, process) in system.processes() {
            // Apply our heuristic filter (if we found connections)
            // On non-windows it's empty, so we skip filtering.
            if !active_pids.is_empty() && !active_pids.contains(&pid.as_u32()) {
                continue;
            }

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
