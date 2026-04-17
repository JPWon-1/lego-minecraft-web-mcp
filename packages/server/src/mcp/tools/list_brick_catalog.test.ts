import { describe, it, expect } from "vitest";
import { listBrickCatalog } from "./list_brick_catalog.js";

describe("list_brick_catalog", () => {
  it("groups LEGO types by category", async () => {
    const r = await listBrickCatalog();
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.standard.length).toBeGreaterThan(0);
      expect(r.data.slopes.length).toBeGreaterThan(0);
      expect(r.data.windows.length).toBeGreaterThan(0);
      expect(r.data.doors.length).toBeGreaterThan(0);
      expect(r.data.special.length).toBeGreaterThan(0);
    }
  });
});
