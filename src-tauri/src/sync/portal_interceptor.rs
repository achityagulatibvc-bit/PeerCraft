use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PortalTransitionEvent {
    pub player_name: String,
    pub player_uuid: String,
    pub from_dimension: String,
    pub to_dimension: String,
    pub target_server: String,
    pub target_port: u16,
    pub timestamp_ms: u64,
}

pub struct PortalInterceptor;

impl PortalInterceptor {
    /// Determines the routing destination when a player enters a dimension portal
    pub fn resolve_portal_destination(from_dimension: &str) -> (&'static str, &'static str, u16) {
        match from_dimension {
            "minecraft:overworld" => ("nether_end", "nether", 25566),
            "minecraft:the_nether" | "nether" => ("overworld", "overworld", 25565),
            "minecraft:the_end" | "the_end" => ("overworld", "overworld", 25565),
            _ => ("overworld", "overworld", 25565),
        }
    }

    /// Formats the Velocity server transfer command (e.g. `send <player> <server>`)
    pub fn build_velocity_transfer_command(player_name: &str, target_server: &str) -> String {
        format!("send {} {}", player_name, target_server)
    }
}
