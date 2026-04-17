import React from "react";
import type { Block } from "@blockgame/shared";

export const VoxelBlock: React.FC<{ block: Block }> = ({ block }) => (
  <mesh position={block.position}>
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial color={block.color} />
  </mesh>
);
