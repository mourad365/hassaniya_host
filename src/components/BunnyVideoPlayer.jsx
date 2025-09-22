import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Hls from 'hls.js';
import { getBunnyVideoUrl, getBunnyVideoUrls, getIframeUrl } from '@/utils/videoUrlUtils';

const BunnyVideoPlayer = ({ 
  videoId, 
  title, 
  poster, 
  className = "",
  autoplay = false,
  controls = true 
}) => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);

  const cdnHostname = import.meta.env.VITE_BUNNY_VIDEO_CDN_HOSTNAME;
  const libraryId = import.meta.env.VITE_BUNNY_VIDEO_LIBRARY_ID;

  // Get video URLs with fallback strategy
  const getVideoUrls = (videoInput) => {
    console.log('BunnyVideoPlayer: Processing video input:', videoInput);
    const urls = getBunnyVideoUrls(videoInput);
    console.log('BunnyVideoPlayer: Generated URLs:', urls);
    return urls;
  };

  const getPosterUrl = (videoId) => {
    return `https://${cdnHostname}/${videoId}/thumbnail.jpg`;
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const videoUrls = getVideoUrls(videoId);
    if (!videoUrls) {
      console.error('BunnyVideoPlayer: No valid video URLs generated for:', videoId);
      setError('Invalid video source - Storage URLs cannot be used for video playback');
      setIsLoading(false);
      return;
    }

    // Create array of URLs to try in order: HLS first, then Play
    const urlsToTry = [];
    if (videoUrls.hls) urlsToTry.push({ url: videoUrls.hls, type: 'HLS' });
    if (videoUrls.play) urlsToTry.push({ url: videoUrls.play, type: 'Direct Play' });

    const handleLoadedData = () => {
      console.log('BunnyVideoPlayer: Video loaded successfully');
      setIsLoading(false);
      setDuration(video.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handlePlay = () => {
      console.log('BunnyVideoPlayer: Video started playing');
      setIsPlaying(true);
    };
    
    const handlePause = () => setIsPlaying(false);
    
    const handleError = (e) => {
      console.error('BunnyVideoPlayer: Video load error:', e);
      const errorCode = e.target.error?.code;
      const errorMessage = e.target.error?.message;
      const currentUrl = urlsToTry[currentUrlIndex];
      
      console.error('BunnyVideoPlayer: Error details:', {
        error: e.target.error,
        errorCode,
        errorMessage,
        networkState: e.target.networkState,
        readyState: e.target.readyState,
        currentUrl,
        currentUrlIndex,
        totalUrls: urlsToTry.length
      });
      
      // Check if this is a 403 Forbidden error or authentication issue
      const is403Error = errorCode === 4 && (
        errorMessage?.toLowerCase().includes('forbidden') ||
        errorMessage?.toLowerCase().includes('403') ||
        errorMessage?.toLowerCase().includes('format error')
      );
      
      if (is403Error) {
        console.warn('🔐 BunnyVideoPlayer: Detected authentication/access error, falling back to iframe immediately');
        setError('Authentication required - switching to iframe player');
        setIsLoading(false);
        return;
      }
      
      // Try next URL if available
      if (currentUrlIndex < urlsToTry.length - 1) {
        console.log(`🔄 BunnyVideoPlayer: ${currentUrl.type} failed, trying next URL...`);
        setCurrentUrlIndex(prev => prev + 1);
        return; // Don't set error yet, try next URL
      }
      
      // All URLs failed, show error
      setError(`Failed to load video: ${errorMessage || 'Unknown error'} (Code: ${errorCode})`);
      setIsLoading(false);
    };

    const handleLoadStart = () => {
      console.log('BunnyVideoPlayer: Load started');
      setIsLoading(true);
    };

    const handleCanPlay = () => {
      console.log('BunnyVideoPlayer: Can play - enough data loaded');
    };

    if (urlsToTry.length === 0) {
      console.error('BunnyVideoPlayer: No valid URLs to try');
      setError('No valid video URLs available');
      setIsLoading(false);
      return;
    }

    const loadVideo = (urlIndex = currentUrlIndex) => {
      const currentVideoUrl = urlsToTry[urlIndex];
      if (!currentVideoUrl) {
        setError('No more video URLs to try');
        setIsLoading(false);
        return;
      }

      console.log(`🎬 BunnyVideoPlayer: Attempting to load ${currentVideoUrl.type} URL:`, currentVideoUrl.url);

      // Clean up previous HLS instance
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      // Set up HLS.js for .m3u8 URLs
      if (currentVideoUrl.url.endsWith('.m3u8')) {
        console.log('BunnyVideoPlayer: Detected .m3u8 URL, using HLS.js');
        
        if (Hls.isSupported()) {
          console.log('BunnyVideoPlayer: HLS.js is supported, initializing...');
          const hls = new Hls({
            debug: false,
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          
          hlsRef.current = hls;
          
          hls.loadSource(currentVideoUrl.url);
          hls.attachMedia(video);
          
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            console.log('✅ BunnyVideoPlayer: HLS manifest parsed successfully');
            setIsLoading(false);
            if (autoplay) {
              video.play().catch(console.error);
            }
          });
          
          hls.on(Hls.Events.ERROR, (event, data) => {
            console.error('❌ BunnyVideoPlayer: HLS error:', data);
            if (data.fatal) {
              console.error('🔄 BunnyVideoPlayer: Fatal HLS error, trying next URL...');
              // Try next URL instead of recovery
              if (urlIndex < urlsToTry.length - 1) {
                setCurrentUrlIndex(urlIndex + 1);
              } else {
                setError('Cannot load video with HLS - all URLs failed');
                setIsLoading(false);
              }
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          // Safari has native HLS support
          console.log('BunnyVideoPlayer: Using native HLS support (Safari)');
          video.src = currentVideoUrl.url;
        } else {
          console.error('BunnyVideoPlayer: HLS not supported, trying next URL...');
          if (urlIndex < urlsToTry.length - 1) {
            setCurrentUrlIndex(urlIndex + 1);
          } else {
            setError('HLS streaming not supported by this browser');
          }
        }
      } else {
        // Regular video file - use standard video element
        console.log('BunnyVideoPlayer: Using standard video element for:', currentVideoUrl.url);
        video.src = currentVideoUrl.url;
      }
    };

    // Load the current video URL
    loadVideo();

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('error', handleError);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('error', handleError);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      
      // Clean up HLS instance
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [videoId, autoplay, currentUrlIndex]);

  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (isPlaying) {
        video.pause();
      } else {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          await playPromise;
        }
      }
    } catch (error) {
      // Handle AbortError and other play errors
      if (error.name !== 'AbortError') {
        console.error('BunnyVideoPlayer: Play error:', error);
      }
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
    // Generate iframe fallback URL using the proper utility
    const iframeUrl = getIframeUrl(videoId);
    console.log('BunnyVideoPlayer: Using iframe fallback:', iframeUrl);
    
    if (!iframeUrl) {
      return (
        <div className={`relative bg-black rounded-lg overflow-hidden ${className}`}>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
            <p className="text-lg mb-4">❌ لا يمكن تشغيل الفيديو</p>
            <p className="text-sm opacity-75">{error}</p>
            <p className="text-xs opacity-50 mt-2">Video ID: {videoId}</p>
          </div>
        </div>
      );
    }
    
    return (
      <div className={`relative bg-black rounded-lg overflow-hidden ${className}`}>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4 z-10">
          <p className="text-lg mb-4">جاري المحاولة باستخدام مشغل بديل...</p>
          <p className="text-sm opacity-75">{error}</p>
        </div>
        {/* Fallback to iframe player */}
        <iframe
          src={iframeUrl}
          className="w-full h-full"
          frameBorder="0"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          title={title || 'فيديو'}
        />
      </div>
    );
  }

  return (
    <div className={`relative bg-black rounded-lg overflow-hidden group ${className}`}>
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        poster={poster || getPosterUrl(videoId)}
        playsInline
        preload="metadata"
        crossOrigin="anonymous"
      >
        <p className="text-white p-4">
          متصفحك لا يدعم تشغيل الفيديو المباشر. 
          <a href={getIframeUrl(videoId)} className="underline" target="_blank" rel="noopener noreferrer">
            فتح في نافذة جديدة
          </a>
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
