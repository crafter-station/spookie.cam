'use client';

import { useCallback, useEffect } from 'react';

import { useProgress } from '@/hooks/use-progress';
import { ChevronLeft, ChevronRight, Loader2, Pause, Play } from 'lucide-react';

import { cn } from '@/lib/utils';

import MegaphoneButton from './audio-player';
import { Progress } from './ui/progress';

interface ProgressBarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  durations: number[]; // in seconds
  currentSlide: number;
  handleNextProgress: () => void;
  handlePreviousProgress: () => void;
  audios?: string[];
  onCompleted: () => void;
  children: React.ReactNode;
}

export const ProgressBarGroup = ({
  durations,
  currentSlide,
  handleNextProgress,
  handlePreviousProgress,
  audios,
  className,
  onCompleted,
  children,
}: ProgressBarGroupProps) => {
  const {
    progressPercentage,
    resetProgressToStart,
    isProgressPaused,
    setIsProgressPaused,
  } = useProgress({
    updateInterval: 100,
    duration: durations[currentSlide],
    onCompleted: () => {
      if (currentSlide !== durations.length - 1) {
        handleNextProgress();
        resetProgressToStart();
      } else {
        onCompleted();
      }
    },
  });
  const handlePageChange = useCallback(
    (direction: 'next' | 'previous') => {
      if (direction === 'next') {
        handleNextProgress();
      } else {
        handlePreviousProgress();
      }
      setIsProgressPaused(false);
      resetProgressToStart();
    },
    [
      handleNextProgress,
      handlePreviousProgress,
      setIsProgressPaused,
      resetProgressToStart,
    ],
  );
  const handlePause = useCallback(() => {
    if (currentSlide === durations.length - 1 && progressPercentage === 100)
      return;
    setIsProgressPaused((prev) => !prev);
  }, [setIsProgressPaused, currentSlide, durations.length, progressPercentage]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (
        e.key === 'l' ||
        (e.key === 'L' && currentSlide !== durations.length - 1)
      ) {
        handlePageChange('next');
      } else if ((e.key === 'j' || e.key === 'J') && currentSlide > 0) {
        handlePageChange('previous');
      } else if (e.key === 'k' || e.key === 'K') {
        handlePause();
      }
    };

    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [
    handlePageChange,
    handlePause,
    currentSlide,
    durations.length,
    progressPercentage,
  ]);

  if (durations.length === 0) {
    return (
      <div
        className="flex aspect-square h-full items-center justify-center"
        aria-live="polite"
      >
        <Loader2 className="mr-2 size-4 animate-spin" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative flex h-full flex-col gap-1 bg-[#262626] p-4',
        className,
      )}
    >
      <div className="flex space-x-2">
        {durations.map((_, index) => (
          <Progress
            key={index}
            value={
              index < currentSlide
                ? 100
                : index === currentSlide
                  ? progressPercentage
                  : 0
            }
            className="h-2 w-full bg-gray-300"
            aria-label={`Progress for step ${index + 1}`}
          />
        ))}
      </div>
      {audios && (
        <MegaphoneButton
          src={audios[currentSlide]}
          isPlaying={!isProgressPaused}
          reload={currentSlide}
        />
      )}
      <button
        type="button"
        className="absolute right-8 top-10 z-50 rounded-full bg-black/10 p-1"
        onClick={handlePause}
        aria-label={isProgressPaused ? 'Play' : 'Pause'}
      >
        {isProgressPaused ? (
          <Play size={22} color="white" />
        ) : (
          <Pause size={22} color="white" />
        )}
      </button>
      <section className="flex h-full flex-col items-center justify-center">
        {children}
      </section>
      {currentSlide > 0 && (
        <button
          type="button"
          onClick={() => handlePageChange('previous')}
          className="absolute bottom-5 left-5 z-50 rounded-full bg-black/10"
          aria-label="Previous slide"
        >
          <ChevronLeft size={30} color="white" />
        </button>
      )}
      {currentSlide + 1 < durations.length && (
        <button
          type="button"
          onClick={() => handlePageChange('next')}
          className="absolute bottom-5 right-8 z-50 rounded-full bg-black/10"
          aria-label="Next slide"
        >
          <ChevronRight size={30} color="white" />
        </button>
      )}
    </div>
  );
};
