use crate::db::Database;
use crate::models::topic::{CreateTopicPayload, Topic, UpdateTopicPayload, PRESET_COLORS};
use chrono::Utc;
use rusqlite::params;
use uuid::Uuid;

pub struct TopicService {
    db: Database,
}

impl TopicService {
    pub fn new(db: Database) -> Self {
        Self { db }
    }

    pub fn create_topic(&self, payload: CreateTopicPayload) -> Result<Topic, String> {
        println!("[TopicService] Creating topic: {}", payload.name);
        let now = Utc::now().to_rfc3339();
        let id = Uuid::new_v4().to_string();

        let color = payload.color.unwrap_or_else(|| {
            let conn = self.db.get_connection();
            let conn = conn.lock().unwrap();
            let count: i32 = conn
                .query_row("SELECT COUNT(*) FROM topics", [], |row| row.get(0))
                .unwrap_or(0);
            PRESET_COLORS[count as usize % PRESET_COLORS.len()].to_string()
        });

        let topic = Topic {
            id: id.clone(),
            name: payload.name,
            color,
            created_at: now,
        };

        println!("[TopicService] Inserting topic with id={}", id);

        let conn = self.db.get_connection();
        let conn = conn.lock().map_err(|e| e.to_string())?;

        let name_count: i64 = conn
            .query_row(
                "SELECT COUNT(*) FROM topics WHERE name = ?1",
                params![&topic.name],
                |row| row.get(0),
            )
            .unwrap_or(0);
        if name_count > 0 {
            return Err("主题名称已存在".to_string());
        }

        let color_count: i64 = conn
            .query_row(
                "SELECT COUNT(*) FROM topics WHERE color = ?1",
                params![&topic.color],
                |row| row.get(0),
            )
            .unwrap_or(0);
        if color_count > 0 {
            return Err("该颜色已被其他主题使用".to_string());
        }

        let result = conn.execute(
            "INSERT INTO topics (id, name, color, created_at) VALUES (?1, ?2, ?3, ?4)",
            [&topic.id, &topic.name, &topic.color, &topic.created_at],
        );

        if let Err(e) = result {
            println!("[TopicService] Failed to insert topic: {}", e);
            return Err(e.to_string());
        }

        println!("[TopicService] Topic created with ID: {}", id);
        Ok(topic)
    }

    pub fn get_topics(&self) -> Result<Vec<Topic>, String> {
        println!("[TopicService] Fetching all topics");
        let conn = self.db.get_connection();
        let conn = conn.lock().map_err(|e| e.to_string())?;

        let mut stmt = conn
            .prepare("SELECT * FROM topics ORDER BY created_at ASC")
            .map_err(|e| e.to_string())?;

        let topics = stmt
            .query_map([], |row| {
                Ok(Topic {
                    id: row.get("id")?,
                    name: row.get("name")?,
                    color: row.get("color")?,
                    created_at: row.get("created_at")?,
                })
            })
            .map_err(|e| e.to_string())?;

        let result = topics
            .collect::<Result<Vec<_>, _>>()
            .map_err(|e| e.to_string())?;

        println!("[TopicService] Fetched {} topics", result.len());
        for t in &result {
            println!("[TopicService] Topic: id={}, name={}", t.id, t.name);
        }
        Ok(result)
    }

    pub fn get_topic(&self, id: &str) -> Result<Option<Topic>, String> {
        let conn = self.db.get_connection();
        let conn = conn.lock().map_err(|e| e.to_string())?;

        let mut stmt = conn
            .prepare("SELECT * FROM topics WHERE id = ?1")
            .map_err(|e| e.to_string())?;

        let mut topics = stmt
            .query_map([id], |row| {
                Ok(Topic {
                    id: row.get("id")?,
                    name: row.get("name")?,
                    color: row.get("color")?,
                    created_at: row.get("created_at")?,
                })
            })
            .map_err(|e| e.to_string())?;

        match topics.next() {
            Some(t) => Ok(Some(t.map_err(|e| e.to_string())?)),
            None => Ok(None),
        }
    }

    pub fn update_topic(&self, payload: UpdateTopicPayload) -> Result<Topic, String> {
        println!("[TopicService] Updating topic: {}", payload.id);

        let existing = self.get_topic(&payload.id)?.ok_or("Topic not found")?;

        let topic = Topic {
            id: payload.id.clone(),
            name: payload.name.unwrap_or(existing.name),
            color: payload.color.unwrap_or(existing.color),
            created_at: existing.created_at,
        };

        let conn = self.db.get_connection();
        let conn = conn.lock().map_err(|e| e.to_string())?;

        let name_count: i64 = conn
            .query_row(
                "SELECT COUNT(*) FROM topics WHERE name = ?1 AND id != ?2",
                params![&topic.name, &topic.id],
                |row| row.get(0),
            )
            .unwrap_or(0);
        if name_count > 0 {
            return Err("主题名称已存在".to_string());
        }

        let color_count: i64 = conn
            .query_row(
                "SELECT COUNT(*) FROM topics WHERE color = ?1 AND id != ?2",
                params![&topic.color, &topic.id],
                |row| row.get(0),
            )
            .unwrap_or(0);
        if color_count > 0 {
            return Err("该颜色已被其他主题使用".to_string());
        }

        conn.execute(
            "UPDATE topics SET name = ?1, color = ?2 WHERE id = ?3",
            [&topic.name, &topic.color, &topic.id],
        )
        .map_err(|e| e.to_string())?;

        println!("[TopicService] Topic {} updated", topic.id);
        Ok(topic)
    }

    pub fn delete_topic(&self, id: &str) -> Result<(), String> {
        println!("[TopicService] Deleting topic: {}", id);

        let conn = self.db.get_connection();
        let conn = conn.lock().map_err(|e| e.to_string())?;

        conn.execute("UPDATE tasks SET topic_id = NULL WHERE topic_id = ?1", [id])
            .map_err(|e| e.to_string())?;

        conn.execute("DELETE FROM topics WHERE id = ?1", [id])
            .map_err(|e| e.to_string())?;

        println!("[TopicService] Topic {} deleted", id);
        Ok(())
    }

    pub fn get_preset_colors() -> Vec<String> {
        PRESET_COLORS.iter().map(|s| s.to_string()).collect()
    }
}
