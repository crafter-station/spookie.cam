'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

const sizes = {
  sm: 300,
  md: 500,
  lg: 750,
} as const;

export const DitheredImage = ({
  id,
  size,
  alt,
}: {
  size?: keyof typeof sizes;
  id: string;
  alt?: string | undefined;
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const selectedSize = size || 'md';

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const img = imgRef.current;
          if (img) {
            img.src = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/multi/v1/dl_150/${id}_frame.gif`;
          }
          observer.unobserve(entry.target);
        }
      },
      {
        rootMargin: '500px',
      },
    );

    observer.observe(imgRef.current);

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [id]);

  return (
    <div
      className="relative"
      style={{ width: sizes[selectedSize], height: sizes[selectedSize] }}
    >
      <img
        ref={imgRef}
        alt={alt || 'a spooky image'}
        width={sizes[selectedSize]}
        height={sizes[selectedSize]}
        onLoad={() => setIsLoaded(true)}
        style={{
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out',
          objectFit: 'cover',
          width: '100%',
          height: '100%',
        }}
      />
      <Link href={`/pic/${id}`} className="absolute inset-0" />
    </div>
  );
};
