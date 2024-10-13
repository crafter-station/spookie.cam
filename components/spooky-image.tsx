// components/SpookyImage.tsx
"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { debounce } from "@/lib/utils";

type FilterType =
  | "atkinson"
  | "spooky"
  | "vampireGlow"
  | "zombieDecay"
  | "ghostlyFade"
  | "witchHex"
  | "werewolfFur";

const workerCode = `
  const applyAtkinsonDither = (imageData, threshold) => {
    const data = new Uint8ClampedArray(imageData.data);
    const width = imageData.width;
    const height = imageData.height;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const oldPixel = data[idx];
        const newPixel = oldPixel > threshold ? 255 : 0;
        data[idx] = data[idx + 1] = data[idx + 2] = newPixel;

        const error = oldPixel - newPixel;

        if (x + 1 < width) data[idx + 4] += (error * 1) / 8;
        if (x + 2 < width) data[idx + 8] += (error * 1) / 8;
        if (y + 1 < height) {
          if (x - 1 > 0) data[idx + width * 4 - 4] += (error * 1) / 8;
          data[idx + width * 4] += (error * 1) / 8;
          if (x + 1 < width) data[idx + width * 4 + 4] += (error * 1) / 8;
        }
        if (y + 2 < height) data[idx + width * 8] += (error * 1) / 8;
      }
    }

    return new ImageData(data, width, height);
  };

  const applySpookyEffects = (imageData, threshold, time) => {
    const data = new Uint8ClampedArray(imageData.data);
    const width = imageData.width;
    const height = imageData.height;

    const verticalSyncOffset = Math.sin(time * 0.5) * 2;

    for (let y = 0; y < height; y++) {
      const scanlineOffset = Math.sin(time * 2 + y * 0.1) * 2;
      
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const sourceY = Math.max(0, Math.min(height - 1, y + Math.round(verticalSyncOffset)));
        const sourceIdx = (sourceY * width + x) * 4;

        for (let i = 0; i < 3; i++) {
          data[idx + i] = Math.min(255, Math.max(0, (data[sourceIdx + i] - 128) * 1.1 + 128));
        }

        const noise = (Math.random() - 0.5) * 15;
        for (let i = 0; i < 3; i++) {
          data[idx + i] = Math.min(255, Math.max(0, data[idx + i] + noise));
        }

        const distanceToCenter = Math.sqrt(Math.pow((x - width / 2) / (width / 2), 2) + Math.pow((y - height / 2) / (height / 2), 2)) / 1.5;
        const vignette = Math.max(0, 1 - distanceToCenter);
        for (let i = 0; i < 3; i++) {
          data[idx + i] *= vignette;
        }

        if (Math.sin(time * 0.1 + y * 0.1) > 0.95) {
          const glitchOffset = Math.floor(Math.sin(time * 2 + y * 0.2) * 3);
          const glitchIdx = idx + glitchOffset * 4;
          if (glitchIdx >= 0 && glitchIdx < data.length - 3) {
            data[idx] = data[glitchIdx];
            data[idx + 1] = data[glitchIdx + 1];
            data[idx + 2] = data[glitchIdx + 2];
          }
        }

        if ((y + Math.round(scanlineOffset)) % 3 === 0) {
          data[idx] *= 0.9;
          data[idx + 1] *= 0.9;
          data[idx + 2] *= 0.9;
        }

        const grayScale = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
        const newPixel = grayScale > threshold ? 255 : 0;
        const error = grayScale - newPixel;

        if (x + 1 < width) data[idx + 4] += (error * 1) / 8;
        if (x + 2 < width) data[idx + 8] += (error * 1) / 8;
        if (y + 1 < height) {
          if (x - 1 > 0) data[idx + width * 4 - 4] += (error * 1) / 8;
          data[idx + width * 4] += (error * 1) / 8;
          if (x + 1 < width) data[idx + width * 4 + 4] += (error * 1) / 8;
        }
        if (y + 2 < height) data[idx + width * 8] += (error * 1) / 8;

        data[idx] = data[idx + 1] = data[idx + 2] = newPixel;

        if (x > 0) {
          data[idx] += data[idx - 4] * 0.05;
          data[idx + 1] += data[idx - 3] * 0.05;
          data[idx + 2] += data[idx - 2] * 0.05;
        }

        if (newPixel > 0) {
          data[idx] *= 1.05;
          data[idx + 1] *= 0.95;
          data[idx + 2] *= 0.95;
        }
      }
    }

    return new ImageData(data, width, height);
  };

  const applyVampireGlow = (imageData, intensity, time) => {
    const data = new Uint8ClampedArray(imageData.data);
    const width = imageData.width;
    const height = imageData.height;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        // Aumentar el rojo y reducir otros colores
        data[idx] = Math.min(255, r + intensity);
        data[idx + 1] = Math.max(0, g - intensity / 2);
        data[idx + 2] = Math.max(0, b - intensity / 2);

        // Añadir un brillo pulsante
        const glow = Math.sin(time * 0.01 + (x + y) * 0.1) * intensity * 0.5;
        data[idx] = Math.min(255, data[idx] + glow);
      }
    }

    return new ImageData(data, width, height);
  };

  const applyZombieDecay = (imageData, intensity, time) => {
    const data = new Uint8ClampedArray(imageData.data);
    const width = imageData.width;
    const height = imageData.height;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        // Añadir tono verdoso
        data[idx] = Math.max(0, r - intensity);
        data[idx + 1] = Math.min(255, g + intensity / 2);
        data[idx + 2] = Math.max(0, b - intensity / 2);

        // Simular descomposición
        if (Math.random() < 0.05) {
          const decay = Math.sin(time * 0.01 + (x + y) * 0.1) * intensity;
          data[idx] = Math.max(0, data[idx] - decay);
          data[idx + 1] = Math.max(0, data[idx + 1] - decay);
          data[idx + 2] = Math.max(0, data[idx + 2] - decay);
        }
      }
    }

    return new ImageData(data, width, height);
  };

  const applyGhostlyFade = (imageData, intensity, time) => {
    const data = new Uint8ClampedArray(imageData.data);
    const width = imageData.width;
    const height = imageData.height;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        // Desaturar y añadir tono azulado
        const gray = (r + g + b) / 3;
        data[idx] = gray + (b - gray) * 0.2;
        data[idx + 1] = gray + (g - gray) * 0.2;
        data[idx + 2] = Math.min(255, gray + (b - gray) * 0.5 + intensity);

        // Efecto de desvanecimiento
        const fade = Math.sin(time * 0.002 + (x + y) * 0.05) * intensity * 0.3;
        data[idx] += fade;
        data[idx + 1] += fade;
        data[idx + 2] += fade;
        data[idx + 3] = Math.max(0, data[idx + 3] - intensity / 2); // Transparencia
      }
    }

    return new ImageData(data, width, height);
  };

  const applyWitchHex = (imageData, intensity, time) => {
    const data = new Uint8ClampedArray(imageData.data);
    const width = imageData.width;
    const height = imageData.height;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        // Añadir tono púrpura
        data[idx] = Math.min(255, r + intensity / 2);
        data[idx + 1] = Math.max(0, g - intensity / 2);
        data[idx + 2] = Math.min(255, b + intensity / 2);

        // Efecto de "hechizo"
        const spell = Math.sin(time * 0.005 + (x * y) * 0.001) * intensity;
        if (spell > intensity * 0.7) {
          data[idx] = 255 - data[idx];
          data[idx + 1] = 255 - data[idx + 1];
          data[idx + 2] = 255 - data[idx + 2];
        }
      }
    }

    return new ImageData(data, width, height);
  };

  const applyWerewolfFur = (imageData, intensity, time) => {
    const data = new Uint8ClampedArray(imageData.data);
    const width = imageData.width;
    const height = imageData.height;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        // Añadir tono marrón/gris
        data[idx] = Math.min(255, r + intensity / 2);
        data[idx + 1] = Math.max(0, g - intensity / 4);
        data[idx + 2] = Math.max(0, b - intensity / 2);

        // Simular pelo
        const fur = Math.sin(time * 0.01 + (x * 0.1 + y * 0.1)) * intensity * 0.2;
        if (fur > 0) {
          data[idx] = Math.min(255, data[idx] + fur);
          data[idx + 1] = Math.min(255, data[idx + 1] + fur);
          data[idx + 2] = Math.min(255, data[idx + 2] + fur);
        }
      }
    }

    return new ImageData(data, width, height);
  };

  self.onmessage = (event) => {
    const { imageData, filterType, threshold, intensity, time } = event.data;
    let result;
    switch (filterType) {
      case "atkinson":
        result = applyAtkinsonDither(imageData, threshold);
        break;
      case "spooky":
        result = applySpookyEffects(imageData, threshold, time);
        break;
      case "vampireGlow":
        result = applyVampireGlow(imageData, intensity, time);
        break;
      case "zombieDecay":
        result = applyZombieDecay(imageData, intensity, time);
        break;
      case "ghostlyFade":
        result = applyGhostlyFade(imageData, intensity, time);
        break;
      case "witchHex":
        result = applyWitchHex(imageData, intensity, time);
        break;
      case "werewolfFur":
        result = applyWerewolfFur(imageData, intensity, time);
        break;
      default:
        result = imageData;
    }
    self.postMessage(result);
  };
`;

const SpookyImage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const [sliderValue, setSliderValue] = useState<number[]>([127]);
  const [dragPosition, setDragPosition] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [processedImageData, setProcessedImageData] =
    useState<ImageData | null>(null);
  const [filterType, setFilterType] = useState<FilterType>("atkinson");

  useEffect(() => {
    const blob = new Blob([workerCode], { type: "application/javascript" });
    workerRef.current = new Worker(URL.createObjectURL(blob));
    workerRef.current.onmessage = (event) => {
      setProcessedImageData(event.data);
    };

    return () => {
      workerRef.current?.terminate();
    };
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

    if (filterType !== "atkinson") {
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

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.putImageData(processedImageData, 0, 0);

    const dragX = (dragPosition / 100) * canvas.width;
    ctx.putImageData(imageData, 0, 0, 0, 0, dragX, canvas.height);

    ctx.beginPath();
    ctx.moveTo(dragX, 0);
    ctx.lineTo(dragX, canvas.height);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [imageData, processedImageData, dragPosition]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.src = "/sticker.webp";
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
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Spooky Image</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="relative cursor-ew-resize mb-4"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <canvas ref={canvasRef} className="w-full h-auto"></canvas>
        </div>
        <div className="flex space-x-4 mb-4">
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
