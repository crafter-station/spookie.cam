import { useCallback, useEffect, useRef, useState } from 'react';

import { HeadphoneOff, Headphones } from 'lucide-react';

interface MegaphoneButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  isPlaying: boolean;
  src: string;
  reload: number;
}

const MegaphoneButton = ({
  isPlaying,
  reload,
  src,
  ...props
}: MegaphoneButtonProps) => {
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleMute = useCallback(() => {
    if (!audioRef.current) return;

    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  const handleEnded = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'm' || e.key === 'M') {
        toggleMute();
      }
    };

    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [toggleMute]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = 0.5;

    if (isPlaying) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, reload]);

  return (
    <div {...props}>
      <audio ref={audioRef} src={src} onEnded={handleEnded} />

      <button
        type="button"
        onClick={toggleMute}
        className="absolute right-16 top-10 z-50 mr-2 rounded-full bg-black/10 p-1"
        aria-label={`Toggle mute ${isMuted ? 'off' : 'on'}`}
      >
        {isMuted ? (
          <HeadphoneOff size={22} color="white" />
        ) : (
          <Headphones size={22} color="white" />
        )}
      </button>
    </div>
  );
};

export default MegaphoneButton;
