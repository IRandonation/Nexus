use serde::{Deserialize, Serialize};

pub const PRESET_COLORS: &[&str] = &[
    "#EF4444", "#F97316", "#EAB308", "#22C55E", "#14B8A6", "#3B82F6", "#8B5CF6", "#EC4899",
    "#6B7280",
];

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Topic {
    pub id: String,
    pub name: String,
    pub color: String,
    pub created_at: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateTopicPayload {
    pub name: String,
    pub color: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateTopicPayload {
    pub id: String,
    pub name: Option<String>,
    pub color: Option<String>,
}
