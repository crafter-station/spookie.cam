'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

import { debounce } from '@/lib/utils';

type FilterType =
  | 'atkinson'
  | 'spooky'
  | 'vampireGlow'
  | 'zombieDecay'
  | 'ghostlyFade'
  | 'witchHex'
  | 'werewolfFur';

const SpookyImage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const [sliderValue, setSliderValue] = useState<number[]>([127]);
  const [dragPosition, setDragPosition] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [processedImageData, setProcessedImageData] =
    useState<ImageData | null>(null);
  const [filterType, setFilterType] = useState<FilterType>('atkinson');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      workerRef.current = new Worker(
        new URL('../components/image-processor.worker.ts', import.meta.url),
      );

      workerRef.current.onmessage = (event: MessageEvent) => {
        setProcessedImageData(event.data);
      };

      return () => {
        workerRef.current?.terminate();
      };
    }
  }, []);

  const processImage = useCallback(() => {
    if (workerRef.current && imageData) {
      workerRef.current.postMessage({
        imageData,
        filterType,
        threshold: sliderValue[0],
        intensity: sliderValue[0],
        time: Date.now(),
      });
    }
  }, [imageData, filterType, sliderValue]);

  useEffect(() => {
    let animationFrameId: number;

    const animate = () => {
      processImage();
      animationFrameId = requestAnimationFrame(animate);
    };

    if (filterType !== 'atkinson') {
      animate();
    } else {
      processImage();
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [processImage, filterType]);

  const drawImages = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageData || !processedImageData) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.putImageData(processedImageData, 0, 0);

    const dragX = (dragPosition / 100) * canvas.width;
    ctx.putImageData(imageData, 0, 0, 0, 0, dragX, canvas.height);

    ctx.beginPath();
    ctx.moveTo(dragX, 0);
    ctx.lineTo(dragX, canvas.height);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [imageData, processedImageData, dragPosition]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = '/sticker.webp';
    img.onload = () => {
      const scaleFactor = Math.min(1, 800 / Math.max(img.width, img.height));
      canvas.width = img.width * scaleFactor;
      canvas.height = img.height * scaleFactor;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      setImageData(ctx.getImageData(0, 0, canvas.width, canvas.height));
    };
  }, []);

  useEffect(() => {
    if (!imageData || !processedImageData) return;

    let animationFrameId: number;
    const render = () => {
      drawImages();
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [imageData, processedImageData, drawImages]);

  const handleSliderChange = debounce((value: number[]) => {
    setSliderValue(value);
  }, 50);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      setDragPosition((x / rect.width) * 100);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleFilterChange = (value: FilterType) => {
    setFilterType(value);
  };

  return (
    <Card className="mx-auto w-full max-w-3xl">
      <CardHeader>
        <CardTitle>Spooky Image</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="relative mb-4 cursor-ew-resize"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <canvas ref={canvasRef} className="h-auto w-full"></canvas>
        </div>
        <div className="mb-4 flex space-x-4">
          <Select onValueChange={handleFilterChange} value={filterType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="atkinson">Atkinson Dither</SelectItem>
              <SelectItem value="spooky">Spooky</SelectItem>
              <SelectItem value="vampireGlow">Vampire Glow</SelectItem>
              <SelectItem value="zombieDecay">Zombie Decay</SelectItem>
              <SelectItem value="ghostlyFade">Ghostly Fade</SelectItem>
              <SelectItem value="witchHex">Witch Hex</SelectItem>
              <SelectItem value="werewolfFur">Werewolf Fur</SelectItem>
            </SelectContent>
          </Select>
          <Slider
            value={sliderValue}
            onValueChange={handleSliderChange}
            max={255}
            step={1}
            className="w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default SpookyImage;
