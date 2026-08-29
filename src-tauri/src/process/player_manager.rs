use std::fs;
use std::path::PathBuf;
use serde::{Deserialize, Serialize};
use crate::process::sandbox::SandboxManager;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OpPlayer {
    pub uuid: String,
    pub name: String,
    pub level: u8,
    #[serde(default)]
    pub bypasses_player_limit: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WhitelistPlayer {
    pub uuid: String,
    pub name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BanEntry {
    pub uuid: Option<String>,
    pub name: Option<String>,
    pub ip: Option<String>,
    pub created: String,
    pub source: String,
    pub expires: String,
    pub reason: String,
}

#[derive(Debug, Default, Serialize, Deserialize)]
pub struct PlayerListsPayload {
    pub ops: Vec<OpPlayer>,
    pub whitelist: Vec<WhitelistPlayer>,
    pub banned_players: Vec<BanEntry>,
    pub banned_ips: Vec<BanEntry>,
}

pub struct PlayerFileManager;

impl PlayerFileManager {
    fn get_dir() -> PathBuf {
        SandboxManager::get_server_dir("overworld")
    }

    /// Reads all player management JSON files from the server directory
    pub fn read_player_lists() -> Result<PlayerListsPayload, String> {
        let dir = Self::get_dir();
        let _ = SandboxManager::initialize_sandbox("overworld");

        let ops_file = dir.join("ops.json");
        let whitelist_file = dir.join("whitelist.json");
        let banned_players_file = dir.join("banned-players.json");
        let banned_ips_file = dir.join("banned-ips.json");

        let ops: Vec<OpPlayer> = if ops_file.exists() {
            let data = fs::read_to_string(&ops_file).unwrap_or_else(|_| "[]".into());
            serde_json::from_str(&data).unwrap_or_default()
        } else {
            Vec::new()
        };

        let whitelist: Vec<WhitelistPlayer> = if whitelist_file.exists() {
            let data = fs::read_to_string(&whitelist_file).unwrap_or_else(|_| "[]".into());
            serde_json::from_str(&data).unwrap_or_default()
        } else {
            Vec::new()
        };

        let banned_players: Vec<BanEntry> = if banned_players_file.exists() {
            let data = fs::read_to_string(&banned_players_file).unwrap_or_else(|_| "[]".into());
            serde_json::from_str(&data).unwrap_or_default()
        } else {
            Vec::new()
        };

        let banned_ips: Vec<BanEntry> = if banned_ips_file.exists() {
            let data = fs::read_to_string(&banned_ips_file).unwrap_or_else(|_| "[]".into());
            serde_json::from_str(&data).unwrap_or_default()
        } else {
            Vec::new()
        };

        Ok(PlayerListsPayload {
            ops,
            whitelist,
            banned_players,
            banned_ips,
        })
    }

    /// Modifies a player list (ops, whitelist, banned_players, banned_ips)
    pub fn modify_list(
        list_type: &str,
        action: &str, // "add" or "remove"
        name_or_ip: &str,
        extra_reason: Option<String>,
    ) -> Result<(), String> {
        let dir = Self::get_dir();
        let timestamp = chrono::Utc::now().to_rfc3339();

        match list_type {
            "ops" => {
                let file = dir.join("ops.json");
                let mut list: Vec<OpPlayer> = if file.exists() {
                    let d = fs::read_to_string(&file).unwrap_or_else(|_| "[]".into());
                    serde_json::from_str(&d).unwrap_or_default()
                } else {
                    Vec::new()
                };

                if action == "add" {
                    list.retain(|p| !p.name.eq_ignore_ascii_case(name_or_ip));
                    list.push(OpPlayer {
                        uuid: format!("{:x}", md5_hash(name_or_ip)),
                        name: name_or_ip.to_string(),
                        level: 4,
                        bypasses_player_limit: false,
                    });
                } else {
                    list.retain(|p| !p.name.eq_ignore_ascii_case(name_or_ip));
                }

                let json = serde_json::to_string_pretty(&list).map_err(|e| e.to_string())?;
                fs::write(&file, json).map_err(|e| e.to_string())?;
            }
            "whitelist" => {
                let file = dir.join("whitelist.json");
                let mut list: Vec<WhitelistPlayer> = if file.exists() {
                    let d = fs::read_to_string(&file).unwrap_or_else(|_| "[]".into());
                    serde_json::from_str(&d).unwrap_or_default()
                } else {
                    Vec::new()
                };

                if action == "add" {
                    list.retain(|p| !p.name.eq_ignore_ascii_case(name_or_ip));
                    list.push(WhitelistPlayer {
                        uuid: format!("{:x}", md5_hash(name_or_ip)),
                        name: name_or_ip.to_string(),
                    });
                } else {
                    list.retain(|p| !p.name.eq_ignore_ascii_case(name_or_ip));
                }

                let json = serde_json::to_string_pretty(&list).map_err(|e| e.to_string())?;
                fs::write(&file, json).map_err(|e| e.to_string())?;
            }
            "banned_players" => {
                let file = dir.join("banned-players.json");
                let mut list: Vec<BanEntry> = if file.exists() {
                    let d = fs::read_to_string(&file).unwrap_or_else(|_| "[]".into());
                    serde_json::from_str(&d).unwrap_or_default()
                } else {
                    Vec::new()
                };

                if action == "add" {
                    list.retain(|b| b.name.as_deref().unwrap_or("").to_lowercase() != name_or_ip.to_lowercase());
                    list.push(BanEntry {
                        uuid: Some(format!("{:x}", md5_hash(name_or_ip))),
                        name: Some(name_or_ip.to_string()),
                        ip: None,
                        created: timestamp,
                        source: "ServerAdmin".into(),
                        expires: "forever".into(),
                        reason: extra_reason.unwrap_or_else(|| "Banned by an operator.".into()),
                    });
                } else {
                    list.retain(|b| b.name.as_deref().unwrap_or("").to_lowercase() != name_or_ip.to_lowercase());
                }

                let json = serde_json::to_string_pretty(&list).map_err(|e| e.to_string())?;
                fs::write(&file, json).map_err(|e| e.to_string())?;
            }
            "banned_ips" => {
                let file = dir.join("banned-ips.json");
                let mut list: Vec<BanEntry> = if file.exists() {
                    let d = fs::read_to_string(&file).unwrap_or_else(|_| "[]".into());
                    serde_json::from_str(&d).unwrap_or_default()
                } else {
                    Vec::new()
                };

                if action == "add" {
                    list.retain(|b| b.ip.as_deref().unwrap_or("") != name_or_ip);
                    list.push(BanEntry {
                        uuid: None,
                        name: None,
                        ip: Some(name_or_ip.to_string()),
                        created: timestamp,
                        source: "ServerAdmin".into(),
                        expires: "forever".into(),
                        reason: extra_reason.unwrap_or_else(|| "Banned IP address.".into()),
                    });
                } else {
                    list.retain(|b| b.ip.as_deref().unwrap_or("") != name_or_ip);
                }

                let json = serde_json::to_string_pretty(&list).map_err(|e| e.to_string())?;
                fs::write(&file, json).map_err(|e| e.to_string())?;
            }
            _ => return Err(format!("Unknown player list: {}", list_type)),
        }

        Ok(())
    }
}

fn md5_hash(input: &str) -> u128 {
    use std::collections::hash_map::DefaultHasher;
    use std::hash::{Hash, Hasher};
    let mut s = DefaultHasher::new();
    input.hash(&mut s);
    s.finish() as u128
}
