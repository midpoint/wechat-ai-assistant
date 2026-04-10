# WeChat AI Assistant

基于 Tauri 的微信聊天回复助手。使用 AI 根据聊天内容和选择的语气生成回复。

## 功能特性

- **多种回复语气**：友好、表扬、正式、怼人、恶毒
- **一键复制**：生成的回复可直接复制到剪贴板
- **跨平台支持**：基于 Tauri 构建，支持 Windows
- **配置灵活**：支持自定义 API 地址和模型

## 技术栈

- **桌面框架**: Tauri 2.0 (Rust + React)
- **前端**: React 18 + TypeScript + Vite
- **后端**: Rust
- **AI**: Anthropic Claude API 兼容格式

## 快速开始

### 前置要求

- Rust 1.70+
- Node.js 18+

### 安装步骤

```bash
# 克隆项目
git clone https://github.com/midpoint/wechat-ai-assistant.git
cd wechat-ai-assistant

# 安装前端依赖
npm install

# 开发模式运行
npm run tauri dev

# 构建发布版本
npm run tauri build
```

### 配置

首次运行时会弹出设置窗口，填入：

- **API Key**：你的 API 密钥
- **API Base URL**：API 地址（如 MiniMax: `https://api.minimaxi.com/anthropic`）
- **模型**：模型名称（如 `MiniMax-M2.7`）

配置文件 `config.json` 会保存在运行目录。

## 使用流程

1. 在左侧粘贴聊天记录
2. 选择回复语气
3. 点击"生成回复"
4. 点击"复制到剪贴板"
5. 粘贴到微信输入框发送

## 项目结构

```
├── src/                    # React 前端
│   ├── components/         # UI 组件
│   ├── styles/             # CSS 样式
│   ├── types.ts            # TypeScript 类型
│   └── App.tsx             # 主应用
├── src-tauri/              # Rust 后端
│   ├── src/
│   │   ├── main.rs         # 入口
│   │   ├── claude.rs       # Claude API
│   │   ├── keyboard.rs      # 键盘模拟
│   │   └── config.rs       # 配置管理
│   ├── Cargo.toml
│   └── tauri.conf.json
├── package.json
└── README.md
```

## 发布

构建后的可执行文件位于：
```
src-tauri/target/release/wechat-ai-assistant.exe
```

首次运行需要配置 API，配置文件为 `config.json`。

## 注意事项

- 请妥善保管 API Key，不要提交到代码仓库
- 建议使用小号测试
