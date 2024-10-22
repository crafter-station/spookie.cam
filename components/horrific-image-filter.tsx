'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const baseShader = `
  uniform sampler2D tDiffuse;
  uniform float time;
  uniform float seed;
  uniform float threshold;
  varying vec2 vUv;

  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  vec2 vhs(vec2 uv, float time) {
    float glitch = step(0.99, sin(time * 20.0 * random(vec2(time))));
    float vshift = 0.1 * sin(time) * random(vec2(time));
    float y = mod(uv.y + vshift, 1.0);
    float scanline = sin(y * 800.0) * 0.04;
    float jitter = random(vec2(y * time)) * 2.0 - 1.0;
    float tracking = sin(y * 30.0 + time) * 0.001;
    uv.x += jitter * 0.01 + tracking;
    return uv;
  }

  vec3 toGrayscale(vec3 color) {
    return vec3(dot(color, vec3(0.299, 0.587, 0.114)));
  }

vec3 atkinsonDither(vec3 color, vec2 fragCoord) {
    float threshold = 0.75;
    vec3 grayscale = vec3(dot(color, vec3(0.299, 0.587, 0.114)));
    float gray = grayscale.r;
    
    float dither = step(threshold, gray + 
        step(1.5/16.0, mod(fragCoord.x, 4.0) + mod(fragCoord.y, 4.0) * 4.0) * (1.0/16.0) +
        step(2.5/16.0, mod(fragCoord.x + 1.0, 4.0) + mod(fragCoord.y, 4.0) * 4.0) * (1.0/16.0) +
        step(3.5/16.0, mod(fragCoord.x + 2.0, 4.0) + mod(fragCoord.y, 4.0) * 4.0) * (1.0/16.0) +
        step(4.5/16.0, mod(fragCoord.x, 4.0) + mod(fragCoord.y + 1.0, 4.0) * 4.0) * (1.0/16.0) +
        step(5.5/16.0, mod(fragCoord.x + 1.0, 4.0) + mod(fragCoord.y + 1.0, 4.0) * 4.0) * (1.0/16.0) +
        step(6.5/16.0, mod(fragCoord.x, 4.0) + mod(fragCoord.y + 2.0, 4.0) * 4.0) * (1.0/16.0)
    );
    
    return vec3(dither);
}

  //
  // Description : Array and textureless GLSL 2D/3D/4D simplex 
  //               noise functions.
  //      Author : Ian McEwan, Ashima Arts.
  //  Maintainer : stegu
  //     Lastmod : 20110822 (ijm)
  //     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
  //               Distributed under the MIT License. See LICENSE file.
  //               https://github.com/ashima/webgl-noise
  //               https://github.com/stegu/webgl-noise
  // 

  vec3 mod289(vec3 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }

  vec4 mod289(vec4 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }

  vec4 permute(vec4 x) {
    return mod289(((x*34.0)+1.0)*x);
  }

  vec4 taylorInvSqrt(vec4 r) {
    return 1.79284291400159 - 0.85373472095314 * r;
  }

  float snoise(vec3 v) { 
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

    // First corner
    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 =   v - i + dot(i, C.xxx) ;

    // Other corners
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    // Permutations
    i = mod289(i); 
    vec4 p = permute( permute( permute( 
              i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
            + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

    // Gradients: 7x7 points over a square, mapped onto an octahedron.
    // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
    float n_ = 0.142857142857; // 1.0/7.0
    vec3  ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);

    //Normalise gradients
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    // Mix final noise value
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                  dot(p2,x2), dot(p3,x3) ) );
  }
