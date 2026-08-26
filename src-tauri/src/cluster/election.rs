use serde::{Deserialize, Serialize};
use reqwest::Client;
use crate::cluster::benchmark::BenchmarkMetrics;

#[derive(Debug, Serialize, Deserialize)]
pub struct ElectionResponse {
    pub success: bool,
    pub election: String,
    pub roles: serde_json::Value,
}

pub struct ElectionClient {
    http_client: Client,
    worker_url: String,
    auth_secret: String,
}

impl ElectionClient {
    pub fn new(worker_url: String, auth_secret: String) -> Self {
        Self {
            http_client: Client::new(),
            worker_url,
            auth_secret,
        }
    }

    /// Submits local benchmark to Cloudflare Worker broker
    pub async fn submit_benchmark(&self, metrics: &BenchmarkMetrics) -> Result<serde_json::Value, String> {
        let url = format!("{}/api/nodes/benchmark", self.worker_url);
        let res = self.http_client
            .post(&url)
            .bearer_auth(&self.auth_secret)
            .json(metrics)
            .send()
            .await
            .map_err(|e| format!("Failed to submit benchmark: {}", e))?;

        let body = res.json::<serde_json::Value>().await
            .map_err(|e| format!("Failed to parse response: {}", e))?;

        Ok(body)
    }

    /// Triggers dynamic election across cluster nodes
    pub async fn trigger_election(&self, requester_node_id: &str) -> Result<ElectionResponse, String> {
        let url = format!("{}/api/cluster/elect", self.worker_url);
        let payload = serde_json::json!({
            "requesterNodeId": requester_node_id,
            "force": false
        });

        let res = self.http_client
            .post(&url)
            .bearer_auth(&self.auth_secret)
            .json(&payload)
            .send()
            .await
            .map_err(|e| format!("Election request failed: {}", e))?;

        let data = res.json::<ElectionResponse>().await
            .map_err(|e| format!("Failed to parse election response: {}", e))?;

        Ok(data)
    }
}
