// LDraw exporter — converts our Block[] into a valid .ldr text file.
//
// LDraw conventions used here:
//   - Y axis points DOWN. Our `z` (height) → LDraw `-y`.
//   - 1 stud (X/Z footprint) = 20 LDU. Our `x`/`y` → LDraw `x`/`z` × 20.
//   - 1 brick height = 24 LDU.
//   - Each part is centered XZ at its origin with bottom at Y=0.
//   - Rotation: we rotate around the vertical (Y in LDraw) axis. Our
//     `rotation` is degrees (0/90/180/270).
//
// References:
//   https://www.ldraw.org/article/218.html (file format spec)
//   https://www.bricklink.com/catalogList.asp (part numbers)

import type { Block, Rotation } from "@blockgame/shared";

const LDU_STUD = 20;
const LDU_BRICK_H = 24;

/** Our brick types → LDraw part numbers. */
const PART_MAP: Record<string, string> = {
  brick_1x1: "3005.dat", // Brick 1 x 1
  brick_1x2: "3004.dat", // Brick 1 x 2
  brick_2x2: "3003.dat", // Brick 2 x 2
  brick_2x4: "3001.dat", // Brick 2 x 4
  brick_1x8: "3008.dat", // Brick 1 x 8
  slope_1x2: "3040.dat", // Slope Brick 45 2 x 1
  slope_2x2: "3039.dat", // Slope Brick 45 2 x 2
  window_1x2: "60593.dat", // Window 1 x 2 x 2 Plain
  window_2x2: "60592.dat", // Window 2 x 2 x 2 (closest plain)
  // voxel_1x1 (Minecraft) maps to a 1x1 brick — Minecraft scenes still export.
  voxel_1x1: "3005.dat",
  // door_1x3 → handled specially: 3 stacked 1x1 bricks (LDraw door parts have
  // wildly different geometries; flat stack reads cleanly in any viewer).
};

/** Hex color → LDraw color code (using BrickLink/LEGO catalog standards). */
const COLOR_MAP: Record<string, number> = {
  "#E4202B": 4, // Red
  "#FF0000": 4,
  "#FFCD00": 14, // Yellow
  "#FFFF00": 14,
  "#006CB7": 1, // Blue
  "#0066FF": 1,
  "#00852B": 2, // Green
  "#00FF00": 2,
  "#F5F4EF": 15, // White
  "#FFFFFF": 15,
  "#14110D": 0, // Black
  "#000000": 0,
  "#9AA0A5": 71, // Light Bluish Gray
  "#808080": 71,
  "#FE8A18": 25, // Orange
  "#FFA500": 25,
  "#8B4513": 70, // Reddish Brown
  "#FF66B2": 5, // Pink (Light Pink)
  "#800080": 22, // Dark Purple
};

function colorCode(hex: string): number {
  return COLOR_MAP[hex.toUpperCase()] ?? 16; // 16 = "current color" (inherits)
}

function rotMatrix(deg: Rotation): [number, number, number, number, number, number, number, number, number] {
  // Rotation around LDraw's Y axis (vertical). Row-major:
  //   | a b c |
  //   | d e f |
  //   | g h i |
  switch (deg) {
    case 90:
      return [0, 0, -1, 0, 1, 0, 1, 0, 0];
    case 180:
      return [-1, 0, 0, 0, 1, 0, 0, 0, -1];
    case 270:
      return [0, 0, 1, 0, 1, 0, -1, 0, 0];
    case 0:
    default:
      return [1, 0, 0, 0, 1, 0, 0, 0, 1];
  }
}

function n(v: number): string {
  // LDraw is fine with integers; trim noisy floats from rotation math.
  if (Number.isInteger(v)) return String(v);
  return Number(v.toFixed(4)).toString();
}

function emitLine(
  color: number,
  pos: [number, number, number],
  rot: Rotation,
  part: string,
): string {
  const [gx, gy, gz] = pos;
  const lx = gx * LDU_STUD;
  const ly = -gz * LDU_BRICK_H;
  const lz = gy * LDU_STUD;
  const [a, b, c, d, e, f, g, h, i] = rotMatrix(rot);
  return `1 ${color} ${n(lx)} ${n(ly)} ${n(lz)} ${n(a)} ${n(b)} ${n(c)} ${n(d)} ${n(e)} ${n(f)} ${n(g)} ${n(h)} ${n(i)} ${part}`;
}

export interface LdrawStats {
  exported: number;
  skipped: { type: string; count: number }[];
}

export function blocksToLdraw(
  blocks: Block[],
  modelName = "design",
): { text: string; stats: LdrawStats } {
  const lines: string[] = [
    `0 ${modelName}`,
    `0 Name: ${modelName}.ldr`,
    `0 Author: 차곡차곡 (chagok-chagok)`,
    `0 !LDRAW_ORG Unofficial_Model`,
    `0 !LICENSE Redistributable under CCAL version 2.0 : see CAreadme.txt`,
    "",
  ];

  const skipped = new Map<string, number>();
  let exported = 0;

  for (const b of blocks) {
    const rot = (b.rotation ?? 0) as Rotation;
    const color = colorCode(b.color);

    if (b.type === "door_1x3") {
      // Decompose into 3 stacked 1x1 bricks at (gx, gy, gz), (gx, gy, gz+1), (gx, gy, gz+2).
      const [gx, gy, gz] = b.position;
      for (let dz = 0; dz < 3; dz++) {
        lines.push(emitLine(color, [gx, gy, gz + dz], rot, "3005.dat"));
        exported++;
      }
      continue;
    }

    if (b.type === "baseplate_16x16") {
      // Skip — LDraw users typically add their own baseplate piece.
      skipped.set(b.type, (skipped.get(b.type) ?? 0) + 1);
      continue;
    }

    const part = PART_MAP[b.type];
    if (!part) {
      skipped.set(b.type, (skipped.get(b.type) ?? 0) + 1);
      continue;
    }
    lines.push(emitLine(color, b.position, rot, part));
    exported++;
  }

  return {
    text: lines.join("\n") + "\n",
    stats: {
      exported,
      skipped: [...skipped.entries()].map(([type, count]) => ({ type, count })),
    },
  };
}

export function downloadLdraw(blocks: Block[], filename = "design.ldr"): LdrawStats {
  const name = filename.replace(/\.ldr$/, "");
  const { text, stats } = blocksToLdraw(blocks, name);
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return stats;
}
