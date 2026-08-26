use reqwest::Client;
use std::time::Duration;
use tokio::time::sleep;

pub struct HeartbeatEmitter {
    http_client: Client,
    worker_url: String,
    auth_secret: String,
    node_id: String,
    role: String,
}

impl HeartbeatEmitter {
    pub fn new(worker_url: String, auth_secret: String, node_id: String, role: String) -> Self {
        Self {
            http_client: Client::new(),
            worker_url,
            auth_secret,
            node_id,
            role,
        }
    }

    /// Spawns the async 5-second heartbeat emitter loop
    pub async fn start_loop(&self) {
        let url = format!("{}/api/cluster/heartbeat", self.worker_url);

        loop {
            let payload = serde_json::json!({
                "nodeId": self.node_id,
                "role": self.role,
                "tps": 20.0,
                "connectedPlayers": 4,
                "memoryUsageMb": 3200
            });

            match self.http_client
                .post(&url)
                .bearer_auth(&self.auth_secret)
                .json(&payload)
                .send()
                .await
            {
                Ok(res) => {
                    log::debug!("Heartbeat acknowledged: status {}", res.status());
                }
                Err(e) => {
                    log::warn!("Heartbeat pulse failed: {}", e);
                }
            }

            sleep(Duration::from_secs(5)).await;
        }
    }
}
