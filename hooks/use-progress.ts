'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface UseProgressParams {
  updateInterval: number;
  duration: number;
  onCompleted: () => void;
}

export const useProgress = ({
  updateInterval,
  duration,
  onCompleted,
}: UseProgressParams) => {
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [isProgressPaused, setIsProgressPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const totalUpdateCount = (duration * 1000) / updateInterval;

  const completedUpdates = useRef(
    (progressPercentage / 100) * totalUpdateCount,
  );

  useEffect(() => {
    if (isProgressPaused || progressPercentage >= 100) return;

    intervalRef.current = setInterval(() => {
      completedUpdates.current++;
      const newProgress = (completedUpdates.current / totalUpdateCount) * 100;

      setProgressPercentage(newProgress);
      if (newProgress >= 100) {
        clearInterval(intervalRef.current!);
        onCompleted();
      }
    }, updateInterval);

    return () => clearInterval(intervalRef.current!);
  }, [
    duration,
    isProgressPaused,
    updateInterval,
    onCompleted,
    totalUpdateCount,
    progressPercentage,
  ]);

  const resetProgressToStart = useCallback(() => {
    setProgressPercentage(0);
    completedUpdates.current = 0;
  }, []);

  return {
    progressPercentage,
    isProgressPaused,
    setIsProgressPaused,
    resetProgressToStart,
  };
};