`;

const shaderEffects = [
  // Subtle Melt
  `
    vec2 direction = normalize(vUv - vec2(0.5));
    float dist = length(vUv - vec2(0.5));
    float melt = smoothstep(0.2, 0.8, sin(dist * 10.0 + seed));
    vec2 meltUV = vUv + direction * melt * 0.03;
    vec3 color = texture2D(tDiffuse, meltUV).rgb;
    gl_FragColor = vec4(toGrayscale(color), 1.0);
  `,
  // Subtle Fracture
  `
    vec2 fractureUV = vUv;
    float angle = atan(vUv.y - 0.5, vUv.x - 0.5);
    float radius = length(vUv - vec2(0.5));
    float fracture = step(0.95, sin(angle * 20.0 + seed));
    fractureUV += vec2(cos(angle), sin(angle)) * fracture * 0.02;
    vec3 color = texture2D(tDiffuse, fractureUV).rgb;
    gl_FragColor = vec4(toGrayscale(color), 1.0);
  `,

  // Subtle Swirl
  `
    vec2 centeredUV = vUv - vec2(0.5);
    float angle = atan(centeredUV.y, centeredUV.x);
    float radius = length(centeredUV);
    float swirl = radius * sin(seed);
    vec2 swirlUV = vec2(cos(angle + swirl), sin(angle + swirl)) * radius + vec2(0.5);
    vec3 color = texture2D(tDiffuse, swirlUV).rgb;
    gl_FragColor = vec4(toGrayscale(color), 1.0);
  `,

  // Subtle Pulse
  `
   float pulse = sin(seed) * 0.5 + 0.5;
    vec2 pulseUV = vUv + (vUv - vec2(0.5)) * pulse * 0.03;
    vec3 color = texture2D(tDiffuse, pulseUV).rgb;
    gl_FragColor = vec4(toGrayscale(color), 1.0);
  `,

  // Modified Subtle Gaze (Mandela Catalog-like)
  `
    vec2 eyeCenter1 = vec2(0.35, 0.4);
    vec2 eyeCenter2 = vec2(0.65, 0.4);
    float eyeRadius = 0.05;
    float eyeDist1 = distance(vUv, eyeCenter1);
    float eyeDist2 = distance(vUv, eyeCenter2);
    
    vec2 uv = vUv;
    if (eyeDist1 < eyeRadius || eyeDist2 < eyeRadius) {
      float distortion = sin(time * 2.0 + seed) * 0.1;
      uv += (uv - vec2(0.5)) * distortion;
    }
    
    // Mouth distortion
    vec2 mouthCenter = vec2(0.5, 0.7);
    float mouthDist = distance(vUv, mouthCenter);
    if (mouthDist < 0.1) {
      float mouthDistortion = sin(vUv.x * 50.0 + time + seed) * 0.02;
      uv.y += mouthDistortion;
    }
    
    vec3 color = texture2D(tDiffuse, uv).rgb;
    
    // Enhance contrast
    color = pow(color, vec3(1.2));
    
    // Add noise
    float noise = random(vUv * time) * 0.1;
    color += vec3(noise);
    
    gl_FragColor = vec4(toGrayscale(color), 1.0);
  `,

  // Modified Subtle Decay (Mandela Catalog-like)
  `
    vec2 uv = vUv;
    
    // Create a glitch effect
    float glitchIntensity = 0.02;
    if (random(vec2(floor(time * 10.0), floor(vUv.y * 10.0))) > 0.95) {
      uv.x += (random(vec2(time)) - 0.5) * glitchIntensity;
    }
    
    // Create a stretching effect
    float stretch = sin(uv.y * 10.0 + time + seed) * 0.01;
    uv.x += stretch;
    
    // Create a wavey effect
    float wave = sin(uv.y * 30.0 + time * 2.0) * 0.002;
    uv.x += wave;
    
    vec3 color = texture2D(tDiffuse, uv).rgb;
    
    // Add static noise
    float noise = random(uv * time) * 0.1;
    color += vec3(noise);
    
    // Enhance contrast
    color = pow(color, vec3(1.3));
    
    // Add vertical scanning lines
    float scanline = sin(uv.y * 800.0 + time * 10.0) * 0.02;
    color += vec3(scanline);
    
    // Add vignette
    float vignette = 1.0 - smoothstep(0.5, 1.5, length(vUv - 0.5));
    color *= vignette;
    
    gl_FragColor = vec4(toGrayscale(color), 1.0);
  `,
  // Subtle Phobia
  `
    vec2 centeredUV = vUv - vec2(0.5);
    float angle = atan(centeredUV.y, centeredUV.x);
    float radius = length(centeredUV);
    float distortion = sin(angle * 10.0 + seed) * 0.02;
    vec2 distortedUV = vec2(cos(angle), sin(angle)) * (radius + distortion) + vec2(0.5);
    vec3 color = texture2D(tDiffuse, distortedUV).rgb;
    gl_FragColor = vec4(toGrayscale(color), 1.0);
  `,

  // Subtle Reflection
  `
    vec2 reflectUV = vec2(1.0 - vUv.x, vUv.y);
    vec3 color = texture2D(tDiffuse, vUv).rgb;
    vec3 reflectColor = texture2D(tDiffuse, reflectUV).rgb;
    float mirror = smoothstep(0.48, 0.52, vUv.x);
    color = mix(color, reflectColor, mirror * 0.5);
    gl_FragColor = vec4(toGrayscale(color), 1.0);
  `,
  // Advanced Melt
  `
    vec2 meltUv = vUv;
    
    // Create a complex noise pattern for the melt
    float noise = snoise(vec3(meltUv * 5.0, seed));
    noise += 0.5 * snoise(vec3(meltUv * 10.0, seed + 1.0));
    noise += 0.25 * snoise(vec3(meltUv * 20.0, seed + 2.0));
    noise = noise / (1.0 + 0.5 + 0.25); // Normalize
    
    // Create multiple melt directions
    vec2 meltDir1 = normalize(vec2(noise, 1.0));
    vec2 meltDir2 = normalize(vec2(1.0, noise));
    
    // Apply melt effect
    float meltIntensity = 0.03; // Adjust for subtlety
    meltUv += meltDir1 * noise * meltIntensity;
    meltUv += meltDir2 * noise * meltIntensity * 0.5;
    
    // Add some waviness to the melt
    float wave = sin(meltUv.y * 20.0 + seed) * 0.005;
    meltUv.x += wave;
    
    // Create a "dripping" effect
    float drip = max(0.0, noise - 0.7) * 0.1;
    meltUv.y += drip;
    
    // Sample the texture with our melted UV coordinates
    vec3 color = texture2D(tDiffuse, meltUv).rgb;
    
    // Add some color variation to simulate heat
    float heat = smoothstep(0.2, 0.8, noise);
    color = mix(color, color * vec3(1.2, 0.8, 0.8), heat * 0.3);
    
    // Darken the edges of the melt
    float edgeDarkness = smoothstep(0.4, 0.5, noise);
    color *= 1.0 - edgeDarkness * 0.3;
    
    // Convert to grayscale
    float gray = dot(color, vec3(0.299, 0.587, 0.114));
    
    // Add a subtle vignette
    vec2 vignetteUv = meltUv * (1.0 - meltUv.yx);
    float vignette = vignetteUv.x * vignetteUv.y * 15.0;
    vignette = pow(vignette, 0.25);
    gray *= vignette;
    
    gl_FragColor = vec4(vec3(gray), 1.0);
  `,
  // Enhanced Dither
  `
    vec3 color = texture2D(tDiffuse, vUv).rgb;
    float gray = dot(color, vec3(0.299, 0.587, 0.114));
    
    // Create a more complex dither pattern
    float x = mod(gl_FragCoord.x, 4.0);
    float y = mod(gl_FragCoord.y, 4.0);
    float dither = mod(x + y * 4.0, 16.0) / 16.0;
    
    // Apply dither
    gray = step(dither, gray);
    
    gl_FragColor = vec4(vec3(gray), 1.0);
  `,

  // Modified Error Diffusion Dither
  `
    vec3 color = texture2D(tDiffuse, vUv).rgb;
    float gray = dot(color, vec3(0.299, 0.587, 0.114));
    
    // Create a pseudo-random dither pattern
    vec2 seed = vUv + fract(time);
    float noise = fract(sin(dot(seed, vec2(12.9898, 78.233))) * 43758.5453);
    
    // Apply dither with error diffusion simulation
    float dither = step(noise * 0.75, gray);
    float error = (gray - dither) * 0.75;
    
    // Simulate error diffusion by adding some of the error back
    gray += error * noise;
    
    gl_FragColor = vec4(vec3(step(0.5, gray)), 1.0);
  `,

  // Simplified Atkinson-like Dither
  `
    vec3 color = texture2D(tDiffuse, vUv).rgb;
    float gray = dot(color, vec3(0.299, 0.587, 0.114));
    
    // Create a pseudo-random dither pattern
    vec2 seed = vUv + fract(time);
    float noise = fract(sin(dot(seed, vec2(12.9898, 78.233))) * 43758.5453);
    
    // Apply dither with Atkinson-like pattern
    float dither_amount = 0.75; // Adjust this for more or less dithering
    float dither_threshold = 0.5 + (noise - 0.5) * dither_amount;
    
    float dithered = step(dither_threshold, gray);
    
    // Simulate error diffusion
    float error = (gray - dithered) * 0.75;
    gray += error * noise;
    
    gl_FragColor = vec4(vec3(step(0.5, gray)), 1.0);
  `,
];

function createShader(effectCode: string) {
  return {
    uniforms: {
      tDiffuse: { value: null },
      time: { value: 0 },
      seed: { value: 0 },
      resolution: { value: new THREE.Vector2() },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      ${baseShader}
      void main() {
        ${effectCode}
        vec2 vhsUv = vhs(vUv, time);
        vec3 vhsColor = texture2D(tDiffuse, vhsUv).rgb;
        vec3 finalColor = mix(gl_FragColor.rgb, toGrayscale(vhsColor), 0.2);
        finalColor = atkinsonDither(finalColor, gl_FragCoord.xy);
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `,
  };
}

