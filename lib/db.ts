import { cache } from 'react';

import { sql } from '@vercel/postgres';

import { PAGE_SIZE } from './constants';

export async function getCreature(cloudinaryPublicId: string) {
  const { rows } = await sql`
    SELECT 
      c.id, 
      c.cloudinary_public_id, 
      c.name, 
      c.synopsis, 
      c.caption,
      c.location,
      c.time,
      c.weather,
      c.effect_index,
      json_agg(
        CASE WHEN t.id IS NOT NULL THEN 
          json_build_object('content', t.content, 'author', t.author)
        ELSE NULL END
      ) FILTER (WHERE t.id IS NOT NULL) AS testimonials
    FROM 
      creatures c
    LEFT JOIN 
      testimonials t ON c.id = t.creature_id
    WHERE 
      c.cloudinary_public_id = ${cloudinaryPublicId}
    GROUP BY 
      c.id;
  `;

  return rows[0];
}

export const getCreaturesPage = cache(async (page: number) => {
  const offset = Math.max(0, (page - 1) * PAGE_SIZE);

  const { rows } = await sql`
    SELECT c.id, 
      c.cloudinary_public_id, 
      c.name, 
      c.synopsis, 
      c.location,
      c.caption,
      c.time,
      c.weather,
      c.effect_index 
    FROM 
      creatures c 
    ORDER BY 
      c.created_at DESC 
    LIMIT ${PAGE_SIZE} 
    OFFSET ${offset};
  `;
  return rows;
});

export const getTotalPages = cache(async () => {
  const { rows } = await sql`
    SELECT COUNT(*) FROM creatures;
  `;
  return Math.ceil(rows[0].count / PAGE_SIZE);
});

export async function getAllCreatures() {
  const { rows } = await sql`
    SELECT 
      c.cloudinary_public_id,
      c.created_at
    FROM 
      creatures c
    ORDER BY 
      c.created_at DESC;
  `;

  return rows;
}

export async function createCreature(
  cloudinaryPublicId: string,
  name: string | null,
  synopsis: string | null,
  location: string | null,
  time: string | null,
  weather: string | null,
) {
  const { rows } = await sql`
    INSERT INTO creatures (cloudinary_public_id, name, synopsis, location, time, weather)
    VALUES (${cloudinaryPublicId}, ${name}, ${synopsis}, ${location}, ${time}, ${weather})
    RETURNING id, cloudinary_public_id;
  `;

  return rows[0];
}

export async function updateCreature(
  id: number,
  updates: {
    name?: string;
    synopsis?: string;
    location?: string;
    time?: string;
    weather?: string;
    testimonials?: { content: string; author: string }[];
  },
) {
  // Start a transaction
  await sql`BEGIN`;

  try {
    // Update the creature
    const {
      rows: [updatedCreature],
    } = await sql`
      UPDATE creatures
      SET
        name = COALESCE(${updates.name}, name),
        synopsis = COALESCE(${updates.synopsis}, synopsis),
        location = COALESCE(${updates.location}, location),
        time = COALESCE(${updates.time}, time),
        weather = COALESCE(${updates.weather}, weather)
      WHERE id = ${id}
      RETURNING *;
    `;

    // If there are new testimonials, insert them
    if (updates.testimonials && updates.testimonials.length > 0) {
      for (const testimonial of updates.testimonials) {
        await sql`
          INSERT INTO testimonials (creature_id, content, author)
          VALUES (${id}, ${testimonial.content}, ${testimonial.author});
        `;
      }
    }

    // Commit the transaction
    await sql`COMMIT`;

    // Fetch the updated creature with its testimonials
    return await getCreature(updatedCreature.cloudinary_public_id);
  } catch (error) {
    // If there's an error, roll back the transaction
    await sql`ROLLBACK`;
    throw error;
  }
}
