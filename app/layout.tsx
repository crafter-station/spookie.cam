import localFont from 'next/font/local';

import type { Metadata } from 'next';

import './globals.css';

import { Providers } from '@/components/providers';

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
  title: 'Create Next App',
  description: 'Generated by create next app',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${vcrOsdMono.variable} dark antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
