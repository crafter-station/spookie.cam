'use server';

import { v2 as cloudinary } from 'cloudinary';

import { nanoid } from '@/lib/utils';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
    const image = formData.get('image') as File;
    if (!image) throw new Error('No image attached');

    const imagePublicId = nanoid();

    // Convert File to buffer
    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: process.env.CLOUDINARY_FOLDER_NAME,
            public_id: imagePublicId,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        )
        .end(buffer);
    });

    return {
      success: true,
      data: {
        imagePublicId: process.env.CLOUDINARY_FOLDER_NAME + '/' + imagePublicId,
        isPublic: true,
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
