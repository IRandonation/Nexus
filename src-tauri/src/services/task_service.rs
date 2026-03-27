use crate::db::Database;
use crate::models::task::{Priority, Task, TaskStatus};
use chrono::Utc;
use uuid::Uuid;

pub struct TaskService {
    db: Database,
}

impl TaskService {
    pub fn new(db: Database) -> Self {
        Self { db }
    }
    
    pub fn create_task(
        &self, 
        content: String,
        extracted_datetime: Option<String>,
        extracted_entities: Option<Vec<String>>,
        event: Option<String>,
        topic_id: Option<String>,
    ) -> Result<Task, String> {
        println!("[TaskService] Creating task: {}", content);
        println!("[TaskService] Params: datetime={:?}, entities={:?}, event={:?}, topic_id={:?}", 
            extracted_datetime, extracted_entities, event, topic_id);
        
        let now = Utc::now().to_rfc3339();
        let id = Uuid::new_v4().to_string();
        
        let extracted_datetime = extracted_datetime.filter(|s| !s.is_empty());
        let event = event.filter(|s| !s.is_empty());
        let topic_id = topic_id.filter(|s| !s.is_empty());
        
        let task = Task {
            id: id.clone(),
            content: content.clone(),
            extracted_datetime: extracted_datetime.clone(),
            extracted_entities: extracted_entities.clone(),
            event: event.clone(),
            priority: Priority::Medium,
            status: TaskStatus::Pending,
            created_at: now.clone(),
            completed_at: None,
            updated_at: now,
            reason: None,
            topic_id: topic_id.clone(),
        };
        
        let conn = self.db.get_connection();
        let conn = conn.lock().map_err(|e| {
            println!("[TaskService] Failed to get connection: {}", e);
            e.to_string()
        })?;
        
        println!("[TaskService] topic_id to insert: {:?}", topic_id);
        
        let result = conn.execute(
            "INSERT INTO tasks (id, content, extracted_datetime, extracted_entities, event, priority, status, created_at, updated_at, topic_id)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
            [
                &task.id,
                &task.content,
                &extracted_datetime.unwrap_or_default(),
                &extracted_entities.as_ref().map(|e| e.join(", ")).unwrap_or_default(),
                &event.unwrap_or_default(),
                &(task.priority as i32).to_string(),
                "pending",
                &task.created_at,
                &task.updated_at,
                &topic_id.unwrap_or_default(),
            ],
        );
        
        if let Err(e) = result {
            println!("[TaskService] Insert failed: {}", e);
            return Err(e.to_string());
        }
        
        println!("[TaskService] Task created with ID: {}", id);
        Ok(task)
    }
    
    pub fn get_tasks(&self) -> Result<Vec<Task>, String> {
        println!("[TaskService] Fetching all tasks");
        let conn = self.db.get_connection();
        let conn = conn.lock().map_err(|e| e.to_string())?;
        let mut stmt = conn
            .prepare("SELECT * FROM tasks ORDER BY created_at DESC")
            .map_err(|e| e.to_string())?;
        
        let tasks = stmt.query_map([], |row| {
            let entities_str: String = row.get::<_, String>("extracted_entities")?;
            let extracted_entities = if entities_str.is_empty() {
                None
            } else {
                Some(entities_str.split(", ").map(|s| s.to_string()).collect())
            };
            
            let topic_id_raw: Option<String> = row.get("topic_id")?;
            let topic_id = topic_id_raw.filter(|s| !s.is_empty());
            
            Ok(Task {
                id: row.get("id")?,
                content: row.get("content")?,
                extracted_datetime: row.get("extracted_datetime")?,
                extracted_entities,
                event: row.get("event")?,
                priority: match row.get::<_, i32>("priority")? {
                    0 => Priority::Low,
                    1 => Priority::Medium,
                    _ => Priority::High,
                },
                status: match row.get::<_, String>("status")?.as_str() {
                    "completed" => TaskStatus::Completed,
                    "cancelled" => TaskStatus::Cancelled,
                    _ => TaskStatus::Pending,
                },
                created_at: row.get("created_at")?,
                completed_at: row.get("completed_at")?,
                updated_at: row.get("updated_at")?,
                reason: row.get("reason")?,
                topic_id,
            })
        }).map_err(|e| e.to_string())?;
        
        let result = tasks.collect::<Result<Vec<_>, _>>()
            .map_err(|e| e.to_string())?;
        
        for task in &result {
            println!("[TaskService] Task from DB: id={}, topic_id={:?}", task.id, task.topic_id);
        }
        
        println!("[TaskService] Fetched {} tasks", result.len());
        Ok(result)
    }
    
