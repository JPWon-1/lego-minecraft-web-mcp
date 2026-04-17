export type WsMessage =
  | { type: "block_added"; block: unknown }
  | { type: "block_removed"; id: string }
  | { type: "scene_reset" }
  | { type: "sync_state"; session: unknown }
  | { type: "score_result"; report: unknown }
  | { type: "hello" }
  | { type: "test" };

export class Broadcaster {
  private subs: Array<(m: WsMessage) => void> = [];
  private queue: WsMessage[] = [];

  subscribe(fn: (m: WsMessage) => void): () => void {
    this.subs.push(fn);
    if (this.queue.length) {
      for (const m of this.queue) fn(m);
      this.queue = [];
    }
    return () => {
      this.subs = this.subs.filter((f) => f !== fn);
    };
  }

  emit(m: WsMessage): void {
    if (this.subs.length === 0) {
      this.queue.push(m);
      return;
    }
    for (const fn of this.subs) fn(m);
  }
}
