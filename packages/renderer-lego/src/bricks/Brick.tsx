import React from "react";
import * as THREE from "three";
import type { ThreeEvent } from "@react-three/fiber";
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

interface Props {
  brick: Block;
  onPlaceAdjacent?: (
    b: Block,
    faceNormal: [number, number, number],
    e: ThreeEvent<MouseEvent>,
  ) => void;
  onRemove?: (b: Block) => void;
  /** When true, render a bright outline + emissive glow (LEGO instruction "this
   * is the new piece this step" callout). */
  highlight?: boolean;
}

export const Brick: React.FC<Props> = ({ brick, onPlaceAdjacent, onRemove, highlight }) => {
  const size = BRICK_SIZES[brick.type] ?? [1, 1, 1];
  const [sx, sy, sz] = size;
  const [bx, by, bz] = brick.position;

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (!onPlaceAdjacent || !e.face) return;
    const n = e.face.normal;
    onPlaceAdjacent(brick, [n.x, n.y, n.z], e);
  };
  const handleContext = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    e.nativeEvent.preventDefault();
    onRemove?.(brick);
  };

  // Y-axis rotation in radians. Three.js group's Y is vertical, matching game's
  // up-axis (z). Rotating the group spins the footprint around the brick center.
  const rotDeg = brick.rotation ?? 0;
  const rotRad = (rotDeg * Math.PI) / 180;

  return (
    <group position={[bx, bz, by]} rotation={[0, rotRad, 0]}>
      <mesh castShadow receiveShadow onClick={handleClick} onContextMenu={handleContext}>
        <boxGeometry args={[sx - 0.02, sz - 0.02, sy - 0.02]} />
        <meshStandardMaterial
          color={brick.color}
          emissive={highlight ? "#ffffff" : "#000000"}
          emissiveIntensity={highlight ? 0.45 : 0}
        />
      </mesh>
      {highlight && (
        <lineSegments raycast={() => null}>
          <edgesGeometry args={[new THREE.BoxGeometry(sx + 0.04, sz + 0.04, sy + 0.04)]} />
          <lineBasicMaterial color="#ffffff" transparent opacity={0.95} />
        </lineSegments>
      )}
      {brick.type !== "baseplate_16x16" &&
        Array.from({ length: sx * sy }).map((_, i) => {
          const x = (i % sx) - (sx - 1) / 2;
          const y = Math.floor(i / sx) - (sy - 1) / 2;
          return (
            <Stud key={i} position={[x, sz / 2 + 0.1, y]} color={brick.color} />
          );
        })}
    </group>
  );
};