    pub fn complete_task(&self, id: &str, reason: Option<String>) -> Result<(), String> {
        println!("[TaskService] Completing task: {} (reason: {:?})", id, reason);
        let now = Utc::now().to_rfc3339();
        
        let conn = self.db.get_connection();
        let conn = conn.lock().map_err(|e| e.to_string())?;
        conn.execute(
            "UPDATE tasks SET status = 'completed', completed_at = ?1, updated_at = ?2, reason = ?3
             WHERE id = ?4",
            [&now, &now, &reason.unwrap_or_default(), id],
        ).map_err(|e| e.to_string())?;
        
        println!("[TaskService] Task {} completed", id);
        Ok(())
    }
    
    pub async fn get_upcoming_tasks(&self, minutes: i64) -> Result<Vec<Task>, String> {
        use chrono::{Duration, Utc};
        let now = Utc::now();
        let deadline = now + Duration::minutes(minutes);
        
        let conn = self.db.get_connection();
        let conn = conn.lock().map_err(|e| e.to_string())?;
        let mut stmt = conn
            .prepare(
                "SELECT * FROM tasks 
                 WHERE extracted_datetime IS NOT NULL 
                 AND status = 'pending'
                 AND extracted_datetime BETWEEN ?1 AND ?2"
            )
            .map_err(|e: rusqlite::Error| e.to_string())?;
        
        let tasks = stmt.query_map(
            [&now.to_rfc3339(), &deadline.to_rfc3339()],
            |row: &rusqlite::Row| {
                let entities_str: String = row.get::<_, String>("extracted_entities")?;
                let extracted_entities = if entities_str.is_empty() {
                    None
                } else {
                    Some(entities_str.split(", ").map(|s| s.to_string()).collect())
                };
                
                Ok(Task {
                    id: row.get("id")?,
                    content: row.get("content")?,
                    extracted_datetime: row.get("extracted_datetime")?,
                    extracted_entities,
                    event: row.get("event")?,
                    priority: match row.get::<_, i32>("priority")? {
                        0 => Priority::Low,
                        1 => Priority::Medium,
                        _ => Priority::High,
                    },
                    status: TaskStatus::Pending,
                    created_at: row.get("created_at")?,
                    completed_at: row.get("completed_at")?,
                    updated_at: row.get("updated_at")?,
                    reason: row.get("reason")?,
                    topic_id: row.get("topic_id")?,
                })
            }
        ).map_err(|e: rusqlite::Error| e.to_string())?;
        
        tasks.collect::<Result<Vec<_>, rusqlite::Error>>()
            .map_err(|e: rusqlite::Error| e.to_string())
    }
    
    pub fn update_task(&self, task: Task) -> Result<(), String> {
        println!("[TaskService] Updating task: {}", task.id);
        let conn = self.db.get_connection();
        let conn = conn.lock().map_err(|e| e.to_string())?;
        
        let extracted_entities = task.extracted_entities.as_ref().map(|e| e.join(", ")).unwrap_or_default();
        let extracted_datetime = task.extracted_datetime.clone().unwrap_or_default();
        let event = task.event.clone().unwrap_or_default();
        
        conn.execute(
            "UPDATE tasks SET 
             content = ?1, 
             extracted_datetime = ?2, 
             extracted_entities = ?3, 
             event = ?4,
             priority = ?5,
             updated_at = ?6
             WHERE id = ?7",
            [
                &task.content,
                &extracted_datetime,
                &extracted_entities,
                &event,
                &(task.priority as i32).to_string(),
                &task.updated_at,
                &task.id,
            ],
        ).map_err(|e| e.to_string())?;
        
        println!("[TaskService] Task {} updated", task.id);
        Ok(())
    }
    
