import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BunnyVideoPlayer = ({ 
  videoId, 
  title, 
  poster, 
  className = "",
  autoplay = false,
  controls = true 
}) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const cdnHostname = import.meta.env.VITE_BUNNY_VIDEO_CDN_HOSTNAME;
  const libraryId = import.meta.env.VITE_BUNNY_VIDEO_LIBRARY_ID;

  // Generate video URL for Bunny Stream - use HLS for streaming
  const getVideoUrl = (videoId) => {
    // Use HLS playlist for streaming (this is the correct format for Bunny Stream)
    return `https://${cdnHostname}/${videoId}/playlist.m3u8`;
  };

  const getPosterUrl = (videoId) => {
    return `https://${cdnHostname}/${videoId}/thumbnail.jpg`;
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedData = () => {
      setIsLoading(false);
      setDuration(video.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleError = (e) => {
      setError('Failed to load video');
      setIsLoading(false);
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('error', handleError);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleSeek = (e) => {
    const video = videoRef.current;
    if (!video) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    video.currentTime = pos * duration;
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen();
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const restart = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime = 0;
    video.play();
  };

  if (error) {
    return (
      <div className={`bg-gray-900 rounded-lg flex items-center justify-center p-8 ${className}`}>
        <div className="text-center text-white">
          <p className="text-lg mb-2">خطأ في تحميل الفيديو</p>
          <p className="text-sm text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-black rounded-lg overflow-hidden group ${className}`}>
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        poster={poster || getPosterUrl(videoId)}
        autoPlay={autoplay}
        playsInline
        preload="metadata"
      >
        <source src={getVideoUrl(videoId)} type="application/x-mpegURL" />
        <p className="text-white p-4">
          متصفحك لا يدعم تشغيل الفيديو المباشر. 
          <a href={getVideoUrl(videoId)} className="underline">رابط الفيديو</a>
        </p>
      </video>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      )}

      {/* Custom Controls */}
      {controls && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {/* Progress Bar */}
          <div 
            className="w-full h-2 bg-gray-600 rounded-full mb-4 cursor-pointer"
            onClick={handleSeek}
          >
            <div 
              className="h-full bg-heritage-gold rounded-full transition-all duration-150"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Button
                onClick={togglePlay}
                variant="ghost"
                size="sm"
                className="text-white hover:text-heritage-gold p-2"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>

              <Button
                onClick={restart}
                variant="ghost"
                size="sm"
                className="text-white hover:text-heritage-gold p-2"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>

              <Button
                onClick={toggleMute}
                variant="ghost"
                size="sm"
                className="text-white hover:text-heritage-gold p-2"
              >
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>

              <span className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {title && (
                <span className="text-white text-sm font-medium truncate max-w-xs">
                  {title}
                </span>
              )}
              
              <Button
                onClick={toggleFullscreen}
                variant="ghost"
                size="sm"
                className="text-white hover:text-heritage-gold p-2"
              >
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BunnyVideoPlayer;
