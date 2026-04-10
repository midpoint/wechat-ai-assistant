import { useState } from "react";
import { Config } from "../types";

interface Props {
  config: Config;
  onSave: (config: Config) => void;
}

function SettingsPanel({ config, onSave }: Props) {
  const [localConfig, setLocalConfig] = useState(config);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(localConfig);
  };

  return (
    <div className="settings-panel">
      <h2>设置</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>API Key:</label>
          <input
            type="password"
            value={localConfig.claude_api_key}
            onChange={(e) =>
              setLocalConfig({ ...localConfig, claude_api_key: e.target.value })
            }
            placeholder="输入 API Key"
          />
        </div>

        <div className="form-group">
          <label>API Base URL:</label>
          <input
            type="text"
            value={localConfig.claude_api_base_url}
            onChange={(e) =>
              setLocalConfig({ ...localConfig, claude_api_base_url: e.target.value })
            }
            placeholder="https://api.minimaxi.com/anthropic"
          />
          <small>MiniMax: https://api.minimaxi.com/anthropic</small>
        </div>

        <div className="form-group">
          <label>模型:</label>
          <input
            type="text"
            value={localConfig.claude_model}
            onChange={(e) =>
              setLocalConfig({ ...localConfig, claude_model: e.target.value })
            }
            placeholder="MiniMax-M2.7"
          />
        </div>

        <button type="submit">保存设置</button>
      </form>
    </div>
  );
}

export default SettingsPanel;