    pub fn delete_task(&self, id: &str) -> Result<(), String> {
        println!("[TaskService] Deleting task: {}", id);
        let conn = self.db.get_connection();
        let conn = conn.lock().map_err(|e| e.to_string())?;
        
        conn.execute(
            "DELETE FROM tasks WHERE id = ?1",
            [id],
        ).map_err(|e| e.to_string())?;
        
        println!("[TaskService] Task {} deleted", id);
        Ok(())
    }

    pub fn get_tasks_by_topic(&self, topic_id: &str) -> Result<Vec<Task>, String> {
        println!("[TaskService] Fetching tasks for topic: {}", topic_id);
        let conn = self.db.get_connection();
        let conn = conn.lock().map_err(|e| e.to_string())?;
        let mut stmt = conn
            .prepare("SELECT * FROM tasks WHERE topic_id = ?1 AND status = 'pending' ORDER BY extracted_datetime ASC")
            .map_err(|e| e.to_string())?;
        
        let tasks = stmt.query_map([topic_id], |row| {
            let entities_str: String = row.get::<_, String>("extracted_entities")?;
            let extracted_entities = if entities_str.is_empty() {
                None
            } else {
                Some(entities_str.split(", ").map(|s| s.to_string()).collect())
            };
            
            Ok(Task {
                id: row.get("id")?,
                content: row.get("content")?,
                extracted_datetime: row.get("extracted_datetime")?,
                extracted_entities,
                event: row.get("event")?,
                priority: match row.get::<_, i32>("priority")? {
                    0 => Priority::Low,
                    1 => Priority::Medium,
                    _ => Priority::High,
                },
                status: TaskStatus::Pending,
                created_at: row.get("created_at")?,
                completed_at: row.get("completed_at")?,
                updated_at: row.get("updated_at")?,
                reason: row.get("reason")?,
                topic_id: row.get("topic_id")?,
            })
        }).map_err(|e| e.to_string())?;
        
        let result = tasks.collect::<Result<Vec<_>, _>>()
            .map_err(|e| e.to_string())?;
        
        println!("[TaskService] Fetched {} tasks for topic", result.len());
        Ok(result)
    }

    pub fn get_conflicting_tasks(&self, datetime: &str, duration_minutes: i32) -> Result<Vec<Task>, String> {
        use chrono::{DateTime, Duration, Utc, TimeZone};
        
        let target_time = DateTime::parse_from_rfc3339(datetime)
            .map(|dt| dt.with_timezone(&Utc))
            .or_else(|_| {
                Utc.datetime_from_str(datetime, "%Y-%m-%dT%H:%M:%S")
                    .or_else(|_| Utc.datetime_from_str(datetime, "%Y-%m-%d %H:%M:%S"))
                    .or_else(|_| Ok(Utc::now()))
            })
            .map_err(|e: String| e)?;
        
        let start = target_time - Duration::minutes(duration_minutes as i64 / 2);
        let end = target_time + Duration::minutes(duration_minutes as i64 / 2);
        
        let conn = self.db.get_connection();
        let conn = conn.lock().map_err(|e| e.to_string())?;
        let mut stmt = conn
            .prepare(
                "SELECT * FROM tasks 
                 WHERE extracted_datetime IS NOT NULL 
                 AND status = 'pending'
                 AND extracted_datetime BETWEEN ?1 AND ?2"
            )
            .map_err(|e| e.to_string())?;
        
        let tasks = stmt.query_map(
            [start.to_rfc3339(), end.to_rfc3339()],
            |row| {
                let entities_str: String = row.get::<_, String>("extracted_entities")?;
                let extracted_entities = if entities_str.is_empty() {
                    None
                } else {
                    Some(entities_str.split(", ").map(|s| s.to_string()).collect())
                };
                
                Ok(Task {
                    id: row.get("id")?,
                    content: row.get("content")?,
                    extracted_datetime: row.get("extracted_datetime")?,
                    extracted_entities,
                    event: row.get("event")?,
                    priority: match row.get::<_, i32>("priority")? {
                        0 => Priority::Low,
                        1 => Priority::Medium,
                        _ => Priority::High,
                    },
                    status: TaskStatus::Pending,
                    created_at: row.get("created_at")?,
                    completed_at: row.get("completed_at")?,
                    updated_at: row.get("updated_at")?,
                    reason: row.get("reason")?,
                    topic_id: row.get("topic_id")?,
                })
            }
        ).map_err(|e| e.to_string())?;
        
        tasks.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
    }
}
