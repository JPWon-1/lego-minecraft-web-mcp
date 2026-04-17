import { describe, it, expect, vi } from "vitest";
import { Broadcaster } from "./ws-broadcaster.js";

describe("Broadcaster", () => {
  it("broadcasts to all subscribers", () => {
    const b = new Broadcaster();
    const a = vi.fn();
    const c = vi.fn();
    b.subscribe(a);
    b.subscribe(c);
    b.emit({ type: "test" });
    expect(a).toHaveBeenCalledWith({ type: "test" });
    expect(c).toHaveBeenCalledWith({ type: "test" });
  });

  it("queues messages when no subscriber yet", () => {
    const b = new Broadcaster();
    b.emit({ type: "hello" });
    b.emit({ type: "scene_reset" });
    const received: unknown[] = [];
    b.subscribe((m) => received.push(m));
    expect(received).toHaveLength(2);
  });

  it("unsubscribe stops receiving", () => {
    const b = new Broadcaster();
    const a = vi.fn();
    const off = b.subscribe(a);
    off();
    b.emit({ type: "test" });
    expect(a).not.toHaveBeenCalled();
  });
});
