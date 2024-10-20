'use client';

import React, { useState } from 'react';

import { useToast } from '@/hooks/use-toast';
import { CheckIcon, Share2Icon } from 'lucide-react';

import { Button } from '@/components/ui/button';

export const ShareButton = ({ id }: { id: string }) => {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);
  const url = `https://spookie.cam/pic/${id}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check my spookie pic!',
          text: 'I found something interesting!',
          url,
        });
        toast({
          title: 'Shared successfully',
          description: 'The content has been shared.',
        });
      } catch (error) {
        console.log('Error sharing content:', error);
        toast({
          title: 'Sharing failed',
          description: 'There was an error while sharing the content.',
          variant: 'destructive',
        });
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(url);
        setIsCopied(true);
        toast({
          title: 'URL copied',
          description: 'The URL has been copied to your clipboard.',
        });
        setTimeout(() => setIsCopied(false), 2000); // Reset copied state after 2 seconds
      } catch (err) {
        console.error('Failed to copy: ', err);
        toast({
          title: 'Copy failed',
          description: 'Failed to copy the URL. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <Button onClick={handleShare} variant="outline">
      {isCopied ? (
        <CheckIcon className="mr-2 size-4" />
      ) : (
        <Share2Icon className="mr-2 size-4" />
      )}
      {isCopied ? 'Copied!' : 'Share'}
    </Button>
  );
};
