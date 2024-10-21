'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

import { useMutation } from '@tanstack/react-query';
import { Loader2, PlusIcon, Upload } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

import { cn } from '@/lib/utils';

import { uploadImage } from './upload-image.action';

export function NewPic() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const [previewImage, setPreviewImage] = React.useState<File | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = React.useState<string | null>(
    null,
  );

  const router = useRouter();

  React.useEffect(() => {
    if (!previewImage) {
      setPreviewImageUrl(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImageUrl(e.target?.result as string);
    };
    reader.readAsDataURL(previewImage);

    // Clean up
    return () => {
      reader.abort();
    };
  }, [previewImage]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (formData: FormData) => {
      if (previewImage) {
        formData.append('image', previewImage);
      }
      const result = await uploadImage(formData);

      if (!result.success) throw new Error(result.error);

      return result.data;
    },
    onError: (error) => {
      alert(error.message);
    },
    onSuccess: ({ id }) => {
      setIsDialogOpen(false);
      router.push('/pic/' + id);
    },
  });

  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setPreviewImage(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
  });

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="aspect-square px-0 md:aspect-auto md:px-4"
        >
          <PlusIcon className="mr-0 size-4 md:mr-2" />
          <span className="hidden md:inline">New pic</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload an Image</DialogTitle>
        </DialogHeader>
        <DialogDescription>We support all image formats!</DialogDescription>

        <form className="flex flex-col items-center space-y-6" action={mutate}>
          <div
            {...getRootProps()}
            className={cn(
              'relative h-64 overflow-hidden rounded-lg border border-dashed border-input p-1 shadow-sm transition-colors focus-visible:border-transparent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
              isDragActive ? 'border-primary' : 'border-gray-300',
              { 'aspect-square': previewImage === null },
            )}
          >
            <input {...getInputProps()} className="" />
            {previewImageUrl ? (
              <img
                src={previewImageUrl}
                alt="Preview"
                className="h-full w-full rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center p-4 text-center">
                <Upload className="mb-2 h-12 w-12 text-gray-400" />
                <p className="text-sm text-gray-500">Drop your picture here</p>
                <p className="mt-2 text-xs text-gray-400">or click to select</p>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="is_public" name="is_public" disabled={isPending} />
            <Label htmlFor="is_public">Public</Label>
          </div>
          <Input
            name="caption"
            placeholder="say something..."
            disabled={isPending}
          />
          <Button
            type="submit"
            disabled={!previewImage || isPending}
            className="mt-4 w-full"
          >
            {isPending ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : null}
            Upload
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
