import React from "react";
import type { Block, SceneSnapshot } from "@blockgame/shared";

type Action =
  | { type: "hello" }
  | { type: "block_added"; block: Block }
  | { type: "block_removed"; id: string }
  | { type: "scene_reset" }
  | { type: "sync_state"; session: { current_scene: SceneSnapshot } }
  | { type: "score_result"; report: unknown };

export interface SceneState {
  blocks: Block[];
  connected: boolean;
  report?: unknown;
}

const initial: SceneState = { blocks: [], connected: false };

function reduce(s: SceneState, a: Action): SceneState {
  switch (a.type) {
    case "hello": return { ...s, connected: true };
    case "block_added": return { ...s, blocks: [...s.blocks, a.block] };
    case "block_removed": return { ...s, blocks: s.blocks.filter(b => b.id !== a.id) };
    case "scene_reset": return { ...s, blocks: [] };
    case "sync_state": return { ...s, blocks: a.session.current_scene.blocks };
    case "score_result": return { ...s, report: a.report };
    default: return s;
  }
}

export function useSceneReducer() {
  return React.useReducer(reduce, initial);
}
