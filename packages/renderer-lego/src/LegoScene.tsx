import React from "react";
import * as THREE from "three";
import { Canvas, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Grid, Sky, Cloud, Clouds } from "@react-three/drei";
import type { Block } from "@blockgame/shared";
import { Brick } from "./bricks/Brick.js";
import { Stud } from "./bricks/Stud.js";

const SIZES: Record<string, [number, number, number]> = {
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
};
const sizeOf = (t: string): [number, number, number] => SIZES[t] ?? [1, 1, 1];

/** A part of a multi-block module — used to render a multi-block ghost preview
 * at the hover position when a module is "PICKED". */
export interface ModulePreviewPart {
  offset: [number, number, number];
  type: string;
  color: string;
}

interface Props {
  bricks: Block[];
  gridSize?: [number, number];
  selectedColor?: string;
  selectedBlockType?: string;
  selectedRotation?: 0 | 90 | 180 | 270;
  /** When set (and a module is "picked"), each part is rendered as a translucent
   * outlined ghost at hoverCell + offset. Replaces the single-block ghost. */
  modulePreviewParts?: ModulePreviewPart[];
  onPlaceBlock?: (pos: [number, number, number]) => void;
  onRemoveBlock?: (b: Block) => void;
  showBaseplate?: boolean;
  showSky?: boolean;
  showGrid?: boolean;
  /** IDs of bricks to render with a bright outline (current instruction step). */
  highlightIds?: Set<string>;
}

