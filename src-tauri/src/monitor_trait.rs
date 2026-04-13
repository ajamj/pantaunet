use crate::monitor_error::MonitorError;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProcessStats {
    pub pid: u32,
    pub name: String,
    pub exe_path: String,
    pub download_bytes: u64,
    pub upload_bytes: u64,
    pub download_speed: u64,
    pub upload_speed: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GlobalStats {
    pub total_download: u64,
    pub total_upload: u64,
    pub download_speed: u64,
    pub upload_speed: u64,
    pub is_online: bool,
}

pub trait MonitoringTrait: Send + Sync {
    fn get_global_stats(&self, delta_time: f64) -> Result<GlobalStats, MonitorError>;
    fn get_process_stats(&self, delta_time: f64) -> Result<Vec<ProcessStats>, MonitorError>;
}
