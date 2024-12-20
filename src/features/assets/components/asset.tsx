import { cn } from '@/utils/styles';
import { AssetType } from '@/features/assets/assets.validation';
import { Button } from '@/components/base/button';
import { PointerEvent, useEffect, useRef, useState } from 'react';
import { ProgressBar } from '@/components/base/progress-bar';

interface VideoAssetProps {
  src: string;
  className?: string;
}

export function VideoAsset({ src, className }: VideoAssetProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  const [progressRefreshInterval, setProgressRefreshInterval] = useState<NodeJS.Timeout>();
  const [isSeeking, setIsSeeking] = useState<boolean>(false);
  const [videoState, setVideoState] = useState<{
    duration: number;
    currentTime: number;
    isPlaying: boolean;
  }>({ duration: 0, currentTime: 0, isPlaying: false });

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    setVideoState((prev) => ({ ...prev, duration: videoElement.duration }));
  }, [videoRef]);

  const playVideo = async () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    await videoElement.play();
    setVideoState((prev) => ({ ...prev, isPlaying: true }));
    setProgressRefreshInterval(
      setInterval(
        () =>
          setVideoState((prev) => ({
            ...prev,
            currentTime: videoElement.currentTime
          })),
        1000 / 24
      )
    );
  };

  const pauseVideo = (pauseForSeek?: boolean) => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    videoElement.pause();
    clearInterval(progressRefreshInterval);
    setVideoState((prev) => ({ ...prev, isPlaying: pauseForSeek || false }));
  };

  const toggleVideoPlayback = async () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    if (videoElement.paused) {
      await playVideo();
    } else {
      pauseVideo();
    }
  };

  const handleProgressBarSeek = (event: PointerEvent<HTMLDivElement>) => {
    const videoElement = videoRef.current;
    const progressBarElement = progressBarRef.current;
    if (!videoElement || !progressBarElement) return;
    if (!videoElement.paused) {
      pauseVideo(true);
    }
    const rect = progressBarElement.getBoundingClientRect();
    const clickPositionX = event.clientX - rect.left;
    const percentage = Math.min(Math.max(clickPositionX / rect.width, 0), 1);
    const progress = videoElement.duration * percentage;
    videoElement.currentTime = progress;
    setVideoState((prev) => ({ ...prev, currentTime: progress }));
  };

  const handleProgressBarPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    setIsSeeking(true);
    handleProgressBarSeek(event);
  };

  const handleSeekEnd = async () => {
    console.log('pointer up!');
    if (!isSeeking) return;
    setIsSeeking(false);
    const videoElement = videoRef.current;
    if (videoElement && videoElement.paused && videoState.isPlaying) {
      await playVideo();
    }
  };

  return (
    <div
      className={cn('relative h-full w-fit overflow-hidden rounded-xl', className)}
      onPointerMove={(event) => isSeeking && handleProgressBarSeek(event)}
      onPointerUp={handleSeekEnd}
      onPointerLeave={handleSeekEnd}
    >
      <video
        ref={videoRef}
        src={src}
        className={'max-h-full max-w-full'}
      />
      <div className={'absolute bottom-2 left-2 right-2 flex h-8 gap-2'}>
        <Button
          type={'button'}
          className={'h-full'}
          onClick={toggleVideoPlayback}
        >
          {!videoRef.current?.paused ? '||' : '>'}
        </Button>
        <div className={'w-full'}>
          <ProgressBar
            ref={progressBarRef}
            value={(videoState.currentTime / videoState.duration) * 100}
            className={'cursor-pointer rounded-xl'}
            onPointerDown={handleProgressBarPointerDown}
          />
          {new Date(videoState.currentTime * 1000).toISOString().substring(11, 19)}/
          {new Date(videoState.duration * 1000).toISOString().substring(11, 19)}
        </div>
      </div>
    </div>
  );
}

interface AssetProps {
  assetType: AssetType;
  fullUrl?: string;
  fileName?: string;
  description?: string | null;
  className?: string;
}

export function Asset({ assetType, fullUrl, fileName, description, className }: AssetProps) {
  if (!fileName && !fullUrl) {
    return null;
  }

  const fullUri = fullUrl || '/media/' + fileName;

  if (assetType === 'image') {
    return (
      <img
        src={fullUri}
        alt={description || 'Brak opisu.'}
        className={cn('max-h-full max-w-full rounded-xl', className)}
      />
    );
  } else if (assetType === 'video') {
    return (
      <VideoAsset
        src={fullUri}
        className={className}
      />
    );
  } else if (assetType === 'audio') {
    return <audio src={fullUri}></audio>;
  } else {
    return <div>Niewłaściwy typ multimediów.</div>;
  }
}
