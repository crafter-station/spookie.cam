'use client';

import React from 'react';

import { DownloadIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

export const ImageDownloadButton = ({ id }: { id: string }) => {
  const imageUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/multi/v1/dl_150/${id}_frame.gif`;
  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `spookie-pic-${id}.gif`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  return (
    <Button onClick={handleDownload} variant="outline">
      <DownloadIcon className="mr-2 size-4" />
      Download Gif
    </Button>
  );
};
