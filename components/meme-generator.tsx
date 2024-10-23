'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { useDuration } from '@/hooks/use-duration';
import { DialogDescription } from '@radix-ui/react-dialog';
import { InfoIcon, PlusIcon } from 'lucide-react';

import { ProgressBarGroup } from './progress-bar-group';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

const customDurations = [3, 2.5, 3, 2.5, 3, 2, 2.5, 6, 8.2];

const audios = [
  '/audios/nivel-0.mp3',
  '/audios/nivel-1.mp3',
  '/audios/nivel-2.mp3',
  '/audios/nivel-3.mp3',
  '/audios/nivel-4.mp3',
  '/audios/nivel-5.mp3',
  '/audios/nivel-6.mp3',
  '/audios/nivel-7.mp3',
  '/audios/nivel-8.mp3',
];

interface MemeGeneratorProps {
  id: string;
}

const options = [
  '',
  'e_contrast:10/e_ordered_dither:1',
  'e_ordered_dither:1/e_oil_paint:50/e_blackwhite:50',
  'e_ordered_dither:1/e_blur_faces:20/e_oil_paint:90/e_contrast:120/e_saturation:-100',
  'e_blur_faces:2000/e_oil_paint:90/e_contrast:120/e_contrast:50/e_blackwhite:30/e_saturation:-100',
  'e_contrast:50/e_oil_paint:30/e_blackwhite:30',
  'e_contrast:70/e_oil_paint:30/e_blackwhite:40',
  'e_contrast:50/e_oil_paint:50/e_blackwhite:50',
  'e_contrast:70/e_blackwhite:60/e_ordered_dither:5',
];

const imageUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;

export const MemeGenerator = ({ id }: MemeGeneratorProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [images, setImages] = useState<string[]>([]);

  const durations = useDuration({ customDurations, audios });

  const handleNextProgress = useCallback(() => {
    setCurrentSlide((prevIndex) =>
      prevIndex + 1 < durations.length ? prevIndex + 1 : prevIndex,
    );
  }, [durations.length]);

  const handlePreviousProgress = useCallback(() => {
    setCurrentSlide((prevIndex) =>
      prevIndex - 1 >= 0 ? prevIndex - 1 : prevIndex,
    );
  }, []);

  const handleComplete = useCallback(() => {
    setIsDialogOpen(false);
    setCurrentSlide(0);
  }, []);

  const slideComponents = useMemo(
    () =>
      durations.map((_, index) => (
        <img
          key={index}
          src={images[index]}
          alt="img"
          className="aspect-square h-full w-full object-cover"
        />
      )),
    [durations, images],
  );

  useEffect(() => {
    const loadedImages: string[] = options.map(
      (option) => `${imageUrl}/${option}/${id}.jpg`,
    );

    loadedImages.forEach((src) => {
      const img = new Image();
      img.src = src;
    });

    setImages(loadedImages);
  }, [id]);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PlusIcon className="mr-2 size-4" />
          Generate Meme
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[425px]"
        aria-describedby="dialog-description"
      >
        <DialogHeader>
          <DialogTitle>Disturbing Meme</DialogTitle>
        </DialogHeader>
        <DialogDescription
          id="dialog-description"
          className="text-sm text-muted-foreground"
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex gap-1">
                <p>Instructions</p>
                <Button size="icon" variant="ghost" className="size-5">
                  <InfoIcon className="size-3" />
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <ul>
                <li>Press J or L to navigate between slides.</li>
                <li>Press M to toggle mute.</li>
                <li>Press K to play/pause.</li>
              </ul>
            </TooltipContent>
          </Tooltip>
        </DialogDescription>
        <ProgressBarGroup
          durations={durations}
          audios={audios}
          currentSlide={currentSlide}
          handleNextProgress={handleNextProgress}
          handlePreviousProgress={handlePreviousProgress}
          onCompleted={handleComplete}
        >
          {slideComponents[currentSlide]}
        </ProgressBarGroup>
      </DialogContent>
    </Dialog>
  );
};
