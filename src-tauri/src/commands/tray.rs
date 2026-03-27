use tauri::{AppHandle, Manager, SystemTrayEvent};

pub fn handle_tray_event(app: &AppHandle, event: SystemTrayEvent) {
    match event {
        SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
            "show" => {
                if let Some(window) = app.get_window("main") {
                    window.show().unwrap();
                    window.set_focus().unwrap();
                }
            }
            "quit" => {
                println!("[Nexus] Quit requested from tray menu");
                std::process::exit(0);
            }
            _ => {}
        },
        SystemTrayEvent::DoubleClick { .. } => {
            if let Some(window) = app.get_window("main") {
                window.show().unwrap();
                window.set_focus().unwrap();
            }
        }
        _ => {}
    }
}
