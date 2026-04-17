import React from "react";
import { Canvas } from "@react-three/fiber";
import type { Block } from "@blockgame/shared";
import { VoxelBlock } from "./VoxelBlock.js";

export const VoxelScene: React.FC<{ blocks: Block[] }> = ({ blocks }) => (
  <Canvas camera={{ position: [10, 10, 10] }} style={{ height: "100%" }}>
    <ambientLight intensity={0.5} />
    <directionalLight position={[10, 20, 10]} intensity={0.8} />
    <gridHelper args={[32, 32]} />
    {blocks.filter(b => b.track === "minecraft").map(b => <VoxelBlock key={b.id} block={b} />)}
  </Canvas>
);
