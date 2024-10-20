import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  console.log(params.id);
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#000',
          fontSize: 32,
          fontWeight: 600,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            width: '40%',
            height: '100%',
            backgroundColor: '#111827',
            color: 'white',
          }}
        >
          {/* This is a placeholder for the image. Replace with your actual image URL */}
          <img
            src={`https://res.cloudinary.com/dyzsexgpb/image/upload/f_auto,q_auto/${params.id}_frame_0`}
            alt="Spookie Image"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
            width: '60%',
            height: '100%',
            padding: '0 40px',
            color: 'white',
          }}
        >
          <h1 style={{ fontSize: 64, margin: 0, marginBottom: 16 }}>
            spookie.cam
          </h1>
          <p style={{ fontSize: 32, margin: 0, opacity: 0.8 }}>
            Create your own spookie pics for free
          </p>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
