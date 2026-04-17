export type ToolErrorCode =
  | "POSITION_OUT_OF_BOUNDS"
  | "INTENT_NOT_LOGGED"
  | "INVALID_COLOR"
  | "UNKNOWN_BLOCK_TYPE"
  | "UNKNOWN_BLOCK_ID"
  | "CHALLENGE_NOT_FOUND"
  | "HINT_LIMIT_EXCEEDED"
  | "WEBSOCKET_DISCONNECTED"
  | "INTERNAL";

export interface ToolError {
  code: ToolErrorCode;
  message: string;
  hint?: string;
}

export type ToolResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ToolError };

export function ok<T>(data: T): ToolResult<T> {
  return { ok: true, data };
}
export function err<T = never>(
  code: ToolErrorCode,
  message: string,
  hint?: string,
): ToolResult<T> {
  return { ok: false, error: { code, message, hint } };
}
