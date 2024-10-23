'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { useDuration } from '@/hooks/use-duration';
import { DialogDescription } from '@radix-ui/react-dialog';
import { Canvas } from '@react-three/fiber';
import { InfoIcon, PlusIcon } from 'lucide-react';
import * as THREE from 'three';

import { HorrificEffect } from './horrific-image-filter';
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
  const [textures, setTextures] = useState<THREE.Texture[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

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
      durations.map(
        (_, index) =>
          textures.length > 0 && (
            <div
              key={index}
              className="aspect-square w-full overflow-hidden rounded-sm bg-[#0a0a0a] shadow-[0_0_15px_rgba(255,0,0,0.3)] transition-all duration-300 ease-in-out hover:shadow-[0_0_25px_rgba(255,0,0,0.5)]"
            >
              {index === 0 ? (
                <img
                  src={`${imageUrl}/${id}.jpg`}
                  alt="img"
                  className="aspect-square h-full w-full object-cover"
                />
              ) : (
                <Canvas
                  orthographic
                  camera={{ zoom: 1, position: [0, 0, 100] }}
                >
                  <HorrificEffect
                    texture={textures[index]}
                    effectIndex={index}
                  />
                </Canvas>
              )}
            </div>
          ),
      ),
    [durations, textures, id],
  );

  useEffect(() => {
    options.forEach((option) => {
      const image = `${imageUrl}/${option}/${id}.jpg`;
      const loader = new THREE.TextureLoader();
      loader.load(image, (loadedTexture) => {
        setTextures((prev) => [...prev, loadedTexture]);
      });
    });
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
                Instructions
                <Button size="icon" variant="ghost" className="size-5">
                  <InfoIcon className="size-3" />
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent className="w-[180px]">
              Press J or L to navigate between slides. Press M to toggle mute.
              Press K to play/pause.
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
