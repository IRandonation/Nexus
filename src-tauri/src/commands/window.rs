use tauri::{command, AppHandle, Manager, Position, Window, WindowBuilder, WindowUrl};

#[command]
pub fn show_omni_bar(app: AppHandle) -> Result<(), String> {
    let window = if let Some(win) = app.get_window("omni-bar") {
        win.show().map_err(|e| e.to_string())?;
        win.set_focus().map_err(|e| e.to_string())?;
        win
    } else {
        WindowBuilder::new(&app, "omni-bar", WindowUrl::App("/omni-bar".into()))
            .title("Nexus")
            .decorations(false)
            .transparent(true)
            .always_on_top(true)
            .skip_taskbar(true)
            .inner_size(600.0, 56.0)
            .build()
            .map_err(|e| e.to_string())?
    };

    center_window(&window)?;
    Ok(())
}

#[command]
pub fn hide_omni_bar(app: AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_window("omni-bar") {
        window.hide().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[command]
pub fn toggle_widget(app: AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_window("widget") {
        if window.is_visible().unwrap_or(false) {
            window.hide().map_err(|e| e.to_string())?;
        } else {
            window.show().map_err(|e| e.to_string())?;
        }
    } else {
        WindowBuilder::new(&app, "widget", WindowUrl::App("/widget".into()))
            .title("Nexus Widget")
            .decorations(false)
            .transparent(true)
            .always_on_top(true)
            .skip_taskbar(true)
            .inner_size(320.0, 180.0)
            .position(1000.0, 600.0)
            .build()
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

fn center_window(window: &Window) -> Result<(), String> {
    let monitor = window
        .current_monitor()
        .map_err(|e| e.to_string())?
        .ok_or("No monitor found")?;

    let size = monitor.size();
    let window_size = window.inner_size().map_err(|e| e.to_string())?;

    let x = (size.width as f64 - window_size.width as f64) / 2.0;
    let y = size.height as f64 * 0.2;

    window
        .set_position(Position::Physical(tauri::PhysicalPosition {
            x: x as i32,
            y: y as i32,
        }))
        .map_err(|e| e.to_string())?;

    Ok(())
}
