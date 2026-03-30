# Nexus 项目文档

**最后更新**: 2026-03-30 | **版本**: 1.1

---

## 1. 产品定位

**Nexus** 是一个基于自然语言交互的个人效能中枢，通过 AI 大模型理解用户意图，帮助管理日程、生成复盘。

### 核心功能

| 功能 | 说明 | 状态 |
|------|------|------|
| 🤖 AI 意图解析 | DeepSeek API 智能理解任务 | ✅ 完成 |
| 📝 任务管理 | 创建、完成、优先级设置 | ✅ 完成 |
| 🏷️ 主题管理 | 任务分类、颜色标记 | ✅ 完成（未记录） |
| 🔍 全文搜索 | SQLite FTS5 支持 | ⏳ 待开始 |
| 📊 洞察报告 | 自动生成每日复盘 | ❌ 代码存在未连接 |
| 🪟 桌面浮窗 | 常驻 Widget 显示待办 | 🟡 显示完成，拖拽未实现 |
| 🖥️ 系统托盘 | 托盘菜单控制 | ✅ 完成 |
| 🪟 多窗口管理 | Omni-Bar/Widget 独立窗口 | ✅ 完成（未记录） |

### 技术栈

- **前端**: React + TypeScript + Tailwind CSS
- **后端**: Rust + Tauri
- **数据库**: SQLite
- **AI**: DeepSeek API

---

## 2. 系统架构

### 架构总览

```
┌─────────────────────────────────────────────────────────┐
│                    Nexus Desktop App                     │
├─────────────────────────────────────────────────────────┤
│  Frontend (React)                                        │
│  ├── Omni-Bar (全局输入框)                               │
│  ├── Widget (桌面浮窗)                                   │
│  └── TaskList (任务列表)                                 │
│                          │                               │
│                          │ Tauri IPC                     │
│                          ▼                               │
│  Backend (Rust)                                          │
│  ├── Window Manager (窗口管理)                           │
│  └── Task Service (任务服务)                             │
│                          │                               │
│                          ▼                               │
│  Data Layer                                              │
│  ├── SQLite (本地数据库)                                 │
│  └── DeepSeek API (AI 服务)                              │
└─────────────────────────────────────────────────────────┘
```

### 核心模块

#### 2.1 窗口管理系统

- **Omni-Bar**: 600×56px，屏幕居中，全局置顶
- **Widget**: 320×180px，可拖拽（待实现），屏幕边缘吸附
- **主窗口**: 900×700px，标准应用窗口

#### 2.2 数据库 Schema

```sql
-- 任务表
CREATE TABLE tasks (
    id TEXT PRIMARY KEY,
    content TEXT NOT NULL,
    extracted_datetime TEXT,
    entities TEXT,           -- JSON: 相关人员/地点
    priority INTEGER DEFAULT 0,  -- 0=low, 1=medium, 2=high
    status TEXT DEFAULT 'pending',
    topic_id TEXT,           -- 关联主题
    created_at TEXT NOT NULL,
    completed_at TEXT
);

-- 主题表
CREATE TABLE topics (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL,     -- 预设颜色: #3B82F6 等
    created_at TEXT NOT NULL
);

-- 用户设置表
CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT
);
```

#### 2.3 AI 集成

**意图解析流程**:
```
用户输入 → DeepSeek API → JSON 解析 → 冲突检测 → 创建任务
```

**核心 Prompt**:
```
你是一个日程助手。从用户输入中提取信息，返回 JSON：
{
  "datetime": "时间信息",
  "entities": ["相关人员", "地点"],
  "event": "事件描述",
  "confidence": 0-1 之间的置信度,
  "topic": "建议主题",
  "subtasks": ["子任务列表"]
}
```

**已实现功能**:
- ✅ 意图解析 + JSON 返回
- ✅ 冲突警告（检测同日任务）
- ✅ 子任务分解建议
- ✅ 置信度评估

---

## 3. 项目进度

### 总体进度：65%

| Phase | 内容 | 状态 | 完成度 |
|-------|------|------|--------|
| Phase 1 | 基础框架 | ✅ 完成 | 100% |
| Phase 2 | 数据层 | ✅ 完成 | 100% |
| Phase 3 | AI 集成 | ✅ 完成 | 95% |
| Phase 4 | UI 实现 | 🟡 进行中 | 80% |
| Phase 5 | 洞察引擎 | ⏳ 待连接 | 0% (代码存在) |
| Phase 6 | 打包发布 | ⏳ 待开始 | 0% |

### 已完成功能 ✅

- [x] Tauri + React + TypeScript 环境
- [x] 系统托盘集成（菜单 + 双击事件）
- [x] SQLite 数据库连接（tasks, topics, settings 表）
- [x] Task CRUD 接口（含冲突检测）
- [x] Topic 管理系统（分类、颜色标记）
- [x] Omni-Bar 和 Widget 基础组件
- [x] DeepSeek AI 意图解析（含冲突警告、子任务分解）
- [x] 多窗口管理（Omni-Bar、Widget、主窗口独立运行）
- [x] Tailwind CSS + Framer Motion 动画
- [x] Zustand 状态管理

### 进行中任务 🟡

- [ ] Widget 拖拽功能（仅有样式，无事件处理）
- [ ] Insight/Scheduler 服务连接（代码存在但未注册）

### 未连接功能 ⚠️