function HorrificEffect({
  texture,
  effectIndex,
}: {
  texture: THREE.Texture;
  effectIndex: number;
}) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { viewport } = useThree();
  const seed = useRef(Math.random() * 1000);

  const shader = useMemo(() => {
    return createShader(shaderEffects[effectIndex]);
  }, [effectIndex]);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = clock.getElapsedTime();
      materialRef.current.uniforms.resolution.value.set(
        texture.image.width,
        texture.image.height,
      );
    }
  });

  const aspectRatio = texture.image.width / texture.image.height;
  const scale = Math.min(viewport.width, viewport.height * aspectRatio);

  return (
    <mesh scale={[scale, scale / aspectRatio, 1]}>
      <planeGeometry />
      <shaderMaterial
        ref={materialRef}
        args={[shader]}
        uniforms-tDiffuse-value={texture}
        uniforms-seed-value={seed.current}
        uniforms-resolution-value={[texture.image.width, texture.image.height]}
      />
    </mesh>
  );
}

export function HorrificImageFilter() {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [selectedEffect, setSelectedEffect] = useState<number>(0);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load('/man-3.webp', (loadedTexture) => {
      console.log(
        'Texture loaded:',
        loadedTexture.image.width,
        loadedTexture.image.height,
      );
      setTexture(loadedTexture);
    });
  }, []);

  if (!texture) {
    return <div>Loading...</div>;
  }

  const effectNames = [
    'Subtle Melt',
    'Subtle Fracture',
    'Subtle Swirl',
    'Subtle Pulse',
    'Subtle Gaze',
    'Subtle Decay',
    'Subtle Phobia',
    'Subtle Reflection',
    'Advanced Melt',
    'Enhanced Dither',
    'Error Diffusion Dither',
    'Atkinson-like Dither',
  ];

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas orthographic camera={{ zoom: 1, position: [0, 0, 100] }}>
        <HorrificEffect texture={texture} effectIndex={selectedEffect} />
      </Canvas>
      <div style={{ position: 'absolute', bottom: 10, left: 10 }}>
        <select
          value={selectedEffect}
          onChange={(e) => setSelectedEffect(Number(e.target.value))}
          style={{ background: 'black', color: 'white', padding: '5px' }}
        >
          {effectNames.map((name, index) => (
            <option key={index} value={index}>
              {name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
