import { notFound } from 'next/navigation';

import { CardDescription, CardTitle } from '@/components/ui/card';
import { DitheredImage } from '@/components/dithered-image';

import { getAllImages, getImagesPage } from '../getImages';
import { PAGE_SIZE } from '../page-size';
import { Pagination } from '../pagination';

export const revalidate = 10;

export default async function Page({
  params,
}: {
  params: { pageIndex: string };
}) {
  const pageIndex = parseInt(params.pageIndex);
  if (isNaN(pageIndex)) {
    return notFound();
  }
  const images = await getImagesPage(pageIndex);
  const allImages = await getAllImages();
  const totalPages = Math.ceil(allImages.length / PAGE_SIZE);

  return (
    <>
      <CardTitle>Gallery</CardTitle>
      <CardDescription>Hot pics right now!</CardDescription>

      <div className="grid grid-cols-1 gap-16">
        {images.map(({ id, caption, blurDataURL }) => (
          <div
            key={id}
            className="flex flex-col items-center justify-center space-y-2"
          >
            <DitheredImage id={id} alt={caption} blurDataURL={blurDataURL} />
            {caption ? (
              <p className="font-mono text-xs italic text-muted-foreground">
                {caption}
              </p>
            ) : null}
          </div>
        ))}
      </div>

      <Pagination totalPages={totalPages} />
    </>
  );
}

export const generateStaticParams = async () => {
  const allImages = await getAllImages();
  const totalPages = Math.max(1, Math.ceil(allImages.length / PAGE_SIZE));
  return Array.from({ length: totalPages }, (_, i) => ({
    pageIndex: i.toString(),
  }));
};
