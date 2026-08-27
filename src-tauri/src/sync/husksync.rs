use std::fs;
use std::path::PathBuf;
use serde::{Deserialize, Serialize};
use crate::process::sandbox::SandboxManager;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SupabaseDbConfig {
    pub host: String,
    pub port: u16,
    pub database: String,
    pub username: String,
    pub password: String,
    pub ssl: bool,
}

impl Default for SupabaseDbConfig {
    fn default() -> Self {
        Self {
            host: std::env::var("PEERCRAFT_SUPABASE_HOST")
                .unwrap_or_else(|_| "aws-0-ap-south-1.pooler.supabase.com".into()),
            port: 5432,
            database: "postgres".into(),
            username: std::env::var("PEERCRAFT_SUPABASE_USER")
                .unwrap_or_else(|_| "postgres.peercraft_cluster".into()),
            password: std::env::var("PEERCRAFT_SUPABASE_PASS")
                .unwrap_or_else(|_| "PEERCRAFT_CLUSTER_POSTGRES_KEY".into()),
            ssl: true,
        }
    }
}

pub struct HuskSyncConfigManager;

impl HuskSyncConfigManager {
    /// Generates and writes plugins/HuskSync/config.yml into the server sandbox
    pub fn deploy_config(dimension: &str, server_name: &str, db_config: &SupabaseDbConfig) -> Result<(), String> {
        let server_dir = SandboxManager::get_server_dir(dimension);
        let husksync_dir = server_dir.join("plugins").join("HuskSync");
        let _ = fs::create_dir_all(&husksync_dir);

        let config_file = husksync_dir.join("config.yml");

        let content = format!(
            "# ====================================================================\n\
            # PeerCraft Automated HuskSync Configuration for {}\n\
            # ====================================================================\n\
            cluster_id: 'peercraft-main-cluster'\n\
            server_name: '{}'\n\
            \n\
            database:\n\
              type: 'POSTGRESQL'\n\
              credentials:\n\
                host: '{}'\n\
                port: {}\n\
                database: '{}'\n\
                username: '{}'\n\
                password: '{}'\n\
                ssl: {}\n\
              connection_pool:\n\
                maximum_pool_size: 10\n\
                minimum_idle: 2\n\
                connection_timeout: 5000\n\
            \n\
            synchronisation:\n\
              save_on_world_save: true\n\
              features:\n\
                inventories: true\n\
                ender_chests: true\n\
                health: true\n\
                hunger: true\n\
                experience: true\n\
                potion_effects: true\n\
                advancements: true\n\
                statistics: true\n\
                location: false\n\
                persistent_data: true\n\
            \n\
            redis:\n\
              enabled: false # Using PostgreSQL NOTIFY/LISTEN with low latency\n",
            dimension,
            server_name,
            db_config.host,
            db_config.port,
            db_config.database,
            db_config.username,
            db_config.password,
            db_config.ssl
        );

        fs::write(&config_file, content)
            .map_err(|e| format!("Failed to write HuskSync config for {}: {}", dimension, e))?;

        Ok(())
    }
}
