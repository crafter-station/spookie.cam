import localFont from 'next/font/local';

import type { Metadata } from 'next';

import './globals.css';

import { Providers } from '@/components/providers';

import { BackgroundNoiseAudioPlayButton } from './background-noise';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

const vcrOsdMono = localFont({
  src: './fonts/VCR_OSD_MONO_1.001.ttf',
  variable: '--font-vcr-osd-mono',
  weight: '400',
});

export const metadata: Metadata = {
  title: 'spookie.cam',
  description: 'Create your own spookie pics for free',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${vcrOsdMono.variable} crt-screen dark antialiased`}
      >
        <svg
          className="pointer-events-none fixed isolate z-50 opacity-70 mix-blend-color-dodge"
          width="100%"
          height="100%"
        >
          <defs>
            <filter id="tv-noise">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.80"
                numOctaves="4"
                stitchTiles="stitch"
                seed="0"
              >
                <animate
                  attributeName="seed"
                  values="0;100;0"
                  dur="0.8s"
                  repeatCount="indefinite"
                />
              </feTurbulence>
              <feColorMatrix
                type="matrix"
                values="1 0 0 0 0
                        0 0 0 0 0
                        0 0 0 0 0
                        0 0 0 1 0"
              />
            </filter>
            <filter id="rgb-shift">
              <feOffset in="SourceGraphic" dx="2" dy="0">
                <animate
                  attributeName="dx"
                  values="2;-2;2"
                  dur="0.05s"
                  repeatCount="indefinite"
                />
              </feOffset>
              <feColorMatrix
                type="matrix"
                values="1 0 0 0 0
                        0 0 0 0 0
                        0 0 0 0 0
                        0 0 0 1 0"
              />
              <feOffset in="SourceGraphic" dx="-2" dy="0">
                <animate
                  attributeName="dx"
                  values="-2;2;-2"
                  dur="0.05s"
                  repeatCount="indefinite"
                />
              </feOffset>
              <feColorMatrix
                type="matrix"
                values="1 0 0 0 0
                        0.2 0 0 0 0
                        0.2 0 0 0 0
                        0 0 0 1 0"
              />
            </filter>
          </defs>
          <rect width="100%" height="100%" filter="url(#tv-noise)" />
        </svg>
        <div className="tv-content" style={{ filter: 'url(#rgb-shift)' }}>
          <Providers>{children}</Providers>
        </div>
        <BackgroundNoiseAudioPlayButton />
      </body>
    </html>
  );
}
