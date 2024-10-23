import { notFound } from 'next/navigation';

import FoggyBackground from '@/components/foggy-background';
import { HorrificCreatureCard } from '@/components/horrific-creature-card';

import { getCreaturesPage, getTotalPages } from '@/lib/db';

import { Pagination } from '../pagination';

export const revalidate = 10;

export default async function Page({
  params,
}: {
  params: { pageIndex: string };
}) {
  const pageIndex = parseInt(params.pageIndex);
  if (isNaN(pageIndex)) {
    return notFound();
  }
  const creatures = await getCreaturesPage(pageIndex);
  const totalPages = await getTotalPages();

  return (
    <div className="container mx-auto px-4 py-8">
      <FoggyBackground />
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

export const generateStaticParams = async () => {
  const totalPages = await getTotalPages();

  return Array.from({ length: totalPages }, (_, i) => ({
    pageIndex: i.toString(),
  }));
};
