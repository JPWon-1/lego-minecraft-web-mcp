import React from "react";
export const Stud: React.FC<{ position: [number, number, number]; color: string }> = ({ position, color }) => (
  <mesh position={position}>
    <cylinderGeometry args={[0.25, 0.25, 0.2, 16]} />
    <meshStandardMaterial color={color} />
  </mesh>
);
