'use client';

import React, { useEffect, useRef } from 'react';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const NavbarMaterial = {
  uniforms: {
    time: { value: 0 },
    resolution: { value: new THREE.Vector2() },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float time;
    uniform vec2 resolution;
    varying vec2 vUv;

    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }

    void main() {
      vec2 st = vUv;
      float r = random(st + 0.01 * time);
      float g = random(st + 0.02 * time);
      float b = random(st + 0.03 * time);
      
      float noise = random(st * 100.0 + time);
      float glitch = step(0.98, noise);
      
      vec3 color = mix(vec3(r, g, b), vec3(0.0, 0.0, 0.0), 0.9);
      color = mix(color, vec3(1.0), glitch);
      
      gl_FragColor = vec4(color, 0.3);
    }
  `,
};

function NavbarEffect() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { size } = useThree();

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.resolution.value.set(
        size.width,
        size.height,
      );
    }
  }, [size]);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = clock.getElapsedTime();
    }
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial ref={materialRef} args={[NavbarMaterial]} transparent />
    </mesh>
  );
}

export function NavbarShader() {
  return (
    <Canvas
      orthographic
      camera={{ zoom: 1, position: [0, 0, 100] }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    >
      <NavbarEffect />
    </Canvas>
  );
}
