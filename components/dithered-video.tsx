'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

const sizes = {
  sm: 300,
  md: 500,
  lg: 750,
};

const transformations = [
  'e_contrast:50/e_ordered_dither:6/e_blackwhite:40',
  'e_contrast:50/e_ordered_dither:6/e_blackwhite:40/e_negate',
  'e_contrast:50/e_ordered_dither:6/e_oil_paint:30/e_blackwhite:40',
  'e_colorize:10/e_ordered_dither:6/e_oil_paint:30/e_blackwhite:20/e_negate',
  'e_contrast:50/e_ordered_dither:10/e_oil_paint:50/e_blackwhite:40',
  'e_colorize:10/e_ordered_dither:10/e_oil_paint:50/e_blackwhite:20/e_negate',
];

export const DitheredVideo = ({
  public_id,
  size = 'md',
  alt,
}: {
  size?: keyof typeof sizes;
  public_id: string;
  alt?: string;
}) => {
  const [videoUrl, setVideoUrl] = useState('');

  useEffect(() => {
    const generateVideoUrl = () => {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const bgRemoval = '';
      const transformationString = transformations
        .map(
          (t, i) =>
            `l_${public_id},w_${sizes[size]},h_${sizes[size]},c_scale/${t}/dl_150`,
        )
        .join('/');

      const url = `https://res.cloudinary.com/${cloudName}/video/upload/b_rgb:000000/${bgRemoval}${transformationString}/fl_loop.mp4`;
      setVideoUrl(url);
    };

    generateVideoUrl();
  }, [public_id, size]);

  return (
    <div className="relative">
      <video
        src={videoUrl}
        width={sizes[size]}
        height={sizes[size]}
        autoPlay
        loop
        muted
        playsInline
      >
        {alt && <track kind="captions" src="" label={alt} />}
      </video>
      <Link href={`/pic/${public_id}`} className="absolute inset-0" />
    </div>
  );
};
