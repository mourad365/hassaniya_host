
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Play, Download, Eye, Share2, Calendar, User, Volume2, Image, Video, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import VideoPlayer from '@/components/VideoPlayer';

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

  // Function to generate video thumbnail
  const generateVideoThumbnail = (videoUrl) => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.currentTime = 5; // Get thumbnail at 5 seconds
      
      video.onloadedmetadata = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 360;
        
        video.onseeked = () => {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8);
          resolve(thumbnailUrl);
        };
      };
      
      video.onerror = () => {
        resolve(null);
      };
      
      video.src = videoUrl;
    });
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
            
            // Generate thumbnail for videos if not available
            if (item.media_type === 'video' && item.file_url && !thumbnailUrl) {
              try {
                thumbnailUrl = await generateVideoThumbnail(item.file_url);
              } catch (error) {
                console.log('Could not generate thumbnail for video:', item.title);
                thumbnailUrl = null;
              }
            }
            
            return {
              id: item.id,
              title: item.title,
              description: item.description || 'لا يوجد وصف متاح',
              type: getMediaTypeInArabic(item.media_type),
              duration: 'غير محدد',
              size: 'غير محدد',
              format: item.media_type === 'video' ? 'MP4' : item.media_type === 'audio' ? 'MP3' : 'PDF',
              thumbnail: 'default-media',
              thumbnail_url: thumbnailUrl,
              author: item.author_name || 'غير معروف',
              date: item.publish_date,
              views: Math.floor(Math.random() * 10000),
              downloads: Math.floor(Math.random() * 1000),
              featured: item.is_featured,
              category: item.categories?.name || 'عام',
              file_url: item.file_url,
              media_type: item.media_type
            };
          })
        );
        setMedia(transformedMedia);
      } else {
        // No data in database, show fallback mock data with demo thumbnails
        const mockMedia = [
      {
        id: 1,
        title: "وثائقي: رحلة في التراث الحساني",
        description: "فيلم وثائقي شامل يستكشف جذور التراث الحساني وانتشاره عبر القارات",
        type: "فيديو",
        duration: "45:30",
        size: "1.2 GB",
        format: "MP4",
        thumbnail: "documentary-heritage",
        thumbnail_url: "https://via.placeholder.com/640x360/2c3e50/ffffff?text=وثائقي+التراث+الحساني",
        author: "فريق الإنتاج الثقافي",
        date: "2024-01-15",
        views: 15420,
        downloads: 892,
        featured: true,
        category: "وثائقي ثقافي",
        file_url: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        media_type: "video"
      },
      {
        id: 2,
        title: "تسجيل نادر: أمسية شعرية حسانية من الستينات",
        description: "تسجيل صوتي نادر لأمسية شعرية حسانية من الستينات بأصوات شعراء مشهورين",
        type: "صوت",
        duration: "1:23:45",
        size: "156 MB",
        format: "MP3",
        thumbnail: "poetry-evening",
        thumbnail_url: "https://via.placeholder.com/640x360/34495e/ffffff?text=أمسية+شعرية+حسانية",
        author: "أرشيف الإذاعة الوطنية",
        date: "2024-01-14",
        views: 8934,
        downloads: 567,
        featured: true,
        category: "تسجيلات تراثية",
        file_url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3",
        media_type: "audio"
      },
      {
        id: 3,
        title: "مجموعة صور: الحياة البدوية في الصحراء",
        description: "مجموعة نادرة من الصور التاريخية توثق الحياة البدوية والتراث الحساني في الصحراء",
        type: "صور",
        duration: "50 صورة",
        size: "245 MB",
        format: "JPG",
        thumbnail: "bedouin-life",
        thumbnail_url: "https://via.placeholder.com/640x360/8b4513/ffffff?text=الحياة+البدوية",
        author: "المصور التراثي سالم الكعبي",
        date: "2024-01-13",
        views: 12567,
        downloads: 1234,
        featured: false,
        category: "توثيق تراثي",
        file_url: null,
        media_type: "image"
      },
      {
        id: 4,
        title: "كتاب رقمي: قاموس المصطلحات الحسانية",
        description: "قاموس شامل للمصطلحات والكلمات الحسانية مع الشرح والأمثلة",
        type: "وثائق",
        duration: "320 صفحة",
        size: "45 MB",
        format: "PDF",
        thumbnail: "hassaniya-dictionary",
        thumbnail_url: "https://via.placeholder.com/640x360/7f8c8d/ffffff?text=قاموس+المصطلحات+الحسانية",
        author: "د. محمد الحساني",
        date: "2024-01-12",
        views: 6789,
        downloads: 2341,
        featured: false,
        category: "مراجع لغوية",
        file_url: null,
        media_type: "document"
      },
      {
        id: 5,
        title: "فيديو: تعليم الخط العربي التراثي",
        description: "سلسلة تعليمية لتعلم الخط العربي التراثي المستخدم في المخطوطات الحسانية",
        type: "فيديو",
        duration: "25:15",
        size: "680 MB",
        format: "MP4",
        thumbnail: "arabic-calligraphy",
        thumbnail_url: "https://via.placeholder.com/640x360/16a085/ffffff?text=تعليم+الخط+العربي",
        author: "الخطاط أحمد ولد محمد",
        date: "2024-01-11",
        views: 4532,
        downloads: 345,
        featured: false,
        category: "تعليمي",
        file_url: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        media_type: "video"
      },
      {
        id: 6,
        title: "تسجيل: موسيقى تراثية على آلة التيدينيت",
        description: "تسجيل عالي الجودة لمقطوعات موسيقية تراثية على آلة التيدينيت الحسانية",
        type: "صوت",
        duration: "38:22",
        size: "89 MB",
        format: "FLAC",
        thumbnail: "tidinit-music",
        thumbnail_url: "https://via.placeholder.com/640x360/e67e22/ffffff?text=موسيقى+التيدينيت",
        author: "الموسيقار يوسف ولد أحمد",
        date: "2024-01-10",
        views: 7821,
        downloads: 456,
        featured: false,
        category: "موسيقى تراثية",
        file_url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3",
        media_type: "audio"
      },
      {
        id: 7,
        title: "أرشيف صور: المخطوطات الحسانية النادرة",
        description: "مجموعة مصورة من المخطوطات الحسانية النادرة المحفوظة في المكتبات العالمية",
        type: "صور",
        duration: "120 صورة",
        size: "890 MB",
        format: "TIFF",
        thumbnail: "rare-manuscripts",
        thumbnail_url: "https://via.placeholder.com/640x360/9b59b6/ffffff?text=المخطوطات+الحسانية",
        author: "مكتبة الشيخ زايد",
        date: "2024-01-09",
        views: 9876,
        downloads: 678,
        featured: true,
        category: "مخطوطات",
        file_url: null,
        media_type: "image"
      },
      {
        id: 8,
        title: "دليل: الحرف التراثية الحسانية",
        description: "دليل مصور شامل للحرف التراثية الحسانية وطرق ممارستها",
        type: "وثائق",
        duration: "180 صفحة",
        size: "78 MB",
        format: "PDF",
        thumbnail: "traditional-crafts",
        thumbnail_url: "https://via.placeholder.com/640x360/27ae60/ffffff?text=الحرف+التراثية",
        author: "جمعية التراث الحساني",
        date: "2024-01-08",
        views: 5432,
        downloads: 789,
        featured: false,
        category: "حرف تراثية",
        file_url: null,
        media_type: "document"
      }
        ];
        setMedia(mockMedia);
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
      if (mediaItem.type === 'فيديو') {
        setVideoPlayer({ 
          isOpen: true, 
          src: mediaItem.file_url, 
          title,
          thumbnail: mediaItem.thumbnail_url 
        });
      } else {
        // For audio files, open in new tab
        window.open(mediaItem.file_url, '_blank');
        toast({
          title: "🎵 تشغيل الصوت",
          description: `تم فتح "${title}" في نافذة جديدة`,
          duration: 3000,
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

  const handleDownload = (id, title) => {
    const mediaItem = media.find(item => item.id === id);
    if (mediaItem && mediaItem.file_url) {
      const link = document.createElement('a');
      link.href = mediaItem.file_url;
      link.download = title;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({
        title: "⬇️ تحميل الملف",
        description: `بدء تحميل "${title}"`,
        duration: 3000,
      });
    } else {
      toast({
        title: "⚠️ خطأ",
        description: `لا يوجد ملف متاح للتحميل لـ "${title}"`,
        duration: 3000,
      });
    }
  };

  const handleShare = (title) => {
    toast({
      title: `📤 ${title}`,
      description: "هذه الميزة غير متوفرة حالياً",
      duration: 3000,
    });
  };

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
                          <div className="flex items-center space-x-1 space-x-reverse">
                            <Download size={14} />
                            <span className="modern-font">{item.downloads}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <button
                            onClick={() => handleDownload(item.id, item.title)}
                            className="text-[var(--desert-brown)] hover:text-[var(--heritage-gold)] transition-colors"
                          >
                            <Download size={16} />
                          </button>
                          <button
                            onClick={() => handleShare(item.title)}
                            className="text-[var(--desert-brown)] hover:text-[var(--heritage-gold)] transition-colors"
                          >
                            <Share2 size={16} />
                          </button>
                        </div>
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
                      
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <button
                          onClick={() => handleDownload(item.id, item.title)}
                          className="text-[var(--desert-brown)] hover:text-[var(--heritage-gold)] transition-colors"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          onClick={() => handleShare(item.title)}
                          className="text-[var(--desert-brown)] hover:text-[var(--heritage-gold)] transition-colors"
                        >
                          <Share2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </motion.section>

          {/* Upload Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-16 text-center"
          >
            <div className="heritage-card bg-white text-black max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold arabic-title mb-4 text-black">
                ساهم في إثراء المكتبة
              </h3>
              <p className="arabic-body mb-6 leading-relaxed text-black">
                هل لديك وسائط تراثية تود مشاركتها؟ ساعدنا في بناء أكبر مكتبة رقمية للتراث الحساني
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => {
                    toast({
                      title: "رفع ملف",
                      description: "هذه الميزة غير متوفرة حالياً",
                      duration: 3000,
                    });
                  }}
                  className="bg-white text-black hover:bg-[var(--sand-light)] px-6 py-3 modern-font"
                >
                  رفع ملف
                </Button>
                <Button
                  onClick={() => {
                    toast({
                      title: "إرشادات الرفع",
                      description: "هذه الميزة غير متوفرة حالياً",
                      duration: 3000,
                    });
                  }}
                  className="border-2 border-black text-black hover:bg-[var(--sand-light)] hover:text-black px-6 py-3 modern-font"
                >
                  إرشادات الرفع
                </Button>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
      
      {videoPlayer.isOpen && (
        <VideoPlayer
          src={videoPlayer.src}
          title={videoPlayer.title}
          thumbnail={videoPlayer.thumbnail}
          onClose={handleCloseVideo}
        />
      )}
    </>
  );
};

export default MediaPage;
