'use server';

import { cache } from 'react';

import { cloudinary } from '@/lib/cloudinary';
import { getBase64Image } from '@/lib/get-base-64-image';

import { PAGE_SIZE } from './page-size';

export const getAllImages = cache(async () => {
  const data = (await cloudinary.search
    .expression('tags=public')
    .fields('context')
    .sort_by('created_at', 'desc')
    .max_results(500)
    .execute()) as {
    total_count: number;
    resources: {
      public_id: string;
      context: {
        caption: string | undefined;
      };
    }[];
  };

  return data.resources || [];
});

export const getImagesPage = cache(async (pageIndex: number) => {
  const data = await getAllImages();

  const startIndex = pageIndex * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;

  const resources = data.slice(startIndex, endIndex);

  const blurDataURLs = await Promise.all(
    resources.map(({ public_id }) => getBase64Image(public_id)),
  );

  return resources.map((resource) => ({
    id: resource.public_id,
    caption: resource.context.caption?.replace(/"/g, ''),
    blurDataURL: blurDataURLs.find((x) => x.id === resource.public_id)?.dataURL,
  }));
});
