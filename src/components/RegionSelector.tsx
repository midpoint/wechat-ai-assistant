import { useState, useRef, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

interface RegionSelectorProps {
  onClose: () => void;
  onSelect: (region: { x: number; y: number; width: number; height: number }) => void;
}

function RegionSelector({ onClose, onSelect }: RegionSelectorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const [selection, setSelection] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    initSelection();
  }, []);

  const initSelection = async () => {
    try {
      // Capture full screen
      const screenId = 0; // Primary screen
      const img = await invoke<string>("capture_full_screen", { screenId });
      setScreenshot(img);

      // Get screen info
      const screens = await invoke<Array<{
        id: number;
        x: number;
        y: number;
        width: number;
        height: number;
        scale_factor: number;
        is_primary: boolean;
      }>>("list_screens");

      const primary = screens.find(s => s.is_primary) || screens[0];
      if (primary) {
        setScreenSize({ width: primary.width, height: primary.height });
      }
    } catch (err) {
      console.error("Failed to capture screen:", err);
      onClose();
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    setIsDrawing(true);
    setStartPos({ x, y });
    setCurrentPos({ x, y });
    setSelection(null);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    setCurrentPos({ x, y });
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    // Calculate selection rectangle
    const x = Math.min(startPos.x, currentPos.x);
    const y = Math.min(startPos.y, currentPos.y);
    const width = Math.abs(currentPos.x - startPos.x);
    const height = Math.abs(currentPos.y - startPos.y);

    if (width > 10 && height > 10) {
      // Scale to actual screen coordinates
      const scaleX = screenSize.width / (canvasRef.current?.width || 1);
      const scaleY = screenSize.height / (canvasRef.current?.height || 1);

      setSelection({
        x: Math.round(x * scaleX),
        y: Math.round(y * scaleY),
        width: Math.round(width * scaleX),
        height: Math.round(height * scaleY),
      });
    }
  };

  const handleConfirm = () => {
    if (selection) {
      onSelect(selection);
    }
  };

  const drawCanvas = (ctx: CanvasRenderingContext2D) => {
    if (!screenshot) return;

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Set canvas to image size
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the screenshot
      ctx.drawImage(img, 0, 0);

      // Draw overlay
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Clear the selection area to show the original image
      if (selection) {
        ctx.clearRect(selection.x, selection.y, selection.width, selection.height);
        ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
      }

      // Draw current selection rectangle
      if (isDrawing) {
        const x = Math.min(startPos.x, currentPos.x);
        const y = Math.min(startPos.y, currentPos.y);
        const width = Math.abs(currentPos.x - startPos.x);
        const height = Math.abs(currentPos.y - startPos.y);

        ctx.clearRect(x, y, width, height);
        ctx.drawImage(img, x, y, width, height, x, y, width, height);

        // Draw border
        ctx.strokeStyle = "#00FF00";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);

        // Draw size text
        ctx.fillStyle = "#00FF00";
        ctx.font = "16px monospace";
        ctx.fillText(`${width}x${height}`, x + 5, y + 20);
      }
    };
    img.src = screenshot;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !screenshot) return;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      drawCanvas(ctx);
    }
  }, [screenshot, isDrawing, startPos, currentPos, selection]);

  return (
    <div className="region-selector-overlay">
      <div className="region-selector-header">
        <span>拖动鼠标选择区域，按 ESC 取消</span>
        <button onClick={onClose}>取消</button>
      </div>

      <canvas
        ref={canvasRef}
        className="region-selector-canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ cursor: "crosshair" }}
      />

      {selection && (
        <div className="region-selector-footer">
          <span>
            已选择: X={selection.x}, Y={selection.y}, 宽度={selection.width}, 高度={selection.height}
          </span>
          <div className="region-selector-actions">
            <button onClick={onClose}>取消</button>
            <button onClick={handleConfirm} className="confirm-btn">确认</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RegionSelector;
