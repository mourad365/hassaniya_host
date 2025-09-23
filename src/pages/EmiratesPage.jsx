
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Calendar, User, Eye, MapPin, Clock, Star, Award, Play, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/hooks/use-language';
import { migrateMediaUrl } from '@/services/mediaService';
import { supabase } from '@/lib/customSupabaseClient';

const EmiratesPage = () => {
  const { t, language, isRTL } = useLanguage();
  const [selectedEmirate, setSelectedEmirate] = useState(t('all'));
  const [playingVideos, setPlayingVideos] = useState({});

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['articles', { category: 'emirates' }],
    queryFn: async () => {
      // Get emirates category ID first
      const { data: emiratesCategories, error: catError } = await supabase
        .from('categories')
        .select('id, slug')
        .eq('type', 'emirates');
      
      // If no emirates categories exist, return empty
      if (catError || !emiratesCategories || emiratesCategories.length === 0) {
        console.warn('Emirates categories not found');
        return [];
      }

      // Get category IDs for the IN query
      const categoryIds = emiratesCategories.map(cat => cat.id);

      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          categories!inner(name, slug)
        `)
        .in('category_id', categoryIds)
        .eq('status', 'published')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.warn('Failed to fetch articles from database:', error);
        return [];
      }
      
      return data || [];
    }
  });

  const { data: emirates = [] } = useQuery({
    queryKey: ['emirates'],
    queryFn: async () => {
      // Always return the Arabic emirates for emirates page
      return [
        { id: 'all', label: t('allEmirates'), icon: MapPin },
        { id: 'adrar', label: 'أدرار', icon: MapPin },
        { id: 'brakna', label: 'براكنة', icon: MapPin },
        { id: 'taganit', label: 'تكانت', icon: MapPin },
        { id: 'trarza', label: 'ترارزة', icon: MapPin }
      ];
    }
  });


  const filteredArticles = selectedEmirate === t('all') 
    ? articles 
    : articles.filter(article => {
        const emirateName = language === 'ar' ? article.emirate : (article.emirateFr || article.emirate);
        return emirateName === selectedEmirate;
      });

  const featuredArticles = articles.filter(article => article.featured);

  // Sharing disabled

  const handleReadMore = (id, title) => {
    toast({
      title: t('readArticle'),
      description: t('featureNotImplemented'),
      duration: 3000,
    });
  };

  const toggleVideo = (articleId) => {
    setPlayingVideos(prev => ({
      ...prev,
      [articleId]: !prev[articleId]
    }));
  };

  const hasVideo = (article) => {
    return article.file_url && (article.content_type === 'video' || article.media_type === 'video');
  };

  const getVideoUrl = (article) => {
    return article.file_url ? migrateMediaUrl(article.file_url) : null;
  };

  const getThumbnailUrl = (article) => {
    if (article.thumbnail_url) return migrateMediaUrl(article.thumbnail_url);
    if (article.image_url) return article.image_url;
    return null;
  };

  return (
    <>
      <Helmet>
        <title>{t('mauritanianEmirates')} - {t('siteName')}</title>
        <meta name="description" content={t('mauritanianEmiratesDescription')} />
        <meta property="og:title" content={`${t('mauritanianEmirates')} - ${t('siteName')}`} />
        <meta property="og:description" content={t('mauritanianEmiratesDescription')} />
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
            <h1 className="text-4xl md:text-5xl font-bold arabic-title text-black mb-4">
              الإمارات الموريتانية التاريخية
            </h1>
            <p className="text-xl arabic-body text-black max-w-3xl mx-auto">
              استكشف تاريخ الإمارات الموريتانية الأربع: أدرار وبراكنة وتكانت وترارزة وتراثها الحساني العريق
            </p>
            <div className="w-24 h-1 bg-[var(--heritage-gold)] mx-auto mt-6"></div>
          </motion.div>

          {/* Emirates Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <div className="flex flex-wrap justify-center gap-3">
              {emirates.map((emirate) => {
                const IconComponent = emirate.icon;
                return (
                  <button
                    key={emirate.id}
                    onClick={() => setSelectedEmirate(emirate.id)}
                    className={`flex items-center space-x-2 space-x-reverse px-4 py-2 rounded-full transition-all duration-300 modern-font text-sm ${
                      selectedEmirate === emirate.id
                        ? 'bg-[var(--heritage-gold)] text-white shadow-lg scale-105'
                        : 'bg-white/80 text-[var(--tent-black)] hover:bg-[var(--sand-medium)] hover:scale-102'
                    }`}
                  >
                    <IconComponent size={16} />
                    <span>{emirate.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* All Articles */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h2 className="text-3xl font-bold arabic-title text-black mb-8 text-center">
              {selectedEmirate === 'الكل' ? 'جميع المقالات' : `تراث ${selectedEmirate}`}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArticles.map((article, index) => (
                <motion.article
                  key={article.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                  className="heritage-card hover-lift group cursor-pointer"
                  onClick={() => handleReadMore(article.id, article.title)}
                >
                  <div className="relative mb-4 overflow-hidden rounded-lg">
                    {playingVideos[article.id] && hasVideo(article) ? (
                      <div className="relative">
                        <video
                          className="w-full h-48 object-cover"
                          controls
                          autoPlay
                          onEnded={() => toggleVideo(article.id)}
                          poster={getThumbnailUrl(article)}
                        >
                          <source src={getVideoUrl(article)} type="video/mp4" />
                          <source src={getVideoUrl(article)} type="video/webm" />
                          <p className="text-white arabic-body p-4">
                            متصفحك لا يدعم تشغيل الفيديو.
                          </p>
                        </video>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleVideo(article.id);
                          }}
                          className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-2 hover:bg-black/80 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="relative">
                        <img  
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          alt={`صورة ${article.title}`}
                          src={getThumbnailUrl(article)} />
                        {hasVideo(article) && (
                          <>
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleVideo(article.id);
                                }}
                                className="bg-white/90 text-[var(--tent-black)] rounded-full p-3 hover:bg-white transition-colors"
                              >
                                <Play size={24} />
                              </button>
                            </div>
                            <div className="absolute top-4 left-4">
                              <span className="bg-red-600 text-white px-2 py-1 rounded text-xs modern-font flex items-center space-x-1 space-x-reverse">
                                <Play size={12} />
                                <span>فيديو</span>
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <span className="bg-[var(--oasis-blue)] text-white px-3 py-1 rounded-full text-sm modern-font">
                        {article.emirate}
                      </span>
                    </div>
                    {article.featured && (
                      <div className="absolute top-4 left-4" style={{ marginTop: hasVideo(article) ? '32px' : '0' }}>
                        <span className="bg-[var(--heritage-gold)] text-white px-2 py-1 rounded text-xs modern-font">
                          مميز
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="bg-[var(--sand-medium)] text-[var(--tent-black)] px-3 py-1 rounded-full text-sm modern-font">
                        {article.category}
                      </span>
                      <div className="flex items-center space-x-1 space-x-reverse">
                        <Star className="text-yellow-500 fill-current" size={14} />
                        <span className="text-sm modern-font text-[var(--desert-brown)]">{article.rating}</span>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold arabic-title text-[var(--tent-black)] group-hover:text-[var(--heritage-gold)] transition-colors">
                      {article.title}
                    </h3>
                    
                    <p className="text-[var(--deep-brown)] arabic-body leading-relaxed text-sm">
                      {article.excerpt.substring(0, 120)}...
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-[var(--desert-brown)]">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <User size={14} />
                        <span className="modern-font">{article.author}</span>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Calendar size={14} />
                        <span className="modern-font">{article.date}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-[var(--sand-dark)]">
                      <div className="flex items-center space-x-4 space-x-reverse text-sm text-[var(--desert-brown)]">
                        <div className="flex items-center space-x-1 space-x-reverse">
                          <Eye size={14} />
                          <span className="modern-font">{article.views}</span>
                        </div>
                        <div className="flex items-center space-x-1 space-x-reverse">
                          <Clock size={14} />
                          <span className="modern-font">{article.readTime}</span>
                        </div>
                      </div>
                      {/* Share button removed */}
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </motion.section>

          {/* Mauritanian Emirates Heritage Highlights */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-16"
          >
            <div className="heritage-card bg-white text-black">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold arabic-title mb-4 text-black">
                  الإمارات الموريتانية التاريخية
                </h3>
                <p className="text-xl arabic-body leading-relaxed max-w-3xl mx-auto text-black">
                  الإمارات الموريتانية الأربع التي شكلت الحضارة الحسانية عبر التاريخ
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Award className="text-black" size={32} />
                  </div>
                  <h4 className="text-xl font-bold arabic-title mb-2 text-black">أدرار</h4>
                  <p className="arabic-body text-black text-sm">تأسست حوالي 1740م</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Clock className="text-black" size={32} />
                  </div>
                  <h4 className="text-xl font-bold arabic-title mb-2 text-black">براكنة</h4>
                  <p className="arabic-body text-black text-sm">تأسست قبل 1600م</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Star className="text-black" size={32} />
                  </div>
                  <h4 className="text-xl font-bold arabic-title mb-2 text-black">تكانت</h4>
                  <p className="arabic-body text-black text-sm">تأسست حوالي 1580م</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <MapPin className="text-black" size={32} />
                  </div>
                  <h4 className="text-xl font-bold arabic-title mb-2 text-black">ترارزة</h4>
                  <p className="arabic-body text-black text-sm">تأسست حوالي 1640م</p>
                </div>
              </div>
              
              <div className="text-center mt-8">
                <Button
                  onClick={() => {
                    toast({
                      title: t('heritageTour'),
                      description: t('featureNotImplemented'),
                      duration: 3000,
                    });
                  }}
                  className="bg-white text-black hover:bg-[var(--sand-light)] px-8 py-3 modern-font"
                >
                  استكشف تاريخ الإمارات
                </Button>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
      
    </>
  );
};

export default EmiratesPage;
