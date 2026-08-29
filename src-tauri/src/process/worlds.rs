use std::path::Path;
use serde::{Deserialize, Serialize};
use walkdir::WalkDir;
use crate::process::sandbox::SandboxManager;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DimensionDiskInfo {
    pub dimension_id: String,
    pub dimension_name: String,
    pub folder: String,
    pub size_bytes: u64,
    pub size_formatted: String,
    pub exists: bool,
}

pub struct WorldsInspector;

impl WorldsInspector {
    fn dir_size(path: &Path) -> u64 {
        if !path.exists() {
            return 0;
        }
        WalkDir::new(path)
            .into_iter()
            .filter_map(|e| e.ok())
            .filter_map(|e| e.metadata().ok())
            .filter(|m| m.is_file())
            .map(|m| m.len())
            .sum()
    }

    fn format_bytes(bytes: u64) -> String {
        if bytes == 0 {
            "0 MB".into()
        } else if bytes < 1024 * 1024 {
            format!("{} KB", bytes / 1024)
        } else if bytes < 1024 * 1024 * 1024 {
            format!("{} MB", bytes / (1024 * 1024))
        } else {
            format!("{:.1} GB", bytes as f64 / (1024.0 * 1024.0 * 1024.0))
        }
    }

    /// Inspects the local server directories and computes real disk usage per dimension
    pub fn get_dimensions_info() -> Vec<DimensionDiskInfo> {
        let overworld_path = SandboxManager::get_server_dir("overworld").join("world");
        let nether_path = SandboxManager::get_server_dir("nether_end").join("world_nether");
        let end_path = SandboxManager::get_server_dir("nether_end").join("world_the_end");

        let overworld_bytes = Self::dir_size(&overworld_path);
        let nether_bytes = Self::dir_size(&nether_path);
        let end_bytes = Self::dir_size(&end_path);

        vec![
            DimensionDiskInfo {
                dimension_id: "overworld".into(),
                dimension_name: "The Overworld".into(),
                folder: "servers/overworld/world/".into(),
                size_bytes: overworld_bytes,
                size_formatted: if overworld_bytes == 0 { "Baseline (Not Generated)".into() } else { Self::format_bytes(overworld_bytes) },
                exists: overworld_path.exists(),
            },
            DimensionDiskInfo {
                dimension_id: "nether".into(),
                dimension_name: "The Nether".into(),
                folder: "servers/nether_end/world_nether/".into(),
                size_bytes: nether_bytes,
                size_formatted: if nether_bytes == 0 { "Baseline (Not Generated)".into() } else { Self::format_bytes(nether_bytes) },
                exists: nether_path.exists(),
            },
            DimensionDiskInfo {
                dimension_id: "the_end".into(),
                dimension_name: "The End".into(),
                folder: "servers/nether_end/world_the_end/".into(),
                size_bytes: end_bytes,
                size_formatted: if end_bytes == 0 { "Baseline (Not Generated)".into() } else { Self::format_bytes(end_bytes) },
                exists: end_path.exists(),
            },
        ]
    }
}
