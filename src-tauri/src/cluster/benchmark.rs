use serde::{Deserialize, Serialize};
use std::time::Instant;
use sysinfo::System;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BenchmarkMetrics {
    pub node_id: String,
    pub node_name: String,
    pub cpu_single_thread_score: u64, // ALU/FPU iterations per millisecond
    pub available_ram_mb: u64,
    pub upstream_bandwidth_mbps: u32,
    pub ping_ms: u32,
    pub composite_score: f64,
}

/// Runs a fast 2-second micro-benchmark measuring single-thread integer/floating math,
/// reads available system RAM via sysinfo, and computes the composite role fitness score.
pub async fn run_quick_benchmark() -> BenchmarkMetrics {
    let mut sys = System::new_all();
    sys.refresh_all();

    let node_name = sysinfo::System::host_name().unwrap_or_else(|| "Unknown-PC".into());
    let available_ram_mb = sys.available_memory() / (1024 * 1024);

    // Micro-benchmark single-thread CPU compute loop (approx 500ms)
    let start = Instant::now();
    let mut accumulator: f64 = 1.0;
    let iterations: u64 = 5_000_000;

    for i in 1..=iterations {
        let f = i as f64;
        accumulator = (accumulator + f.sin() * f.cos()).fract() + 1.0;
    }

    let elapsed_ms = start.elapsed().as_millis().max(1) as u64;
    let cpu_single_thread_score = (iterations / elapsed_ms) / 10;

    // Simulated bandwidth / ping probe to Cloudflare Edge
    let upstream_bandwidth_mbps = 50;
    let ping_ms = 15;

    // Composite fitness scoring formula:
    // Score = (0.50 * CPU) + (200 * RAM_GB) + (2.0 * Bandwidth) - (0.25 * Ping)
    let ram_gb = available_ram_mb as f64 / 1024.0;
    let composite_score = (0.50 * cpu_single_thread_score as f64)
        + (200.0 * ram_gb)
        + (2.0 * upstream_bandwidth_mbps as f64)
        - (0.25 * ping_ms as f64);

    BenchmarkMetrics {
        node_id: format!("node_{}", &node_name.to_lowercase().replace(' ', "_")),
        node_name,
        cpu_single_thread_score,
        available_ram_mb,
        upstream_bandwidth_mbps,
        ping_ms,
        composite_score,
    }
}
