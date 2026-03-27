# Nexus

AI驱动的智能日程与回顾助手

## 功能特性

- 🎯 **全局热键**: Alt+N 快速唤醒输入框
- 🤖 **AI 意图解析**: DeepSeek API 智能理解任务
- 📝 **任务管理**: 创建、完成、优先级设置
- 🔍 **全文搜索**: SQLite FTS5 支持
- 📊 **洞察报告**: 自动生成每日复盘
- 🪟 **桌面浮窗**: 常驻 Widget 显示待办
- 🎨 **磨砂玻璃 UI**: 现代设计语言

## 技术栈

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Rust + Tauri
- **Database**: SQLite
- **AI**: DeepSeek API

## 开发

```bash
# 安装依赖
npm install

# 运行开发服务器
npm run tauri:dev

# 构建生产版本
npm run tauri:build
```

## 配置

设置 DeepSeek API Key:
1. 打开应用设置
2. 输入 API Key
3. 保存

或使用环境变量:
```bash
export DEEPSEEK_API_KEY="your-api-key"
```

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| Alt+N | 显示/隐藏 Omni-Bar |
| Alt+Shift+N | 显示/隐藏 Widget |

## 目录结构

```
nexus/
├── src/              # React 前端代码
├── src-tauri/        # Rust 后端代码
├── docs/             # 文档中心
│   ├── PROJECT.md    # 项目全景（产品 + 架构 + 进度）
│   └── DESIGN_SYSTEM.md  # UI/UX 设计规范
└── public/           # 静态资源
```

## 📚 文档

| 文档 | 说明 |
|------|------|
| [项目全景](./docs/PROJECT.md) | 产品定位 + 系统架构 + 开发进度 |
| [设计规范](./docs/DESIGN_SYSTEM.md) | UI/UX 设计系统（色彩、组件、动画） |

## 许可证

MIT
