import { v2 as cloudinary } from 'cloudinary';

import { CardDescription, CardTitle } from '@/components/ui/card';
import { DitheredImage } from '@/components/dithered-image';

import { getBase64Image } from '@/lib/get-base-64-image';
import { getUserId } from '@/lib/get-user-id';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function Page() {
  const userId = await getUserId();
  const data = (await cloudinary.api.resources_by_context(
    'user_id',
    `"${userId}"`,
    {
      context: true,
    },
  )) as {
    resources: {
      public_id: string;
      context: {
        custom: {
          caption: string | undefined;
        };
      };
    }[];
  };

  const blurDataURLs = await Promise.all(
    data.resources.map(({ public_id }) => getBase64Image(public_id)),
  );

  return (
    <>
      <CardTitle>Your pics</CardTitle>
      <CardDescription>Only you can see them*</CardDescription>

      <div className="grid grid-cols-1 gap-16">
        {data.resources.map(({ public_id, context }) => (
          <div
            key={public_id}
            className="flex flex-col items-center justify-center space-y-2"
          >
            <DitheredImage
              id={public_id}
              alt={
                context.custom.caption
                  ? context.custom.caption.replace(/"/g, '')
                  : undefined
              }
              blurDataURL={
                blurDataURLs.find((x) => x.id === public_id)?.dataURL
              }
            />
            {context.custom.caption ? (
              <p className="font-mono text-xs italic text-muted-foreground">
                {context.custom.caption.replace(/"/g, '')}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </>
  );
}
