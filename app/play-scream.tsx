'use client';

import { useEffect, useRef, useState } from 'react';

interface AudioElementRef {
  current: HTMLAudioElement | null;
}

interface AudioPlayError extends Error {
  name: string;
  message: string;
  code?: number;
}

export default function PlayScream(): null {
  const audioRef: AudioElementRef = useRef<HTMLAudioElement | null>(null);
  const [isClient, setIsClient] = useState<boolean>(false);

  useEffect((): void => {
    setIsClient(true);
    // Create Audio instance only on client side
    audioRef.current = new Audio('/audios/scream.mp3');
  }, []);

  useEffect((): (() => void) => {
    if (!isClient) return () => {};

    const handleClick = async (): Promise<void> => {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        try {
          await audioRef.current.play();
        } catch (error) {
          console.error('Error playing audio:', error as AudioPlayError);
        }
      }
    };

    const continueButton: HTMLElement | null =
      document.getElementById('continue-button');
    if (continueButton) {
      continueButton.addEventListener('click', handleClick);
    }

    // Cleanup function
    return () => {
      if (continueButton) {
        continueButton.removeEventListener('click', handleClick);
      }
      // Cleanup audio instance
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [isClient]);

  return null;
}
