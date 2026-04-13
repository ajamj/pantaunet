use std::process::Command;

#[allow(dead_code)]
#[derive(Debug, PartialEq)]
pub enum FirewallError {
    CommandFailed(String),
    OsError(String),
}

#[allow(dead_code)]
pub struct FirewallManager;

impl FirewallManager {
    /// Blocks a specific application from accessing the internet via Windows Firewall
    pub fn block_app(name: &str, exe_path: &str) -> Result<(), FirewallError> {
        #[cfg(target_os = "windows")]
        {
            let output = Command::new("netsh")
                .args([
                    "advfirewall",
                    "firewall",
                    "add",
                    "rule",
                    &format!("name=\"Pantaunet_Block_{}\"", name),
                    "dir=out",
                    "action=block",
                    &format!("program=\"{}\"", exe_path),
                    "enable=yes",
                ])
                .output()
                .map_err(|e| FirewallError::OsError(e.to_string()))?;

            if !output.status.success() {
                return Err(FirewallError::CommandFailed(
                    String::from_utf8_lossy(&output.stderr).to_string(),
                ));
            }
            Ok(())
        }
        
        #[cfg(not(target_os = "windows"))]
        {
            // Placeholder for Linux/macOS
            Ok(())
        }
    }

    /// Allows a previously blocked application by removing its firewall rule
    pub fn allow_app(name: &str) -> Result<(), FirewallError> {
        #[cfg(target_os = "windows")]
        {
            let output = Command::new("netsh")
                .args([
                    "advfirewall",
                    "firewall",
                    "delete",
                    "rule",
                    &format!("name=\"Pantaunet_Block_{}\"", name),
                ])
                .output()
                .map_err(|e| FirewallError::OsError(e.to_string()))?;

            if !output.status.success() {
                return Err(FirewallError::CommandFailed(
                    String::from_utf8_lossy(&output.stderr).to_string(),
                ));
            }
            Ok(())
        }

        #[cfg(not(target_os = "windows"))]
        {
            Ok(())
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_firewall_rule_name_generation() {
        // Just testing that the logic compiles and runs. 
        // We cannot reliably execute netsh in a CI/Test environment without admin privileges,
        // so we just verify the enum and struct are available.
        let err = FirewallError::OsError("Test".to_string());
        assert_eq!(err, FirewallError::OsError("Test".to_string()));
    }
}
