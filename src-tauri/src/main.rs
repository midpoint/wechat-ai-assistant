// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod capture;
mod claude;
mod keyboard;
mod config;

use log::info;
use std::sync::Mutex;
use tauri::State;

pub use capture::*;
pub use claude::*;
pub use keyboard::*;
pub use config::*;

struct AppState {
    config: Mutex<Config>,
}

#[tauri::command]
async fn capture_screen(
    x: i32,
    y: i32,
    width: u32,
    height: u32,
) -> Result<String, String> {
    capture::capture_region(x, y, width, height)
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn analyze_image_with_claude(
    image_base64: String,
    prompt: String,
    api_key: String,
    model: String,
    base_url: String,
) -> Result<String, String> {
    claude::analyze_image(&image_base64, &prompt, &api_key, &model, &base_url)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn simulate_type_text(text: String) -> Result<(), String> {
    keyboard::type_text(&text).map_err(|e| e.to_string())
}

#[tauri::command]
async fn simulate_enter() -> Result<(), String> {
    keyboard::press_enter().map_err(|e| e.to_string())
}

#[tauri::command]
async fn simulate_ctrl_v() -> Result<(), String> {
    keyboard::paste_from_clipboard().map_err(|e| e.to_string())
}

#[tauri::command]
async fn copy_and_send(text: String) -> Result<(), String> {
    keyboard::paste_and_send(&text).map_err(|e| e.to_string())
}

#[tauri::command]
fn load_config(state: State<AppState>) -> Result<Config, String> {
    let config = state.config.lock().map_err(|e| e.to_string())?;
    Ok(config.clone())
}

#[tauri::command]
fn save_config(new_config: Config, state: State<AppState>) -> Result<(), String> {
    let mut config = state.config.lock().map_err(|e| e.to_string())?;
    *config = new_config.clone();
    config::save_to_file(&new_config, "config.json").map_err(|e| e.to_string())
}

#[tauri::command]
fn list_screens() -> Result<Vec<ScreenInfo>, String> {
    capture::get_screens().map_err(|e| e.to_string())
}

#[tauri::command]
fn capture_full_screen(screen_id: Option<u32>) -> Result<String, String> {
    capture::capture_screen_full(screen_id.unwrap_or(0))
        .map_err(|e| e.to_string())
}

fn main() {
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info"))
        .init();

    info!("Starting WeChat AI Assistant");

    let app_config = config::load_from_file("config.json")
        .unwrap_or_else(|_| Config::default());

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(AppState {
            config: Mutex::new(app_config),
        })
        .invoke_handler(tauri::generate_handler![
            capture_screen,
            analyze_image_with_claude,
            simulate_type_text,
            simulate_enter,
            simulate_ctrl_v,
            copy_and_send,
            load_config,
            save_config,
            list_screens,
            capture_full_screen,
        ])
        .setup(|_app| {
            info!("Application setup complete");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
