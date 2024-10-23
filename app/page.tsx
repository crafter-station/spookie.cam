import Link from 'next/link';

import { CircleIcon, PlayIcon } from 'lucide-react';

import { SpookyButton } from '@/components/ui/icons';

import { CDate } from './c-date';

export default function Home() {
  return (
    <>
      <div className="container mx-auto flex h-screen flex-col items-center justify-center py-8">
        <div className="absolute left-8 top-8 flex items-center font-vcr text-4xl font-black tracking-[0.3em] opacity-50">
          PLAY
          <PlayIcon fill="currentColor" className="ml-2 inline size-8" />
        </div>
        <div className="absolute right-8 top-8 flex items-center font-vcr text-4xl font-black tracking-[0.3em] opacity-50">
          REC
          <CircleIcon
            fill="currentColor"
            className="ml-2 inline size-6 animate-pulse text-red-900"
          />
        </div>
        <CDate />
        <h1 className="mb-6 text-center text-3xl font-bold">
          Welcome to{' '}
          <span className="block text-8xl text-red-900">spookie.cam</span>
        </h1>
        <p className="text-center text-xl">
          You are about to enter a world of horror and terror. Are you ready?
        </p>

        <Link
          href="/catalog"
          className="group relative my-8"
          id="continue-button"
        >
          <SpookyButton className="w-[20rem] text-red-900 drop-shadow-lg group-hover:text-white group-focus:text-white group-focus:outline-none group-focus:ring-0" />
          <span className="absolute inset-0 flex items-center justify-center pb-2 text-3xl font-black group-hover:text-red-900 group-focus:text-red-900">
            Continue
          </span>
        </Link>

        <p className="mt-64 text-center text-xl text-muted-foreground">
          Images may be disturbing. Viewer discretion is advised.
        </p>
      </div>
    </>
  );
}
