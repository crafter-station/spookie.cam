export async function getBase64Image(
  id: string,
): Promise<{ id: string; dataURL: string | null }> {
  try {
    const url = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/e_blur:1000/q_25/${id}_frame_0.jpg`;
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const dataURL = `data:${response.headers.get('content-type') || 'image/jpeg'};base64,${base64}`;

    return { id, dataURL };
  } catch (error) {
    console.error('Error fetching image:', error);
    return { id, dataURL: null };
  }
}
