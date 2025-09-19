import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, Eye, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BunnyVideoPlayer from './BunnyVideoPlayer';
import { useLanguage } from '@/hooks/use-language';

const VideoLibrary = () => {
  const { t, isRTL } = useLanguage();
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const libraryId = import.meta.env.VITE_BUNNY_VIDEO_LIBRARY_ID || '493708';
  const apiKey = import.meta.env.VITE_BUNNY_VIDEO_API_KEY || '4e19874d-4ee6-4f16-a29864485e6d-7a39-481e';
  const cdnHostname = import.meta.env.VITE_BUNNY_VIDEO_CDN_HOSTNAME || 'vz-a9578edc-805.b-cdn.net';

  // Fetch videos from Bunny Stream API
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `https://video.bunnycdn.com/library/${libraryId}/videos`,
          {
            headers: {
              'AccessKey': apiKey,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch videos');
        }

        const data = await response.json();
        setVideos(data.items || []);
        setFilteredVideos(data.items || []);
      } catch (err) {
        setError(err.message);
        // Fallback to mock data for development
        const mockVideos = [
          {
            guid: 'sample-1',
            title: 'مقدمة في التراث الحساني',
            description: 'فيديو تعريفي بالتراث الحساني وأهميته الثقافية',
            dateUploaded: '2024-01-15T10:00:00Z',
            views: 1250,
            length: 1800,
            thumbnailFileName: 'thumb1.jpg'
          },
          {
            guid: 'sample-2', 
            title: 'الشعر الحساني التقليدي',
            description: 'استعراض لأشهر القصائد في الأدب الحساني',
            dateUploaded: '2024-01-10T14:30:00Z',
            views: 890,
            length: 2400,
            thumbnailFileName: 'thumb2.jpg'
          }
        ];
        setVideos(mockVideos);
        setFilteredVideos(mockVideos);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, [libraryId, apiKey]);

  // Filter and search videos
  useEffect(() => {
    let filtered = videos.filter(video =>
      video.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort videos
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.dateUploaded) - new Date(a.dateUploaded);
        case 'views':
          return (b.views || 0) - (a.views || 0);
        case 'duration':
          return (b.length || 0) - (a.length || 0);
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
        default:
          return 0;
      }
    });

    setFilteredVideos(filtered);
  }, [videos, searchTerm, sortBy]);

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getThumbnailUrl = (videoId, thumbnailFileName) => {
    if (thumbnailFileName) {
      return `https://${cdnHostname}/${videoId}/${thumbnailFileName}`;
    }
    return `https://${cdnHostname}/${videoId}/thumbnail.jpg`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-sand-light py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-heritage-gold"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-light py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-heritage-black mb-4 modern-font">
            مكتبة الفيديو
          </h1>
          <p className="text-lg text-heritage-brown max-w-2xl mx-auto">
            مجموعة من الفيديوهات التراثية والثقافية الحسانية
          </p>
        </div>

        {/* Video Player Modal */}
        {selectedVideo && (
          <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-4 border-b">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-heritage-black">
                    {selectedVideo.title}
                  </h3>
                  <Button
                    onClick={() => setSelectedVideo(null)}
                    variant="ghost"
                    className="text-heritage-brown hover:text-heritage-black"
                  >
                    ✕
                  </Button>
                </div>
              </div>
              <div className="aspect-video">
                <BunnyVideoPlayer
                  videoId={selectedVideo.guid}
                  title={selectedVideo.title}
                  className="w-full h-full"
                  controls={true}
                  autoplay={true}
                />
              </div>
              <div className="p-4">
                <p className="text-heritage-brown mb-2">
                  {selectedVideo.description}
                </p>
                <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-600">
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 ml-1" />
                    {formatDate(selectedVideo.dateUploaded)}
                  </span>
                  <span className="flex items-center">
                    <Eye className="h-4 w-4 ml-1" />
                    {selectedVideo.views || 0} مشاهدة
                  </span>
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 ml-1" />
                    {formatDuration(selectedVideo.length || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="البحث في الفيديوهات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-12 py-3 border border-sand-300 rounded-lg focus:ring-2 focus:ring-heritage-gold focus:border-transparent text-right"
              />
            </div>
            <div className="flex items-center space-x-4 space-x-reverse">
              <Filter className="h-5 w-5 text-heritage-brown" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-sand-300 rounded-lg focus:ring-2 focus:ring-heritage-gold focus:border-transparent"
              >
                <option value="date">الأحدث</option>
                <option value="views">الأكثر مشاهدة</option>
                <option value="duration">المدة</option>
                <option value="title">العنوان</option>
              </select>
            </div>
          </div>
        </div>

        {/* Video Grid */}
        {filteredVideos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-heritage-brown">
              {searchTerm ? 'لم يتم العثور على فيديوهات مطابقة للبحث' : 'لا توجد فيديوهات متاحة'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredVideos.map((video) => (
              <div
                key={video.guid}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                onClick={() => setSelectedVideo(video)}
              >
                <div className="aspect-video bg-gray-200 relative overflow-hidden">
                  <img
                    src={getThumbnailUrl(video.guid, video.thumbnailFileName)}
                    alt={video.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = '/api/placeholder/400/225';
                    }}
                  />
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                    {formatDuration(video.length || 0)}
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-bold text-heritage-black mb-2 line-clamp-2">
                    {video.title}
                  </h3>
                  <p className="text-heritage-brown text-sm mb-3 line-clamp-2">
                    {video.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span className="flex items-center">
                      <Eye className="h-3 w-3 ml-1" />
                      {video.views || 0}
                    </span>
                    <span>
                      {formatDate(video.dateUploaded)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-center">
              تعذر تحميل الفيديوهات: {error}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoLibrary;
