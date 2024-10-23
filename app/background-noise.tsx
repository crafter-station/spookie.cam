'use client';

import { useEffect, useRef, useState } from 'react';

import { HeadphoneOffIcon, HeadphonesIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

const BACKGROUND_NOISE_AUDIO_URLS = [
  '/audios/horror-ambience.mp3',
  '/audios/whispers.mp3',
  '/audios/terror.mp3',
] as const;

const LOCAL_STORAGE_KEY = 'background-audio-preference' as const;
const AUTOPLAY_DELAY = 2000 as const; // 2 seconds in milliseconds

export const BackgroundNoiseAudioPlayButton = (): JSX.Element => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentAudioIndex, setCurrentAudioIndex] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const autoplayTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize audio and state when component mounts in browser
  useEffect(() => {
    // Initialize audio instance
    audioRef.current = new Audio(BACKGROUND_NOISE_AUDIO_URLS[0]);

    // Initialize state from localStorage if available
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
        audioRef.current.src = BACKGROUND_NOISE_AUDIO_URLS[currentAudioIndex];
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
        audioRef.current.currentTime = 0;
      }
    };
  }, [currentAudioIndex]); // Empty dependency array as this should only run once on mount

  useEffect(() => {
    if (!audioRef.current) return;

    const handleAudioEnd = () => {
      setCurrentAudioIndex((prevIndex: number) => {
        const nextIndex = (prevIndex + 1) % BACKGROUND_NOISE_AUDIO_URLS.length;
        if (audioRef.current) {
          audioRef.current.src = BACKGROUND_NOISE_AUDIO_URLS[nextIndex];
          audioRef.current
            .play()
            .catch((error: Error) =>
              console.error('Error playing audio:', error),
            );
        }
        return nextIndex;
      });
    };

    audioRef.current.addEventListener('ended', handleAudioEnd);

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('ended', handleAudioEnd);
      }
    };
  }, []);

  // Effect to handle playing/pausing and saving preference
  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.src = BACKGROUND_NOISE_AUDIO_URLS[currentAudioIndex];
      audioRef.current
        .play()
        .catch((error: Error) => console.error('Error playing audio:', error));
    } else {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(isPlaying));
  }, [isPlaying, currentAudioIndex]);

  const togglePlayPause = (): void => {
    setIsPlaying(!isPlaying);
    if (autoplayTimeoutRef.current) {
      clearTimeout(autoplayTimeoutRef.current);
    }
  };

  return (
    <Button
      id="background-noise-button"
      onClick={togglePlayPause}
      className="absolute bottom-4 right-4 flex size-16 items-center justify-center rounded-full"
      variant="outline"
      size="icon"
    >
      {isPlaying ? (
        <HeadphonesIcon className="size-10" />
      ) : (
        <HeadphoneOffIcon className="size-10" />
      )}
    </Button>
  );
};

export default BackgroundNoiseAudioPlayButton;
