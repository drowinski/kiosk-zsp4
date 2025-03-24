import React, { ReactEventHandler, useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/base/button';
import { ProgressBar } from '@/components/base/progress-bar';
import { Slider } from '@/components/base/slider';
import { PauseIcon, PlayIcon } from '@/components/icons';

interface VideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {}

export function Video({ src, className, ...props }: VideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  const [isPaused, setIsPaused] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isPointerDownOnProgressBar, setIsPointerDownOnProgressBar] = useState(false);
  const [shouldResumeOnScrubEnd, setShouldResumeOnScrubEnd] = useState(false);

  const handleProgress: ReactEventHandler<HTMLVideoElement> = (e) => {
    const video = e.currentTarget;
    const progress = video.currentTime / video.duration;
    setProgress(progress);
  };

  const togglePlay = (force?: boolean) => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (force !== undefined && force) {
      videoElement.play();
      return;
    } else if (force !== undefined && !force) {
      videoElement.pause();
      return;
    }

    if (videoElement.paused || videoElement.ended) {
      videoElement.play();
    } else {
      videoElement.pause();
    }
  };

  const scrub = (event: PointerEvent | MouseEvent) => {
    const video = videoRef.current;
    const progressBar = progressBarRef.current;
    if (!video || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const clickPositionX = event.clientX - rect.left;
    const percentage = Math.min(Math.max(clickPositionX / rect.width, 0), 1);

    const scrubbedTime = video.duration * percentage;
    setProgress(scrubbedTime / video.duration);
    video.currentTime = scrubbedTime;
  };

  const handleScrubStart = (event: React.PointerEvent) => {
    setIsPointerDownOnProgressBar(true);
    if (!isPaused) {
      setShouldResumeOnScrubEnd(true);
      togglePlay(false);
    }
    scrub(event.nativeEvent);
  };

  const handleScrubEnd = useCallback(() => {
    setIsPointerDownOnProgressBar(false);
    if (isPaused && shouldResumeOnScrubEnd) {
      setShouldResumeOnScrubEnd(false);
      togglePlay(true);
    }
  }, [isPaused, shouldResumeOnScrubEnd]);

  const setVolume = (volume: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = volume;
  };

  useEffect(() => {
    const handleWindowPointerMove = (e: PointerEvent) => isPointerDownOnProgressBar && scrub(e);
    window.addEventListener('pointermove', handleWindowPointerMove);
    const handleWindowPointerUp = () => handleScrubEnd();
    window.addEventListener('pointerup', handleWindowPointerUp);

    return () => {
      window.removeEventListener('pointermove', handleWindowPointerMove);
      window.removeEventListener('pointerup', handleWindowPointerUp);
    };
  }, [handleScrubEnd, isPointerDownOnProgressBar]);

  return (
    <div className={'relative h-full w-fit overflow-hidden rounded-xl'}>
      <video
        ref={videoRef}
        src={src}
        controls={false}
        className={'max-h-full max-w-full'}
        onPlay={() => setIsPaused(false)}
        onPause={() => setIsPaused(true)}
        onTimeUpdate={handleProgress}
        {...props}
      />
      <div className={'absolute bottom-2 left-2 right-2 flex h-8 gap-2 swiper-no-swiping'}>
        <Button
          size={'square'}
          onClick={() => togglePlay()}
        >
          {isPaused ? <PlayIcon /> : <PauseIcon />}
        </Button>
        <div className={'flex h-full w-full flex-col justify-between'}>
          <ProgressBar
            ref={progressBarRef}
            value={progress * 100}
            onPointerDown={handleScrubStart}
            onClick={(e) => scrub(e.nativeEvent)}
          />
          <Slider
            defaultValue={[videoRef.current?.volume || 1]}
            min={0}
            max={1}
            step={0.05}
            onValueChange={(value) => setVolume(value[0])}
          />
        </div>
      </div>
    </div>
  );
}
