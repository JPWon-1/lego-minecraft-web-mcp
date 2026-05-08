import React from "react";
import * as THREE from "three";
import type { ThreeEvent } from "@react-three/fiber";
import type { Block } from "@blockgame/shared";

// Game convention: position = [x, y, z] where z is UP.
// Three.js convention: y is UP.
// Swap z↔y for rendering so "vertical towers" actually stand up.
interface Props {
  block: Block;
  onPlaceAdjacent?: (
    block: Block,
    faceNormal: [number, number, number],
    e: ThreeEvent<MouseEvent>,
  ) => void;
  onRemove?: (block: Block) => void;
  highlight?: boolean;
}

export const VoxelBlock: React.FC<Props> = ({ block, onPlaceAdjacent, onRemove, highlight }) => {
  const [x, y, z] = block.position;
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (!onPlaceAdjacent || !e.face) return;
    const n = e.face.normal;
    onPlaceAdjacent(block, [n.x, n.y, n.z], e);
  };
  const handleContext = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    e.nativeEvent.preventDefault();
    onRemove?.(block);
  };
  return (
    <group position={[x, z, y]}>
      <mesh
        castShadow
        receiveShadow
        onClick={handleClick}
        onContextMenu={handleContext}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={block.color}
          emissive={highlight ? "#ffffff" : "#000000"}
          emissiveIntensity={highlight ? 0.45 : 0}
        />
      </mesh>
      {highlight && (
        <lineSegments raycast={() => null}>
          <edgesGeometry args={[new THREE.BoxGeometry(1.05, 1.05, 1.05)]} />
          <lineBasicMaterial color="#ffffff" transparent opacity={0.95} />
        </lineSegments>
      )}
    </group>
  );
};
