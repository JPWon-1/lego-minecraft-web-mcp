import React from "react";

export function useGameSocket(
  url: string,
  dispatch: (a: any) => void,
) {
  React.useEffect(() => {
    let ws: WebSocket | null = null;
    let attempt = 0;
    let cancelled = false;

    function connect() {
      if (cancelled) return;
      ws = new WebSocket(url);
      ws.onmessage = (e) => {
        try { dispatch(JSON.parse(e.data)); } catch { /* ignore */ }
      };
      ws.onclose = () => {
        attempt++;
        const backoff = Math.min(10_000, 500 * 2 ** Math.min(attempt, 6));
        setTimeout(connect, backoff);
      };
    }
    connect();
    return () => { cancelled = true; ws?.close(); };
  }, [url, dispatch]);
}
