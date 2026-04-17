import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import type { Block } from "@blockgame/shared";
import { Brick } from "./bricks/Brick.js";
import { Stud } from "./bricks/Stud.js";

interface Props {
  bricks: Block[];
  gridSize?: [number, number];
}

export const LegoScene: React.FC<Props> = ({ bricks, gridSize = [16, 16] }) => {
  const visible = bricks.filter((b) => b.track === "lego");
  const basePlateColor = "#3a6a3a";
  const studs: Array<{ x: number; z: number }> = [];
  for (let x = 0; x < gridSize[0]; x++) {
    for (let z = 0; z < gridSize[1]; z++) {
      studs.push({ x, z });
    }
  }
  return (
    <Canvas
      camera={{ position: [22, 16, 22], fov: 50 }}
      style={{ height: "100%", width: "100%", background: "#B0C4DE" }}
      shadows
    >
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[20, 30, 15]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      {/* LEGO baseplate */}
      <mesh
        position={[gridSize[0] / 2 - 0.5, -0.15, gridSize[1] / 2 - 0.5]}
        receiveShadow
      >
        <boxGeometry args={[gridSize[0], 0.3, gridSize[1]]} />
        <meshStandardMaterial color={basePlateColor} />
      </mesh>
      {/* Studs on baseplate */}
      {studs.map((s) => (
        <Stud
          key={`base-${s.x}-${s.z}`}
          position={[s.x, 0.05, s.z]}
          color={basePlateColor}
        />
      ))}

      <Grid
        args={[gridSize[0], gridSize[1]]}
        position={[gridSize[0] / 2 - 0.5, 0.01, gridSize[1] / 2 - 0.5]}
        cellSize={1}
        cellThickness={0.3}
        cellColor="#2a4a2a"
        sectionSize={8}
        sectionColor="#1a3a1a"
        fadeDistance={50}
        infiniteGrid={false}
      />

      {visible.map((b) => (
        <Brick key={b.id} brick={b} />
      ))}

      <OrbitControls
        makeDefault
        target={[gridSize[0] / 2 - 0.5, 2, gridSize[1] / 2 - 0.5]}
      />
    </Canvas>
  );
};
