use crate::monitor_error::MonitorError;
use crate::monitor_trait::{MonitoringTrait, GlobalStats, ProcessStats};

pub struct MockMonitor {
    pub global_stats: GlobalStats,
    pub process_stats: Vec<ProcessStats>,
}

impl MockMonitor {
    pub fn new() -> Self {
        Self {
            global_stats: GlobalStats {
                total_download: 1000,
                total_upload: 500,
                download_speed: 100,
                upload_speed: 50,
                is_online: true,
            },
            process_stats: vec![
                ProcessStats {
                    pid: 1234,
                    name: "mock_process".to_string(),
                    download_bytes: 500,
                    upload_bytes: 250,
                    download_speed: 50,
                    upload_speed: 25,
                }
            ],
        }
    }
}

impl MonitoringTrait for MockMonitor {
    fn get_global_stats(&self, _delta_time: f64) -> Result<GlobalStats, MonitorError> {
        Ok(self.global_stats.clone())
    }

    fn get_process_stats(&self, _delta_time: f64) -> Result<Vec<ProcessStats>, MonitorError> {
        Ok(self.process_stats.clone())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_mock_monitor() {
        let monitor = MockMonitor::new();
        let global = monitor.get_global_stats(1.0).unwrap();
        assert_eq!(global.total_download, 1000);
        assert!(global.is_online);

        let processes = monitor.get_process_stats(1.0).unwrap();
        assert_eq!(processes.len(), 1);
        assert_eq!(processes[0].name, "mock_process");
    }
}
