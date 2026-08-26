use reqwest::Client;
use std::path::Path;
use tokio::fs::File;
use tokio_util::codec::{BytesCodec, FramedRead};

pub struct R2SyncClient {
    http_client: Client,
    endpoint: String,
    bucket: String,
}

impl R2SyncClient {
    pub fn new(endpoint: String, bucket: String) -> Self {
        Self {
            http_client: Client::new(),
            endpoint,
            bucket,
        }
    }

    /// Uploads compressed dimension delta archive to Cloudflare R2 bucket
    pub async fn upload_delta(&self, local_archive: &Path, remote_key: &str) -> Result<(), String> {
        let url = format!("{}/{}/{}", self.endpoint, self.bucket, remote_key);
        let file = File::open(local_archive).await
            .map_err(|e| format!("Failed to open local archive: {}", e))?;
        
        let stream = FramedRead::new(file, BytesCodec::new());
        let body = reqwest::Body::wrap_stream(stream);

        self.http_client
            .put(&url)
            .body(body)
            .send()
            .await
            .map_err(|e| format!("R2 Upload failed: {}", e))?;

        Ok(())
    }
}
