use tauri::AppHandle;

pub fn register_hotkeys(_app: &AppHandle) -> Result<(), String> {
    println!("[Hotkey] Hotkeys disabled - using UI buttons instead");
    Ok(())
}
