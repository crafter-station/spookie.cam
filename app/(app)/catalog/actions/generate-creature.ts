'use server';

import { openai } from '@ai-sdk/openai';
import { streamObject } from 'ai';
import { createStreamableValue } from 'ai/rsc';
import { z } from 'zod';

import { updateCreature } from '@/lib/db';

const creatureSchema = z.object({
  name: z.string(),
  synopsis: z.string(),
  location: z.string(),
  time: z.string(),
  weather: z.string(),
  testimonials: z
    .array(
      z.object({
        content: z.string(),
        author: z.string(),
      }),
    )
    .min(2)
    .max(3),
});

type CreatureData = z.infer<typeof creatureSchema>;

export async function generateCreatureDetails(
  creatureId: number,
  cloudinaryPublicId: string,
  initialPrompt: string,
) {
  const stream = createStreamableValue();

  (async () => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const imageUrl = `https://res.cloudinary.com/${cloudName}/image/upload/w_150,h_150,c_fill/${cloudinaryPublicId}`;

    const { partialObjectStream } = await streamObject({
      model: openai('gpt-4o-mini'),
      schema: creatureSchema,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Based on this image and the following prompt: "${initialPrompt}", 
                     generate a creepy, Halloween-inspired creature. Include a spooky name, 
                     a brief synopsis of its origin (like a movie synopsis), its typical 
                     haunting location, the time it's most active, the weather conditions 
                     it prefers, and 2-3 terrifying testimonials from people who encountered it.`,
            },
            {
              type: 'image',
              image: imageUrl,
            },
          ],
        },
      ],
    });

    let finalObject: Partial<CreatureData> = {};

    for await (const partialObject of partialObjectStream) {
      stream.update(partialObject);
      finalObject = { ...finalObject, ...partialObject } as CreatureData;
    }

    // Ensure all required fields are present before updating
    if (
      finalObject.name &&
      finalObject.synopsis &&
      finalObject.location &&
      finalObject.time &&
      finalObject.weather &&
      finalObject.testimonials &&
      finalObject.testimonials.length >= 2
    ) {
      // Update the creature in the database after generation is complete
      await updateCreature(creatureId, {
        name: finalObject.name,
        synopsis: finalObject.synopsis,
        location: finalObject.location,
        time: finalObject.time,
        weather: finalObject.weather,
        testimonials: finalObject.testimonials,
      });
    } else {
      throw new Error('Incomplete creature data generated');
    }

    stream.done();
  })();

  return { object: stream.value };
}
