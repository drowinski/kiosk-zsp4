import React, { ReactEventHandler, useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/base/button';
import { ProgressBar } from '@/components/base/progress-bar';
import { Slider } from '@/components/base/slider';
import { PauseIcon, PlayIcon, VolumeIcon, VolumeOffIcon } from '@/components/icons';
import { cn } from '@/utils/styles';

interface VideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  showPlayOverlay?: boolean;
  disabled?: boolean;
}

export function Video({ src, showPlayOverlay: _showPlayOverlay = true, disabled, className, ...props }: VideoProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  const [wrapperFillDimension, setWrapperFillDimension] = useState<'width' | 'height'>('width');

  const [isPaused, setIsPaused] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isPointerDownOnProgressBar, setIsPointerDownOnProgressBar] = useState(false);
  const [shouldResumeOnScrubEnd, setShouldResumeOnScrubEnd] = useState(false);
  const [showPlayOverlay, setShowPlayOverlay] = useState(_showPlayOverlay);
  const [volume, _setVolume] = useState(videoRef.current?.volume ?? 1);

  const handleProgress: ReactEventHandler<HTMLVideoElement> = (e) => {
    const video = e.currentTarget;
    const progress = video.currentTime / video.duration;
    setProgress(progress);
  };

  const togglePlay = (force?: boolean) => {
    const video = videoRef.current;
    if (!video) return;

    if (force !== undefined && force) {
      video.play();
      return;
    } else if (force !== undefined && !force) {
      video.pause();
      return;
    }

    if (video.paused || video.ended) {
      video.play();
    } else {
      video.pause();
    }
  };

  useEffect(() => {
    if (disabled === undefined || disabled) return;
    togglePlay(false);
  }, [disabled]);

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
    _setVolume(volume);
  };

  if (videoRef.current?.volume && videoRef.current?.volume !== volume) {
    setVolume(videoRef.current.volume);
  }

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

  const resize = useCallback(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const wrapperWidth = wrapper.getBoundingClientRect().width;
    const wrapperHeight = wrapper.getBoundingClientRect().height;

    const parent = wrapper.parentElement;
    if (parent) {
      const parentStyle = window.getComputedStyle(parent);
      const parentWidth =
        parent.getBoundingClientRect().width -
        (parseFloat(parentStyle.paddingLeft) + parseFloat(parentStyle.paddingRight));
      const parentHeight =
        parent.getBoundingClientRect().height -
        (parseFloat(parentStyle.paddingTop) + parseFloat(parentStyle.paddingBottom));

      const parentAspectRatio = parentWidth / parentHeight;
      const wrapperAspectRatio = wrapperWidth / wrapperHeight;

      if (parentAspectRatio < wrapperAspectRatio) {
        setWrapperFillDimension('width');
      } else {
        setWrapperFillDimension('height');
      }
    } else {
      setWrapperFillDimension('width');
    }
  }, []);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const wrapperParent = wrapperRef.current?.parentElement;
    if (!wrapper || !wrapperParent) return;
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(wrapper);
    resizeObserver.observe(wrapperParent);
    resize();
    return () => resizeObserver.disconnect();
  }, [resize]);

  return (
    <div
      ref={wrapperRef}
      className={cn(
        'relative overflow-hidden rounded-xl',
        wrapperFillDimension === 'width' && 'h-fit w-full',
        wrapperFillDimension === 'height' && 'h-full w-fit',
        className
      )}
    >
      <video
        ref={videoRef}
        src={src}
        controls={false}
        className={'h-full w-full'}
        onPlay={() => setIsPaused(false)}
        onPause={() => setIsPaused(true)}
        onClick={() => togglePlay()}
        onTimeUpdate={handleProgress}
        {...props}
      />
      {showPlayOverlay ? (
        <Button
          variant={'ghost'}
          className={'absolute inset-0 h-full w-full'}
          onClick={() => {
            setShowPlayOverlay(false);
            togglePlay(true);
          }}
          aria-label={'Odtwórz film'}
        >
          <div className={'flex h-full w-full items-center justify-center'}>
            <div className={'aspect-square rounded-xl bg-primary p-3 text-primary-foreground'}>
              <PlayIcon className={'h-full w-full'} />
            </div>
          </div>
        </Button>
      ) : (
        <div className={'swiper-no-swiping absolute bottom-2 left-2 right-2 flex flex-col gap-2'}>
          <div className={'flex w-full items-end justify-between gap-1'}>
            <Button
              size={'icon'}
              onClick={() => togglePlay()}
              aria-label={isPaused ? 'Odtwórz film' : 'Wstrzymaj film'}
            >
              {isPaused ? <PlayIcon /> : <PauseIcon />}
            </Button>
            <div className={'flex max-w-[50%] items-center gap-1'}>
              <Slider
                className={'w-32 max-w-full'}
                value={[volume]}
                min={0}
                max={1}
                step={0.05}
                onValueChange={(value) => setVolume(value[0])}
                aria-label={'Suwak głośności'}
              />
              <div className={'h-fit w-fit rounded-lg bg-primary p-1 text-primary-foreground'}>
                {volume === 0 ? <VolumeOffIcon /> : <VolumeIcon />}
              </div>
            </div>
          </div>
          <ProgressBar
            ref={progressBarRef}
            value={progress * 100}
            onPointerDown={handleScrubStart}
            onClick={(e) => scrub(e.nativeEvent)}
            aria-label={'Suwak czasu'}
            className={'grow'}
          />
        </div>
      )}
    </div>
  );
}
