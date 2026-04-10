interface Props {
  status: string;
  onAnalyze: () => void;
  loading: boolean;
}

function StatusPanel({ status, onAnalyze, loading }: Props) {
  return (
    <div className="status-panel">
      <h2>状态</h2>
      <div className="status-display">
        <span className="status-label">当前状态:</span>
        <span className={`status-value ${loading ? "loading" : ""}`}>{status}</span>
      </div>
      <button className="analyze-btn" onClick={onAnalyze} disabled={loading}>
        {loading ? "处理中..." : "截图并分析"}
      </button>
      <p className="hint">
        确保微信窗口可见，需要分析的聊天界面在屏幕上显示。
      </p>
    </div>
  );
}

export default StatusPanel;
