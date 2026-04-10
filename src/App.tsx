import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Config } from "./types";
import SettingsPanel from "./components/SettingsPanel";

type ReplyTone = "friendly" | "praise" | "formal" | "confrontational" | "vicious";

const TONE_PROMPTS: Record<ReplyTone, string> = {
  friendly: "友好、亲切、像朋友聊天",
  praise: "表扬、夸赞、让人开心",
  formal: "正式、礼貌、书面化",
  confrontational: "怼人、反怼、不吃亏",
  vicious: "恶毒、阴阳怪气、伤人",
};

function App() {
  const [config, setConfig] = useState<Config | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [tone, setTone] = useState<ReplyTone>("friendly");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("空闲");
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const cfg = await invoke<Config>("load_config");
      setConfig(cfg);
      // If config is empty (first run), show settings
      if (!cfg.claude_api_key) {
        setShowSettings(true);
      }
    } catch (err) {
      console.error("Failed to load config:", err);
      // Config file not found, show settings
      setShowSettings(true);
    }
  };

  const saveConfig = async (newConfig: Config) => {
    try {
      await invoke("save_config", { newConfig });
      setConfig(newConfig);
    } catch (err) {
      console.error("Failed to save config:", err);
    }
  };

  const generateReply = async () => {
    if (!config || !chatInput.trim()) return;

    setLoading(true);
    setStatus("正在生成回复...");

    try {
      const prompt = `你是一个微信聊天助手。用户会提供一段聊天记录，请你根据对方的最后一条消息，生成一个合适的回复。

语气要求：${TONE_PROMPTS[tone]}

聊天记录：
${chatInput}

请直接输出回复内容，不要解释，不要加前缀，输出纯文本。`;

      const response = await invoke<string>("analyze_image_with_claude", {
        imageBase64: "",
        prompt: prompt,
        apiKey: config.claude_api_key,
        model: config.claude_model,
        baseUrl: config.claude_api_base_url,
      });

      setResult(response);
      setStatus("生成完成");
    } catch (err) {
      setStatus(`错误: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!result) return;

    try {
      await invoke("copy_and_send", { text: result });
      setStatus("已复制到剪贴板！");
    } catch (err) {
      setStatus(`复制失败: ${err}`);
    }
  };

  if (!config) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div className="app">
      {/* Settings Button */}
      <button className="settings-btn" onClick={() => setShowSettings(true)}>
        ⚙️ 设置
      </button>

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>设置</h2>
              <button className="modal-close" onClick={() => setShowSettings(false)}>
                ✕
              </button>
            </div>
            <SettingsPanel config={config} onSave={saveConfig} />
          </div>
        </div>
      )}

      <header className="app-header">
        <h1>微信 AI 助手</h1>
      </header>

      <main className="app-main simplified">
        <div className="right-panel">
          <div className="chat-input-section">
            <h2>粘贴聊天记录</h2>
            <textarea
              className="chat-input"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="在这里粘贴聊天记录...

格式示例：
对方: 你好呀
我: 你好
对方: 今天吃什么？
我: 随便都行
对方: 那吃火锅吧
"
              rows={10}
            />
          </div>

          <div className="tone-section">
            <h2>选择回复语气</h2>
            <div className="tone-buttons">
              {(["friendly", "praise", "formal", "confrontational", "vicious"] as ReplyTone[]).map((t) => (
                <button
                  key={t}
                  className={`tone-btn ${tone === t ? "active" : ""}`}
                  onClick={() => setTone(t)}
                >
                  {t === "friendly" && "😊 友好"}
                  {t === "praise" && "👏 表扬"}
                  {t === "formal" && "📋 正式"}
                  {t === "confrontational" && "🔥 怼人"}
                  {t === "vicious" && "💀 恶毒"}
                </button>
              ))}
            </div>
          </div>

          <div className="action-section">
            <button
              className="generate-btn"
              onClick={generateReply}
              disabled={loading || !chatInput.trim()}
            >
              {loading ? "生成中..." : "生成回复"}
            </button>
          </div>

          <div className="result-section">
            <div className="result-header">
              <h2>生成的回复</h2>
              {result && (
                <button className="copy-btn" onClick={copyToClipboard}>
                  复制到剪贴板
                </button>
              )}
            </div>
            <div className="result-content">
              {result || "生成的回复将显示在这里..."}
            </div>
          </div>

          <div className="status-bar">
            <span>{status}</span>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
