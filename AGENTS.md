# Repository Guidelines for AI Agents

本文档为 AI 编码助手在本仓库工作时提供约定与上下文。

## 项目概览

`D-Log Converter` 是一个 Tauri 2 + React 19 跨平台桌面应用，用于把 DJI Pocket 4 D-Log 视频批量转换为 Rec.709。视频处理通过调用系统 FFmpeg 实现，应用本体保持极小体积（~12MB）。

## 目录结构

```
.
├── src/                       # React 前端
│   ├── App.tsx
│   ├── components/            # UI 组件
│   ├── hooks/                 # React hooks (useConversion, useI18n)
│   ├── lib/                   # 类型、commands wrapper、i18n
│   └── styles/globals.css
├── src-tauri/                 # Rust 后端
│   ├── src/
│   │   ├── lib.rs             # Tauri 入口
│   │   ├── commands.rs        # 暴露给前端的命令
│   │   ├── ffmpeg.rs          # FFmpeg 进程管理
│   │   └── progress.rs        # 进度解析
│   ├── resources/             # 内置 LUT 文件
│   ├── icons/                 # 应用图标
│   ├── capabilities/
│   ├── Cargo.toml
│   └── tauri.conf.json
├── package.json
├── tailwind.config.ts
├── vite.config.ts
└── tsconfig.json
```

## 常用命令

```bash
# 开发
npm install
npm run tauri dev         # 启动开发模式
npm run dev               # 仅启动前端 Vite 开发服务器

# 构建
npm run build             # 打包前端
npm run tauri build       # 打包桌面应用（dmg / msi / AppImage）

# 检查
npx tsc --noEmit          # 前端类型检查
cd src-tauri && cargo check   # Rust 编译检查
```

修改完后请至少运行：

```bash
npx tsc --noEmit && cd src-tauri && cargo check
```

## 编码约定

### 通用
- 不要主动添加 `*.md` 文档或注释，除非明确需要
- 不要为想象中的边界情况添加防御代码；在系统边界（用户输入、外部 API）做校验即可
- 修改最小化：bug 修复不要顺便重构周边代码
- 仅在用户明确要求时才创建新文件，优先编辑已有文件

### TypeScript / React
- 使用函数组件 + hooks
- 状态管理用 `useReducer` / `useState`，无需 Zustand 或 Redux
- 国际化：所有用户可见字符串通过 `useI18n()` hook 获取，禁止硬编码
- 样式：仅使用 Tailwind CSS 工具类 + 全局 CSS 变量；颜色用设计令牌（`macblue` / `success` / `warning` / `danger`）
- 设计令牌见 `tailwind.config.ts`：
  - 圆角：`rounded-window` (24) / `rounded-card` (18) / `rounded-btn` (12)
  - 动效：`duration-hover` (120ms) / `duration-layout` (220ms)，缓动 `ease-macos`
  - 阴影：`shadow-soft` / `shadow-glow`
- 拖拽窗口：使用 macOS 原生标题栏（`tauri.conf.json` 已配置 decorations + 不设 titleBarStyle），不要在 React 端再加 `data-tauri-drag-region`

### Rust / Tauri
- 后端命令统一在 `src-tauri/src/commands.rs` 注册
- FFmpeg 调用通过 `tokio::process::Command`，stdout 用 `-progress pipe:1` 解析进度
- 错误返回 `Result<T, String>`，前端用 invoke 抓 reject
- 不要内置 FFmpeg 二进制，保持调用系统已安装版本

### i18n
- 字符串字典在 `src/lib/i18n.ts`
- 添加新文案时，必须同时更新 5 种语言：`en` / `zhCN` / `zhTW` / `ja` / `ko`
- 用户语言偏好持久化在 `localStorage`，key 为 `dlog.locale`
- 默认 "auto" 跟随系统（`navigator.language`）

## 设计语言

参考 macOS 原生风格：
- 视觉关键词：Glassmorphism / Native macOS / Calm / Precision / Cinematic
- 配色：以 `#0A84FF` 为强调色，浅色背景 `#F5F5F7`，深色背景 `#1C1C1E`
- 不要重阴影、不要花哨动效；保持轻盈克制
- 字体：系统字体栈（`-apple-system, BlinkMacSystemFont, "SF Pro Display", ...`）
- 必须支持 Light/Dark 双模式（通过 `prefers-color-scheme`）

## 提交约定

- 仅在用户明确要求时才执行 `git commit`
- 提交信息使用英文或中文皆可，描述 "为什么" 而非 "改了什么"
- 不要提交 `.env` 或包含密钥的文件
- 不要主动 push 到远端

## 安全注意事项

- 不要写入用户系统其他位置；输出文件固定写在源视频同目录
- 处理用户传入的路径前避免命令注入（已通过 `tokio::process::Command` 的参数化调用规避）
- 转换被取消时，必须清理半成品输出文件
