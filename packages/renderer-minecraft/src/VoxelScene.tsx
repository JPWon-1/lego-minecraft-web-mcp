import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, Sky } from "@react-three/drei";
import type { Block } from "@blockgame/shared";
import { VoxelBlock } from "./VoxelBlock.js";

interface Props {
  blocks: Block[];
  gridSize?: [number, number];
}

export const VoxelScene: React.FC<Props> = ({ blocks, gridSize = [16, 16] }) => {
  const visible = blocks.filter((b) => b.track === "minecraft");
  return (
    <Canvas
      camera={{ position: [18, 14, 18], fov: 50 }}
      style={{ height: "100%", width: "100%", background: "#87CEEB" }}
      shadows
    >
      <Sky sunPosition={[100, 20, 100]} />
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[20, 30, 15]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      {/* Baseplate — grass-like green plate */}
      <mesh
        position={[gridSize[0] / 2 - 0.5, -0.5, gridSize[1] / 2 - 0.5]}
        receiveShadow
      >
        <boxGeometry args={[gridSize[0], 0.4, gridSize[1]]} />
        <meshStandardMaterial color="#6ab04c" />
      </mesh>

      {/* Grid overlay for snap reference */}
      <Grid
        args={[gridSize[0], gridSize[1]]}
        position={[gridSize[0] / 2 - 0.5, -0.29, gridSize[1] / 2 - 0.5]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#2c5530"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#1a3d1f"
        fadeDistance={40}
        fadeStrength={1}
        infiniteGrid={false}
      />

      {visible.map((b) => (
        <VoxelBlock key={b.id} block={b} />
      ))}

      <OrbitControls
        makeDefault
        target={[gridSize[0] / 2 - 0.5, 2, gridSize[1] / 2 - 0.5]}
      />
    </Canvas>
  );
};
