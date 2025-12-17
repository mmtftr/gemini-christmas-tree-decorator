import React, { useRef, useMemo, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ============================================
// BEAUTIFUL STARFIELD
// ============================================

interface StarFieldProps {
  count?: number;
  radius?: number;
  twinkleSpeed?: number;
  color?: string;
}

export const StarField: React.FC<StarFieldProps> = ({
  count = 2000,
  radius = 80,
  twinkleSpeed = 1,
  color = '#ffffff',
}) => {
  const meshRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Generate star positions with varied sizes and brightness
  const { positions, sizes, brightness } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const brightness = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Distribute stars on a sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = radius * (0.8 + Math.random() * 0.4);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6 + radius * 0.3; // Bias upward
      positions[i * 3 + 2] = r * Math.cos(phi);

      // Varied star sizes - some big bright ones, mostly small
      const sizeRoll = Math.random();
      if (sizeRoll > 0.98) {
        sizes[i] = 3 + Math.random() * 2; // Bright stars
      } else if (sizeRoll > 0.9) {
        sizes[i] = 1.5 + Math.random() * 1.5; // Medium stars
      } else {
        sizes[i] = 0.5 + Math.random() * 1; // Dim stars
      }

      // Random initial brightness phase
      brightness[i] = Math.random() * Math.PI * 2;
    }

    return { positions, sizes, brightness };
  }, [count, radius]);

  // Custom shader material for twinkling
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color(color) },
      },
      vertexShader: `
        attribute float size;
        attribute float brightness;
        varying float vBrightness;
        uniform float time;

        void main() {
          vBrightness = brightness;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

          // Twinkle effect based on time and brightness phase
          float twinkle = 0.7 + 0.3 * sin(time * 2.0 + brightness);

          gl_PointSize = size * twinkle * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        varying float vBrightness;

        void main() {
          // Circular star shape with soft glow
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);

          if (dist > 0.5) discard;

          // Soft glow falloff
          float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
          alpha = pow(alpha, 1.5);

          // Slight color variation based on brightness
          vec3 starColor = mix(color, vec3(1.0), 0.3);

          gl_FragColor = vec4(starColor, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, [color]);

  // Animate twinkling
  useFrame((state) => {
    if (shaderMaterial) {
      shaderMaterial.uniforms.time.value = state.clock.elapsedTime * twinkleSpeed;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={sizes}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-brightness"
          count={count}
          array={brightness}
          itemSize={1}
        />
      </bufferGeometry>
      <primitive object={shaderMaterial} attach="material" />
    </points>
  );
};

// ============================================
// SNOW PARTICLES
// ============================================

interface SnowProps {
  count?: number;
  intensity?: number; // 0-1
  area?: number;
  speed?: number;
}

export const Snow: React.FC<SnowProps> = ({
  count = 1000,
  intensity = 0.5,
  area = 20,
  speed = 1,
}) => {
  const meshRef = useRef<THREE.Points>(null);

  // Adjust count based on intensity
  const particleCount = Math.floor(count * intensity);

  // Create particle positions
  const particles = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      // Random position in a box
      positions[i * 3] = (Math.random() - 0.5) * area;
      positions[i * 3 + 1] = Math.random() * 15; // Height
      positions[i * 3 + 2] = (Math.random() - 0.5) * area;

      // Random fall speed
      velocities[i] = 0.5 + Math.random() * 1.5;

      // Random size
      sizes[i] = 0.02 + Math.random() * 0.04;
    }

    return { positions, velocities, sizes };
  }, [particleCount, area]);

  // Animate snow falling
  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const positions = meshRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < particleCount; i++) {
      // Fall down
      positions[i * 3 + 1] -= particles.velocities[i] * delta * speed;

      // Slight horizontal drift
      const time = state.clock.elapsedTime;
      positions[i * 3] += Math.sin(time + i) * 0.002;
      positions[i * 3 + 2] += Math.cos(time + i * 0.5) * 0.002;

      // Reset when below ground
      if (positions[i * 3 + 1] < -2) {
        positions[i * 3 + 1] = 12 + Math.random() * 3;
        positions[i * 3] = (Math.random() - 0.5) * area;
        positions[i * 3 + 2] = (Math.random() - 0.5) * area;
      }
    }

    meshRef.current.geometry.attributes.position.needsUpdate = true;
  });

  if (particleCount === 0) return null;

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={particleCount}
          array={particles.sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color="#ffffff"
        transparent
        opacity={0.8}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// Ambient floating particles (dust/magic)
interface AmbientParticlesProps {
  count?: number;
  color?: string;
  area?: number;
}

export const AmbientParticles: React.FC<AmbientParticlesProps> = ({
  count = 100,
  color = '#ffffff',
  area = 15,
}) => {
  const meshRef = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * area;
      positions[i * 3 + 1] = Math.random() * 8 - 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * area;
      speeds[i] = 0.2 + Math.random() * 0.3;
    }

    return { positions, speeds };
  }, [count, area]);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.elapsedTime;
    const positions = meshRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const speed = particles.speeds[i];
      positions[i * 3] += Math.sin(time * speed + i) * 0.003;
      positions[i * 3 + 1] += Math.cos(time * speed * 0.5 + i) * 0.002;
      positions[i * 3 + 2] += Math.sin(time * speed * 0.7 + i * 0.5) * 0.003;
    }

    meshRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color={color}
        transparent
        opacity={0.4}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};
