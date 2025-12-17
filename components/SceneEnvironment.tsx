import React from 'react';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';
import { SceneTheme } from '../data/themes';
import { Snow, AmbientParticles } from './Snow';

interface SceneEnvironmentProps {
  theme: SceneTheme;
}

export const SceneEnvironment: React.FC<SceneEnvironmentProps> = ({ theme }) => {
  return (
    <>
      {/* Fog */}
      <fog attach="fog" args={[theme.fogColor, 10, 50]} />

      {/* Ambient Light */}
      <ambientLight intensity={theme.ambientIntensity} color={theme.ambientColor} />

      {/* Main directional light (sun/moon) */}
      <directionalLight
        position={[10, 20, 10]}
        intensity={theme.mainLightIntensity}
        color={theme.mainLightColor}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
        shadow-bias={-0.0001}
      />

      {/* Accent light for color atmosphere */}
      <pointLight
        position={[-8, 6, -8]}
        intensity={theme.accentLightIntensity}
        color={theme.accentLightColor}
        distance={25}
      />

      {/* Secondary accent from opposite side */}
      <pointLight
        position={[8, 4, 8]}
        intensity={theme.accentLightIntensity * 0.5}
        color={theme.accentLightColor}
        distance={20}
      />

      {/* Rim light for tree outline */}
      <spotLight
        position={[0, 15, -10]}
        angle={0.4}
        penumbra={1}
        intensity={0.3}
        color="#ffffff"
      />

      {/* Stars */}
      {theme.starsVisible && (
        <Stars
          radius={80}
          depth={50}
          count={3000}
          factor={4}
          saturation={0.2}
          fade
          speed={0.5}
        />
      )}

      {/* Snowfall */}
      {theme.snowfall && (
        <Snow
          count={1500}
          intensity={theme.snowfallIntensity}
          area={25}
          speed={1.2}
        />
      )}

      {/* Ambient particles (magic dust) */}
      <AmbientParticles count={80} color={theme.accentLightColor} area={12} />

      {/* Ground plane */}
      <mesh
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -3.21, 0]}
      >
        <circleGeometry args={[20, 64]} />
        <meshStandardMaterial
          color={theme.groundColor}
          roughness={0.9}
          metalness={0}
        />
      </mesh>

      {/* Ground glow ring around tree base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.17, 0]}>
        <ringGeometry args={[2.5, 4, 64]} />
        <meshBasicMaterial
          color={theme.accentLightColor}
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Sky gradient (simple colored plane far away) */}
      <mesh position={[0, 20, -40]} rotation={[0.2, 0, 0]}>
        <planeGeometry args={[120, 60]} />
        <meshBasicMaterial color={theme.skyColor} fog={false} />
      </mesh>
    </>
  );
};
