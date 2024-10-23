import { Suspense } from 'react';

import { CreatureDetails } from '@/components/creature-details';

import { getCreature } from '@/lib/db';

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
