// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

pub mod cluster;
pub mod process;
pub mod sync;
pub mod rcon;

use std::sync::Arc;
use tauri::State;
use serde::{Deserialize, Serialize};

use cluster::benchmark::{BenchmarkMetrics, run_quick_benchmark};
use cluster::worker_client::{WorkerClusterClient, ClusterTopologyResponse};
use process::supervisor::ProcessSupervisor;
use process::playit::PlayitTunnelSupervisor;
use process::sandbox::{SandboxManager, SandboxFileInfo};
use process::properties::{PropertiesManager, ServerOptions};
use process::player_manager::{PlayerFileManager, PlayerListsPayload};
use process::software::SoftwareDiscovery;
use process::worlds::{WorldsInspector, DimensionDiskInfo};
use process::killer::PortCollisionGuard;

pub struct AppState {
    pub supervisor: Arc<ProcessSupervisor>,
    pub tunnel: Arc<PlayitTunnelSupervisor>,
    pub worker: Arc<WorkerClusterClient>,
}

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
async fn get_cluster_topology(state: State<'_, AppState>) -> Result<ClusterTopologyResponse, String> {
    state.worker.fetch_topology().await
}

#[tauri::command]
async fn start_playit_tunnel(secret_key: String, state: State<'_, AppState>) -> Result<u32, String> {
    state.tunnel.start_tunnel(&secret_key)
}

#[tauri::command]
async fn stop_playit_tunnel(state: State<'_, AppState>) -> Result<(), String> {
    state.tunnel.stop_tunnel();
    Ok(())
}

#[tauri::command]
async fn start_assigned_node(dimension: String, state: State<'_, AppState>) -> Result<String, String> {
    log::info!("Preparing sandbox and starting node for dimension: {}", dimension);
    let server_dir = SandboxManager::initialize_sandbox(&dimension)?;

    let is_windows = cfg!(target_os = "windows");
    let java_bin = if is_windows { "java.exe" } else { "java" };

    let jvm_args: Vec<&str> = match dimension.as_str() {
        "overworld" => vec![
            "-Xms4G", "-Xmx6G",
            "-XX:+UseG1GC",
            "-XX:+ParallelRefProcEnabled",
            "-XX:MaxGCPauseMillis=200",
            "-XX:+UnlockExperimentalVMOptions",
            "-XX:+DisableExplicitGC",
            "-XX:+AlwaysPreTouch",
            "-jar", "../../bin/paper.jar",
            "--nogui",
            "--port", "25565"
        ],
        "nether_end" => vec![
            "-Xms2G", "-Xmx3G",
            "-XX:+UseG1GC",
            "-XX:MaxGCPauseMillis=150",
            "-jar", "../../bin/paper.jar",
            "--nogui",
            "--port", "25566"
        ],
        "velocity" => vec![
            "-Xms512M", "-Xmx1024M",
            "-XX:+UseG1GC",
            "-jar", "../../bin/velocity.jar"
        ],
        _ => return Err(format!("Unknown dimension: {}", dimension)),
    };

    let pid = state.supervisor.spawn_dimension_process(&dimension, java_bin, &jvm_args, &server_dir)?;
    Ok(format!("Started {} server (PID: {})", dimension, pid))
}

#[tauri::command]
async fn stop_assigned_node(dimension: String, state: State<'_, AppState>) -> Result<String, String> {
    log::info!("Stopping server instance for dimension: {}", dimension);
    state.supervisor.stop_dimension(&dimension)?;
    Ok(format!("Stopped {} server instance", dimension))
}

#[tauri::command]
async fn send_server_command(dimension: String, command: String, state: State<'_, AppState>) -> Result<String, String> {
    log::info!("Executing command on [{}]: {}", dimension, command);
    state.supervisor.send_command(&dimension, &command)?;
    Ok(format!("Command sent to {}", dimension))
}

#[tauri::command]
async fn list_sandbox_files(dimension: String, subpath: String) -> Result<Vec<SandboxFileInfo>, String> {
    SandboxManager::list_files(&dimension, &subpath)
}

#[tauri::command]
async fn read_sandbox_file(dimension: String, file_path: String) -> Result<String, String> {
    SandboxManager::read_file(&dimension, &file_path)
}

#[tauri::command]
async fn write_sandbox_file(dimension: String, file_path: String, content: String) -> Result<(), String> {
    SandboxManager::write_file(&dimension, &file_path, &content)
}

#[tauri::command]
async fn get_server_options(dimension: String) -> Result<ServerOptions, String> {
    PropertiesManager::read_options(&dimension)
}

#[tauri::command]
async fn set_server_options(dimension: String, options: ServerOptions) -> Result<(), String> {
    PropertiesManager::write_options(&dimension, &options)
}

#[tauri::command]
async fn get_player_lists() -> Result<PlayerListsPayload, String> {
    PlayerFileManager::read_player_lists()
}

#[tauri::command]
async fn modify_player_list(
    list_type: String,
    action: String,
    name_or_ip: String,
    extra_reason: Option<String>,
) -> Result<(), String> {
    PlayerFileManager::modify_list(&list_type, &action, &name_or_ip, extra_reason)
}

#[tauri::command]
async fn fetch_software_versions() -> Result<Vec<String>, String> {
    SoftwareDiscovery::fetch_paper_versions().await
}

#[tauri::command]
async fn get_dimensions_info() -> Result<Vec<DimensionDiskInfo>, String> {
    Ok(WorldsInspector::get_dimensions_info())
}

#[tauri::command]
async fn cleanup_ports() -> Result<(), String> {
    PortCollisionGuard::cleanup_orphans();
    Ok(())
}

fn main() {
    env_logger::init_from_env(env_logger::Env::default().default_filter_or("info"));

    let supervisor = Arc::new(ProcessSupervisor::new());
    let tunnel = Arc::new(PlayitTunnelSupervisor::new());
    let worker = Arc::new(WorkerClusterClient::new(
        std::env::var("PEERCRAFT_API_URL").unwrap_or_else(|_| "https://peercraft-broker.workers.dev".into()),
        std::env::var("GROUP_AUTH_SECRET").unwrap_or_else(|_| "PEERCRAFT_SECRET".into()),
    ));

    let supervisor_clone = supervisor.clone();
    let tunnel_clone = tunnel.clone();

    tauri::Builder::default()
        .manage(AppState { supervisor, tunnel, worker })
        .invoke_handler(tauri::generate_handler![
            run_benchmark,
            get_cluster_status,
            get_cluster_topology,
            start_playit_tunnel,
            stop_playit_tunnel,
            start_assigned_node,
            stop_assigned_node,
            send_server_command,
            list_sandbox_files,
            read_sandbox_file,
            write_sandbox_file,
            get_server_options,
            set_server_options,
            get_player_lists,
            modify_player_list,
            fetch_software_versions,
            get_dimensions_info,
            cleanup_ports
        ])
        .run(tauri::generate_context!())
        .expect("error while running PeerCraft tauri application");

    // Clean up on exit
    supervisor_clone.terminate_all();
    tunnel_clone.stop_tunnel();
}
