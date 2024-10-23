'use client';

import { useEffect, useState } from 'react';

type UseDurationParams =
  | { customDurations: number[]; audios?: string[] }
  | { customDurations?: number[]; audios: string[] };

export const useDuration = ({
  customDurations = [],
  audios = [],
}: UseDurationParams) => {
  const [durations, setDurations] = useState<number[]>([]);

  useEffect(() => {
    if (audios.length === 0) setDurations(customDurations);

    const fetchDurations = async () => {
      try {
        const durationsArray = await Promise.all(
          audios.map(
            (audio) =>
              new Promise<number>((resolve, reject) => {
                const audioElement = new Audio(audio);

                audioElement.onloadedmetadata = () => {
                  resolve(audioElement.duration);
                };

                audioElement.onerror = () => {
                  reject(new Error(`Error audio: ${audio}`));
                };
              }),
          ),
        );

        const finalDurations = durationsArray.map((duration, index) =>
          customDurations[index] !== undefined
            ? customDurations[index]
            : duration,
        );

        setDurations((prevDurations) =>
          JSON.stringify(prevDurations) !== JSON.stringify(finalDurations)
            ? finalDurations
            : prevDurations,
        );
      } catch (error) {
        console.error(error);
        setDurations(customDurations);
      }
    };

    fetchDurations();
  }, [audios, customDurations]);

  return durations;
};
