'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';

import { HorrificEffect } from './horrific-image-filter';

interface HorrificCreatureCardProps {
  name: string | null;
  effectIndex: number;
  cloudinaryPublicId: string;
  isLink?: boolean;
  showName?: boolean;
}

export const HorrificCreatureCard: React.FC<HorrificCreatureCardProps> = ({
  name,
  effectIndex,
  cloudinaryPublicId,
  isLink = true,
  showName = false,
}) => {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const imageUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${cloudinaryPublicId}`;

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(imageUrl, (loadedTexture) => {
      setTexture(loadedTexture);
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        const aspectRatio =
          loadedTexture.image.height / loadedTexture.image.width;
        setDimensions({ width, height: width * aspectRatio });
      }
    });
  }, [imageUrl]);

  const content = (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-sm bg-[#0a0a0a] shadow-[0_0_15px_rgba(255,0,0,0.3)] transition-all duration-300 ease-in-out hover:shadow-[0_0_25px_rgba(255,0,0,0.5)]"
      style={{ width: '100%', height: dimensions.height }}
    >
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
      {texture && (
        <Canvas orthographic camera={{ zoom: 1, position: [0, 0, 100] }}>
          <HorrificEffect texture={texture} effectIndex={effectIndex} />
        </Canvas>
      )}
      {showName && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
          <h2 className="truncate font-vcr text-xl text-[#ff0000] shadow-[0_0_5px_rgba(255,0,0,0.7)]">
            {name || 'Unnamed Creature'}
          </h2>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent to-[rgba(0,0,0,0.3)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle,_transparent_50%,_rgba(0,0,0,0.5)_100%)]"></div>
    </div>
  );

  return isLink ? (
    <Link href={`/catalog/${cloudinaryPublicId}`} className="group block">
      {content}
    </Link>
  ) : (
    content
  );
};
