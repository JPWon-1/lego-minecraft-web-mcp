import React from "react";
import * as THREE from "three";
import { Canvas, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Grid, Sky } from "@react-three/drei";
import type { Block } from "@blockgame/shared";
import { VoxelBlock } from "./VoxelBlock.js";

export interface ModulePreviewPart {
  offset: [number, number, number];
  type: string;
  color: string;
}

interface Props {
  blocks: Block[];
  gridSize?: [number, number];
  selectedColor?: string;
  selectedBlockType?: string;
  modulePreviewParts?: ModulePreviewPart[];
  onPlaceBlock?: (pos: [number, number, number]) => void;
  onRemoveBlock?: (block: Block) => void;
  showBaseplate?: boolean;
  showSky?: boolean;
  showGrid?: boolean;
  highlightIds?: Set<string>;
}

export const VoxelScene: React.FC<Props> = ({
  blocks,
  gridSize = [16, 16],
  selectedColor,
  selectedBlockType,
  modulePreviewParts,
  onPlaceBlock,
  onRemoveBlock,
  showBaseplate = true,
  showSky = true,
  showGrid = true,
  highlightIds,
}) => {
  const visible = blocks.filter((b) => b.track === "minecraft");
  const [hoverCell, setHoverCell] = React.useState<[number, number, number] | null>(
    null,
  );
  const orbitTarget = React.useMemo<[number, number, number]>(
    () => [gridSize[0] / 2 - 0.5, 2, gridSize[1] / 2 - 0.5],
    [gridSize],
  );
  const cameraConfig = React.useMemo(
    () => ({ position: [18, 14, 18] as [number, number, number], fov: 50 }),
    [],
  );

  // Drag-vs-click detection (window-level so all meshes share it).
  const downRef = React.useRef<{ x: number; y: number } | null>(null);
  React.useEffect(() => {
    const onDown = (e: PointerEvent) => {
      downRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("pointerdown", onDown, { capture: true });
    return () => window.removeEventListener("pointerdown", onDown, { capture: true });
  }, []);
  const isDrag = (e: ThreeEvent<MouseEvent>): boolean => {
    const start = downRef.current;
    downRef.current = null;
    if (!start) return false;
    const dx = e.nativeEvent.clientX - start.x;
    const dy = e.nativeEvent.clientY - start.y;
    return Math.hypot(dx, dy) > 4;
  };

  const handleBaseClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (isDrag(e)) return;
    if (!onPlaceBlock) return;
    const { x, z } = e.point;
    const gx = Math.floor(x + 0.5);
    const gy = Math.floor(z + 0.5);
    if (gx < 0 || gx >= gridSize[0] || gy < 0 || gy >= gridSize[1]) return;
    onPlaceBlock([gx, gy, 0]);
  };
  const handleBaseMove = (e: ThreeEvent<PointerEvent>) => {
    const { x, z } = e.point;
    const gx = Math.floor(x + 0.5);
    const gy = Math.floor(z + 0.5);
    if (gx < 0 || gx >= gridSize[0] || gy < 0 || gy >= gridSize[1]) {
      setHoverCell(null);
      return;
    }
    setHoverCell([gx, gy, 0]);
  };

  const handlePlaceAdjacent = (
    block: Block,
    n: [number, number, number],
    e?: ThreeEvent<MouseEvent>,
  ) => {
    if (e && isDrag(e)) return;
    if (!onPlaceBlock) return;
    // voxel_1x1 is unit-size; step by 1 in face normal direction
    const [bx, by, bz] = block.position;
    const ngx = bx + Math.round(n[0]);
    const ngy = by + Math.round(n[2]);
    const ngz = bz + Math.round(n[1]);
    if (ngx < 0 || ngx >= gridSize[0] || ngy < 0 || ngy >= gridSize[1]) return;
    if (ngz < 0) return;
    onPlaceBlock([ngx, ngy, ngz]);
  };

  return (
    <Canvas
      camera={cameraConfig}
      style={{
        height: "100%",
        width: "100%",
        background: showSky ? "#87CEEB" : showBaseplate ? "#5c9ebf" : "#1a1a1a",
      }}
      shadows
    >
      {showSky ? <Sky sunPosition={[100, 20, 100]} /> : null}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[20, 30, 15]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      {showBaseplate ? (
        <mesh
          position={[gridSize[0] / 2 - 0.5, -0.5, gridSize[1] / 2 - 0.5]}
          receiveShadow
          onClick={handleBaseClick}
          onPointerMove={handleBaseMove}
          onPointerOut={() => setHoverCell(null)}
        >
          <boxGeometry args={[gridSize[0], 0.4, gridSize[1]]} />
          <meshStandardMaterial color="#6ab04c" />
        </mesh>
      ) : (
        <mesh
          position={[gridSize[0] / 2 - 0.5, -0.5, gridSize[1] / 2 - 0.5]}
          onClick={handleBaseClick}
          onPointerMove={handleBaseMove}
          onPointerOut={() => setHoverCell(null)}
          visible={false}
        >
          <boxGeometry args={[gridSize[0], 0.4, gridSize[1]]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      )}

      {showGrid ? (
        <Grid
          args={[gridSize[0], gridSize[1]]}
          position={[gridSize[0] / 2 - 0.5, -0.29, gridSize[1] / 2 - 0.5]}
          cellSize={1}
          cellThickness={0.5}
          cellColor={showBaseplate ? "#2c5530" : "#888"}
          sectionSize={5}
          sectionThickness={1}
          sectionColor={showBaseplate ? "#1a3d1f" : "#aaa"}
          fadeDistance={40}
          fadeStrength={1}
          infiniteGrid={false}
        />
      ) : null}

      {/* Hover ghost preview — pass-through for clicks, bright enough to read
          against the baseplate. */}
      {hoverCell && selectedColor && selectedBlockType && (
        <group
          position={[hoverCell[0], hoverCell[2], hoverCell[1]]}
          raycast={() => null}
        >
          <mesh raycast={() => null}>
            <boxGeometry args={[1.04, 1.04, 1.04]} />
            <meshStandardMaterial
              color={selectedColor}
              transparent
              opacity={0.55}
              depthWrite={false}
              emissive={selectedColor}
              emissiveIntensity={0.35}
            />
          </mesh>
          <lineSegments raycast={() => null}>
            <edgesGeometry args={[new THREE.BoxGeometry(1.04, 1.04, 1.04)]} />
            <lineBasicMaterial color="#ffffff" transparent opacity={0.85} />
          </lineSegments>
        </group>
      )}

      {/* Module preview ghost: render every part of the picked module. */}
      {hoverCell && modulePreviewParts && modulePreviewParts.length > 0 &&
        modulePreviewParts.map((part, i) => {
          const px = hoverCell[0] + part.offset[0];
          const py = hoverCell[1] + part.offset[1];
          const pz = hoverCell[2] + part.offset[2];
          return (
            <group key={i} position={[px, pz, py]} raycast={() => null}>
              <mesh raycast={() => null}>
                <boxGeometry args={[1.04, 1.04, 1.04]} />
                <meshStandardMaterial
                  color={part.color}
                  transparent
                  opacity={0.55}
                  depthWrite={false}
                  emissive={part.color}
                  emissiveIntensity={0.35}
                />
              </mesh>
              <lineSegments raycast={() => null}>
                <edgesGeometry args={[new THREE.BoxGeometry(1.04, 1.04, 1.04)]} />
                <lineBasicMaterial color="#ffffff" transparent opacity={0.85} />
              </lineSegments>
            </group>
          );
        })}

      {visible.map((b) => (
        <VoxelBlock
          key={b.id}
          block={b}
          onPlaceAdjacent={handlePlaceAdjacent}
          onRemove={onRemoveBlock}
          highlight={highlightIds?.has(b.id)}
        />
      ))}

      <OrbitControls
        makeDefault
        target={orbitTarget}
        enableDamping={false}
        autoRotate={false}
      />
    </Canvas>
  );
};
