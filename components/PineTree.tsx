import React, { useRef, useMemo } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeConfig } from '../types';

interface PineTreeProps {
  config: TreeConfig;
  onPointerMove?: (e: ThreeEvent<PointerEvent>) => void;
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
  onPointerOut?: (e: ThreeEvent<PointerEvent>) => void;
}

export const PineTree: React.FC<PineTreeProps> = ({
  config,
  onPointerMove,
  onClick,
  onPointerOut,
}) => {
  const groupRef = useRef<THREE.Group>(null);

  // Gentle sway animation
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime();
      groupRef.current.rotation.y = Math.sin(time * 0.1) * 0.02;
    }
  });

  // Create a beautiful tiered pine tree
  const treeGeometry = useMemo(() => {
    const tiers = 5;
    const elements: JSX.Element[] = [];

    // Trunk
    elements.push(
      <mesh key="trunk" position={[0, 0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[config.radius * 0.1, config.radius * 0.15, 1.2, 16]} />
        <meshStandardMaterial color="#4a3728" roughness={0.9} metalness={0} />
      </mesh>
    );

    // Tree tiers (cones stacked)
    for (let i = 0; i < tiers; i++) {
      const tierProgress = i / (tiers - 1);
      const tierHeight = config.height * 0.28 * (1 - tierProgress * 0.15);
      const tierRadius = config.radius * (1.1 - tierProgress * 0.7);
      const yPos = 1.0 + i * (config.height * 0.18);

      // Main cone
      elements.push(
        <mesh
          key={`tier-${i}`}
          position={[0, yPos, 0]}
          castShadow
          receiveShadow
          name="tree-foliage"
          onPointerMove={onPointerMove}
          onClick={onClick}
          onPointerOut={onPointerOut}
        >
          <coneGeometry args={[tierRadius, tierHeight, 32]} />
          <meshStandardMaterial
            color={config.color}
            roughness={0.85}
            metalness={0.05}
            emissive={config.snowAmount > 0 ? '#e8f4f8' : '#000000'}
            emissiveIntensity={config.snowAmount * 0.25}
          />
        </mesh>
      );

      // Snow caps on top of each tier
      if (config.snowAmount > 0.1) {
        elements.push(
          <mesh
            key={`snow-${i}`}
            position={[0, yPos + tierHeight * 0.35, 0]}
            castShadow
          >
            <coneGeometry args={[tierRadius * 0.7, tierHeight * 0.3, 32]} />
            <meshStandardMaterial
              color="#f5f9fc"
              roughness={0.9}
              metalness={0}
              transparent
              opacity={Math.min(config.snowAmount * 1.5, 1)}
            />
          </mesh>
        );
      }
    }

    // Top spike
    const topY = 1.0 + (tiers - 1) * (config.height * 0.18) + config.height * 0.15;
    elements.push(
      <mesh
        key="top-spike"
        position={[0, topY, 0]}
        castShadow
        receiveShadow
        name="tree-foliage"
        onPointerMove={onPointerMove}
        onClick={onClick}
        onPointerOut={onPointerOut}
      >
        <coneGeometry args={[config.radius * 0.25, config.height * 0.25, 16]} />
        <meshStandardMaterial
          color={config.color}
          roughness={0.85}
          metalness={0.05}
          emissive={config.snowAmount > 0 ? '#e8f4f8' : '#000000'}
          emissiveIntensity={config.snowAmount * 0.25}
        />
      </mesh>
    );

    return elements;
  }, [config, onPointerMove, onClick, onPointerOut]);

  return (
    <group ref={groupRef} position={[0, -1, 0]}>
      {treeGeometry}
    </group>
  );
};
