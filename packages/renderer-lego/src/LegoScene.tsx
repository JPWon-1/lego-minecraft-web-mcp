import React from "react";
import { Canvas } from "@react-three/fiber";
import type { Block } from "@blockgame/shared";
import { Brick } from "./bricks/Brick.js";

export const LegoScene: React.FC<{ bricks: Block[] }> = ({ bricks }) => (
  <Canvas camera={{ position: [15, 15, 15] }} style={{ height: "100%" }}>
    <ambientLight intensity={0.6} />
    <directionalLight position={[10, 20, 10]} intensity={0.9} />
    <gridHelper args={[32, 32]} />
    {bricks.filter(b => b.track === "lego").map(b => <Brick key={b.id} brick={b} />)}
  </Canvas>
);
