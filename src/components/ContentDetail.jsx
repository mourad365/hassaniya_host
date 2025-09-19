import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, User } from 'lucide-react';
import { contentService } from '@/services/contentService';
import BunnyVideoPlayer from './BunnyVideoPlayer';
import { getBunnyImageUrl } from '@/utils/bunnyImageUtils';

const ContentDetail = ({ contentType }) => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();

  const [content, setContent] = useState(null);
  const [relatedContent, setRelatedContent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, [slug, contentType]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      let data = null;

      switch (contentType) {
        case 'article':
          data = await contentService.getArticleBySlug(slug);
          break;
        case 'news':
          data = await contentService.getNewsBySlug(slug);
          break;
        case 'program':
          data = await contentService.getProgramBySlug(slug);
          break;
        case 'podcast':
          data = await contentService.getPodcastBySlug(slug);
          break;
        case 'coverage':
          data = await contentService.getCoverageBySlug(slug);
          break;
        default:
          throw new Error('Invalid content type');
      }

      if (!data) {
        navigate('/404');
        return;
      }

      setContent(data);

      // Fetch related content only
      const related = await contentService.getRelatedContent(contentType, data.category_id, data.id);
      setRelatedContent(related);
    } catch (error) {
      console.error('Error fetching content:', error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في تحميل المحتوى"
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };


  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sand-light to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-heritage-brown mx-auto mb-4"></div>
          <p className="arabic-body">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!content) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sand-light to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold arabic-title text-heritage-brown mb-4">
            {content.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>{formatDate(content.publish_date)}</span>
            </div>
            
            {content.author_name && (
              <div className="flex items-center gap-2">
                <User size={16} />
                <span>{content.author_name}</span>
              </div>
            )}
            
          </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Featured Image */}
            {content.image_url && content.image_url.trim() !== '' && (
              <div className="mb-6">
                <img
                  src={getBunnyImageUrl(content.image_url)}
                  alt={content.title}
                  className="w-full h-64 md:h-96 object-cover rounded-lg shadow-md"
                  onError={(e) => {
                    console.log('ContentDetail - Image failed to load:', {
                      original: content.image_url,
                      bunnyUrl: getBunnyImageUrl(content.image_url)
                    });
                    e.target.style.display = 'none';
                    e.target.parentElement.style.display = 'none';
                  }}
                  onLoad={() => {
                    console.log('ContentDetail - Image loaded successfully:', {
                      original: content.image_url,
                      bunnyUrl: getBunnyImageUrl(content.image_url)
                    });
                  }}
                />
              </div>
            )}

            {/* Media Player */}
            {(content.audio_url || content.video_url) && (
              <div className="mb-6">
                {content.video_url ? (
                  // Check if it's a Bunny CDN video (contains bunny cdn hostname or video ID pattern)
                  content.video_url.includes('bunnycdn.com') || content.video_url.includes('b-cdn.net') || 
                  /^[a-f0-9-]{36}$/i.test(content.video_url) ? (
                    <BunnyVideoPlayer
                      videoId={content.video_url.includes('http') ? 
                        content.video_url.split('/').pop().replace(/\.(mp4|webm|ogg)$/, '') : 
                        content.video_url}
                      title={content.title}
                      poster={getBunnyImageUrl(content.image_url)}
                      className="w-full aspect-video rounded-lg shadow-md"
                    />
                  ) : (
                    <video
                      controls
                      className="w-full rounded-lg shadow-md"
                      poster={getBunnyImageUrl(content.image_url)}
                    >
                      <source src={content.video_url} type="video/mp4" />
                      متصفحك لا يدعم تشغيل الفيديو
                    </video>
                  )
                ) : content.audio_url ? (
                  <audio
                    controls
                    className="w-full"
                  >
                    <source src={content.audio_url} type="audio/mpeg" />
                    متصفحك لا يدعم تشغيل الصوت
                  </audio>
                ) : null}
              </div>
            )}

            {/* Content Body */}
            <div className="prose prose-lg max-w-none arabic-body mb-8">
              {content.content || content.description}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Related Content */}
            {relatedContent.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="arabic-title">محتوى ذات صلة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {relatedContent.map((item) => (
                      <div
                        key={item.id}
                        className="cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors"
                        onClick={() => navigate(`/${contentType}s/${item.page_slug}`)}
                      >
                        {item.image_url && item.image_url.trim() !== '' && (
                          <img
                            src={getBunnyImageUrl(item.image_url)}
                            alt={item.title}
                            className="w-full h-24 object-cover rounded mb-2"
                            onError={(e) => {
                              console.log('ContentDetail - Related content image failed to load:', {
                                original: item.image_url,
                                bunnyUrl: getBunnyImageUrl(item.image_url)
                              });
                              e.target.style.display = 'none';
                            }}
                            onLoad={() => {
                              console.log('ContentDetail - Related content image loaded successfully:', {
                                original: item.image_url,
                                bunnyUrl: getBunnyImageUrl(item.image_url)
                              });
                            }}
                          />
                        )}
                        <h4 className="font-semibold text-sm arabic-title line-clamp-2 mb-1">
                          {item.title}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {formatDate(item.publish_date)}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentDetail;
