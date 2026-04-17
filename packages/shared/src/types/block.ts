export type Track = "minecraft" | "lego";
export type Vec3 = [number, number, number];
export type Rotation = 0 | 90 | 180 | 270;

export interface Block {
  id: string;
  track: Track;
  type: string;
  position: Vec3;
  color: string;
  rotation?: Rotation;
  placed_at: number;
  turn_id: string;
}

export interface SceneSnapshot {
  blocks: Block[];
  camera: { position: Vec3; target: Vec3 };
  taken_at: number;
}
