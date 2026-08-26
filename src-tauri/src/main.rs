// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

pub mod cluster;
pub mod process;
pub mod sync;
pub mod rcon;

use serde::{Deserialize, Serialize};
use cluster::benchmark::{BenchmarkMetrics, run_quick_benchmark};

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
async fn get_cluster_status() -> Result<ClusterStatus, String> {
    Ok(ClusterStatus {
        state: "RUNNING".into(),
        active_role: "PRIMARY".into(),
        public_domain: "mc.peercraft.live".into(),
        overworld_tps: 20.0,
        nether_tps: 20.0,
        total_players: 4,
    })
}

#[tauri::command]
async fn start_assigned_node(role: String) -> Result<String, String> {
    log::info!("Starting node with role: {}", role);
    Ok(format!("Node started successfully in {} mode", role))
}

#[tauri::command]
async fn stop_assigned_node() -> Result<String, String> {
    log::info!("Stopping node and executing chunk flush...");
    Ok("Node stopped and chunks flushed".into())
}

fn main() {
    env_logger::init_from_env(env_logger::Env::default().default_filter_or("info"));

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            run_benchmark,
            get_cluster_status,
            start_assigned_node,
            stop_assigned_node
        ])
        .run(tauri::generate_context!())
        .expect("error while running PeerCraft tauri application");
}
