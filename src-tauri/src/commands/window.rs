use tauri::{
    command, AppHandle, Manager, PhysicalPosition, PhysicalSize, Position, Size, Window,
    WindowBuilder, WindowUrl,
};

const WIDGET_WIDTH: f64 = 320.0;
const WIDGET_HEIGHT: f64 = 180.0;
const WIDGET_MARGIN: f64 = 20.0;

fn omni_bar_size_for_monitor(width: u32) -> (f64, f64) {
    if width <= 1366 {
        (520.0, 150.0)
    } else if width <= 1920 {
        (620.0, 160.0)
    } else {
        (700.0, 170.0)
    }
}

#[command]
pub fn show_omni_bar(app: AppHandle) -> Result<(), String> {
    let window = if let Some(win) = app.get_window("omni-bar") {
        win
    } else {
        WindowBuilder::new(&app, "omni-bar", WindowUrl::App("/omni-bar".into()))
            .title("Nexus Quick Add")
            .decorations(false)
            .transparent(true)
            .always_on_top(true)
            .skip_taskbar(true)
            .resizable(false)
            .inner_size(620.0, 160.0)
            .build()
            .map_err(|e| e.to_string())?
    };

    anchor_omni_bar(&window)?;
    window.show().map_err(|e| e.to_string())?;
    window.set_focus().map_err(|e| e.to_string())?;
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
            anchor_widget(&window)?;
            window.show().map_err(|e| e.to_string())?;
            window.set_focus().map_err(|e| e.to_string())?;
        }
    } else {
        let window = WindowBuilder::new(&app, "widget", WindowUrl::App("/widget".into()))
            .title("Nexus Widget")
            .decorations(false)
            .transparent(true)
            .always_on_top(true)
            .skip_taskbar(true)
            .resizable(false)
            .inner_size(WIDGET_WIDTH, WIDGET_HEIGHT)
            .build()
            .map_err(|e| e.to_string())?;

        anchor_widget(&window)?;
    }
    Ok(())
}

pub fn ensure_widget_visible(app: &AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_window("widget") {
        anchor_widget(&window)?;
        window.show().map_err(|e| e.to_string())?;
        return Ok(());
    }

    let window = WindowBuilder::new(app, "widget", WindowUrl::App("/widget".into()))
        .title("Nexus Widget")
        .decorations(false)
        .transparent(true)
        .always_on_top(true)
        .skip_taskbar(true)
        .resizable(false)
        .inner_size(WIDGET_WIDTH, WIDGET_HEIGHT)
        .build()
        .map_err(|e| e.to_string())?;

    anchor_widget(&window)?;
    window.show().map_err(|e| e.to_string())?;
    Ok(())
}

fn anchor_omni_bar(window: &Window) -> Result<(), String> {
    let monitor = window
        .current_monitor()
        .map_err(|e| e.to_string())?
        .ok_or("No monitor found")?;

    let size = monitor.size();
    let (w, h) = omni_bar_size_for_monitor(size.width);

    window
        .set_size(Size::Physical(PhysicalSize {
            width: w as u32,
            height: h as u32,
        }))
        .map_err(|e| e.to_string())?;

    let x = (size.width as f64 - w) / 2.0;
    let y = 24.0;

    window
        .set_position(Position::Physical(PhysicalPosition {
            x: x as i32,
            y: y as i32,
        }))
        .map_err(|e| e.to_string())?;

    Ok(())
}

fn anchor_widget(window: &Window) -> Result<(), String> {
    let monitor = window
        .current_monitor()
        .map_err(|e| e.to_string())?
        .ok_or("No monitor found")?;

    let size = monitor.size();
    let x = size.width as f64 - WIDGET_WIDTH - WIDGET_MARGIN;
    let y = size.height as f64 - WIDGET_HEIGHT - WIDGET_MARGIN - 40.0;

    window
        .set_position(Position::Physical(PhysicalPosition {
            x: x as i32,
            y: y as i32,
        }))
        .map_err(|e| e.to_string())?;

    Ok(())
}
