'use client';

import React, { useEffect, useRef, useState } from 'react';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  Bloom,
  DepthOfField,
  EffectComposer,
  Glitch,
  Noise,
  Vignette,
} from '@react-three/postprocessing';
import { BlendFunction, GlitchMode } from 'postprocessing';
import * as THREE from 'three';
import { Vector2 } from 'three';

const VHSShader = {
  uniforms: {
    tDiffuse: { value: null },
    time: { value: 0 },
    distortion: { value: 0.1 },
    chaos: { value: 0.5 },
    ghosting: { value: 0.3 },
    flickerIntensity: { value: 0.05 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float time;
    uniform float distortion;
    uniform float chaos;
    uniform float ghosting;
    uniform float flickerIntensity;
    varying vec2 vUv;
    
    float rand(vec2 co) {
      return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
    }
    
    void main() {
      vec2 p = vUv;
      
      // Chaotic distortion
      float distortAmount = sin(p.y * 20.0 + time) * 0.02 * chaos;
      p.x += distortAmount;
      
      // Vertical distortion
      float vertJitter = rand(vec2(time, p.y)) * 0.01 * chaos;
      p.y += vertJitter;
      
      // Ghosting effect
      vec4 color = texture2D(tDiffuse, p);
      vec4 ghostColor = texture2D(tDiffuse, p + vec2(0.005, 0.0) * ghosting);
      color = mix(color, ghostColor, 0.5);
      
      // Color bleeding
      float redShift = rand(vec2(time, p.y)) * 0.03 * chaos;
      float greenShift = rand(vec2(time + 1.0, p.y)) * 0.03 * chaos;
      float blueShift = rand(vec2(time + 2.0, p.y)) * 0.03 * chaos;
      color.r = texture2D(tDiffuse, p + vec2(redShift, 0.0)).r;
      color.g = texture2D(tDiffuse, p + vec2(greenShift, 0.0)).g;
      color.b = texture2D(tDiffuse, p + vec2(blueShift, 0.0)).b;
      
      // Noise and grain
      float noise = rand(p * time) * 0.1 * chaos;
      color.rgb += noise;
      
      // Flickering
      float flicker = 1.0 + (rand(vec2(time, 0.0)) - 0.5) * flickerIntensity;
      color.rgb *= flicker;
      
      // Vignette
      float vignette = 1.0 - smoothstep(0.5, 1.5, length(p - 0.5));
      color.rgb *= vignette;
      
      gl_FragColor = color;
    }
  `,
};

const VHSEffect = () => {
  const { gl } = useThree();
  const shaderRef = useRef<THREE.ShaderMaterial>(null);

  useEffect(() => {
    if (shaderRef.current) {
      const renderTarget = new THREE.WebGLRenderTarget(
        gl.domElement.width,
        gl.domElement.height,
        {
          minFilter: THREE.LinearFilter,
          magFilter: THREE.LinearFilter,
          format: THREE.RGBAFormat,
          stencilBuffer: false,
          depthBuffer: true,
        },
      );
      shaderRef.current.uniforms.tDiffuse.value = renderTarget.texture;
    }
  }, [gl]);

  useFrame((_, delta) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.time.value += delta;
    }
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={shaderRef}
        args={[VHSShader]}
        uniforms-tDiffuse-value={null}
        transparent
      />
    </mesh>
  );
};

interface SceneProps {
  settings: {
    glitchIntensity: number;
    noiseOpacity: number;
    vignetteIntensity: number;
    bloomIntensity: number;
    dofFocusDistance: number;
  };
  glitchActive: boolean;
}

const Scene: React.FC<SceneProps> = ({ settings, glitchActive }) => {
  const { gl } = useThree();

  useEffect(() => {
    // Configure renderer
    gl.outputEncoding = THREE.sRGBEncoding;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
  }, [gl]);

  return (
    <>
      <VHSEffect />
      <EffectComposer>
        {glitchActive && (
          <Glitch
            delay={new Vector2(0.5, 1)}
            duration={new Vector2(0.1, 0.3)}
            strength={
              new Vector2(
                settings.glitchIntensity * 0.5,
                settings.glitchIntensity,
              )
            }
            mode={GlitchMode.CONSTANT_WILD}
            ratio={0.85}
          />
        )}
        <Noise
          premultiply
          blendFunction={BlendFunction.OVERLAY}
          opacity={settings.noiseOpacity}
        />
        <Vignette
          eskil={false}
          offset={0.1}
          darkness={settings.vignetteIntensity}
        />
        <Bloom
          intensity={settings.bloomIntensity}
          luminanceThreshold={0.3}
          luminanceSmoothing={0.9}
          height={300}
        />
        <DepthOfField
          focusDistance={settings.dofFocusDistance}
          focalLength={0.02}
          bokehScale={2}
          height={480}
        />
      </EffectComposer>
    </>
  );
};

const FoggyBackground = () => {
  const [isMounted, setIsMounted] = useState(false);
  const glitchTimeoutRef = useRef<NodeJS.Timeout>();
  const messageTimeoutRef = useRef<NodeJS.Timeout>();
  const glitchIntervalRef = useRef<NodeJS.Timeout>();
  const messageIntervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const [settings] = useState({
    glitchIntensity: 0.6,
    noiseOpacity: 0.3,
    vignetteIntensity: 0.7,
    chaos: 0.5,
    ghosting: 0.3,
    flickerIntensity: 0.05,
    bloomIntensity: 0.5,
    dofFocusDistance: 0.02,
  });

  const [glitchActive, setGlitchActive] = useState(false);
  const [spookyMessage, setSpookyMessage] = useState('');

  useEffect(() => {
    const triggerGlitch = () => {
      setGlitchActive(true);
      glitchTimeoutRef.current = setTimeout(
        () => {
          setGlitchActive(false);
        },
        50 + Math.random() * 150,
      );
    };

    glitchIntervalRef.current = setInterval(
      triggerGlitch,
      1000 + Math.random() * 2000,
    );

    return () => {
      if (glitchTimeoutRef.current) clearTimeout(glitchTimeoutRef.current);
      if (glitchIntervalRef.current) clearInterval(glitchIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    const messages = [
      "They're here",
      "Don't turn around",
      'Can you hear them?',
      "It's watching you",
      'Run.',
    ];

    const showMessage = () => {
      const message = messages[Math.floor(Math.random() * messages.length)];
      setSpookyMessage(message);
      messageTimeoutRef.current = setTimeout(() => setSpookyMessage(''), 2000);
    };

    messageIntervalRef.current = setInterval(
      showMessage,
      10000 + Math.random() * 20000,
    );

    return () => {
      if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
      if (messageIntervalRef.current) clearInterval(messageIntervalRef.current);
    };
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <div className="fixed inset-0 z-[-1] h-full w-full">
        <Canvas
          camera={{ position: [0, 0, 1] }}
          className="h-full w-full"
          gl={{
            antialias: true,
            alpha: true,
            preserveDrawingBuffer: true,
            stencil: false,
          }}
        >
          <color attach="background" args={['#000000']} />
          <Scene settings={settings} glitchActive={glitchActive} />
        </Canvas>
      </div>
      {spookyMessage && (
        <div className="pointer-events-none fixed inset-0 flex items-center justify-center">
          <p
            className="animate-pulse font-vcr text-4xl font-bold text-red-600"
            style={{
              textShadow: '0 0 10px #ff0000',
            }}
          >
            {spookyMessage}
          </p>
        </div>
      )}
    </>
  );
};

export default FoggyBackground;
