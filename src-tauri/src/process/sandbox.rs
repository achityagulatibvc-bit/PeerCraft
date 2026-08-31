use std::fs::{self, File};
use std::io::Write;
use std::path::{Path, PathBuf};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct SandboxFileInfo {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    pub size_bytes: u64,
    pub modified_timestamp: u64,
}

pub struct SandboxManager;

impl SandboxManager {
    /// Returns the root path for a given dimension instance ('overworld', 'nether_end', 'velocity')
    pub fn get_server_dir(dimension: &str) -> PathBuf {
        let base_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
            .parent()
            .unwrap_or_else(|| Path::new("."))
            .to_path_buf();
        base_dir.join("servers").join(dimension)
    }

    /// Prepares the sandbox directory with EULA and default configurations if not present
    pub fn initialize_sandbox(dimension: &str) -> Result<PathBuf, String> {
        let server_dir = Self::get_server_dir(dimension);
        fs::create_dir_all(&server_dir)
            .map_err(|e| format!("Failed to create directory {:?}: {}", server_dir, e))?;

        // 1. Accept EULA automatically for Paper instances
        if dimension != "velocity" {
            let eula_path = server_dir.join("eula.txt");
            if !eula_path.exists() {
                let mut f = File::create(&eula_path)
                    .map_err(|e| format!("Failed to create eula.txt: {}", e))?;
                f.write_all(b"eula=true\n")
                    .map_err(|e| format!("Failed to write eula.txt: {}", e))?;
            }
        }

        // 2. Deploy default configs if missing
        match dimension {
            "overworld" => {
                let props_path = server_dir.join("server.properties");
                if !props_path.exists() {
                    let default_props = include_str!("../../../config/server-overworld.properties");
                    let _ = fs::write(&props_path, default_props);
                }

                let config_dir = server_dir.join("config");
                let _ = fs::create_dir_all(&config_dir);
                let paper_cfg_path = config_dir.join("paper-global.yml");
                if !paper_cfg_path.exists() {
                    let default_paper = include_str!("../../../config/paper-global.yml");
                    let _ = fs::write(&paper_cfg_path, default_paper);
                }
            }
            "nether_end" => {
                let props_path = server_dir.join("server.properties");
                if !props_path.exists() {
                    let default_props = include_str!("../../../config/server-nether-end.properties");
                    let _ = fs::write(&props_path, default_props);
                }

                let config_dir = server_dir.join("config");
                let _ = fs::create_dir_all(&config_dir);
                let paper_cfg_path = config_dir.join("paper-global.yml");
                if !paper_cfg_path.exists() {
                    let default_paper = include_str!("../../../config/paper-global.yml");
                    let _ = fs::write(&paper_cfg_path, default_paper);
                }
            }
            "velocity" => {
                let vel_path = server_dir.join("velocity.toml");
                if !vel_path.exists() {
                    let default_vel = include_str!("../../../config/velocity.toml");
                    let _ = fs::write(&vel_path, default_vel);
                }

                let secret_path = server_dir.join("velocity.secret");
                if !secret_path.exists() {
                    let _ = fs::write(&secret_path, "PEERCRAFT_SHARED_VELOCITY_SECRET_KEY_HEX");
                }
            }
            _ => {}
        }

        Ok(server_dir)
    }

    /// Lists files and subdirectories within a sandboxed server folder
    pub fn list_files(dimension: &str, subpath: &str) -> Result<Vec<SandboxFileInfo>, String> {
        let server_dir = Self::get_server_dir(dimension);
        let clean_sub = subpath.trim_start_matches('/').trim_start_matches('\\');
        let target_path = server_dir.join(clean_sub);

        // Security check: ensure path stays within sandbox
        if !target_path.starts_with(&server_dir) {
            return Err("Access denied: Path outside of server sandbox".into());
        }

        if !target_path.exists() {
            return Ok(Vec::new());
        }

        let mut results = Vec::new();
        let entries = fs::read_dir(&target_path)
            .map_err(|e| format!("Failed to read directory: {}", e))?;

        for entry in entries.filter_map(|e| e.ok()) {
            let path = entry.path();
            let metadata = entry.metadata().ok();
            let is_dir = metadata.as_ref().map(|m| m.is_dir()).unwrap_or(false);
            let size_bytes = metadata.as_ref().map(|m| m.len()).unwrap_or(0);
            let modified = metadata
                .and_then(|m| m.modified().ok())
                .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
                .map(|d| d.as_secs())
                .unwrap_or(0);

            let rel_path = path.strip_prefix(&server_dir)
                .map(|p| p.to_string_lossy().replace('\\', "/"))
                .unwrap_or_else(|_| path.to_string_lossy().to_string());

            results.push(SandboxFileInfo {
                name: entry.file_name().to_string_lossy().to_string(),
                path: format!("/{}", rel_path),
                is_dir,
                size_bytes,
                modified_timestamp: modified,
            });
        }

        results.sort_by(|a, b| {
            if a.is_dir == b.is_dir {
                a.name.to_lowercase().cmp(&b.name.to_lowercase())
            } else if a.is_dir {
                std::cmp::Ordering::Less
            } else {
                std::cmp::Ordering::Greater
            }
        });

        Ok(results)
    }

    /// Reads a file from the server sandbox
    pub fn read_file(dimension: &str, rel_path: &str) -> Result<String, String> {
        let server_dir = Self::get_server_dir(dimension);
        let clean_path = rel_path.trim_start_matches('/').trim_start_matches('\\');
        let target_path = server_dir.join(clean_path);

        if !target_path.starts_with(&server_dir) {
            return Err("Access denied: Path outside of server sandbox".into());
        }

        fs::read_to_string(&target_path)
            .map_err(|e| format!("Failed to read file {:?}: {}", target_path, e))
    }

    /// Writes/saves a file into the server sandbox
    pub fn write_file(dimension: &str, rel_path: &str, content: &str) -> Result<(), String> {
        let server_dir = Self::get_server_dir(dimension);
        let clean_path = rel_path.trim_start_matches('/').trim_start_matches('\\');
        let target_path = server_dir.join(clean_path);

        if !target_path.starts_with(&server_dir) {
            return Err("Access denied: Path outside of server sandbox".into());
        }

        if let Some(parent) = target_path.parent() {
            let _ = fs::create_dir_all(parent);
        }

        fs::write(&target_path, content)
            .map_err(|e| format!("Failed to write file {:?}: {}", target_path, e))
    }
}
