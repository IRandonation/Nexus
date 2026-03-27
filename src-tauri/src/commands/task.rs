use tauri::{command, State};
use crate::models::task::Task;
use crate::services::task_service::TaskService;
use crate::services::ai_service::AIService;

#[command]
pub async fn create_task(
    content: String,
    extracted_datetime: Option<String>,
    extracted_entities: Option<Vec<String>>,
    event: Option<String>,
    topic_id: Option<String>,
    task_service: State<'_, TaskService>,
) -> Result<Task, String> {
    println!("[Command] create_task received: content='{}', event='{:?}', topic_id='{:?}'", 
        content, event, topic_id);
    task_service.create_task(content, extracted_datetime, extracted_entities, event, topic_id)
}

#[command]
pub fn get_tasks(
    task_service: State<'_, TaskService>,
) -> Result<Vec<Task>, String> {
    task_service.get_tasks()
}

#[command]
pub fn get_tasks_by_topic(
    topic_id: String,
    task_service: State<'_, TaskService>,
) -> Result<Vec<Task>, String> {
    task_service.get_tasks_by_topic(&topic_id)
}

#[command]
pub fn get_conflicting_tasks(
    datetime: String,
    duration_minutes: i32,
    task_service: State<'_, TaskService>,
) -> Result<Vec<Task>, String> {
    task_service.get_conflicting_tasks(&datetime, duration_minutes)
}

#[command]
pub fn complete_task(
    id: String,
    reason: Option<String>,
    task_service: State<'_, TaskService>,
) -> Result<(), String> {
    task_service.complete_task(&id, reason)
}

#[command]
pub async fn parse_intent(
    input: String,
    topic_id: Option<String>,
    task_service: State<'_, TaskService>,
    ai_service: State<'_, AIService>,
) -> Result<crate::services::ai_service::ParsedIntent, String> {
    let topic_tasks = if let Some(tid) = &topic_id {
        task_service.get_tasks_by_topic(tid)?
    } else {
        vec![]
    };
    ai_service.parse_intent(&input, topic_tasks).await
}

#[command]
pub fn update_task(
    task: Task,
    task_service: State<'_, TaskService>,
) -> Result<(), String> {
    task_service.update_task(task)
}

#[command]
pub fn delete_task(
    id: String,
    task_service: State<'_, TaskService>,
) -> Result<(), String> {
    task_service.delete_task(&id)
}
