import { ReactNode } from 'react';
import Link from 'next/link';

import { GalleryVerticalIcon, UserIcon } from 'lucide-react';

import { buttonVariants } from '@/components/ui/button';
import { NavbarShader } from '@/components/nav-bar-shader';

import { cn } from '@/lib/utils';

import { NewPic } from './new-pic';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-50 mx-auto flex h-16 max-w-6xl items-center justify-between bg-transparent px-4 md:px-8">
        <NavbarShader />
        <Link href="/" className="font-vcr text-2xl font-black">
          spookie.cam
        </Link>

        <div className="flex space-x-2">
          <NewPic />
          <Link
            href="/mine"
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'aspect-square px-0 md:aspect-auto md:px-4',
            )}
          >
            <UserIcon className="mr-0 size-4 md:mr-2" />
            <span className="hidden md:inline">Your pics</span>
          </Link>
          <Link
            href="/catalog"
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'aspect-square px-0 md:aspect-auto md:px-4',
            )}
          >
            <GalleryVerticalIcon className="mr-0 size-4 md:mr-2" />
            <span className="hidden md:inline">Catalog</span>
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-4 md:px-8">{children}</div>
    </div>
  );
}
