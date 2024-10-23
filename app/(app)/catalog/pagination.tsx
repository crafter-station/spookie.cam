'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

import { buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { cn } from '@/lib/utils';

export const Pagination = ({ totalPages }: { totalPages: number }) => {
  const MAX_PAGE_INDEX = totalPages;
  const { pageIndex } = useParams<{ pageIndex: string }>();

  const router = useRouter();

  const currentPage = React.useMemo(
    () => parseInt(pageIndex) || 1,
    [pageIndex],
  );

  return (
    <div className="my-4 flex w-full items-center gap-2">
      <p className="text-sm text-muted-foreground">
        Page {currentPage} of {MAX_PAGE_INDEX}
      </p>

      {currentPage <= 1 ? null : (
        <Link
          href={`/catalog/${currentPage - 1}`}
          className={cn(buttonVariants({ variant: 'outline', size: 'icon' }))}
        >
          <ChevronLeftIcon className="size-4" />
        </Link>
      )}
      {currentPage >= MAX_PAGE_INDEX ? null : (
        <Link
          href={`/catalog/${currentPage + 1}`}
          className={cn(buttonVariants({ variant: 'outline', size: 'icon' }))}
        >
          <ChevronRightIcon className="size-4" />
        </Link>
      )}

      <p className="text-sm text-muted-foreground">or go directly to</p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          const goTo = parseInt(formData.get('go-to')?.toString() || '');
          if (!isNaN(goTo) && goTo >= 1 && goTo <= MAX_PAGE_INDEX) {
            router.push(`/catalog/${goTo}`);
          }
        }}
      >
        <Input
          type="number"
          name="go-to"
          required
          placeholder={MAX_PAGE_INDEX.toString()}
          min={1}
          max={MAX_PAGE_INDEX}
        />
      </form>
    </div>
  );
};
