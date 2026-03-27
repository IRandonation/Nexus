use tokio::time::{self, Duration};
use chrono::{Local, Timelike};
use std::sync::Arc;
use crate::services::task_service::TaskService;
use crate::services::ai_service::AIService;
use crate::services::insight_service::InsightService;
use crate::db::Database;

pub struct SchedulerService {
    task_service: Arc<TaskService>,
    ai_service: Arc<AIService>,
    db: Arc<Database>,
}

impl SchedulerService {
    pub fn new(
        task_service: Arc<TaskService>,
        ai_service: Arc<AIService>,
        db: Arc<Database>,
    ) -> Self {
        Self {
            task_service,
            ai_service,
            db,
        }
    }
    
    pub async fn start(&self) {
        let mut interval = time::interval(Duration::from_secs(60));
        
        loop {
            interval.tick().await;
            self.check_scheduled_tasks().await;
            self.check_daily_insight().await;
        }
    }
    
    async fn check_scheduled_tasks(&self) {
        let tasks = self.task_service.get_upcoming_tasks(30).await.unwrap_or_default();
        for task in tasks {
            self.send_notification(&format!("任务提醒：{}", task.content)).await;
        }
    }
    
    async fn check_daily_insight(&self) {
        let now = Local::now();
        if now.hour() == 21 && now.minute() == 0 {
            let insight_service = InsightService::new(
                Arc::clone(&self.db),
                Arc::clone(&self.ai_service),
            );
            
            let today = now.date_naive();
            match insight_service.generate_daily_insight(today).await {
                Ok(_) => {
                    self.send_notification("今日复盘已生成").await;
                }
                Err(e) => {
                    eprintln!("Failed to generate insight: {}", e);
                }
            }
        }
    }
    
    async fn send_notification(&self, message: &str) {
        use tauri::api::notification::Notification;
        
        Notification::new("com.nexus.app")
            .title("Nexus")
            .body(message)
            .show()
            .ok();
    }
}
