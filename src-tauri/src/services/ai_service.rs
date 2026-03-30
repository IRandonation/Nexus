use reqwest::Client;
use serde::{Deserialize, Serialize};
use crate::models::task::Task;

const DEEPSEEK_API_URL: &str = "https://api.deepseek.com/v1/chat/completions";

#[derive(Serialize)]
struct DeepSeekRequest {
    model: String,
    messages: Vec<Message>,
    response_format: ResponseFormat,
    temperature: f32,
}

#[derive(Serialize)]
struct Message {
    role: String,
    content: String,
}

#[derive(Serialize)]
struct ResponseFormat {
    #[serde(rename = "type")]
    type_: String,
}

#[derive(Deserialize)]
struct DeepSeekResponse {
    choices: Vec<Choice>,
}

#[derive(Deserialize)]
struct Choice {
    message: MessageContent,
}

#[derive(Deserialize)]
struct MessageContent {
    content: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ParsedIntent {
    pub datetime: String,
    pub entities: Vec<String>,
    pub event: String,
    pub confidence: f32,
    pub subtasks: Option<Vec<String>>,
    #[serde(default)]
    pub conflict_warning: Option<String>,
}

pub struct AIService {
    client: Client,
    api_key: String,
}

impl AIService {
    pub fn new(api_key: String) -> Self {
        Self {
            client: Client::new(),
            api_key,
        }
    }
    
    pub async fn parse_intent(&self, input: &str, topic_tasks: Vec<Task>) -> Result<ParsedIntent, String> {
        let context = if topic_tasks.is_empty() {
            String::new()
        } else {
            let tasks_info: Vec<String> = topic_tasks.iter().map(|t| {
                format!(
                    "- {} (时间: {})",
                    t.event.as_deref().unwrap_or(&t.content),
                    t.extracted_datetime.as_deref().unwrap_or("未设置")
                )
            }).collect();
            format!(
                "\n\n当前主题下已有任务：\n{}\n\n请考虑与现有任务的一致性，如时间冲突请在 subtasks 中说明。",
                tasks_info.join("\n")
            )
        };

        let prompt = format!(
            r#"你是一个任务助手。请分析用户的任务描述，提取关键信息并以 JSON 格式返回。{}

重要规则：
1. 以用户输入为准，不要过度解读或添加不存在的信息
2. datetime 必须转换为 ISO 8601 格式的具体日期时间（如 2024-01-15T15:00:00），根据当前时间推算"明天"、"下周"等相对时间
3. 如果信息不明确，使用空值或默认值，不要猜测
4. event 只提取事件本身，不包含时间、人称等修饰词
   - 例如："我明天下午三点开会" → event: "开会"
   - 例如："下周一上午10点见客户" → event: "见客户"
   - 例如："周五晚上和李明看电影" → event: "看电影"
   时间信息单独放在 datetime 字段，人称/地点放在 entities 字段
5. 只在任务明确需要多个步骤时才生成 subtasks
6. 如果新任务与现有任务存在时间冲突，在 conflict_warning 中说明

当前时间参考：{}

JSON 格式：
{{
  "datetime": "转换为 ISO 8601 格式的具体日期时间（如 2024-01-15T15:00:00），如无法确定具体时间则为空字符串",
  "entities": ["提取的相关人员、地点等实体，如未提及则为空数组"],
  "event": "事件本身（不含时间/人称），如"开会"、"见客户"",
  "confidence": 0-1 之间的置信度（根据信息明确程度）",
  "subtasks": ["只有当任务明显可分步执行时才列出子任务，否则为空数组"],
  "conflict_warning": "如果与现有任务时间冲突，说明冲突情况；无冲突则为空字符串"
}}

用户输入: "{}""#,
            context,
            chrono::Local::now().format("%Y-%m-%d %H:%M:%S"),
            input
        );
        
        self.call_deepseek(&prompt, true).await
    }
    
    pub async fn generate_summary(&self, prompt: &str) -> Result<String, String> {
        let response = self.call_deepseek::<serde_json::Value>(prompt, false).await?;
        Ok(response.to_string())
    }
    
    async fn call_deepseek<T: serde::de::DeserializeOwned>(
        &self,
        prompt: &str,
        json_mode: bool,
    ) -> Result<T, String> {
        let request = DeepSeekRequest {
            model: "deepseek-chat".to_string(),
            messages: vec![Message {
                role: "user".to_string(),
                content: prompt.to_string(),
            }],
            response_format: ResponseFormat {
                type_: if json_mode { "json_object".to_string() } else { "text".to_string() },
            },
            temperature: 0.3,
        };
        
        let response = self.client
            .post(DEEPSEEK_API_URL)
            .header("Authorization", format!("Bearer {}", self.api_key))
            .header("Content-Type", "application/json")
            .json(&request)
            .send()
            .await
            .map_err(|e| e.to_string())?;
        
        let result: DeepSeekResponse = response.json().await.map_err(|e| e.to_string())?;
        
        if let Some(choice) = result.choices.first() {
            if json_mode {
                serde_json::from_str(&choice.message.content).map_err(|e| e.to_string())
            } else {
                serde_json::from_str(&format!("\"{}\"", choice.message.content.replace("\"", "\\\"")))
                    .map_err(|e| e.to_string())
            }
        } else {
            Err("No response from AI".to_string())
        }
    }
}
