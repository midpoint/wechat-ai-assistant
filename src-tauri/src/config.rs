use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Config {
    pub claude_api_key: String,
    pub claude_api_base_url: String,
    pub claude_model: String,
    pub capture_region: CaptureRegion,
    pub filter_keywords: Vec<String>,
    pub enable_group_chat: bool,
    pub auto_reply_delay_ms: u64,
    pub system_prompt: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CaptureRegion {
    pub x: i32,
    pub y: i32,
    pub width: u32,
    pub height: u32,
}

impl Default for Config {
    fn default() -> Self {
        Self {
            claude_api_key: String::new(),
            claude_api_base_url: "https://api.minimaxi.com/anthropic".to_string(),
            claude_model: "claude-sonnet-4-20250514".to_string(),
            capture_region: CaptureRegion::default(),
            filter_keywords: vec![],
            enable_group_chat: false,
            auto_reply_delay_ms: 1000,
            system_prompt: "你是一个微信智能助手，请根据用户的输入生成合适的回复。回复要简洁自然，像人类对话。如果用户发送图片或表情，可以做出相应的回应。不要透露你是AI或机器人。回复长度适中，不要过长。保持友好和乐于助人的态度。".to_string(),
        }
    }
}

impl Default for CaptureRegion {
    fn default() -> Self {
        Self {
            x: 0,
            y: 0,
            width: 400,
            height: 600,
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
