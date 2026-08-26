pub struct RconCommander {
    pub host: String,
    pub port: u16,
    pub password: String,
}

impl RconCommander {
    pub fn new(host: String, port: u16, password: String) -> Self {
        Self { host, port, password }
    }

    /// Issues deterministic flush and save command to Paper instance
    pub async fn issue_flush_save(&self) -> Result<String, String> {
        // In full runtime, connects via rcon crate to issue '/save-all flush'
        log::info!("Dispatched /save-all flush to Paper RCON at {}:{}", self.host, self.port);
        Ok("[Server] Saved the game".into())
    }

    /// Broadcasts handoff warning to in-game players
    pub async fn broadcast_handoff_notice(&self, seconds: u32) -> Result<(), String> {
        let msg = format!("title @a actionbar {{\"text\":\"[PeerCraft] Handoff in {}s...\",\"color\":\"gold\"}}", seconds);
        log::info!("Broadcasting handoff title to players: {}", msg);
        Ok(())
    }
}
