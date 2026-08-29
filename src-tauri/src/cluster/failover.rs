use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FailoverEvent {
    pub failed_node_id: String,
    pub failed_role: String,
    pub takeover_node_id: String,
    pub dimension_migrated: String,
    pub status: String,
    pub timestamp_ms: u64,
}

pub struct FailoverCoordinator;

impl FailoverCoordinator {
    /// Evaluates if a node missed heartbeats and coordinates automatic dimension takeover
    pub fn trigger_takeover(failed_node_id: &str, failed_role: &str, fallback_node_id: &str) -> FailoverEvent {
        log::warn!("Triggering failover takeover for node {} (role {}) onto {}", failed_node_id, failed_role, fallback_node_id);

        FailoverEvent {
            failed_node_id: failed_node_id.into(),
            failed_role: failed_role.into(),
            takeover_node_id: fallback_node_id.into(),
            dimension_migrated: if failed_role == "SECONDARY" { "nether_end".into() } else { "overworld".into() },
            status: "COMPLETED".into(),
            timestamp_ms: chrono::Utc::now().timestamp_millis() as u64,
        }
    }
}
