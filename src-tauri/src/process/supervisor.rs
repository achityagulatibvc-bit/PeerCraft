use std::process::{Child, Command, Stdio};
use std::sync::{Arc, Mutex};

pub struct ProcessSupervisor {
    children: Arc<Mutex<Vec<Child>>>,
    active_role: Arc<Mutex<Option<String>>>,
}

impl ProcessSupervisor {
    pub fn new() -> Self {
        Self {
            children: Arc::new(Mutex::new(Vec::new())),
            active_role: Arc::new(Mutex::new(None)),
        }
    }

    /// Spawns a Java backend PaperMC or Velocity process
    pub fn spawn_java_process(
        &self,
        java_bin: &str,
        jvm_args: &[&str],
        working_dir: &str,
    ) -> Result<(), String> {
        let mut cmd = Command::new(java_bin);
        cmd.args(jvm_args)
            .current_dir(working_dir)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped());

        let child = cmd.spawn().map_err(|e| format!("Failed to spawn Java process: {}", e))?;
        self.children.lock().unwrap().push(child);
        Ok(())
    }

    /// Gracefully terminates all active child processes
    pub fn terminate_all(&self) {
        let mut list = self.children.lock().unwrap();
        for child in list.iter_mut() {
            let _ = child.kill();
        }
        list.clear();
        *self.active_role.lock().unwrap() = None;
    }

    /// Returns true if at least one supervised process is still alive.
    /// Also prunes any children that already exited on their own (e.g.
    /// crashed), so a dead process can't be misreported as running.
    pub fn is_running(&self) -> bool {
        let mut list = self.children.lock().unwrap();
        list.retain_mut(|child| matches!(child.try_wait(), Ok(None)));
        !list.is_empty()
    }

    pub fn set_active_role(&self, role: Option<String>) {
        *self.active_role.lock().unwrap() = role;
    }

    pub fn active_role(&self) -> Option<String> {
        self.active_role.lock().unwrap().clone()
    }
}