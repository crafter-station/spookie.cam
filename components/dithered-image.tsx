'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const sizes = {
  sm: 300,
  md: 500,
  lg: 750,
} as const;

// 1x1 pixel black GIF
const DEFAULT_BLUR_DATA_URL =
  'data:image/jpeg;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

export const DitheredImage = ({
  id,
  size,
  alt,
  blurDataURL,
}: {
  size?: keyof typeof sizes;
  id: string;
  alt?: string | undefined;
  blurDataURL?: string | null;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const selectedSize = size || 'md';
  const imageUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${id}.jpg`;

  const hoverImageUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/multi/v1/dl_150/${id}_frame.gif`;

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Image
        alt={alt || 'a spooky image'}
        src={isHovered ? hoverImageUrl : imageUrl}
        width={sizes[selectedSize]}
        height={sizes[selectedSize]}
        className="object-cover"
        placeholder="blur"
        blurDataURL={blurDataURL || DEFAULT_BLUR_DATA_URL}
        unoptimized
      />
      {size !== 'lg' && (
        <Link href={`/pic/${id}`} className="absolute inset-0" />
      )}
    </div>
  );
};
