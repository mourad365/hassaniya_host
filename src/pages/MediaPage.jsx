
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Play, Eye, Calendar, User, Volume2, Image, Video, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import BunnyVideoPlayer from '@/components/BunnyVideoPlayer';
import { getBunnyVideoUrl, debugVideoUrl } from '@/utils/videoUrlUtils';
import { getBunnyImageUrl } from '@/utils/bunnyImageUtils';

const MediaPage = () => {
  const [media, setMedia] = useState([]);
  const [selectedType, setSelectedType] = useState('الكل');
  const [videoPlayer, setVideoPlayer] = useState({ isOpen: false, src: '', title: '' });

  const mediaTypes = [
    { id: 'الكل', label: 'جميع الوسائط', icon: FileText },
    { id: 'فيديو', label: 'الفيديوهات', icon: Video },
    { id: 'صوت', label: 'التسجيلات الصوتية', icon: Volume2 },
    { id: 'صور', label: 'الصور الأرشيفية', icon: Image },
    { id: 'وثائق', label: 'الوثائق', icon: FileText }
  ];

  // Get proper image URL for media thumbnails
  const getMediaThumbnail = (mediaItem) => {
    if (mediaItem.image_url) {
      return getBunnyImageUrl(mediaItem.image_url);
    }
    
    // For Bunny Stream videos, use the CDN thumbnail
    if (mediaItem.media_type === 'video' && mediaItem.file_url) {
      const cdnHostname = import.meta.env.VITE_BUNNY_VIDEO_CDN_HOSTNAME;
      // Check if it's a Bunny Stream GUID
      const guidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (guidPattern.test(mediaItem.file_url) && cdnHostname) {
        return `https://${cdnHostname}/${mediaItem.file_url}/thumbnail.jpg`;
      }
    }
    
    return null;
  };

  // Function to get media type in Arabic
  const getMediaTypeInArabic = (mediaType) => {
    const typeMap = {
      'video': 'فيديو',
      'audio': 'صوت',
      'image': 'صور',
      'document': 'وثائق'
    };
    return typeMap[mediaType] || 'أخرى';
  };

  useEffect(() => {
    const fetchMedia = async () => {
      const { data, error } = await supabase
        .from('media')
        .select(`
          id, title, description, media_type, publish_date, 
          file_url, thumbnail_url, author_name, is_featured,
          categories(name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching media:', error);
        setMedia([]);
      } else if (data && data.length > 0) {
        // Transform database data to match component structure
        const transformedMedia = await Promise.all(
          data.map(async (item) => {
            let thumbnailUrl = item.thumbnail_url;
            
            // Use proper thumbnail generation without CORS issues
            if (!thumbnailUrl) {
              thumbnailUrl = getMediaThumbnail(item);
            }
            
            return {
              id: item.id,
              title: item.title,
              description: item.description || 'لا يوجد وصف متاح',
              type: getMediaTypeInArabic(item.media_type),
              duration: 'غير محدد',
              size: 'غير محدد',
              format: item.media_type === 'video' ? 'MP4' : item.media_type === 'audio' ? 'MP3' : 'PDF',
              thumbnail_url: thumbnailUrl,
              author: item.author_name || 'غير معروف',
              date: item.publish_date,
              views: item.views ?? 0,
              downloads: 0,
              featured: item.is_featured || false,
              category: item.categories?.name || 'عام',
              file_url: item.file_url,
              media_type: item.media_type
            };
          })
        );
        setMedia(transformedMedia);
      } else {
        // No data in database
        setMedia([]);
      }
    };
    
    fetchMedia();
  }, []);

  const filteredMedia = selectedType === 'الكل' 
    ? media 
    : media.filter(item => item.type === selectedType);

  const featuredMedia = media.filter(item => item.featured);

  const handlePlay = (id, title) => {
    const mediaItem = media.find(item => item.id === id);
    if (mediaItem && mediaItem.file_url) {
      console.log('MediaPage: Playing media item:', {
        id,
        title,
        type: mediaItem.type,
        file_url: mediaItem.file_url
      });
      
      if (mediaItem.type === 'فيديو') {
        // Use the video player for videos
        setVideoPlayer({
          isOpen: true,
          src: mediaItem.file_url,
          title: title
        });
      } else {
        // For audio and other media, open in new tab
        const mediaUrl = getBunnyVideoUrl(mediaItem.file_url);
        debugVideoUrl(mediaUrl, title);
        window.open(mediaUrl, '_blank');
        
        const mediaType = mediaItem.type === 'فيديو' ? '🎬' : '🎵';
        toast({
          title: `${mediaType} فتح الوسائط`,
          description: `تم فتح "${title}" في نافذة جديدة`,
          duration: 4000,
        });
      }
    } else {
      toast({
        title: "⚠️ خطأ",
        description: `لا يوجد ملف متاح لـ "${title}"`,
        duration: 3000,
      });
    }
  };

  const handleCloseVideo = () => {
    setVideoPlayer({ isOpen: false, src: '', title: '' });
  };

  // Download and sharing features are disabled

  return (
    <>
      <Helmet>
        <title>مكتبة الوسائط - الحسانية</title>
        <meta name="description" content="مكتبة وسائط شاملة تضم فيديوهات وصوتيات وصور أرشيفية ووثائق من التراث الحساني" />
        <meta property="og:title" content="مكتبة الوسائط - الحسانية" />
        <meta property="og:description" content="مكتبة وسائط شاملة تضم فيديوهات وصوتيات وصور أرشيفية ووثائق من التراث الحساني" />
      </Helmet>

      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold arabic-title text-[var(--tent-black)] mb-4">
              مكتبة الوسائط
            </h1>
            <p className="text-xl arabic-body text-black max-w-3xl mx-auto">
              مكتبة شاملة تضم فيديوهات وصوتيات وصور أرشيفية ووثائق من التراث الحساني
            </p>
            <div className="w-24 h-1 bg-[var(--heritage-gold)] mx-auto mt-6"></div>
          </motion.div>

          {/* Media Type Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <div className="flex flex-wrap justify-center gap-4">
              {mediaTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`flex items-center space-x-2 space-x-reverse px-6 py-3 rounded-full transition-all duration-300 modern-font focus:outline-none focus:ring-2 focus:ring-[var(--heritage-gold)] focus:ring-opacity-50 ${
                      selectedType === type.id
                        ? 'bg-[var(--heritage-gold)] text-black shadow-lg scale-105'
                        : 'bg-white/80 text-black hover:bg-[var(--sand-medium)] hover:text-black hover:scale-102 active:bg-[var(--sand-medium)] focus:bg-[var(--sand-medium)]'
                    }`}
                  >
                    <IconComponent size={18} />
                    <span>{type.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Featured Media */}
          {selectedType === 'الكل' && featuredMedia.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-16"
            >
              <h2 className="text-3xl font-bold arabic-title text-[var(--tent-black)] mb-8 text-center">
                الوسائط المميزة
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {featuredMedia.map((item, index) => (
                  <motion.article
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                    className="heritage-card hover-lift group relative overflow-hidden"
                  >
                    <div className="absolute top-4 right-4 z-10">
                      <span className="bg-[var(--heritage-gold)] text-white px-3 py-1 rounded-full text-sm modern-font">
                        مميز
                      </span>
                    </div>
                    
                    <div className="relative mb-6 overflow-hidden rounded-lg bg-gray-100">
                      {item.thumbnail_url ? (
                        <img  
                          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                          alt={`صورة ${item.title}`}
                          src={item.thumbnail_url}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      
                      {/* Fallback content when no thumbnail */}
                      <div className={`w-full h-64 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center ${item.thumbnail_url ? 'hidden' : 'flex'}`}>
                        <div className="text-center">
                          {item.type === 'فيديو' && <Video size={48} className="mx-auto mb-2 text-gray-500" />}
                          {item.type === 'صوت' && <Volume2 size={48} className="mx-auto mb-2 text-gray-500" />}
                          {item.type === 'صور' && <Image size={48} className="mx-auto mb-2 text-gray-500" />}
                          {item.type === 'وثائق' && <FileText size={48} className="mx-auto mb-2 text-gray-500" />}
                          <p className="text-gray-600 text-sm arabic-body">{item.type}</p>
                        </div>
                      </div>

                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          onClick={() => handlePlay(item.id, item.title)}
                          className="bg-white/90 text-[var(--tent-black)] rounded-full p-4 hover:bg-white transition-colors"
                          disabled={!item.file_url}
                        >
                          <Play size={32} />
                        </button>
                      </div>
                      <div className="absolute bottom-4 right-4">
                        <span className="bg-[var(--oasis-blue)] text-white px-3 py-1 rounded-full text-sm modern-font">
                          {mediaTypes.find(type => type.id === item.type)?.label}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="bg-[var(--sand-medium)] text-[var(--tent-black)] px-3 py-1 rounded-full text-sm modern-font">
                          {item.category}
                        </span>
                        <span className="text-sm text-[var(--desert-brown)] modern-font">
                          {item.duration}
                        </span>
                      </div>
                      
                      <h3 className="text-2xl font-bold arabic-title text-[var(--tent-black)] group-hover:text-[var(--heritage-gold)] transition-colors">
                        {item.title}
                      </h3>
                      
                      <p className="text-[var(--deep-brown)] arabic-body leading-relaxed">
                        {item.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-[var(--desert-brown)]">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <User size={14} />
                          <span className="modern-font">{item.author}</span>
                        </div>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <span className="modern-font">{item.size}</span>
                          <span className="modern-font">•</span>
                          <span className="modern-font">{item.format}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-[var(--sand-dark)]">
                        <div className="flex items-center space-x-4 space-x-reverse text-sm text-[var(--desert-brown)]">
                          <div className="flex items-center space-x-1 space-x-reverse">
                            <Eye size={14} />
                            <span className="modern-font">{item.views}</span>
                          </div>
                          <span className="modern-font">{item.size}</span>
                        </div>
                        {/* Download and share actions removed */}
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            </motion.section>
          )}

          {/* All Media */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h2 className="text-3xl font-bold arabic-title text-black mb-8 text-center">
              {selectedType === 'الكل' ? 'جميع الوسائط' : mediaTypes.find(type => type.id === selectedType)?.label}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredMedia.map((item, index) => (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                  className="heritage-card hover-lift group"
                >
                  <div className="relative mb-4 overflow-hidden rounded-lg bg-gray-100">
                    {item.thumbnail_url ? (
                      <img  
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        alt={`صورة ${item.title}`}
                        src={item.thumbnail_url}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    
                    {/* Fallback content when no thumbnail */}
                    <div className={`w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center ${item.thumbnail_url ? 'hidden' : 'flex'}`}>
                      <div className="text-center">
                        {item.type === 'فيديو' && <Video size={36} className="mx-auto mb-2 text-gray-500" />}
                        {item.type === 'صوت' && <Volume2 size={36} className="mx-auto mb-2 text-gray-500" />}
                        {item.type === 'صور' && <Image size={36} className="mx-auto mb-2 text-gray-500" />}
                        {item.type === 'وثائق' && <FileText size={36} className="mx-auto mb-2 text-gray-500" />}
                        <p className="text-gray-600 text-xs arabic-body">{item.type}</p>
                      </div>
                    </div>

                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => handlePlay(item.id, item.title)}
                        className="bg-white/90 text-[var(--tent-black)] rounded-full p-3 hover:bg-white transition-colors"
                        disabled={!item.file_url}
                      >
                        <Play size={24} />
                      </button>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className="bg-[var(--oasis-blue)] text-white px-3 py-1 rounded-full text-sm modern-font">
                        {mediaTypes.find(type => type.id === item.type)?.label}
                      </span>
                    </div>
                    {item.featured && (
                      <div className="absolute top-4 left-4">
                        <span className="bg-[var(--heritage-gold)] text-white px-2 py-1 rounded text-xs modern-font">
                          مميز
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="bg-[var(--sand-medium)] text-[var(--tent-black)] px-3 py-1 rounded-full text-sm modern-font">
                        {item.category}
                      </span>
                      <span className="text-sm text-[var(--desert-brown)] modern-font">
                        {item.duration}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold arabic-title text-[var(--tent-black)] group-hover:text-[var(--heritage-gold)] transition-colors">
                      {item.title}
                    </h3>
                    
                    <p className="text-[var(--deep-brown)] arabic-body leading-relaxed text-sm">
                      {item.description.substring(0, 100)}...
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-[var(--desert-brown)]">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <User size={14} />
                        <span className="modern-font">{item.author}</span>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Calendar size={14} />
                        <span className="modern-font">{item.date}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-[var(--sand-dark)]">
                      <div className="flex items-center space-x-4 space-x-reverse text-sm text-[var(--desert-brown)]">
                        <div className="flex items-center space-x-1 space-x-reverse">
                          <Eye size={14} />
                          <span className="modern-font">{item.views}</span>
                        </div>
                        <span className="modern-font">{item.size}</span>
                      </div>
                      {/* Download and share actions removed */}
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </motion.section>

          {/* Empty state when no media */}
          {media.length === 0 && (
            <div className="text-center text-[var(--deep-brown)] mt-8">لا توجد وسائط متاحة حالياً</div>
          )}
        </div>
      </div>
      
      {videoPlayer.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative w-full max-w-4xl mx-auto bg-white rounded-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">{videoPlayer.title}</h3>
              <button
                onClick={handleCloseVideo}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="aspect-video">
              <BunnyVideoPlayer
                videoId={videoPlayer.src}
                title={videoPlayer.title}
                autoplay={true}
                controls={true}
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MediaPage;
