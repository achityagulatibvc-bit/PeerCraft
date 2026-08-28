use std::process::{Child, Command, Stdio};
use std::sync::{Arc, Mutex};
use std::path::PathBuf;

pub struct PlayitTunnelSupervisor {
    process: Arc<Mutex<Option<Child>>>,
}

impl PlayitTunnelSupervisor {
    pub fn new() -> Self {
        Self {
            process: Arc::new(Mutex::new(None)),
        }
    }

    /// Spawns the Playit.gg Anycast Tunnel daemon
    pub fn start_tunnel(&self, secret_key: &str) -> Result<u32, String> {
        let base_dir = std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."));
        let is_windows = cfg!(target_os = "windows");
        let playit_bin = base_dir.join("bin").join(if is_windows { "playit.exe" } else { "playit" });

        if !playit_bin.exists() {
            return Err("Playit binary not found in bin/ directory.".into());
        }

        let mut lock = self.process.lock().unwrap();
        if let Some(child) = lock.as_mut() {
            if let Ok(None) = child.try_wait() {
                return Ok(child.id());
            }
        }

        let mut cmd = Command::new(&playit_bin);
        if !secret_key.trim().is_empty() && secret_key != "playit_dev_session_token" && secret_key != "your_playit_agent_secret_key" {
            cmd.args(["--secret", secret_key]);
        }

        let child = cmd
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .spawn()
            .map_err(|e| format!("Failed to start Playit Anycast daemon: {}", e))?;

        let pid = child.id();
        *lock = Some(child);
        log::info!("Started Playit Anycast tunnel daemon with PID {}", pid);
        Ok(pid)
    }

    /// Stops the Playit Anycast tunnel daemon
    pub fn stop_tunnel(&self) {
        let mut lock = self.process.lock().unwrap();
        if let Some(mut child) = lock.take() {
            let _ = child.kill();
            log::info!("Terminated Playit Anycast tunnel daemon");
        }
    }
}
