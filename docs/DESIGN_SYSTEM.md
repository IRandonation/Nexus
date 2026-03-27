# Nexus 设计系统

**风格**: Frosted Minimalism（磨砂极简主义）

---

## 1. 色彩系统

### 深色主题（默认）

```css
/* 背景层次 */
--bg-primary: #0a0a0f;        /* 最深背景 */
--bg-secondary: #12121a;      /* 卡片背景 */
--bg-glass: rgba(18, 18, 26, 0.72);  /* 玻璃效果 */

/* 强调色 */
--accent-primary: #6366f1;    /* 主品牌色 */
--accent-secondary: #8b5cf6;  /* 辅助色 */
--accent-tertiary: #06b6d4;   /* 高亮色 */

/* 语义色 */
--success: #10b981;
--warning: #f59e0b;
--error: #ef4444;

/* 文字 */
--text-primary: #f8fafc;
--text-secondary: #94a3b8;
--text-tertiary: #64748b;

/* 玻璃效果 */
--glass-border: rgba(255, 255, 255, 0.08);
--glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
--glass-blur: 20px;
```

### 渐变

```css
--gradient-brand: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
--glow-primary: 0 0 20px rgba(99, 102, 241, 0.4);
```

---

## 2. 字体系统

```css
--font-primary: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: "JetBrains Mono", "Fira Code", monospace;
```

| 层级 | 大小 | 字重 | 用途 |
|------|------|------|------|
| Hero | 32px | 700 | Widget 计数 |
| H1 | 24px | 600 | 模态框标题 |
| H2 | 20px | 600 | 章节标题 |
| Body | 14px | 400 | 正文内容 |
| Small | 12px | 400 | 元数据 |

---

## 3. 间距系统

**基础单位**: 4px

```css
--space-1: 4px;   --space-2: 8px;   --space-3: 12px;
--space-4: 16px;  --space-5: 20px;  --space-6: 24px;
--space-8: 32px;  --space-10: 40px; --space-12: 48px;
```

---

## 4. 核心组件

### 4.1 Omni-Bar

**尺寸**: 600×56px

```css
.omni-bar {
  background: var(--bg-glass);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  box-shadow: var(--glass-shadow);
  padding: 0 20px;
}
```

**状态**:
- Default: 半透明背景
- Focus: 品牌色边框 + 发光

### 4.2 Task Card

```css
.task-card {
  background: var(--bg-glass);
  backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  padding: 12px 16px;
}

/* 优先级标识 */
.priority-high { border-left: 3px solid var(--error); }
.priority-medium { border-left: 3px solid var(--warning); }
.priority-low { border-left: 3px solid var(--success); }
```

### 4.3 Widget

**尺寸**: 320×180px

```css
.widget {
  background: var(--bg-glass);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  box-shadow: var(--glass-shadow);
  padding: 16px;
}
```

### 4.4 按钮

```css
/* 主按钮 */
.btn-primary {
  background: var(--gradient-brand);
  color: white;
  border-radius: 10px;
  padding: 10px 16px;
}

.btn-primary:hover {
  box-shadow: var(--glow-primary);
}

/* 次要按钮 */
.btn-secondary {
  background: var(--bg-glass);
  border: 1px solid var(--glass-border);
}
```

---

## 5. 动画系统

### 持续时间

```css
--duration-fast: 150ms;
--duration-normal: 200ms;
--duration-slow: 300ms;
```

### 缓动函数

```css
--ease-out: cubic-bezier(0.0, 0, 0.2, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
```

### 关键动画

```css
/* Omni-Bar 入场 */
@keyframes omniEnter {
  0% { opacity: 0; transform: translateY(-20px) scale(0.95); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

/* Widget 滑入 */
@keyframes widgetSlideIn {
  0% { opacity: 0; transform: translateX(20px); }
  100% { opacity: 1; transform: translateX(0); }
}
```

---

## 6. 图标系统

**库**: Lucide Icons

| 用途 | 图标 | 尺寸 |
|------|------|------|
| 搜索 | Search | 20px |
| 添加 | Plus | 20px |
| 时间 | Clock | 16px |
| 完成 | Check | 16px |
| AI | Sparkles | 16px |

---

## 7. Tailwind 配置

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        glass: 'rgba(18, 18, 26, 0.72)',
        'glass-border': 'rgba(255, 255, 255, 0.08)',
        accent: {
          DEFAULT: '#6366f1',
          secondary: '#8b5cf6',
        }
      },
      backdropBlur: { glass: '20px' },
      boxShadow: {
        glass: '0 8px 32px rgba(0, 0, 0, 0.4)',
        glow: '0 0 20px rgba(99, 102, 241, 0.4)',
      }
    }
  }
}
```

---

*Design System v1.0 | 精简自原版 19KB → 5KB*
