use serde::{Deserialize, Serialize};
use reqwest::Client;
use std::time::Duration;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServerEndpoint {
    pub node_id: Option<String>,
    pub node_name: Option<String>,
    pub host: String,
    pub port: u16,
    pub status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProxyEndpoint {
    pub node_id: Option<String>,
    pub public_domain: String,
    pub status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClusterTopologyResponse {
    pub cluster: String,
    pub timestamp: u64,
    pub servers: std::collections::HashMap<String, ServerEndpoint>,
    pub proxy: ProxyEndpoint,
}

pub struct WorkerClusterClient {
    http_client: Client,
    worker_url: String,
    auth_secret: String,
}

impl WorkerClusterClient {
    pub fn new(worker_url: String, auth_secret: String) -> Self {
        Self {
            http_client: Client::builder()
                .timeout(Duration::from_secs(5))
                .build()
                .unwrap_or_else(|_| Client::new()),
            worker_url,
            auth_secret,
        }
    }

    /// Fetches live cluster topology from Cloudflare Worker broker
    pub async fn fetch_topology(&self) -> Result<ClusterTopologyResponse, String> {
        let url = format!("{}/api/cluster/topology", self.worker_url);
        let res = self.http_client
            .get(&url)
            .send()
            .await
            .map_err(|e| format!("Failed to reach Cloudflare Worker: {}", e))?;

        let topology = res.json::<ClusterTopologyResponse>().await
            .map_err(|e| format!("Failed to parse cluster topology: {}", e))?;

        Ok(topology)
    }

    /// Sends role lease heartbeat to Firebase via Cloudflare Worker broker
    pub async fn send_heartbeat(
        &self,
        node_id: &str,
        role: &str,
        tps: f32,
        players: u32,
        memory_mb: u64,
    ) -> Result<(), String> {
        let url = format!("{}/api/cluster/heartbeat", self.worker_url);
        let payload = serde_json::json!({
            "nodeId": node_id,
            "role": role,
            "tps": tps,
            "connectedPlayers": players,
            "memoryUsageMb": memory_mb
        });

        self.http_client
            .post(&url)
            .bearer_auth(&self.auth_secret)
            .json(&payload)
            .send()
            .await
            .map_err(|e| format!("Heartbeat failed: {}", e))?;

        Ok(())
    }
}
