use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use serde::{Deserialize, Serialize};
use crate::process::sandbox::SandboxManager;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServerOptions {
    pub slots: u32,
    pub gamemode: String,
    pub difficulty: String,
    pub whitelist: bool,
    pub cracked: bool, // online-mode = false
    pub pvp: bool,
    pub command_blocks: bool,
    pub fly: bool,
    pub animals: bool,
    pub monsters: bool,
    pub villagers: bool,
    pub nether: bool,
    pub spawn_protection: u32,
    pub motd: String,
    pub server_port: u16,
}

impl Default for ServerOptions {
    fn default() -> Self {
        Self {
            slots: 20,
            gamemode: "survival".into(),
            difficulty: "hard".into(),
            whitelist: false,
            cracked: true,
            pvp: true,
            command_blocks: true,
            fly: false,
            animals: true,
            monsters: true,
            villagers: true,
            nether: true,
            spawn_protection: 16,
            motd: "PeerCraft Asymmetric Cluster [Cracked OK]".into(),
            server_port: 25565,
        }
    }
}

pub struct PropertiesManager;

impl PropertiesManager {
    fn get_props_path(dimension: &str) -> PathBuf {
        SandboxManager::get_server_dir(dimension).join("server.properties")
    }

    /// Parses server.properties into structured ServerOptions
    pub fn read_options(dimension: &str) -> Result<ServerOptions, String> {
        let path = Self::get_props_path(dimension);
        if !path.exists() {
            let _ = SandboxManager::initialize_sandbox(dimension);
        }

        if !path.exists() {
            return Ok(ServerOptions::default());
        }

        let content = fs::read_to_string(&path)
            .map_err(|e| format!("Failed to read server.properties: {}", e))?;

        let mut map: HashMap<String, String> = HashMap::new();
        for line in content.lines() {
            let trimmed = line.trim();
            if trimmed.starts_with('#') || trimmed.is_empty() {
                continue;
            }
            if let Some((key, val)) = trimmed.split_once('=') {
                map.insert(key.trim().to_string(), val.trim().to_string());
            }
        }

        let mut opts = ServerOptions::default();

        if let Some(val) = map.get("max-players") {
            opts.slots = val.parse().unwrap_or(20);
        }
        if let Some(val) = map.get("gamemode") {
            opts.gamemode = val.to_lowercase();
        }
        if let Some(val) = map.get("difficulty") {
            opts.difficulty = val.to_lowercase();
        }
        if let Some(val) = map.get("white-list") {
            opts.whitelist = val == "true";
        }
        if let Some(val) = map.get("online-mode") {
            opts.cracked = val != "true"; // cracked when online-mode is false
        }
        if let Some(val) = map.get("pvp") {
            opts.pvp = val == "true";
        }
        if let Some(val) = map.get("enable-command-block") {
            opts.command_blocks = val == "true";
        }
        if let Some(val) = map.get("allow-flight") {
            opts.fly = val == "true";
        }
        if let Some(val) = map.get("spawn-animals") {
            opts.animals = val == "true";
        }
        if let Some(val) = map.get("spawn-monsters") {
            opts.monsters = val == "true";
        }
        if let Some(val) = map.get("spawn-npcs") {
            opts.villagers = val == "true";
        }
        if let Some(val) = map.get("allow-nether") {
            opts.nether = val == "true";
        }
        if let Some(val) = map.get("spawn-protection") {
            opts.spawn_protection = val.parse().unwrap_or(16);
        }
        if let Some(val) = map.get("motd") {
            opts.motd = val.clone();
        }
        if let Some(val) = map.get("server-port") {
            opts.server_port = val.parse().unwrap_or(25565);
        }

        Ok(opts)
    }

    /// Saves modified ServerOptions back to server.properties
    pub fn write_options(dimension: &str, opts: &ServerOptions) -> Result<(), String> {
        let path = Self::get_props_path(dimension);
        if let Some(parent) = path.parent() {
            let _ = fs::create_dir_all(parent);
        }

        let content = format!(
            "# PeerCraft Server Properties for {}\n\
            server-port={}\n\
            max-players={}\n\
            gamemode={}\n\
            difficulty={}\n\
            white-list={}\n\
            online-mode={}\n\
            pvp={}\n\
            enable-command-block={}\n\
            allow-flight={}\n\
            spawn-animals={}\n\
            spawn-monsters={}\n\
            spawn-npcs={}\n\
            allow-nether={}\n\
            spawn-protection={}\n\
            motd={}\n\
            enable-rcon=true\n\
            rcon.port=25575\n\
            rcon.password=PEERCRAFT_INTERNAL_RCON_PASS_SECURE\n\
            sync-chunk-writes=true\n\
            view-distance=8\n\
            simulation-distance=6\n\
            network-compression-threshold=256\n",
            dimension,
            opts.server_port,
            opts.slots,
            opts.gamemode,
            opts.difficulty,
            opts.whitelist,
            !opts.cracked, // online-mode is opposite of cracked
            opts.pvp,
            opts.command_blocks,
            opts.fly,
            opts.animals,
            opts.monsters,
            opts.villagers,
            opts.nether,
            opts.spawn_protection,
            opts.motd
        );

        fs::write(&path, content)
            .map_err(|e| format!("Failed to write server.properties: {}", e))
    }
}
