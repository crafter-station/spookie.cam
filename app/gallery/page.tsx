import { v2 as cloudinary } from 'cloudinary';

import { DitheredImage } from '@/components/dithered-image';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function Page() {
  const data = (await cloudinary.search
    .expression('tags=public')
    .execute()) as {
    total_count: number;
    resources: {
      public_id: string;
    }[];
  };

  return (
    <div className="mx-auto max-w-6xl">
      <h1>Gallery</h1>

      <div className="grid grid-cols-1 gap-12">
        {data.resources.map(({ public_id }) => (
          <div key={public_id} className="flex justify-center">
            <DitheredImage public_id={public_id} />
          </div>
        ))}
      </div>
    </div>
  );
}
