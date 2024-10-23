'use client';

import { useEffect, useRef, useState } from 'react';

import { HeadphoneOffIcon, HeadphonesIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

const BACKGROUND_NOISE_AUDIO_URLS = [
  '/audios/horror-ambience.mp3',
  '/audios/whispers.mp3',
  '/audios/terror.mp3',
];

const LOCAL_STORAGE_KEY = 'background-audio-preference';
const AUTOPLAY_DELAY = 2000; // 5 seconds in milliseconds

export const BackgroundNoiseAudioPlayButton = () => {
  const [isPlaying, setIsPlaying] = useState(() => {
    // Initialize state from localStorage if available
    if (typeof window !== 'undefined') {
      const savedPreference = localStorage.getItem(LOCAL_STORAGE_KEY);
      return savedPreference ? JSON.parse(savedPreference) : false;
    }
    return false;
  });

  const [currentAudioIndex, setCurrentAudioIndex] = useState(0);
  const audioRef = useRef(new Audio(BACKGROUND_NOISE_AUDIO_URLS[0]));
  const autoplayTimeoutRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;

    const handleAudioEnd = () => {
      setCurrentAudioIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % BACKGROUND_NOISE_AUDIO_URLS.length;
        audio.src = BACKGROUND_NOISE_AUDIO_URLS[nextIndex];
        audio
          .play()
          .catch((error) => console.error('Error playing audio:', error));
        return nextIndex;
      });
    };

    audio.addEventListener('ended', handleAudioEnd);

    // Set up autoplay timer
    autoplayTimeoutRef.current = setTimeout(() => {
      const savedPreference = localStorage.getItem(LOCAL_STORAGE_KEY);
      // Only autoplay if user hasn't explicitly set a preference
      if (!savedPreference) {
        setIsPlaying(true);
        audio.src = BACKGROUND_NOISE_AUDIO_URLS[currentAudioIndex];
        audio
          .play()
          .catch((error) => console.error('Error playing audio:', error));
      }
    }, AUTOPLAY_DELAY);

    return () => {
      audio.removeEventListener('ended', handleAudioEnd);
      audio.pause();
      audio.currentTime = 0;
      if (autoplayTimeoutRef.current) {
        clearTimeout(autoplayTimeoutRef.current);
      }
    };
  }, []);

  // Effect to handle playing/pausing and saving preference
  useEffect(() => {
    const audio = audioRef.current;

    if (isPlaying) {
      audio.src = BACKGROUND_NOISE_AUDIO_URLS[currentAudioIndex];
      audio
        .play()
        .catch((error) => console.error('Error playing audio:', error));
    } else {
      audio.pause();
      audio.currentTime = 0;
    }

    // Save preference to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(isPlaying));
    }
  }, [isPlaying, currentAudioIndex]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    // Clear autoplay timeout when user manually interacts
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
