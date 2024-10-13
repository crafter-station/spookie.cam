'use client';

import React from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DitheredImage } from '@/components/dithered-image';

import { ImageUploadDialogContent } from './dialog-content';

export default function ImageUploader() {
  const [uploadedPublicId, setUploadedPublicId] = React.useState<string | null>(
    null,
  );
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const handleOnImageUploaded = (publicId: string) => {
    setUploadedPublicId(publicId);
    setIsDialogOpen(false);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Upload Image</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Upload an Image</DialogTitle>
          </DialogHeader>
          <DialogDescription>We support all image formats!</DialogDescription>
          <ImageUploadDialogContent onImageUploaded={handleOnImageUploaded} />
        </DialogContent>
      </Dialog>

      {uploadedPublicId && (
        <div className="mt-4 h-64">
          <DitheredImage public_id={uploadedPublicId} />
        </div>
      )}
    </div>
  );
}
