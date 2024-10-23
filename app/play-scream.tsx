'use client';

import { useEffect, useState } from 'react';

export default function PlayScream() {
  const [audio] = useState(new Audio('/audios/scream.mp3'));

  useEffect(() => {
    const continueButton = document.getElementById('continue-button');

    const handleClick = () => {
      audio.currentTime = 0; // Reset audio to start
      audio.play().catch((error) => {
        console.error('Error playing audio:', error);
      });
    };

    if (continueButton) {
      continueButton.addEventListener('click', handleClick);
    }

    // Cleanup function
    return () => {
      if (continueButton) {
        continueButton.removeEventListener('click', handleClick);
      }
    };
  }, [audio]); // Empty dependency array since we only want this to run once

  return null;
}
