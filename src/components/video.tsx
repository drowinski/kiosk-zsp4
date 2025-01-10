import React, { MouseEvent, PointerEvent, ReactEventHandler, useRef, useState } from 'react';
import { Button } from '@/components/base/button';
import { ProgressBar } from '@/components/base/progress-bar';

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

  const handleScrubStart = (e: PointerEvent) => {
    setIsPointerDownOnProgressBar(true);
    if (!isPaused) {
      setShouldResumeOnScrubEnd(true);
      togglePlay(false);
    }
    scrub(e);
  }

  const handleScrubEnd = () => {
    setIsPointerDownOnProgressBar(false);
    if (isPaused && shouldResumeOnScrubEnd) {
      setShouldResumeOnScrubEnd(false);
      togglePlay(true);
    }
  }

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
      <div className={'absolute bottom-2 left-2 right-2 flex h-8 gap-2'}>
        <Button onClick={() => togglePlay()}>{isPaused ? '>' : '||'}</Button>
        <ProgressBar
          ref={progressBarRef}
          value={progress * 100}
          onPointerDown={handleScrubStart}
          onPointerUp={handleScrubEnd}
          onPointerMove={(e) => isPointerDownOnProgressBar && scrub(e)}
          onClick={(e) => scrub(e)}
        />
      </div>
    </div>
  );
}
