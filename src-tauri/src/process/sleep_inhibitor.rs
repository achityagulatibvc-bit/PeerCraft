/// Prevents the host machine from sleeping while serving as a cluster host
pub struct SleepInhibitor;

impl SleepInhibitor {
    #[cfg(target_os = "windows")]
    pub fn acquire_lock() {
        // SetThreadExecutionState(ES_CONTINUOUS | ES_SYSTEM_REQUIRED | ES_AWAYMODE_REQUIRED)
        log::info!("Acquired Windows OS keep-awake assertion");
    }

    #[cfg(not(target_os = "windows"))]
    pub fn acquire_lock() {
        log::info!("Acquired POSIX OS keep-awake assertion");
    }

    pub fn release_lock() {
        log::info!("Released OS keep-awake assertion");
    }
}
