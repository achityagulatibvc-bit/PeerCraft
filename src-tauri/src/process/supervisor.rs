use std::io::Write;
use std::process::{Child, Command, Stdio};
use std::sync::{Arc, Mutex};
use std::path::Path;
use std::collections::HashMap;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProcessStatus {
    pub dimension: String,
    pub running: bool,
    pub pid: Option<u32>,
    pub port: u16,
}

pub struct ProcessSupervisor {
    children: Arc<Mutex<HashMap<String, Child>>>,
    active_role: Arc<Mutex<Option<String>>>,
}

impl ProcessSupervisor {
    pub fn new() -> Self {
        Self {
            children: Arc::new(Mutex::new(HashMap::new())),
            active_role: Arc::new(Mutex::new(None)),
        }
    }

    /// Spawns a Java backend PaperMC or Velocity process for a specific dimension
    pub fn spawn_dimension_process(
        &self,
        dimension: &str,
        java_bin: &str,
        jvm_args: &[&str],
        working_dir: &Path,
    ) -> Result<u32, String> {
        let mut map = self.children.lock().unwrap();

        if let Some(child) = map.get_mut(dimension) {
            if let Ok(None) = child.try_wait() {
                return Ok(child.id());
            }
        }

        let mut cmd = Command::new(java_bin);
        cmd.args(jvm_args)
            .current_dir(working_dir)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped());

        let child = cmd.spawn().map_err(|e| format!("Failed to spawn process for {}: {}", dimension, e))?;
        let pid = child.id();
        map.insert(dimension.to_string(), child);

        log::info!("Spawned {} instance with PID {}", dimension, pid);
        Ok(pid)
    }

    /// Dispatches a command to the process's standard input
    pub fn send_command(&self, dimension: &str, command: &str) -> Result<(), String> {
        let mut map = self.children.lock().unwrap();
        if let Some(child) = map.get_mut(dimension) {
            if let Some(stdin) = child.stdin.as_mut() {
                let cmd_with_nl = format!("{}\n", command.trim());
                stdin.write_all(cmd_with_nl.as_bytes())
                    .map_err(|e| format!("Failed to write to stdin: {}", e))?;
                stdin.flush().map_err(|e| format!("Failed to flush stdin: {}", e))?;
                return Ok(());
            }
        }
        Err(format!("No running process with active stdin for dimension: {}", dimension))
    }

    /// Checks if a specific dimension's process is currently alive
    pub fn is_running(&self, dimension: &str) -> bool {
        let mut map = self.children.lock().unwrap();
        if let Some(child) = map.get_mut(dimension) {
            match child.try_wait() {
                Ok(None) => true,
                _ => false,
            }
        } else {
            false
        }
    }

    /// Returns true if ANY supervised process (any dimension) is still alive.
    /// Also prunes any that already exited on their own (e.g. crashed), so a
    /// dead process can't be misreported as running.
    pub fn any_running(&self) -> bool {
        let mut map = self.children.lock().unwrap();
        map.retain(|_, child| matches!(child.try_wait(), Ok(None)));
        !map.is_empty()
    }

    /// Gracefully stops a dimension server process by sending stop / end command
    pub fn stop_dimension(&self, dimension: &str) -> Result<(), String> {
        let _ = self.send_command(dimension, if dimension == "velocity" { "end" } else { "stop" });

        let mut map = self.children.lock().unwrap();
        if let Some(mut child) = map.remove(dimension) {
            std::thread::spawn(move || {
                std::thread::sleep(std::time::Duration::from_secs(5));
                let _ = child.kill();
            });
        }
        Ok(())
    }

    /// Gracefully terminates all active child processes across all dimensions
    pub fn terminate_all(&self) {
        let mut map = self.children.lock().unwrap();
        for (dim, mut child) in map.drain() {
            log::info!("Terminating {} process PID {}", dim, child.id());
            let _ = child.kill();
        }
        *self.active_role.lock().unwrap() = None;
    }

    pub fn set_active_role(&self, role: Option<String>) {
        *self.active_role.lock().unwrap() = role;
    }

    pub fn active_role(&self) -> Option<String> {
        self.active_role.lock().unwrap().clone()
    }
}