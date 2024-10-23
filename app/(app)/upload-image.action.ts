'use server';

import { headers } from 'next/headers';

import { sql } from '@vercel/postgres';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { z } from 'zod';

import { EmbeddingInput, getEmbeddings } from '@/lib/get-embeddings';
import { getUserId } from '@/lib/get-user-id';
import { hasLimitReached } from '@/lib/ratelimit';
import { nanoid } from '@/lib/utils';
import { vectorIndex } from '@/lib/vector';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const isPublicSchema = z
  .enum(['on', 'off'])
  .nullish()
  .transform((v) => v === 'on');

const captionSchema = z
  .string()
  .max(255)
  .nullish()
  .transform((x) => (x ? x.replace(/"/g, "'") : null)); // security

export async function uploadImage(formData: FormData): Promise<
  | {
      success: true;
      data: {
        id: string;
        isPublic: boolean;
      };
    }
  | { success: false; error: string }
> {
  try {
    const ip = headers().get('x-forwarded-for') ?? 'ip';
    const limitReached = await hasLimitReached(ip);
    if (limitReached) throw new Error('Rate limit reached');

    const userId = await getUserId();

    const image = formData.get('image') as File;
    if (!image) throw new Error('No image attached');

    const isPublic = isPublicSchema.parse(formData.get('is_public'));
    const caption = captionSchema.parse(formData.get('caption'));

    const id = nanoid();

    // Convert File to buffer
    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    const { url } = (await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            public_id: id,
            tags: isPublic ? ['public'] : undefined,
            context: caption
              ? `caption="${caption}"|user_id="${userId}"`
              : `user_id="${userId}"`,
            resource_type: 'image',
            transformation: [
              { width: 1000, height: 1000, crop: 'limit' },
              { quality: 'auto:good', fetch_format: 'auto' },
            ],
          },
          (error, result) => {
            if (error) reject(error);
            if (
              result &&
              (result.moderation?.[0] as unknown as { status: string })
                ?.status === 'rejected'
            )
              reject(
                new Error(
                  'Image does not comply with our content moderation policy',
                ),
              );
            if (!result) throw new Error('Error talking with cloudinary :(');
            else resolve(result);
          },
        )
        .end(buffer);
    })) as UploadApiResponse;

    const options = [
      'e_contrast:50/e_ordered_dither:6/e_blackwhite:40',
      'e_contrast:50/e_ordered_dither:6/e_blackwhite:40/e_negate',
      'e_contrast:50/e_ordered_dither:6/e_oil_paint:30/e_blackwhite:40',
      'e_colorize:10/e_ordered_dither:6/e_oil_paint:30/e_blackwhite:20/e_negate',
      'e_contrast:50/e_ordered_dither:10/e_oil_paint:50/e_blackwhite:40',
      'e_colorize:10/e_ordered_dither:10/e_oil_paint:50/e_blackwhite:20/e_negate',
    ];

    const transformations = options.map((option, index) => ({
      public_id: `${id}_frame_${index}`,
      transformation: [
        { background: 'rgb:000000' },
        { raw_transformation: option },
      ],
      tags: [id + '_frame'],
    }));

    try {
      // Generate frames in parallel
      const framePromises = transformations.map((transformation) =>
        cloudinary.uploader.upload(
          `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/v1/${id}`,
          transformation,
        ),
      );

      await Promise.all(framePromises);

      // Create GIF
      await cloudinary.uploader.multi(id + '_frame', {
        transformation: [{ delay: 150 }, { format: 'gif' }],
      });
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Error generating GIF');
    }

    // Save image details to the database
    // Save image details to the database
    try {
      await sql`
    INSERT INTO creatures (
      cloudinary_public_id,
      name,
      synopsis,
      location,
      time,
      weather,
      effect_index,
      created_at,
      is_public,
      caption
    ) VALUES (
      ${id},
      ${null},
      ${null},
      ${null},
      ${null},
      ${null},
      ${Math.floor(Math.random() * 6)},
      NOW(),
      ${isPublic},
      ${caption}
    )
    ON CONFLICT (cloudinary_public_id) 
    DO UPDATE SET
      is_public = EXCLUDED.is_public,
      caption = EXCLUDED.caption,
      updated_at = NOW();
  `;
    } catch (error) {
      console.error('Database error:', error);
      throw new Error('Error saving image details');
    }

    const inputEmbeddings: EmbeddingInput[] = [{ image: url }];
    if (caption) {
      inputEmbeddings.push({ text: caption });
    }
    const embeddingsResponse = await getEmbeddings(inputEmbeddings);

    const indexInput = [
      {
        id: 'image_' + id,
        vector: embeddingsResponse.data[0].embedding,
      },
    ];

    if (caption) {
      indexInput.push({
        id: 'caption_' + id,
        vector: embeddingsResponse.data[1].embedding,
      });
    }

    await vectorIndex.upsert(indexInput);

    return {
      success: true,
      data: {
        id,
        isPublic,
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: 'Internal server error',
    };
  }
}