以下功能代码已编写但未接入系统：
- [ ] InsightService - 每日复盘生成（`insight_service.rs` 存在，未在 main.rs 注册）
- [ ] SchedulerService - 后台调度器（`scheduler.rs` 存在，未在 main.rs 启动）

### 下一步计划 ⏳

#### P0 - 紧急修复（立即）
- [ ] **Widget 拖拽**：添加鼠标事件处理 + 窗口定位逻辑
- [ ] **服务连接**：将 InsightService 和 Scheduler 注册到 main.rs

#### P1 - 短期优化（本周）
- [ ] 任务按时间排序显示（修改查询逻辑）
- [ ] 本地冲突检测（创建前检查同日任务）
- [ ] 冲突简单提示（暂不调用 AI）
- [ ] Insight 面板前端对接

#### P2 - 中期增强
- [ ] 传递今日任务给 AI（上下文感知解析）
- [ ] AI 生成替代时间建议
- [ ] 多视图切换（时间线/优先级/今日）
- [ ] 定时任务系统
- [ ] Markdown 导出

#### P3 - 长期规划
- [ ] 全文搜索 (FTS5)
- [ ] 重复任务支持（recurrence 规则）
- [ ] 用户习惯学习（主动建议）
- [ ] 生产打包

---

## 4. 开发指南

### 快速开始

```bash
# 安装依赖
npm install

# 开发模式
npm run tauri:dev

# 生产构建
npm run tauri:build
```

### 配置 AI

1. 打开应用设置页面
2. 输入 DeepSeek API Key
3. 保存

或使用环境变量:
```bash
export DEEPSEEK_API_KEY="your-api-key"
```

---

## 5. 技术债务

| 问题 | 优先级 | 解决方案 | 状态 |
|------|--------|----------|------|
| Widget 拖拽未实现 | 🔴 紧急 | 添加鼠标事件 + 窗口定位 | 待修复 |
| Insight/Scheduler 未连接 | 🔴 紧急 | 注册到 main.rs invoke_handler | 待修复 |
| 图标使用占位符 | 中 | 替换为真实图标 | 待处理 |
| 错误处理不完善 | 中 | 添加完整错误边界 | 待处理 |
| 缺少单元测试 | 中 | 添加关键功能测试 | 待处理 |
| console.log 调试代码 | 低 | 使用 tracing/proper logging | 待清理 |
| Widget 位置硬编码 | 低 | 从配置读取 | 待处理 |
| FTS5 全文搜索 | 低 | 实现搜索表和查询 | 待实现 |

---

## 6. 智能调度架构

### 设计原则
- **本地优先**: 冲突检测等逻辑在本地完成（快、省 Token）
- **AI 增强**: 语义理解、调度建议由 AI 处理（智能）
- **用户可控**: 最终决定权在用户

### 任务分类
- **任务主题**：分立不同的任务主题，可以选择也可以新建，将一类内容任务在一起建立，每次进行ai任务解析都将已有未完成的任务整理输入来判断合适的任务安排和一致性
- **时间窗口**：有一个窗口显示今天任务安排，每个任务后都带着任务主题的tag和颜色用于区分

### 任务流程
```
用户选择任务主题或者新建任务主体 → 用户输入 → AI 解析 → 建立该任务主题下的任务 → 冲突检测 → (如有冲突) AI 建议 → 用户确认 → 创建任务
```

### 排序策略
- **默认视图**: 按时间升序 (`ORDER BY extracted_datetime ASC`)
- **优先级视图**: 按优先级降序 + 时间升序
- **Widget**: 今日任务，时间排序，前 5 个

### 边界情况处理
| 情况 | 解决方案 |
|------|----------|
| 时间冲突 | AI 检测后推荐 2-3 个替代时间 |
| 模糊时间 ("改天") | AI 追问或设为"待定"状态 |
| AI 解析失败 | 降级：手动填写表单，置信度<0.7 时触发 |
| 任务过多 | 分页加载，只传最近 7 天任务给 AI |

---

## 7. 风险与问题

1. **API 依赖**: DeepSeek API 稳定性影响核心功能
   - 缓解：添加本地缓存和降级策略

2. **性能风险**: 多窗口同时运行可能影响性能
   - 缓解：优化渲染，减少重绘

3. **孤儿代码**: InsightService 和 SchedulerService 存在但未连接
   - 缓解：立即注册到 main.rs

---

## 8. 代码质量评估

### 优势 ✅
- **类型安全**: TypeScript 前端完整类型定义，Rust 后端 serde 序列化
- **状态管理**: Zustand stores 结构清晰，异步处理规范
- **错误处理**: Rust 使用 `Result<T, String>` 模式，前端有 try-catch
- **代码组织**: 前端 components/stores/hooks 分层，后端 commands/services/models 分层
- **UI 美观**: Glass morphism 主题，Framer Motion 动画，响应式布局

### 待改进 ⚠️
- **无测试**: 前后端均无测试文件
- **日志混乱**: 大量 `println!` 和 `console.log`，应使用 tracing
- **硬编码值**: Widget 位置 `(1000.0, 600.0)` 等应配置化
- **孤儿代码**: 未连接的服务文件应删除或接入

---

*本文档由 Oracle 分析验证，基于实际代码而非计划文档*

*历史版本合并: ProjectGuide、ARCHITECTURE、IMPLEMENTATION_PLAN、PROJECT_PROGRESS*
