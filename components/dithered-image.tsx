'use client';

import React, { useEffect, useRef, useState } from 'react';

import { CldImage } from 'next-cloudinary';

const options = [
  'e_contrast:50/e_ordered_dither:6/e_blackwhite:40',
  'e_contrast:50/e_ordered_dither:6/e_blackwhite:40/e_negate',
  'e_contrast:50/e_ordered_dither:6/e_oil_paint:30/e_blackwhite:40',
  'e_colorize:10/e_ordered_dither:6/e_oil_paint:30/e_blackwhite:20/e_negate',
  'e_contrast:50/e_ordered_dither:10/e_oil_paint:50/e_blackwhite:40',
  'e_colorize:10/e_ordered_dither:10/e_oil_paint:50/e_blackwhite:20/e_negate',
];

export const DitheredImage = ({
  public_id,
  alt,
}: {
  public_id: string;
  alt?: string | undefined;
}) => {
  const [filter, setFilter] = useState<string>(options[0]);
  const [isInViewport, setIsInViewport] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  const [removeBg, setRemoveBg] = React.useState(true);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.1, // Trigger when at least 10% of the image is visible
      },
    );

    const currentImageRef = imageRef.current;

    if (currentImageRef) {
      observer.observe(currentImageRef);
    }

    return () => {
      if (currentImageRef) {
        observer.unobserve(currentImageRef);
      }
    };
  }, []);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isInViewport) {
      const changeFilter = () => {
        const randomIndex = Math.floor(Math.random() * options.length);
        setFilter(options[randomIndex]);
      };

      // Initial change
      changeFilter();

      // Set up interval to change filter every 300ms
      intervalId = setInterval(changeFilter, 150);
    }

    // Clean up interval when component unmounts or leaves viewport
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isInViewport]);
  // e_background_removal/
  return (
    <div ref={imageRef}>
      <CldImage
        src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload${removeBg ? '/e_background_removal' : ''}/b_rgb:000000/ar_4:3,c_auto_pad,g_auto/${filter}/v1/${public_id}.png`}
        width={500}
        height={500}
        preserveTransformations
        alt={alt || 'a spookie image'}
        className="h-auto w-auto"
        onError={() => setRemoveBg(false)}
      />
    </div>
  );
};
