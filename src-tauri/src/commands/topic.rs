use crate::models::topic::{CreateTopicPayload, Topic, UpdateTopicPayload};
use crate::services::topic_service::TopicService;
use tauri::{command, State};

#[command]
pub fn create_topic(
    payload: CreateTopicPayload,
    topic_service: State<'_, TopicService>,
) -> Result<Topic, String> {
    topic_service.create_topic(payload)
}

#[command]
pub fn get_topics(topic_service: State<'_, TopicService>) -> Result<Vec<Topic>, String> {
    topic_service.get_topics()
}

#[command]
pub fn update_topic(
    payload: UpdateTopicPayload,
    topic_service: State<'_, TopicService>,
) -> Result<Topic, String> {
    topic_service.update_topic(payload)
}

#[command]
pub fn delete_topic(id: String, topic_service: State<'_, TopicService>) -> Result<(), String> {
    topic_service.delete_topic(&id)
}

#[command]
pub fn get_preset_colors() -> Vec<String> {
    TopicService::get_preset_colors()
}
