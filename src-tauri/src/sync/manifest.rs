use sha2::{Digest, Sha256};
use std::fs::File;
use std::io::Read;
use std::path::Path;
use walkdir::WalkDir;

pub struct ManifestValidator;

impl ManifestValidator {
    /// Computes unified SHA-256 hash across all regional MCA chunk files in a dimension
    pub fn compute_dimension_hash(dir: &Path) -> Result<String, String> {
        let mut hasher = Sha256::new();

        let mut files: Vec<_> = WalkDir::new(dir)
            .into_iter()
            .filter_map(|e| e.ok())
            .filter(|e| e.path().is_file())
            .collect();

        // Sort deterministically
        files.sort_by_key(|a| a.path().to_string_lossy().into_owned());

        for entry in files {
            let path = entry.path();
            if let Some(ext) = path.extension() {
                if ext == "mca" || ext == "dat" {
                    let mut file = File::open(path)
                        .map_err(|e| format!("Failed to read {:?}: {}", path, e))?;
                    let mut buffer = [0u8; 8192];
                    while let Ok(n) = file.read(&mut buffer) {
                        if n == 0 { break; }
                        hasher.update(&buffer[..n]);
                    }
                }
            }
        }

        let result = hasher.finalize();
        Ok(format!("{:x}", result))
    }
}
