use std::fs::File;
use std::io::{Read, Write};
use std::path::Path;
use walkdir::WalkDir;

pub struct DeltaEngine;

impl DeltaEngine {
    /// Compresses a dimension folder (e.g. world/region) using Zstandard into an archive stream
    pub fn compress_dimension_delta(source_dir: &Path, output_archive: &Path) -> Result<u64, String> {
        let out_file = File::create(output_archive)
            .map_err(|e| format!("Failed to create output archive: {}", e))?;
        let mut encoder = zstd::stream::Encoder::new(out_file, 3)
            .map_err(|e| format!("Failed to initialize zstd encoder: {}", e))?;

        let mut total_bytes: u64 = 0;

        for entry in WalkDir::new(source_dir).into_iter().filter_map(|e| e.ok()) {
            let path = entry.path();
            if path.is_file() {
                if let Some(ext) = path.extension() {
                    if ext == "mca" || ext == "dat" || ext == "json" {
                        let mut file = File::open(path)
                            .map_err(|e| format!("Failed to open file {:?}: {}", path, e))?;
                        let mut buffer = Vec::new();
                        file.read_to_end(&mut buffer)
                            .map_err(|e| format!("Read error: {}", e))?;
                        encoder.write_all(&buffer)
                            .map_err(|e| format!("Zstd write error: {}", e))?;
                        total_bytes += buffer.len() as u64;
                    }
                }
            }
        }

        encoder.finish().map_err(|e| format!("Zstd finish error: {}", e))?;
        Ok(total_bytes)
    }
}
