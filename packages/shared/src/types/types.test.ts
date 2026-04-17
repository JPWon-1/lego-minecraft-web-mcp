import { describe, it, expectTypeOf } from "vitest";
import type { Block, ChallengeManifest, ScoreReport, Session, ToolResult } from "../index.js";

describe("shared types", () => {
  it("Block has required fields", () => {
    expectTypeOf<Block>().toMatchTypeOf<{
      id: string;
      track: "minecraft" | "lego";
      type: string;
      position: [number, number, number];
      color: string;
      rotation?: 0 | 90 | 180 | 270;
    }>();
  });

  it("ToolResult is discriminated union", () => {
    const ok: ToolResult<number> = { ok: true, data: 42 };
    const err: ToolResult<number> = {
      ok: false,
      error: { code: "INTERNAL", message: "y" },
    };
    expectTypeOf(ok).toMatchTypeOf<ToolResult<number>>();
    expectTypeOf(err).toMatchTypeOf<ToolResult<number>>();
  });

  it("ChallengeManifest, ScoreReport, Session are exported", () => {
    expectTypeOf<ChallengeManifest>().toBeObject();
    expectTypeOf<ScoreReport>().toBeObject();
    expectTypeOf<Session>().toBeObject();
  });
});
