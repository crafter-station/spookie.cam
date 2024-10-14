import { v2 as cloudinary } from 'cloudinary';

import { CardDescription, CardTitle } from '@/components/ui/card';
import { DitheredImage } from '@/components/dithered-image';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const revalidate = 30;

export default async function Page() {
  const data = (await cloudinary.search
    .expression('tags=public')
    .fields('context')
    .execute()) as {
    total_count: number;
    resources: {
      public_id: string;
      context: {
        caption: string | undefined;
      };
    }[];
  };

  return (
    <>
      <CardTitle>Gallery</CardTitle>
      <CardDescription>Hot pics right now!</CardDescription>

      <div className="grid grid-cols-1 gap-16">
        {data.resources.map(({ public_id, context }) => (
          <div
            key={public_id}
            className="flex flex-col items-center justify-center space-y-2"
          >
            <DitheredImage
              public_id={public_id}
              alt={
                context.caption ? context.caption.replace(/"/g, '') : undefined
              }
            />
            {context.caption ? (
              <p className="font-mono text-xs italic text-muted-foreground">
                {context.caption.replace(/"/g, '')}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </>
  );
}
