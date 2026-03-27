use rusqlite::Connection;
use std::sync::{Arc, Mutex};
use tauri::api::path::app_data_dir;

#[derive(Clone)]
pub struct Database {
    conn: Arc<Mutex<Connection>>,
}

impl Database {
    pub fn new(app_handle: &tauri::AppHandle) -> Result<Self, String> {
        let app_dir = app_data_dir(&app_handle.config()).ok_or("Failed to get app data dir")?;

        std::fs::create_dir_all(&app_dir).map_err(|e| e.to_string())?;

        let db_path = app_dir.join("nexus.db");
        let conn = Connection::open(db_path).map_err(|e| e.to_string())?;

        conn.execute("PRAGMA foreign_keys = OFF", [])
            .map_err(|e| e.to_string())?;

        let db = Self {
            conn: Arc::new(Mutex::new(conn)),
        };
        db.init_tables()?;

        Ok(db)
    }

    fn init_tables(&self) -> Result<(), String> {
        let conn = self.conn.lock().map_err(|e| e.to_string())?;

        conn.execute(
            "CREATE TABLE IF NOT EXISTS topics (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            color TEXT NOT NULL,
            created_at TEXT NOT NULL
        )",
            [],
        )
        .map_err(|e| e.to_string())?;

        conn.execute(
            "CREATE TABLE IF NOT EXISTS tasks (
            id TEXT PRIMARY KEY,
            content TEXT NOT NULL,
            extracted_datetime TEXT,
            extracted_entities TEXT,
            event TEXT,
            priority INTEGER DEFAULT 0,
            status TEXT DEFAULT 'pending',
            created_at TEXT NOT NULL,
            completed_at TEXT,
            updated_at TEXT NOT NULL,
            reason TEXT,
            metadata TEXT,
            topic_id TEXT
        )",
            [],
        )
        .map_err(|e| e.to_string())?;

        let _ = conn.execute("ALTER TABLE tasks ADD COLUMN topic_id TEXT", []);

        conn.execute(
            "CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )",
            [],
        )
        .map_err(|e| e.to_string())?;

        Ok(())
    }

    pub fn get_connection(&self) -> Arc<Mutex<Connection>> {
        Arc::clone(&self.conn)
    }
}
