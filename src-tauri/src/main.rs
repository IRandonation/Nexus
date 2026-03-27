use tauri::{generate_context, Builder, Manager, SystemTray, SystemTrayMenu};
use db::Database;
use services::{task_service::TaskService, ai_service::AIService, topic_service::TopicService};

mod commands;
mod db;
mod models;
mod services;

use commands::{hotkey, tray, task, config, topic};

fn main() {
    println!("[Nexus] Starting application...");
    
    use tauri::SystemTrayMenuItem as TMenuItem;
    let tray_menu = SystemTrayMenu::new()
        .add_item(tauri::CustomMenuItem::new("show", "显示 Nexus"))
        .add_native_item(TMenuItem::Separator)
        .add_item(tauri::CustomMenuItem::new("quit", "退出"));

    Builder::default()
        .system_tray(SystemTray::new().with_menu(tray_menu))
        .on_system_tray_event(tray::handle_tray_event)
        .on_window_event(|event| {
            match event.event() {
                tauri::WindowEvent::CloseRequested { api, .. } => {
                    println!("[Nexus] Window close requested, exiting application");
                    api.prevent_close();
                    event.window().close().unwrap();
                }
                _ => {}
            }
        })
        .setup(|app| {
            println!("[Nexus] Setting up application...");
            
            hotkey::register_hotkeys(&app.handle())?;
            println!("[Nexus] Hotkeys registered");
            
            let db = Database::new(&app.handle())?;
            println!("[Nexus] Database initialized");
            
            app.manage(TaskService::new(db.clone()));
            println!("[Nexus] TaskService initialized");
            
            app.manage(TopicService::new(db));
            println!("[Nexus] TopicService initialized");
            
            let api_key = config::load_api_key(app.handle())
                .unwrap_or_else(|_| String::new());
            app.manage(AIService::new(api_key.clone()));
            println!("[Nexus] AIService initialized (API key: {})", if api_key.is_empty() { "not set - please configure in Settings" } else { "***" });
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::window::show_omni_bar,
            commands::window::hide_omni_bar,
            commands::window::toggle_widget,
            task::create_task,
            task::get_tasks,
            task::get_tasks_by_topic,
            task::get_conflicting_tasks,
            task::complete_task,
            task::parse_intent,
            task::update_task,
            task::delete_task,
            config::load_api_key,
            config::save_api_key,
            topic::create_topic,
            topic::get_topics,
            topic::update_topic,
            topic::delete_topic,
            topic::get_preset_colors,
        ])
        .run(generate_context!())
        .expect("error while running tauri application");
}
