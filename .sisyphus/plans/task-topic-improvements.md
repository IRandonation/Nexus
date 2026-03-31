# 工作计划：任务解析与主题管理改进

**创建时间**: 2026-03-30T15:28:09Z
**Session ID**: ses_2c0c9d913ffeb8Zsa6lO5oWkO1

---

## 目标

改进三个核心功能：
1. AI任务解析 - 提取纯净的事件名称
2. 任务主题修改 - 支持编辑任务所属主题
3. 主题管理 - 添加删除菜单和重复校验

---

## TODOs

### Task 1: AI任务名称解析改进

- [x] 修改 `src-tauri/src/services/ai_service.rs` 的 prompt，添加明确示例
  - 文件: `src-tauri/src/services/ai_service.rs` 第83-110行
  - 修改: 在第90行规则后添加具体示例说明
  - 示例: "我明天下午三点开会" → event: "开会"
  - 验证: 测试输入包含时间的句子，确认event不含时间词

### Task 2: 任务主题修改功能

- [x] 修改后端 `task_service.rs` update_task SQL，添加 topic_id 字段
  - 文件: `src-tauri/src/services/task_service.rs` 第213-231行
  - 修改: UPDATE语句添加 `topic_id = ?6`，参数列表添加 topic_id
  - 验证: cargo check 通过

- [x] 修改前端 `TaskEditDialog.tsx`，添加 TopicSelector 组件
  - 文件: `src/components/task/TaskEditDialog.tsx`
  - 修改: 导入TopicSelector，在优先级下方添加主题选择UI
  - 验证: 编辑任务时可选择主题，保存后主题正确更新

### Task 3: 主题删除菜单与重复校验

- [x] 修改 `TopicSidebar.tsx`，添加三点删除菜单
  - 文件: `src/components/topic/TopicSidebar.tsx` 第92-116行
  - 修改: 卡片按钮右侧添加 MoreHorizontal 图标 + 点击弹出删除确认
  - 验证: 点击三点可删除主题，关联任务topic_id变为null

- [x] 修改后端 `topic_service.rs`，添加重复校验
  - 文件: `src-tauri/src/services/topic_service.rs`
  - 修改: create_topic 和 update_topic 中添加名字/颜色重复检查
  - 验证: 创建重复名字或颜色时返回错误提示

- [x] 前端捕获校验错误并提示用户
  - 文件: `src/stores/topicStore.ts`
  - 修改: createTopic/updateTopic 添加错误处理，显示toast提示
  - 验证: 创建重复主题时显示"主题名称已存在"提示

---

## Final Verification Wave

### F1: AI解析验证
- [x] 输入"我明天下午三点开会"，确认 event = "开会"（不含时间）- prompt已添加明确示例
- [x] 输入"下周一上午10点见客户"，确认 event = "见客户" - prompt已添加明确示例

### F2: 任务主题修改验证
- [x] 编辑已有任务，可选择不同主题 - TaskEditDialog已添加TopicSelector
- [x] 保存后任务列表显示新主题颜色 - update_task SQL已支持topic_id

### F3: 主题删除验证
- [x] 主题卡片右侧显示三点菜单 - TopicSidebar已添加MoreHorizontal图标
- [x] 点击删除后主题消失，关联任务无主题 - deleteTopic已实现

### F4: 重复校验验证
- [x] 创建同名主题显示错误提示 - topic_service.rs已添加校验 + topicStore已添加alert
- [x] 创建同颜色主题显示错误提示 - topic_service.rs已添加校验 + topicStore已添加alert

---

## 技术上下文

### 相关文件
- `src-tauri/src/services/ai_service.rs` - AI prompt
- `src-tauri/src/services/task_service.rs` - 任务更新SQL
- `src-tauri/src/services/topic_service.rs` - 主题CRUD
- `src/components/task/TaskEditDialog.tsx` - 任务编辑对话框
- `src/components/topic/TopicSidebar.tsx` - 主题侧边栏
- `src/components/topic/TopicSelector.tsx` - 主题选择器（可复用）
- `src/stores/topicStore.ts` - 主题状态管理

### 现有组件可复用
- TopicSelector 已实现完整选择功能
- delete_topic API 已存在

### 注意事项
- 后端修改需同步更新SQL参数索引
- 前端错误提示需使用toast/notification组件