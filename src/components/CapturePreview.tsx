import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { CaptureRegion, ScreenInfo } from "../types";

interface Props {
  region: CaptureRegion;
  onRegionChange: (region: CaptureRegion) => void;
  onSelectRegion: () => void;
}

function CapturePreview({ region, onRegionChange, onSelectRegion }: Props) {
  const [screens, setScreens] = useState<ScreenInfo[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {
    loadScreens();
  }, []);

  const loadScreens = async () => {
    try {
      const screenList = await invoke<ScreenInfo[]>("list_screens");
      setScreens(screenList);
    } catch (err) {
      console.error("Failed to load screens:", err);
    }
  };

  const capturePreview = async () => {
    setCapturing(true);
    try {
      const image = await invoke<string>("capture_screen", {
        x: region.x,
        y: region.y,
        width: region.width,
        height: region.height,
      });
      setPreviewImage(image);
    } catch (err) {
      console.error("Failed to capture preview:", err);
    } finally {
      setCapturing(false);
    }
  };

  return (
    <div className="capture-preview">
      <h2>捕获区域</h2>

      <button onClick={onSelectRegion} className="select-region-btn">
        拖动选择区域
      </button>

      <div className="region-inputs">
        <div className="input-row">
          <label>X:</label>
          <input
            type="number"
            value={region.x}
            onChange={(e) =>
              onRegionChange({ ...region, x: parseInt(e.target.value) || 0 })
            }
          />
          <label>Y:</label>
          <input
            type="number"
            value={region.y}
            onChange={(e) =>
              onRegionChange({ ...region, y: parseInt(e.target.value) || 0 })
            }
          />
        </div>
        <div className="input-row">
          <label>宽度:</label>
          <input
            type="number"
            value={region.width}
            onChange={(e) =>
              onRegionChange({
                ...region,
                width: parseInt(e.target.value) || 400,
              })
            }
          />
          <label>高度:</label>
          <input
            type="number"
            value={region.height}
            onChange={(e) =>
              onRegionChange({
                ...region,
                height: parseInt(e.target.value) || 600,
              })
            }
          />
        </div>
      </div>

      <div className="screens-info">
        <h3>可用屏幕:</h3>
        {screens.map((screen) => (
          <div key={screen.id} className="screen-item">
            屏幕 {screen.id}: {screen.width}x{screen.height} @ ({screen.x}, {screen.y})
            {screen.is_primary && " (主屏)"}
          </div>
        ))}
      </div>

      <button onClick={capturePreview} disabled={capturing}>
        {capturing ? "捕获中..." : "捕获预览"}
      </button>

      {previewImage && (
        <div className="preview-image">
          <h3>预览:</h3>
          <img src={previewImage} alt="Capture preview" />
        </div>
      )}
    </div>
  );
}

export default CapturePreview;
