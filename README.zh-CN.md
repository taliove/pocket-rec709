<div align="center">

# Pocket Rec.709

**DJI D-Log 视频拖拽式批量转换工具**
**调用系统 FFmpeg 应用官方 Rec.709 LUT 的极简跨平台桌面应用**

[![License](https://img.shields.io/github/license/taliove/pocket-rec709?color=blue&style=flat-square)](LICENSE)
[![Release](https://img.shields.io/github/v/release/taliove/pocket-rec709?display_name=tag&style=flat-square&color=success)](https://github.com/taliove/pocket-rec709/releases/latest)
[![Downloads](https://img.shields.io/github/downloads/taliove/pocket-rec709/total?style=flat-square&color=orange)](https://github.com/taliove/pocket-rec709/releases)
[![Stars](https://img.shields.io/github/stars/taliove/pocket-rec709?style=flat-square&color=yellow)](https://github.com/taliove/pocket-rec709/stargazers)
[![Issues](https://img.shields.io/github/issues/taliove/pocket-rec709?style=flat-square)](https://github.com/taliove/pocket-rec709/issues)

[![CI](https://img.shields.io/github/actions/workflow/status/taliove/pocket-rec709/ci.yml?branch=main&label=CI&style=flat-square&logo=github)](https://github.com/taliove/pocket-rec709/actions/workflows/ci.yml)
[![Release Build](https://img.shields.io/github/actions/workflow/status/taliove/pocket-rec709/release.yml?label=release&style=flat-square&logo=github)](https://github.com/taliove/pocket-rec709/actions/workflows/release.yml)

[![Tauri](https://img.shields.io/badge/Tauri-2-24C8DB?style=flat-square&logo=tauri&logoColor=white)](https://tauri.app)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Rust](https://img.shields.io/badge/Rust-stable-CE412B?style=flat-square&logo=rust&logoColor=white)](https://www.rust-lang.org)

[![macOS](https://img.shields.io/badge/macOS-Apple_Silicon_+_Intel-000?style=flat-square&logo=apple&logoColor=white)](https://github.com/taliove/pocket-rec709/releases)
[![Windows](https://img.shields.io/badge/Windows-x64-0078D6?style=flat-square&logo=windows&logoColor=white)](https://github.com/taliove/pocket-rec709/releases)
[![Linux](https://img.shields.io/badge/Linux-x64-FCC624?style=flat-square&logo=linux&logoColor=black)](https://github.com/taliove/pocket-rec709/releases)

[English](README.md) · **简体中文**

</div>

---

## ✨ 特性

- 🎬 **拖拽即用，批量转换** — 把多个 D-Log 视频拖进窗口，点开始转换，剩下交给它
- 🍎 **macOS 原生外观** — 自动适配 Light/Dark，原生标题栏
- 🎨 **三种输出编码** — H.264 / H.265 / ProRes 422 HQ，配 CRF 质量滑块
- 📦 **极小体积** — 应用本体仅 ~12MB，借用系统 FFmpeg 完成编码
- 🌍 **6 种语言** — 自动检测 + 手动切换：English / 简体中文 / 繁體中文 / 日本語 / 한국어
- 🎞️ **内置官方 LUT** — DJI Pocket 4 D-Log → Rec.709（33×33×33 3D CUBE）

## 📥 下载

从 [Releases 页面](https://github.com/taliove/pocket-rec709/releases/latest)选择你的平台：

| 平台 | 文件 |
|------|------|
| macOS (Apple Silicon) | `*_aarch64.dmg` |
| macOS (Intel) | `*_x64.dmg` |
| Windows | `*_x64-setup.exe` 或 `*_x64_en-US.msi` |
| Linux | `*_amd64.AppImage` 或 `*_amd64.deb` |

## 🛠 前置要求

请先安装 FFmpeg：

```bash
# macOS
brew install ffmpeg

# Windows
winget install ffmpeg

# Linux (Debian/Ubuntu)
sudo apt install ffmpeg
```

## 🚀 用法

1. 启动 **Pocket Rec.709**
2. 把一个或多个 D-Log 视频文件拖入窗口（支持 MP4 / MOV / MKV / MXF / M4V / MTS / M2TS）
3. 在底部选择输出编码：
   - **H.264**（默认）— 兼容性最好、编码最快
   - **H.265** — 文件更小、画质更优，编码稍慢
   - **ProRes 422 HQ** — 后期友好的专业格式
4. 用 Quality 滑块调整 CRF（数值越小画质越好，文件越大）
5. 点击 **Convert N files** 开始
6. 输出文件保存在源文件同目录，文件名追加 `_rec709` 后缀

转换中可点击 **Cancel** 中止，半成品文件会自动清理。完成后悬停文件行可点击 **Reveal** 在 Finder / 资源管理器中定位输出。

## 💻 开发

```bash
npm install
npm run tauri dev      # 启动开发模式
npm run tauri build    # 打包发布版本
```

构建产物位于 `src-tauri/target/release/bundle/`。

## 📦 发布流程

1. 更新版本号：`package.json` / `src-tauri/tauri.conf.json` / `src-tauri/Cargo.toml`
2. 提交并打 tag：

```bash
git commit -am "chore: bump version to 1.x.x"
git tag v1.x.x
git push origin main --tags
```

GitHub Actions 将自动：

- 并行构建 **macOS (ARM + Intel)**、**Windows x64**、**Linux x64** 安装包
- 创建 Release 草稿并上传所有产物
- 全部成功后自动转为正式发布

你也可以在 **Actions → Release → Run workflow** 手动触发。

## 🧱 技术栈

- **前端**：React 19 + TypeScript + Tailwind CSS + Vite
- **后端**：Tauri 2 (Rust)
- **视频引擎**：系统 FFmpeg（应用本体仅 ~12MB）
- **LUT**：内置 33×33×33 3D CUBE 文件作为资源

## 📄 License

[MIT](LICENSE) © [taliove](https://github.com/taliove)
