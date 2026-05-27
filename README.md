# Pocket Rec.709

[![CI](https://github.com/taliove/pocket-rec709/actions/workflows/ci.yml/badge.svg)](https://github.com/taliove/pocket-rec709/actions/workflows/ci.yml)
[![Release](https://github.com/taliove/pocket-rec709/actions/workflows/release.yml/badge.svg)](https://github.com/taliove/pocket-rec709/actions/workflows/release.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

一个极简的跨平台桌面应用，把 DJI OSMO Pocket 4 拍摄的 D-Log 视频批量转换为 Rec.709 标准色彩空间。

A tiny, drag-and-drop batch converter that applies the official DJI Pocket 4 D-Log → Rec.709 LUT to your videos via system FFmpeg.

- 拖拽即用，批量转换 / Drag-and-drop batch conversion
- macOS 原生外观，自动适配 Light/Dark / Native macOS look, auto Light/Dark
- 支持 H.264 / H.265 / ProRes 三种输出 / H.264 / H.265 / ProRes output
- 内置 DJI Pocket 4 D-Log → Rec.709 LUT
- 多语言：跟随系统 / English / 简体中文 / 繁體中文 / 日本語 / 한국어

## 下载 / Download

从 [Releases 页面](https://github.com/taliove/pocket-rec709/releases) 下载最新版本：

| Platform | File |
|----------|------|
| macOS (Apple Silicon) | `*_aarch64.dmg` |
| macOS (Intel) | `*_x64.dmg` |
| Windows | `*_x64-setup.exe` 或 `*_x64_en-US.msi` |
| Linux | `*_amd64.AppImage` 或 `*_amd64.deb` |

## 前置要求 / Prerequisite

应用本体仅 ~12MB，视频处理依赖系统已安装的 FFmpeg：

```bash
# macOS
brew install ffmpeg

# Windows
winget install ffmpeg

# Linux (Debian/Ubuntu)
sudo apt install ffmpeg
```

## 用法 / Usage

1. 启动 Pocket Rec.709
2. 把一个或多个 D-Log 视频文件拖入窗口（支持 MP4 / MOV / MKV / MXF / M4V / MTS / M2TS）
3. 在底部选择输出编码：
   - **H.264**（默认）— 兼容性最好、编码最快
   - **H.265** — 文件更小、画质更优，编码稍慢
   - **ProRes 422 HQ** — 后期友好的专业格式
4. 用 Quality 滑块调整 CRF（数值越小画质越好，文件越大）
5. 点击 **Convert N files** 开始
6. 输出文件保存在源文件同目录，文件名追加 `_rec709` 后缀

转换中可点击 **Cancel** 中止，半成品文件会自动清理。完成后悬停文件行可点击 **Reveal** 在 Finder/资源管理器中定位输出。

## 开发 / Development

```bash
npm install
npm run tauri dev      # 启动开发模式
npm run tauri build    # 打包发布版本
```

构建产物位于 `src-tauri/target/release/bundle/`。

## 发布流程 / Release Process

1. 更新 `package.json` 和 `src-tauri/tauri.conf.json` 的 `version` 字段
2. 提交更改 `git commit -am "chore: bump version to 1.x.x"`
3. 打 tag 并推送：

```bash
git tag v1.x.x
git push origin v1.x.x
```

GitHub Actions 会自动：
- 构建 macOS (ARM + Intel)、Windows、Linux 四个平台的安装包
- 创建 GitHub Release 草稿并上传所有产物
- 全部成功后自动发布

也可以在 Actions 页面手动触发 `Release` workflow，输入 tag 名运行。

## 技术栈 / Tech Stack

- 前端：React 19 + TypeScript + Tailwind CSS + Vite
- 后端：Tauri 2 (Rust)
- 视频引擎：系统 FFmpeg（应用本体仅 ~12MB）
- LUT：内置 33×33×33 3D CUBE 文件作为资源

## License

MIT © [taliove](https://github.com/taliove)
