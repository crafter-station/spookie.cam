import { v2 as cloudinary } from 'cloudinary';

import { DitheredImage } from '@/components/dithered-image';

import { vectorIndex } from '@/lib/vector';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function Page({ params }: { params: { id: string } }) {
  const data = (await cloudinary.api.resources_by_ids(
    process.env.CLOUDINARY_FOLDER_NAME + '/' + params.id,
    {
      context: true,
    },
  )) as {
    resources: {
      public_id: string;
      url: string;
      context: {
        custom: {
          caption: string | undefined;
        };
      };
    }[];
  };

  const image = data.resources[0];

  const [vector] = await vectorIndex.fetch(['e_' + params.id], {
    includeVectors: true,
  });

  const similarIds = vector?.vector
    ? await vectorIndex.query({
        vector: vector.vector,
        topK: 10,
        includeVectors: false,
      })
    : [];

  const similar =
    similarIds.length > 0
      ? ((await cloudinary.api.resources_by_ids(
          similarIds.map(
            (x) =>
              process.env.CLOUDINARY_FOLDER_NAME +
              '/' +
              (x.id as string).split('_')[1],
          ),
          {
            context: true,
            tags: true,
          },
        )) as {
          resources: {
            public_id: string;
            url: string;
            context: {
              custom: {
                caption: string | undefined;
              };
            };
            tags: string[];
          }[];
        })
      : null;

  return (
    <div className="mx-auto my-8 max-w-6xl">
      <h1 className="text-4xl font-bold">Single image</h1>

      <div className="grid grid-cols-1 gap-16">
        <div
          key={image.public_id}
          className="flex flex-col items-center justify-center space-y-2"
        >
          <DitheredImage
            size="lg"
            public_id={image.public_id}
            alt={
              image.context?.custom.caption
                ? image.context.custom.caption.replace(/"/g, '')
                : undefined
            }
          />
          {image.context?.custom.caption ? (
            <p className="font-mono italic text-muted-foreground">
              {image.context.custom?.caption.replace(/"/g, '')}
            </p>
          ) : null}
        </div>
      </div>

      {similar && similar.resources.length > 0 ? (
        <div className="mt-8 space-y-4">
          <h2 className="text-2xl font-semibold">Similar</h2>
          <div className="grid grid-cols-3 gap-16">
            {similar.resources.map(({ public_id, context, tags }) =>
              public_id.split('/')[1] === params.id ||
              !tags.includes('public') ? null : (
                <div
                  key={public_id}
                  className="flex flex-col items-center justify-center space-y-2"
                >
                  <DitheredImage
                    public_id={public_id}
                    alt={
                      context?.custom?.caption
                        ? context.custom.caption.replace(/"/g, '')
                        : undefined
                    }
                    size="sm"
                  />
                  {context?.custom?.caption ? (
                    <p className="font-mono text-xs italic text-muted-foreground">
                      {context.custom.caption.replace(/"/g, '')}
                    </p>
                  ) : null}
                </div>
              ),
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
