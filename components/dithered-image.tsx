'use client';

import React from 'react';
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
  useOriginal = true,
}: {
  size?: keyof typeof sizes;
  id: string;
  alt?: string | undefined;
  blurDataURL?: string | null;
  useOriginal?: boolean;
}) => {
  const selectedSize = size || 'md';
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  const imageUrl = useOriginal
    ? `https://res.cloudinary.com/${cloudName}/image/upload/${id}`
    : `https://res.cloudinary.com/${cloudName}/image/multi/v1/dl_150/${id}_frame.gif`;

  return (
    <div className="relative">
      <Image
        alt={alt || 'a spooky image'}
        src={imageUrl}
        width={sizes[selectedSize]}
        height={sizes[selectedSize]}
        className="object-cover"
        placeholder="blur"
        blurDataURL={blurDataURL || DEFAULT_BLUR_DATA_URL}
      />
      {size !== 'lg' && (
        <Link href={`/pic/${id}`} className="absolute inset-0" />
      )}
    </div>
  );
};
