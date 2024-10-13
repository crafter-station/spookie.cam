'use client';

import React from 'react';

import { CldImage } from 'next-cloudinary';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

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
          <DialogDescription>We support al image formats!</DialogDescription>
          <ImageUploadDialogContent onImageUploaded={handleOnImageUploaded} />
        </DialogContent>
      </Dialog>

      {uploadedPublicId && (
        <div className="mt-4 h-64 rounded-lg">
          <CldImage
            src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/e_ordered_dither:3/e_oil_paint:5/e_blackwhite:30/v1/${uploadedPublicId}.jpg`}
            width={500}
            height={500}
            preserveTransformations
            alt="Description of my image"
          />
        </div>
      )}
    </div>
  );
}
