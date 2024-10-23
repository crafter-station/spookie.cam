'use client';

import { useEffect, useRef, useState } from 'react';

import { HeadphoneOffIcon, HeadphonesIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

const BACKGROUND_NOISE_AUDIO_URLS = [
  '/audios/scream.mp3',
  '/audios/horror-ambience.mp3',
  '/audios/whispers.mp3',
  '/audios/terror.mp3',
] as const;

const LOCAL_STORAGE_KEY = 'background-audio-preference' as const;
const AUTOPLAY_DELAY = 2000 as const; // 2 seconds in milliseconds

export const BackgroundNoiseAudioPlayButton = (): JSX.Element => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentAudioIndex, setCurrentAudioIndex] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const autoplayTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize state and setup autoplay when component mounts
  useEffect(() => {
    const savedPreference = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedPreference) {
      setIsPlaying(JSON.parse(savedPreference) as boolean);
    }

    // Set up autoplay timer
    autoplayTimeoutRef.current = setTimeout(() => {
      const savedPref = localStorage.getItem(LOCAL_STORAGE_KEY);
      // Only autoplay if user hasn't explicitly set a preference
      if (!savedPref && audioRef.current) {
        setIsPlaying(true);
        audioRef.current
          .play()
          .catch((error: Error) =>
            console.error('Error playing audio:', error),
          );
      }
    }, AUTOPLAY_DELAY);

    return () => {
      if (autoplayTimeoutRef.current) {
        clearTimeout(autoplayTimeoutRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        // eslint-disable-next-line react-hooks/exhaustive-deps
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  // Handle audio end and playlist cycling
  useEffect(() => {
    if (!audioRef.current) return;

    const handleAudioEnd = () => {
      setCurrentAudioIndex(
        (prevIndex: number) =>
          (prevIndex + 1) % BACKGROUND_NOISE_AUDIO_URLS.length,
      );
    };

    audioRef.current.addEventListener('ended', handleAudioEnd);

    return () => {
      if (audioRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        audioRef.current.removeEventListener('ended', handleAudioEnd);
      }
    };
  }, []);

  // Handle playing/pausing and saving preference
  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current
        .play()
        .catch((error: Error) => console.error('Error playing audio:', error));
    } else {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(isPlaying));
  }, [isPlaying]);

  const togglePlayPause = (): void => {
    setIsPlaying(!isPlaying);
    if (autoplayTimeoutRef.current) {
      clearTimeout(autoplayTimeoutRef.current);
    }
  };

  return (
    <div className="absolute bottom-4 right-4">
      <audio
        ref={audioRef}
        src={BACKGROUND_NOISE_AUDIO_URLS[currentAudioIndex]}
        preload="auto"
        id="background-noise-audio"
      />
      <Button
        id="background-noise-button"
        onClick={togglePlayPause}
        className="flex size-16 items-center justify-center rounded-full"
        variant="outline"
        size="icon"
      >
        {isPlaying ? (
          <HeadphonesIcon className="size-10" />
        ) : (
          <HeadphoneOffIcon className="size-10" />
        )}
      </Button>
    </div>
  );
};

export default BackgroundNoiseAudioPlayButton;
