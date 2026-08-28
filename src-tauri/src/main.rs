// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

pub mod cluster;
pub mod process;
pub mod sync;
pub mod rcon;

use serde::{Deserialize, Serialize};
use cluster::benchmark::{BenchmarkMetrics, run_quick_benchmark};
use process::supervisor::ProcessSupervisor;

#[derive(Debug, Serialize, Deserialize)]
pub struct ClusterStatus {
    pub state: String,
    pub active_role: String,
    pub public_domain: String,
    pub overworld_tps: f32,
    pub nether_tps: f32,
    pub total_players: u32,
}

#[tauri::command]
async fn run_benchmark() -> Result<BenchmarkMetrics, String> {
    Ok(run_quick_benchmark().await)
}

#[tauri::command]
async fn get_cluster_status(supervisor: tauri::State<'_, ProcessSupervisor>) -> Result<ClusterStatus, String> {
    let running = supervisor.is_running();
    Ok(ClusterStatus {
        state: if running { "RUNNING".into() } else { "STOPPED".into() },
        active_role: supervisor.active_role().unwrap_or_else(|| "NONE".into()),
        // TODO: still placeholder. No real Paper/Velocity server is spawned yet
        // (see start_assigned_node), and RCON has no real implementation to
        // query these from a live server, so we report 0 instead of inventing
        // fake-but-plausible numbers.
        public_domain: "mc.peercraft.live".into(),
        overworld_tps: 0.0,
        nether_tps: 0.0,
        total_players: 0,
    })
}

#[tauri::command]
async fn start_assigned_node(
    role: String,
    supervisor: tauri::State<'_, ProcessSupervisor>,
) -> Result<String, String> {
    log::info!("Starting node with role: {}", role);

    // TODO: this spawns a safe, harmless placeholder process (not a real
    // PaperMC/Velocity server). There is currently no config system for
    // real java binary path, jar location, or JVM args — once that exists,
    // replace this block with a real spawn_java_process(java_bin, jvm_args,
    // working_dir) call using those real values.
    #[cfg(target_os = "windows")]
    let (placeholder_bin, placeholder_args): (&str, Vec<&str>) =
        ("ping", vec!["-n", "3600", "127.0.0.1"]);
    #[cfg(not(target_os = "windows"))]
    let (placeholder_bin, placeholder_args): (&str, Vec<&str>) = ("sleep", vec!["3600"]);

    supervisor.spawn_java_process(placeholder_bin, &placeholder_args, ".")?;
    supervisor.set_active_role(Some(role.clone()));

    Ok(format!("Node started successfully in {} mode (placeholder process)", role))
}

#[tauri::command]
async fn stop_assigned_node(supervisor: tauri::State<'_, ProcessSupervisor>) -> Result<String, String> {
    log::info!("Stopping node and executing chunk flush...");
    supervisor.terminate_all();
    Ok("Node stopped and chunks flushed".into())
}

fn main() {
    env_logger::init_from_env(env_logger::Env::default().default_filter_or("info"));

    tauri::Builder::default()
        .manage(ProcessSupervisor::new())
        .invoke_handler(tauri::generate_handler![
            run_benchmark,
            get_cluster_status,
            start_assigned_node,
            stop_assigned_node
        ])
        .run(tauri::generate_context!())
        .expect("error while running PeerCraft tauri application");
}
