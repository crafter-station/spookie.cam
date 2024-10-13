import { v2 as cloudinary } from 'cloudinary';

import { DitheredImage } from '@/components/dithered-image';

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
        caption: string | undefined;
      };
    }[];
  };

  return (
    <div className="mx-auto max-w-6xl">
      <h1>Mine</h1>

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
    </div>
  );
}
