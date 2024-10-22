import { DitheredImage } from '@/components/dithered-image';
import FoggyBackground from '@/components/foggy-background';

import { getAllImages, getImagesPage } from './getImages';
import { PAGE_SIZE } from './page-size';
import { Pagination } from './pagination';

export const revalidate = 10;

export default async function Page() {
  const images = await getImagesPage(0);
  const allImages = await getAllImages();

  return (
    <>
      <FoggyBackground />
      <div className="relative z-10 min-h-screen bg-transparent p-8 text-orange-500">
        <div className="grid grid-cols-1 gap-16">
          {images.map(({ id, caption, blurDataURL }) => (
            <div
              key={id}
              className="flex flex-col items-center justify-center space-y-2"
            >
              <DitheredImage id={id} alt={caption} blurDataURL={blurDataURL} />
              {caption ? (
                <p className="font-mono text-xs italic text-orange-300">
                  {caption}
                </p>
              ) : null}
            </div>
          ))}
        </div>

        <div className="mt-12">
          <Pagination totalPages={Math.ceil(allImages.length / PAGE_SIZE)} />
        </div>
      </div>
    </>
  );
}