export const LegoScene: React.FC<Props> = ({
  bricks,
  gridSize = [16, 16],
  selectedColor,
  selectedBlockType,
  selectedRotation = 0,
  modulePreviewParts,
  onPlaceBlock,
  onRemoveBlock,
  showBaseplate = true,
  showSky = false,
  showGrid = true,
  highlightIds,
}) => {
  const visible = bricks.filter((b) => b.track === "lego");
  const basePlateColor = "#3a6a3a";
  const [hoverCell, setHoverCell] = React.useState<[number, number, number] | null>(
    null,
  );

  const studs: Array<{ x: number; z: number }> = [];
  if (showBaseplate) {
    for (let x = 0; x < gridSize[0]; x++) {
      for (let z = 0; z < gridSize[1]; z++) {
        studs.push({ x, z });
      }
    }
  }

  // Drag-vs-click detection: orbit drags also fire onClick on whichever mesh
  // the pointer was over at release. Capture pointer-down at the window level
  // so all meshes (baseplate AND placed bricks) share the same gate.
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
    const gx = Math.round(e.point.x);
    const gy = Math.round(e.point.z);
    if (gx < 0 || gx >= gridSize[0] || gy < 0 || gy >= gridSize[1]) return;
    onPlaceBlock([gx, gy, 0]);
  };
  const handleBaseMove = (e: ThreeEvent<PointerEvent>) => {
    const gx = Math.floor(e.point.x + 0.5);
    const gy = Math.floor(e.point.z + 0.5);
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
    const [bx, by, bz] = block.position;
    const [esx, esy, esz] = sizeOf(block.type);
    const [nsx, nsy, nsz] = sizeOf(selectedBlockType ?? "brick_1x1");
    // three normal (nx, ny, nz) maps to game axes (x, z, y)
    const dx = Math.round(n[0]) * ((esx + nsx) / 2);
    const dy = Math.round(n[2]) * ((esy + nsy) / 2);
    const dz = Math.round(n[1]) * ((esz + nsz) / 2);
    const ngx = bx + dx;
    const ngy = by + dy;
    const ngz = bz + dz;
    if (ngx < 0 || ngx >= gridSize[0] || ngy < 0 || ngy >= gridSize[1]) return;
    if (ngz < 0) return;
    onPlaceBlock([ngx, ngy, ngz]);
  };

  const cx = gridSize[0] / 2 - 0.5;
  const cz = gridSize[1] / 2 - 0.5;
  // Memoized so OrbitControls/Canvas don't see a fresh reference every render
  // (which made the camera nudge each time blocks updated).
  const orbitTarget = React.useMemo<[number, number, number]>(
    () => [cx, showSky ? 7 : 2, cz],
    [cx, cz, showSky],
  );
  const cameraConfig = React.useMemo(
    () => ({
      position: (showSky ? [30, 18, 36] : [22, 16, 22]) as [number, number, number],
      fov: showSky ? 45 : 50,
    }),
    [showSky],
  );

  return (
    <Canvas
      camera={cameraConfig}
      style={{
        height: "100%",
        width: "100%",
        background: showSky
          ? "#6ab3e8"
          : showBaseplate
          ? "#B0C4DE"
          : "#1a1a1a",
      }}
      shadows
    >
      {showSky ? <Sky sunPosition={[100, 20, 100]} turbidity={6} /> : null}
      <ambientLight intensity={showSky ? 0.7 : 0.6} />
      <directionalLight
        position={[20, 30, 15]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      {showSky ? (
        <Clouds>
          <Cloud position={[0, -6, 10]} seed={1} segments={30} bounds={[12, 2, 6]} volume={8} color="#ffffff" opacity={0.8} />
          <Cloud position={[18, -4, -8]} seed={2} segments={24} bounds={[10, 2, 5]} volume={7} color="#ffffff" opacity={0.7} />
          <Cloud position={[-14, -8, -4]} seed={3} segments={26} bounds={[14, 2, 6]} volume={9} color="#ffffff" opacity={0.75} />
          <Cloud position={[4, 14, -16]} seed={4} segments={20} bounds={[10, 1.5, 4]} volume={6} color="#ffffff" opacity={0.6} />
        </Clouds>
      ) : null}

      {showBaseplate ? (
        <>
          <mesh
            position={[cx, -0.15, cz]}
            receiveShadow
            onClick={handleBaseClick}
            onPointerMove={handleBaseMove}
            onPointerOut={() => setHoverCell(null)}
          >
            <boxGeometry args={[gridSize[0], 0.3, gridSize[1]]} />
            <meshStandardMaterial color={basePlateColor} />
          </mesh>
          {studs.map((s) => (
            <Stud
              key={`base-${s.x}-${s.z}`}
              position={[s.x, 0.05, s.z]}
              color={basePlateColor}
            />
          ))}
        </>
      ) : (
        /* Invisible click-catcher plane so users can still place on empty air */
        <mesh
          position={[cx, -0.15, cz]}
          onClick={handleBaseClick}
          onPointerMove={handleBaseMove}
          onPointerOut={() => setHoverCell(null)}
          visible={false}
        >
          <boxGeometry args={[gridSize[0], 0.3, gridSize[1]]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      )}

      {showGrid ? (
        <Grid
          args={[gridSize[0], gridSize[1]]}
          position={[cx, 0.01, cz]}
          cellSize={1}
          cellThickness={0.3}
          cellColor={showBaseplate ? "#2a4a2a" : "#666"}
          sectionSize={8}
          sectionColor={showBaseplate ? "#1a3a1a" : "#888"}
          fadeDistance={50}
          infiniteGrid={false}
        />
      ) : null}

      {hoverCell && selectedColor && selectedBlockType && showBaseplate && (() => {
        const [sx, sy, sz] = sizeOf(selectedBlockType);
        const rotRad = (selectedRotation * Math.PI) / 180;
        // Match Brick.tsx render math: group at [bx, bz, by] with box
        // [sx, sz, sy] centered on position. Rotation spins the group around Y
        // so the footprint visually flips, just like a placed brick will.
        return (
          <group
            position={[hoverCell[0], hoverCell[2], hoverCell[1]]}
            rotation={[0, rotRad, 0]}
            raycast={() => null}
          >
            <mesh raycast={() => null}>
              <boxGeometry args={[sx - 0.02, sz - 0.02, sy - 0.02]} />
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
              <edgesGeometry args={[new THREE.BoxGeometry(sx, sz, sy)]} />
              <lineBasicMaterial color="#ffffff" transparent opacity={0.9} />
            </lineSegments>
          </group>
        );
      })()}

      {/* Module preview ghost: render every part of the picked module as a
          translucent cube at hoverCell + offset. */}
      {hoverCell && modulePreviewParts && modulePreviewParts.length > 0 && showBaseplate &&
        modulePreviewParts.map((part, i) => {
          const [sx, sy, sz] = sizeOf(part.type);
          const px = hoverCell[0] + part.offset[0];
          const py = hoverCell[1] + part.offset[1];
          const pz = hoverCell[2] + part.offset[2];
          return (
            <group
              key={i}
              position={[px, pz, py]}
              raycast={() => null}
            >
              <mesh raycast={() => null}>
                <boxGeometry args={[sx - 0.02, sz - 0.02, sy - 0.02]} />
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
                <edgesGeometry args={[new THREE.BoxGeometry(sx, sz, sy)]} />
                <lineBasicMaterial color="#ffffff" transparent opacity={0.9} />
              </lineSegments>
            </group>
          );
        })}

      {visible.map((b) => (
        <Brick
          key={b.id}
          brick={b}
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
