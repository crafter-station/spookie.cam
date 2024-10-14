'use server';

import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { z } from 'zod';

import { EmbeddingInput, getEmbeddings } from '@/lib/get-embeddings';
import { getUserId } from '@/lib/get-user-id';
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
        imagePublicId: string;
        isPublic: boolean;
      };
    }
  | { success: false; error: string }
> {
  try {
    const userId = await getUserId();

    const image = formData.get('image') as File;
    if (!image) throw new Error('No image attached');

    const isPublic = isPublicSchema.parse(formData.get('is_public'));
    const caption = captionSchema.parse(formData.get('caption'));

    const imagePublicId = nanoid();

    // Convert File to buffer
    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    const { url } = (await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: process.env.CLOUDINARY_FOLDER_NAME,
            public_id: imagePublicId,
            tags: isPublic ? ['public'] : undefined,
            context: caption
              ? `caption="${caption}"|user_id="${userId}"`
              : `user_id="${userId}"`,
            moderation: 'aws_rek',
          },
          (error, result) => {
            if (error) reject(error);
            if (
              result &&
              (result.moderation[0] as unknown as { status: string }).status ===
                'rejected'
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

    const inputEmbeddings: EmbeddingInput[] = [{ image: url }];
    if (caption) {
      inputEmbeddings.push({ text: caption });
    }
    const embeddingsResponse = await getEmbeddings(inputEmbeddings);

    const indexInput = [
      {
        id: 'e_' + imagePublicId,
        vector: embeddingsResponse.data[0].embedding,
      },
    ];

    if (caption) {
      indexInput.push({
        id: 'c_' + imagePublicId,
        vector: embeddingsResponse.data[1].embedding,
      });
    }

    await vectorIndex.upsert(indexInput);

    return {
      success: true,
      data: {
        imagePublicId: process.env.CLOUDINARY_FOLDER_NAME + '/' + imagePublicId,
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
