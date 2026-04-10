# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

基于 Tauri + Claude Vision API 的微信智能自动回复桌面应用。使用屏幕截图 + OCR + 键盘模拟实现自动化回复。

## 技术栈

- **桌面框架**: Tauri 2.0 (Rust + React)
- **前端**: React 18 + TypeScript + Vite
- **后端**: Rust
- **AI**: Claude Vision API (图像理解和生成)
- **键盘模拟**: enigo crate

## 核心模块

### Rust 后端 (src-tauri/src/)

| 文件 | 职责 |
|------|------|
| `main.rs` | Tauri 入口、命令注册 |
| `capture.rs` | 屏幕区域截图 (screenshots crate) |
| `claude.rs` | Claude Vision API 调用 |
| `keyboard.rs` | 键盘模拟输入 (enigo crate) |
| `config.rs` | JSON 配置文件读写 |

### React 前端 (src/)

| 文件 | 职责 |
|------|------|
| `App.tsx` | 主应用组件 |
| `components/SettingsPanel.tsx` | 配置面板 |
| `components/CapturePreview.tsx` | 截图预览 |
| `components/StatusPanel.tsx` | 状态显示 |

## 启动开发

```bash
# 安装前端依赖
npm install

# 启动 Tauri 开发模式
npm run tauri dev
```

## 关键依赖

- `screenshots`: 跨平台屏幕截图
- `enigo`: 键盘和鼠标模拟
- `reqwest`: HTTP 客户端（调用 Claude API）
- `@tauri-apps/api`: Tauri 前端 API
