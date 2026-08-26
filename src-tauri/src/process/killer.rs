use sysinfo::System;

pub struct PortCollisionGuard;

impl PortCollisionGuard {
    /// Scans and kills any orphaned processes binding standard ports (25565, 25566, 25577, 25575)
    pub fn cleanup_orphans() {
        let mut sys = System::new_all();
        sys.refresh_all();

        // Target standard Minecraft daemon binary names
        for (_, process) in sys.processes() {
            let name = process.name().to_lowercase();
            if name.contains("playit") || (name.contains("java") && process.cmd().iter().any(|arg| arg.contains("paper.jar") || arg.contains("velocity.jar"))) {
                log::info!("Terminating orphaned process PID: {} ({})", process.pid(), name);
                process.kill();
            }
        }
    }
}
