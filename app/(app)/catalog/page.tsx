import { HorrificCreatureCard } from '@/components/horrific-creature-card';

import { getCreaturesPage, getTotalPages } from '@/lib/db';

import { Pagination } from './pagination';

export const revalidate = 10;

export default async function Home() {
  const creatures = await getCreaturesPage(1);
  const totalPages = await getTotalPages();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-center text-4xl font-bold">Creepy Creatures</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {creatures.map((creature) => (
          <HorrificCreatureCard
            key={creature.id}
            name={creature.name}
            cloudinaryPublicId={creature.cloudinary_public_id}
            effectIndex={creature.effect_index}
          />
        ))}
      </div>
      <Pagination totalPages={totalPages} />
    </div>
  );
}
