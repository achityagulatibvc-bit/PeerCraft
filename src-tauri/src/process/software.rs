use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SoftwareVersionInfo {
    pub project_id: String,
    pub project_name: String,
    pub versions: Vec<String>,
    pub recommended_version: String,
}

pub struct SoftwareDiscovery;

impl SoftwareDiscovery {
    /// Queries official PaperMC API for list of available releases
    pub async fn fetch_paper_versions() -> Result<Vec<String>, String> {
        let client = reqwest::Client::new();
        let res = client
            .get("https://api.papermc.io/v2/projects/paper")
            .header("User-Agent", "PeerCraft-Desktop/0.2.0")
            .send()
            .await
            .map_err(|e| format!("Failed to reach PaperMC API: {}", e))?;

        #[derive(Deserialize)]
        struct PaperProjectResponse {
            versions: Vec<String>,
        }

        let body = res.json::<PaperProjectResponse>().await
            .map_err(|e| format!("Failed to parse Paper response: {}", e))?;

        let mut rev = body.versions;
        rev.reverse();
        Ok(rev)
    }
}
