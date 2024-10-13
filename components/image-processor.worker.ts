// imageProcessor.worker.ts

const applyAtkinsonDither = (
  imageData: ImageData,
  threshold: number
): ImageData => {
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

const applySpookyEffects = (
  imageData: ImageData,
  threshold: number
): ImageData => {
  const data = new Uint8ClampedArray(imageData.data);
  const width = imageData.width;
  const height = imageData.height;

  // Time-based seed for the effects
  const time = Date.now() * 0.001;

  // Vertical sync offset
  const verticalSyncOffset = Math.sin(time * 0.5) * 2;

  for (let y = 0; y < height; y++) {
    // Moving scanline effect
    const scanlineOffset = Math.sin(time * 2 + y * 0.1) * 2;

    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      // Apply vertical sync offset
      const sourceY = Math.max(
        0,
        Math.min(height - 1, y + Math.round(verticalSyncOffset))
      );
      const sourceIdx = (sourceY * width + x) * 4;

      // Slightly increase contrast
      for (let i = 0; i < 3; i++) {
        data[idx + i] = Math.min(
          255,
          Math.max(0, (data[sourceIdx + i] - 128) * 1.1 + 128)
        );
      }

      // Add subtle noise
      const noise = (Math.random() - 0.5) * 15;
      for (let i = 0; i < 3; i++) {
        data[idx + i] = Math.min(255, Math.max(0, data[idx + i] + noise));
      }

      // Vignette effect
      const distanceToCenter =
        Math.sqrt(
          Math.pow((x - width / 2) / (width / 2), 2) +
            Math.pow((y - height / 2) / (height / 2), 2)
        ) / 1.5;
      const vignette = Math.max(0, 1 - distanceToCenter);
      for (let i = 0; i < 3; i++) {
        data[idx + i] *= vignette;
      }

      // VHS Glitch effect
      const glitchIntensity = 0.05;
      const glitchPeriod = 0.1;
      const glitchAmplitude = 3;

      if (Math.sin(time * glitchPeriod + y * 0.1) > 1 - glitchIntensity) {
        const glitchOffset = Math.floor(
          Math.sin(time * 2 + y * 0.2) * glitchAmplitude
        );
        const glitchIdx = idx + glitchOffset * 4;

        if (glitchIdx >= 0 && glitchIdx < data.length - 3) {
          data[idx] = data[glitchIdx];
          data[idx + 1] = data[glitchIdx + 1];
          data[idx + 2] = data[glitchIdx + 2];
        }
      }

      // Moving horizontal scanlines
      const scanlineIntensity = 0.1;
      if ((y + Math.round(scanlineOffset)) % 3 === 0) {
        data[idx] *= 1 - scanlineIntensity;
        data[idx + 1] *= 1 - scanlineIntensity;
        data[idx + 2] *= 1 - scanlineIntensity;
      }

      // Apply dithering using the threshold
      const grayScale =
        data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
      const newPixel = grayScale > threshold ? 255 : 0;

      const error = grayScale - newPixel;

      // Distribute error (Atkinson dithering)
      if (x + 1 < width) data[idx + 4] += (error * 1) / 8;
      if (x + 2 < width) data[idx + 8] += (error * 1) / 8;
      if (y + 1 < height) {
        if (x - 1 > 0) data[idx + width * 4 - 4] += (error * 1) / 8;
        data[idx + width * 4] += (error * 1) / 8;
        if (x + 1 < width) data[idx + width * 4 + 4] += (error * 1) / 8;
      }
      if (y + 2 < height) data[idx + width * 8] += (error * 1) / 8;

      // Set the new pixel value
      data[idx] = data[idx + 1] = data[idx + 2] = newPixel;

      // Subtle color bleeding (common in VHS)
      const bleedAmount = 0.05;
      if (x > 0) {
        data[idx] += data[idx - 4] * bleedAmount;
        data[idx + 1] += data[idx - 3] * bleedAmount;
        data[idx + 2] += data[idx - 2] * bleedAmount;
      }

      // Subtle color tint (slightly reddish)
      if (newPixel > 0) {
        data[idx] *= 1.05;
        data[idx + 1] *= 0.95;
        data[idx + 2] *= 0.95;
      }
    }
  }

  return new ImageData(data, width, height);
};

self.onmessage = (event: MessageEvent) => {
  const { imageData, filterType, threshold } = event.data;
  let result: ImageData;

  if (filterType === "atkinson") {
    result = applyAtkinsonDither(imageData, threshold);
  } else {
    result = applySpookyEffects(imageData, threshold);
  }

  self.postMessage(result);
};

export {}; // Add this line to make TypeScript treat this as a module
