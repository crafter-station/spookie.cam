import { CardDescription, CardTitle } from '@/components/ui/card';
import { DitheredImage } from '@/components/dithered-image';

import { getAllImages, getImagesPage } from './getImages';
import { PAGE_SIZE } from './page-size';
import { Pagination } from './pagination';

export const revalidate = 10;

export default async function Page() {
  const images = await getImagesPage(0);
  const allImages = await getAllImages();

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

      <Pagination totalPages={Math.ceil(allImages.length / PAGE_SIZE)} />
    </>
  );
}
