import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, MessageCircle, Share2, Bookmark, Play, Calendar, User, Eye } from 'lucide-react';
import { contentService } from '@/services/contentService';
import { likeService, commentService, shareService, bookmarkService } from '@/services/interactionService';

const ContentDetail = ({ contentType }) => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();

  const [content, setContent] = useState(null);
  const [relatedContent, setRelatedContent] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    fetchContent();
  }, [slug, contentType]);

  useEffect(() => {
    if (content && user) {
      checkUserInteractions();
    }
  }, [content, user]);

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

      // Fetch related content, comments, and interaction counts
      const [related, commentsData, likes, commentsCount] = await Promise.all([
        contentService.getRelatedContent(contentType, data.category_id, data.id),
        commentService.getComments(contentType, data.id),
        likeService.getLikeCount(contentType, data.id),
        commentService.getCommentCount(contentType, data.id)
      ]);

      setRelatedContent(related);
      setComments(commentsData);
      setLikeCount(likes);
      setCommentCount(commentsCount);
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

  const checkUserInteractions = async () => {
    if (!user || !content) return;

    try {
      const [liked, bookmarked] = await Promise.all([
        likeService.isLikedByUser(contentType, content.id, user.id),
        bookmarkService.isBookmarkedByUser(contentType, content.id, user.id)
      ]);

      setIsLiked(liked);
      setIsBookmarked(bookmarked);
    } catch (error) {
      console.error('Error checking user interactions:', error);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "تسجيل الدخول مطلوب",
        description: "يجب تسجيل الدخول للإعجاب بالمحتوى"
      });
      return;
    }

    try {
      const result = await likeService.toggleLike(contentType, content.id, user.id);
      setIsLiked(result.liked);
      setLikeCount(prev => result.liked ? prev + 1 : prev - 1);
      
      toast({
        title: result.liked ? "تم الإعجاب" : "تم إلغاء الإعجاب",
        description: result.liked ? "تمت إضافة إعجابك" : "تم إلغاء إعجابك"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في تحديث الإعجاب"
      });
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      toast({
        title: "تسجيل الدخول مطلوب",
        description: "يجب تسجيل الدخول لحفظ المحتوى"
      });
      return;
    }

    try {
      const result = await bookmarkService.toggleBookmark(contentType, content.id, user.id);
      setIsBookmarked(result.bookmarked);
      
      toast({
        title: result.bookmarked ? "تم الحفظ" : "تم إلغاء الحفظ",
        description: result.bookmarked ? "تم حفظ المحتوى" : "تم إلغاء حفظ المحتوى"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في تحديث الحفظ"
      });
    }
  };

  const handleShare = async (platform) => {
    try {
      await shareService.shareToSocial(
        contentType,
        content.id,
        content.title,
        platform,
        user?.id
      );
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleAddComment = async () => {
    if (!user) {
      toast({
        title: "تسجيل الدخول مطلوب",
        description: "يجب تسجيل الدخول للتعليق"
      });
      return;
    }

    if (!newComment.trim()) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يرجى كتابة تعليق"
      });
      return;
    }

    try {
      setSubmittingComment(true);
      const comment = await commentService.addComment(
        contentType,
        content.id,
        newComment,
        user.id
      );

      setComments(prev => [...prev, comment]);
      setCommentCount(prev => prev + 1);
      setNewComment('');
      
      toast({
        title: "تم إضافة التعليق",
        description: "تم نشر تعليقك بنجاح"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في إضافة التعليق"
      });
    } finally {
      setSubmittingComment(false);
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
            
            {content.view_count && (
              <div className="flex items-center gap-2">
                <Eye size={16} />
                <span>{content.view_count} مشاهدة</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            <Button
              variant={isLiked ? "default" : "outline"}
              size="sm"
              onClick={handleLike}
              className="flex items-center gap-2"
            >
              <Heart size={16} className={isLiked ? "fill-current" : ""} />
              <span>{likeCount}</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center gap-2"
            >
              <MessageCircle size={16} />
              <span>{commentCount}</span>
            </Button>

            <Button
              variant={isBookmarked ? "default" : "outline"}
              size="sm"
              onClick={handleBookmark}
              className="flex items-center gap-2"
            >
              <Bookmark size={16} className={isBookmarked ? "fill-current" : ""} />
            </Button>

            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('facebook')}
                className="px-3"
              >
                Facebook
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('twitter')}
                className="px-3"
              >
                Twitter
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShare('whatsapp')}
                className="px-3"
              >
                WhatsApp
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Featured Image */}
            {content.image_url && (
              <div className="mb-6">
                <img
                  src={content.image_url}
                  alt={content.title}
                  className="w-full h-64 md:h-96 object-cover rounded-lg shadow-md"
                />
              </div>
            )}

            {/* Media Player */}
            {(content.audio_url || content.video_url) && (
              <div className="mb-6">
                {content.video_url ? (
                  <video
                    controls
                    className="w-full rounded-lg shadow-md"
                    poster={content.image_url}
                  >
                    <source src={content.video_url} type="video/mp4" />
                    متصفحك لا يدعم تشغيل الفيديو
                  </video>
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

            {/* Comments Section */}
            <div id="comments" className="mt-12">
              <h3 className="text-2xl font-bold arabic-title mb-6">
                التعليقات ({commentCount})
              </h3>

              {/* Add Comment Form */}
              {user ? (
                <Card className="mb-6">
                  <CardContent className="pt-6">
                    <Textarea
                      placeholder="اكتب تعليقك هنا..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="mb-4 arabic-body"
                      rows={3}
                    />
                    <Button
                      onClick={handleAddComment}
                      disabled={submittingComment || !newComment.trim()}
                      className="btn-heritage"
                    >
                      {submittingComment ? 'جاري النشر...' : 'نشر التعليق'}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="mb-6">
                  <CardContent className="pt-6 text-center">
                    <p className="arabic-body text-gray-600 mb-4">
                      يجب تسجيل الدخول للتعليق
                    </p>
                    <Button onClick={() => navigate('/login')} className="btn-heritage">
                      تسجيل الدخول
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Comments List */}
              <div className="space-y-4">
                {comments.map((comment) => (
                  <Card key={comment.id}>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-sm">
                          {comment.user?.email?.split('@')[0] || 'مستخدم'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(comment.created_at)}
                        </span>
                      </div>
                      <p className="arabic-body text-gray-700">
                        {comment.content}
                      </p>
                    </CardContent>
                  </Card>
                ))}
                
                {comments.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="arabic-body">لا توجد تعليقات بعد</p>
                  </div>
                )}
              </div>
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
                        {item.image_url && (
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-full h-24 object-cover rounded mb-2"
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
