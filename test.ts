import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const options = [
  'e_contrast:50/e_ordered_dither:6/e_blackwhite:40',
  'e_contrast:50/e_ordered_dither:6/e_blackwhite:40/e_negate',
  'e_contrast:50/e_ordered_dither:6/e_oil_paint:30/e_blackwhite:40',
  'e_colorize:10/e_ordered_dither:6/e_oil_paint:30/e_blackwhite:20/e_negate',
  'e_contrast:50/e_ordered_dither:10/e_oil_paint:50/e_blackwhite:40',
  'e_colorize:10/e_ordered_dither:10/e_oil_paint:50/e_blackwhite:20/e_negate',
];

async function generateGIF(publicId: string) {
  const transformations = options.map((option, index) => ({
    public_id: `${publicId}_frame_${index}`,
    transformation: [
      { background: 'rgb:000000' },
      { raw_transformation: option },
    ],
    tags: [publicId + '_frame'],
  }));

  try {
    // Generate frames
    for (let i = 0; i < transformations.length; i++) {
      await cloudinary.uploader.upload(
        `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/v1/${publicId}`,
        transformations[i],
      );
    }

    // Create GIF
    await cloudinary.uploader.multi(publicId + '_frame', {
      transformation: [{ delay: 150 }, { format: 'gif' }],
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

// Replace 'your_image_public_id' with the actual public ID of your image
generateGIF('spookie.cam/VDPV5pAq');
