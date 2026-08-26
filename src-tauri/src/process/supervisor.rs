use std::process::{Child, Command, Stdio};
use std::sync::{Arc, Mutex};

pub struct ProcessSupervisor {
    children: Arc<Mutex<Vec<Child>>>,
}

impl ProcessSupervisor {
    pub fn new() -> Self {
        Self {
            children: Arc::new(Mutex::new(Vec::new())),
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
    }
}
