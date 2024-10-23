import { InfoIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { CardDescription, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { DitheredImage } from '@/components/dithered-image';
import { MemeGenerator } from '@/components/meme-generator';

import { cloudinary } from '@/lib/cloudinary';
import { getBase64Image } from '@/lib/get-base-64-image';
import { vectorIndex } from '@/lib/vector';

import { ImageDownloadButton } from './download-button';
import { ShareButton } from './share-button';

export const revalidate = 30;

export function generateMetadata({ params }: { params: { id: string } }) {
  const ogImageUrl = `https://spookie.cam/api/og/${params.id}`;

  return {
    title: 'spookie.cam',
    description: 'Create your own spookie pics for free',
    openGraph: {
      title: 'spookie.cam',
      description: 'Create your own spookie pics for free',
      url: `https://spookie.cam/pic/${params.id}`,
      siteName: 'spookie.cam',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: 'spookie.cam',
        },
      ],
      locale: 'en-US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'spookie.cam',
      description: 'Create your own spookie pics for free',
      images: [ogImageUrl],
      creator: '@cuevaio',
    },
  };
}

export default async function Page({ params }: { params: { id: string } }) {
  const data = (await cloudinary.api.resources_by_ids(params.id, {
    context: true,
  })) as {
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

  const [vector] = await vectorIndex.fetch(['image_' + params.id], {
    includeVectors: true,
  });

  const similarIds = vector?.vector
    ? await vectorIndex.query({
        vector: vector.vector,
        topK: 12,
        includeVectors: false,
      })
    : [];

  const similar =
    similarIds.length > 0
      ? ((await cloudinary.api.resources_by_ids(
          similarIds.map((x) => (x.id as string).split('_')[1]),
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

  const images = [
    {
      id: image.public_id,
    },
  ];

  if (similar) {
    images.push(
      ...similar.resources.map(({ public_id }) => ({
        id: public_id,
      })),
    );
  }

  const blurDataURLs = await Promise.all(
    images.map(({ id }) => getBase64Image(id)),
  );

  return (
    <>
      <CardTitle className="flex items-center space-x-1">
        It&apos;s you?
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="ghost" className="size-5">
              <InfoIcon className="size-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="max-w-64">
            <p>
              Only you can see this pic without having the link. This picture
              isn&apos;t featured in any other page. Nobody can see this in
              Gallery or the &quot;similar&quot; section in other pics. If you
              want other people to see this, share the link with them.
            </p>
          </TooltipContent>
        </Tooltip>
      </CardTitle>
      <CardDescription>buenas noches</CardDescription>
      <div className="my-8 grid grid-cols-1 gap-16">
        <div
          key={image.public_id}
          className="flex flex-col items-center justify-center space-y-2"
        >
          <DitheredImage
            size="lg"
            id={image.public_id}
            alt={
              image.context?.custom.caption
                ? image.context.custom.caption.replace(/"/g, '')
                : undefined
            }
            blurDataURL={
              blurDataURLs.find((x) => x.id === image.public_id)?.dataURL
            }
          />
          {image.context?.custom.caption ? (
            <p className="font-mono italic text-muted-foreground">
              {image.context.custom?.caption.replace(/"/g, '')}
            </p>
          ) : null}
          <div className="flex flex-wrap justify-evenly gap-4">
            <ImageDownloadButton id={image.public_id} />
            <ShareButton id={image.public_id} />
            <MemeGenerator id={image.public_id} />
          </div>
        </div>
      </div>

      {similar && similar.resources.length > 0 ? (
        <div className="mt-8 space-y-4">
          <CardTitle>Similar</CardTitle>
          <div className="grid grid-cols-3 gap-16">
            {similar.resources.map(({ public_id, context, tags }) =>
              public_id === params.id || !tags.includes('public') ? null : (
                <div
                  key={public_id}
                  className="flex flex-col items-center justify-center space-y-2"
                >
                  <DitheredImage
                    id={public_id}
                    alt={
                      context?.custom?.caption
                        ? context.custom.caption.replace(/"/g, '')
                        : undefined
                    }
                    size="sm"
                    blurDataURL={
                      blurDataURLs.find((x) => x.id === public_id)?.dataURL
                    }
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
    </>
  );
}

export async function generateStaticParams() {
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

  return data.resources.map(({ public_id }) => ({ id: public_id }));
}
