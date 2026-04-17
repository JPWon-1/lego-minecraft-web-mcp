import React from "react";
import type { Block } from "@blockgame/shared";
import { Stud } from "./Stud.js";

const BRICK_SIZES: Record<string, [number, number, number]> = {
  brick_1x1: [1, 1, 1],
  brick_1x2: [1, 2, 1],
  brick_2x2: [2, 2, 1],
  brick_2x4: [2, 4, 1],
  brick_1x8: [1, 8, 1],
  slope_1x2: [1, 2, 1],
  slope_2x2: [2, 2, 1],
  window_1x2: [1, 2, 1],
  window_2x2: [2, 2, 1],
  door_1x3: [1, 1, 3],
  baseplate_16x16: [16, 16, 0.25],
};

export const Brick: React.FC<{ brick: Block }> = ({ brick }) => {
  const size = BRICK_SIZES[brick.type] ?? [1, 1, 1];
  const [sx, sy, sz] = size;
  return (
    <group position={brick.position}>
      <mesh>
        <boxGeometry args={[sx, sy, sz]} />
        <meshStandardMaterial color={brick.color} />
      </mesh>
      {brick.type !== "baseplate_16x16" && Array.from({ length: sx * sy }).map((_, i) => {
        const x = i % sx - (sx - 1) / 2;
        const y = Math.floor(i / sx) - (sy - 1) / 2;
        return <Stud key={i} position={[x, y, sz / 2 + 0.1]} color={brick.color} />;
      })}
    </group>
  );
};
