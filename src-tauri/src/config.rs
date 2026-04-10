use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Config {
    pub claude_api_key: String,
    pub claude_api_base_url: String,
    pub claude_model: String,
}

impl Default for Config {
    fn default() -> Self {
        Self {
            claude_api_key: String::new(),
            claude_api_base_url: "https://api.minimaxi.com/anthropic".to_string(),
            claude_model: "MiniMax-M2.7".to_string(),
        }
    }
}

pub fn load_from_file<P: AsRef<Path>>(path: P) -> Result<Config, Box<dyn std::error::Error>> {
    let content = fs::read_to_string(path)?;
    let config: Config = serde_json::from_str(&content)?;
    Ok(config)
}

pub fn save_to_file<P: AsRef<Path>>(config: &Config, path: P) -> Result<(), Box<dyn std::error::Error>> {
    let content = serde_json::to_string_pretty(config)?;
    fs::write(path, content)?;
    Ok(())
}
