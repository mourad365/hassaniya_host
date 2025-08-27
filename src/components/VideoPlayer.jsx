import React, { useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const VideoPlayer = ({ src, title, onClose, thumbnail }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showThumbnail, setShowThumbnail] = useState(true);

  const handlePlayPause = (videoRef) => {
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleMute = (videoRef) => {
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleFullscreen = (videoRef) => {
    if (!isFullscreen) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const videoRef = React.useRef(null);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
      <div className="relative w-full max-w-4xl mx-4">
        {/* Close button */}
        <Button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 bg-transparent hover:bg-white/10"
          size="sm"
        >
          <X size={24} />
        </Button>

        {/* Video title */}
        <h3 className="text-white text-xl arabic-title mb-4 text-center">{title}</h3>

        {/* Video container */}
        <div className="relative bg-black rounded-lg overflow-hidden">
          {/* Thumbnail overlay - shows before video starts */}
          {showThumbnail && thumbnail && (
            <div className="relative w-full">
              <img 
                src={thumbnail} 
                alt={`معاينة ${title}`}
                className="w-full h-auto max-h-[70vh] object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Button
                  onClick={() => {
                    setShowThumbnail(false);
                    if (videoRef.current) {
                      videoRef.current.play();
                      setIsPlaying(true);
                    }
                  }}
                  className="bg-white/90 text-black rounded-full p-6 hover:bg-white transition-colors"
                >
                  <Play size={48} />
                </Button>
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-white text-sm arabic-body text-center bg-black/60 rounded px-3 py-1">
                  اضغط لتشغيل الفيديو
                </p>
              </div>
            </div>
          )}

          <video
            ref={videoRef}
            src={src}
            className={`w-full h-auto max-h-[70vh] ${showThumbnail ? 'hidden' : 'block'}`}
            controls
            onPlay={() => {
              setIsPlaying(true);
              setShowThumbnail(false);
            }}
            onPause={() => setIsPlaying(false)}
            onEnded={() => {
              setIsPlaying(false);
              setShowThumbnail(true);
            }}
          >
            <source src={src} type="video/mp4" />
            <p className="text-white arabic-body p-4">
              متصفحك لا يدعم تشغيل الفيديو. 
              <a href={src} className="text-blue-400 underline" download>
                اضغط هنا لتحميل الفيديو
              </a>
            </p>
          </video>

          {/* Custom controls overlay - only show when video is visible */}
          {!showThumbnail && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center space-x-4 space-x-reverse">
                  <Button
                    onClick={() => handlePlayPause(videoRef)}
                    className="bg-white/20 hover:bg-white/30 text-white"
                    size="sm"
                  >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  </Button>
                  
                  <Button
                    onClick={() => handleMute(videoRef)}
                    className="bg-white/20 hover:bg-white/30 text-white"
                    size="sm"
                  >
                    {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </Button>
                </div>

                <Button
                  onClick={() => handleFullscreen(videoRef)}
                  className="bg-white/20 hover:bg-white/30 text-white"
                  size="sm"
                >
                  <Maximize size={16} />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Video info */}
        <div className="mt-4 text-center">
          <p className="text-white/80 arabic-body">
            اضغط على الفيديو للتحكم في التشغيل
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
