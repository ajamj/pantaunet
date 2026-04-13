use thiserror::Error;
use serde::Serialize;

#[derive(Debug, Error, Serialize)]
pub enum MonitorError {
    #[error("Permission denied to access system monitoring APIs")]
    PermissionDenied,
    #[error("Internal API failure: {0}")]
    ApiFailure(String),
    #[error("Data unavailable at this moment")]
    DataUnavailable,
    #[error("Internal error: {0}")]
    Internal(String),
}

impl From<String> for MonitorError {
    fn from(s: String) -> Self {
        MonitorError::Internal(s)
    }
}
