use std::fs;
use std::path::PathBuf;
use tauri::command;

fn get_config_path(app_handle: &tauri::AppHandle) -> Result<PathBuf, String> {
    let config_dir = match app_handle.path_resolver().app_config_dir() {
        Some(path) => path,
        None => return Err("Failed to get config dir".to_string()),
    };

    fs::create_dir_all(&config_dir).map_err(|e| e.to_string())?;
    Ok(config_dir.join("config.json"))
}

#[command]
pub fn load_api_key(app_handle: tauri::AppHandle) -> Result<String, String> {
    let config_path = get_config_path(&app_handle)?;

    if !config_path.exists() {
        return Ok(String::new());
    }

    let content = fs::read_to_string(&config_path).map_err(|e| e.to_string())?;
    let config: serde_json::Value = serde_json::from_str(&content).map_err(|e| e.to_string())?;

    let api_key = config
        .get("api_key")
        .and_then(|v| v.as_str())
        .unwrap_or("")
        .to_string();

    println!(
        "[Config] Loaded API key: {}",
        if api_key.is_empty() { "not set" } else { "***" }
    );
    Ok(api_key)
}

#[command]
pub fn save_api_key(api_key: String, app_handle: tauri::AppHandle) -> Result<(), String> {
    let config_path = get_config_path(&app_handle)?;

    let config = serde_json::json!({
        "api_key": api_key
    });

    fs::write(&config_path, config.to_string()).map_err(|e| e.to_string())?;
    println!("[Config] API key saved to {:?}", config_path);

    Ok(())
}
