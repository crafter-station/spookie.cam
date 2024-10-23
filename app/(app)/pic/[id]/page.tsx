import { Suspense } from 'react';

import { CreatureDetails } from '@/components/creature-details';

import { getAllCreatures, getCreature } from '@/lib/db';

export const revalidate = 10;

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

export default async function CreaturePage({
  params,
}: {
  params: { id: string };
}) {
  const creatureData = await getCreature(params.id);

  if (!creatureData) {
    return (
      <div className="mt-10 text-center font-vcr text-2xl text-red-500">
        Creature not found
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>Loading creature details...</div>}>
        <CreatureDetails creature={creatureData as any} />
      </Suspense>
    </div>
  );
}

export const generateStaticParams = async () => {
  const creatures = await getAllCreatures();
  return creatures.map((creature) => ({ id: creature.cloudinary_public_id }));
};
