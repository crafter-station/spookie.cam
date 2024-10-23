const ctx: Worker = self as any;

const applyAtkinsonDither = (
  imageData: ImageData,
  threshold: number,
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
  threshold: number,
  time: number,
): ImageData => {
  const data = new Uint8ClampedArray(imageData.data);
  const width = imageData.width;
  const height = imageData.height;

  const verticalSyncOffset = Math.sin(time * 0.5) * 2;

  for (let y = 0; y < height; y++) {
    const scanlineOffset = Math.sin(time * 2 + y * 0.1) * 2;

    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const sourceY = Math.max(
        0,
        Math.min(height - 1, y + Math.round(verticalSyncOffset)),
      );
      const sourceIdx = (sourceY * width + x) * 4;

      for (let i = 0; i < 3; i++) {
        data[idx + i] = Math.min(
          255,
          Math.max(0, (data[sourceIdx + i] - 128) * 1.1 + 128),
        );
      }

      const noise = (Math.random() - 0.5) * 15;
      for (let i = 0; i < 3; i++) {
        data[idx + i] = Math.min(255, Math.max(0, data[idx + i] + noise));
      }

      const distanceToCenter =
        Math.sqrt(
          Math.pow((x - width / 2) / (width / 2), 2) +
            Math.pow((y - height / 2) / (height / 2), 2),
        ) / 1.5;
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

      const grayScale =
        data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
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

const applyVampireGlow = (
  imageData: ImageData,
  intensity: number,
  time: number,
): ImageData => {
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

const applyZombieDecay = (
  imageData: ImageData,
  intensity: number,
  time: number,
): ImageData => {
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

const applyGhostlyFade = (
  imageData: ImageData,
  intensity: number,
  time: number,
): ImageData => {
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

const applyWitchHex = (
  imageData: ImageData,
  intensity: number,
  time: number,
): ImageData => {
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
      const spell = Math.sin(time * 0.005 + x * y * 0.001) * intensity;
      if (spell > intensity * 0.7) {
        data[idx] = 255 - data[idx];
        data[idx + 1] = 255 - data[idx + 1];
        data[idx + 2] = 255 - data[idx + 2];
      }
    }
  }

  return new ImageData(data, width, height);
};

const applyWerewolfFur = (
  imageData: ImageData,
  intensity: number,
  time: number,
): ImageData => {
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

ctx.onmessage = (event: MessageEvent) => {
  const { imageData, filterType, threshold, intensity, time } = event.data;
  let result: ImageData;
  switch (filterType) {
    case 'atkinson':
      result = applyAtkinsonDither(imageData, threshold);
      break;
    case 'spooky':
      result = applySpookyEffects(imageData, threshold, time);
      break;
    case 'vampireGlow':
      result = applyVampireGlow(imageData, intensity, time);
      break;
    case 'zombieDecay':
      result = applyZombieDecay(imageData, intensity, time);
      break;
    case 'ghostlyFade':
      result = applyGhostlyFade(imageData, intensity, time);
      break;
    case 'witchHex':
      result = applyWitchHex(imageData, intensity, time);
      break;
    case 'werewolfFur':
      result = applyWerewolfFur(imageData, intensity, time);
      break;
    default:
      result = imageData;
  }
  ctx.postMessage(result);
};

// Add this line at the end of the file
export {};
