export interface CaptureRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Config {
  claude_api_key: string;
  claude_api_base_url: string;
  claude_model: string;
  capture_region: CaptureRegion;
  filter_keywords: string[];
  enable_group_chat: boolean;
  auto_reply_delay_ms: number;
  system_prompt: string;
}

export interface ScreenInfo {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  scale_factor: number;
  is_primary: boolean;
}
