
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Calendar, User, Eye, Share2, Globe, MapPin, Clock, TrendingUp, Play, Video, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import ContributeHeritage from '@/components/home/ContributeHeritage';
import VideoPlayer from '@/components/VideoPlayer';
import { supabase } from '@/lib/customSupabaseClient';

const PoliticsPage = () => {
  const { t } = useTranslation();
  const [articles, setArticles] = useState([]);
  const [videos, setVideos] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedContentType, setSelectedContentType] = useState('all');
  const [videoPlayer, setVideoPlayer] = useState({ isOpen: false, src: '', title: '' });

  const regions = [
    { id: 'all', label: t('allRegions'), icon: Globe },
    { id: 'uae', label: t('uae'), icon: MapPin },
    { id: 'morocco', label: t('morocco'), icon: MapPin },
    { id: 'mauritania', label: t('mauritania'), icon: MapPin },
    { id: 'sahara', label: t('westernSahara'), icon: MapPin },
    { id: 'mali', label: t('mali'), icon: MapPin }
  ];

  const contentTypes = [
    { id: 'all', label: t('allContent'), icon: FileText },
    { id: 'articles', label: t('articles'), icon: FileText },
    { id: 'videos', label: t('videos'), icon: Video }
  ];

  useEffect(() => {
    fetchArticles();
    fetchVideos();
  }, []);

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('category', 'politics')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching articles:', error);
        return;
      }
      
      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
    }
  };

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .eq('media_type', 'video')
        .eq('category', 'politics')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching videos:', error);
        return;
      }
      
      setVideos(data || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  };

  const filteredArticles = selectedRegion === 'all' 
    ? articles 
    : articles.filter(article => article.region === selectedRegion);

  const filteredVideos = selectedRegion === 'all' 
    ? videos 
    : videos.filter(video => video.region === selectedRegion);

  const getFilteredContent = () => {
    if (selectedContentType === 'articles') return filteredArticles;
    if (selectedContentType === 'videos') return filteredVideos;
    return [...filteredArticles, ...filteredVideos].sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    );
  };

  const trendingArticles = articles.filter(article => article.trending);
  const trendingVideos = videos.filter(video => video.trending);

  const handleShare = (title) => {
    toast({
      title: t('shareArticle'),
      description: t('featureNotImplemented'),
      duration: 3000,
    });
  };

  const handleReadMore = (id, title) => {
    toast({
      title: t('readArticle'),
      description: t('featureNotImplemented'),
      duration: 3000,
    });
  };

  const handlePlayVideo = (id, title) => {
    const video = videos.find(v => v.id === id);
    if (video && video.file_url) {
      setVideoPlayer({ isOpen: true, src: video.file_url, title });
    } else {
      toast({
        title: t('playVideo'),
        description: t('featureNotImplemented'),
        duration: 3000,
      });
    }
  };

  const handleCloseVideo = () => {
    setVideoPlayer({ isOpen: false, src: '', title: '' });
  };

  return (
    <>
      <Helmet>
        <title>{t('politicsAndHistory')} - {t('siteName')}</title>
        <meta name="description" content={t('politicsPageDescription')} />
        <meta property="og:title" content={`${t('politicsAndHistory')} - ${t('siteName')}`} />
        <meta property="og:description" content={t('politicsPageDescription')} />
      </Helmet>

      <div className="min-h-screen py-12 bg-gradient-to-br from-sand-50 to-sand-100">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-6xl font-bold arabic-title text-heritage-black mb-6">
              {t('politicsAndHistory')}
            </h1>
            <p className="text-xl md:text-2xl arabic-body text-heritage-brown max-w-4xl mx-auto leading-relaxed">
              {t('politicsPageDescription')}
            </p>
            <div className="w-32 h-1.5 bg-heritage-gold mx-auto mt-8 rounded-full shadow-sm"></div>
          </motion.div>

          {/* Content Type Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex flex-wrap justify-center gap-4">
              {contentTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedContentType(type.id)}
                    className={`flex items-center space-x-2 space-x-reverse px-8 py-4 rounded-2xl transition-all duration-300 modern-font shadow-md hover:shadow-lg ${
                      selectedContentType === type.id
                        ? 'bg-heritage-gold text-heritage-black shadow-lg scale-105 border-2 border-desert-400'
                        : 'bg-white/90 text-heritage-brown hover:bg-sand-200 hover:text-heritage-black hover:scale-102 border-2 border-sand-300 active:bg-sand-200 focus:bg-sand-200'
                    }`}
                  >
                    <IconComponent size={18} />
                    <span>{type.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Region Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-12"
          >
            <div className="flex flex-wrap justify-center gap-4">
              {regions.map((region) => {
                const IconComponent = region.icon;
                return (
                  <button
                    key={region.id}
                    onClick={() => setSelectedRegion(region.id)}
                    className={`flex items-center space-x-2 space-x-reverse px-8 py-4 rounded-2xl transition-all duration-300 modern-font shadow-md hover:shadow-lg ${
                      selectedRegion === region.id
                        ? 'bg-heritage-gold text-heritage-black shadow-lg scale-105 border-2 border-desert-400'
                        : 'bg-white/90 text-heritage-brown hover:bg-sand-200 hover:text-heritage-black hover:scale-102 border-2 border-sand-300'
                    }`}
                  >
                    <IconComponent size={18} />
                    <span>{region.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Featured Content */}
              {getFilteredContent().length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="mb-12"
                >
                  {(() => {
                    const featuredItem = getFilteredContent()[0];
                    const isVideo = featuredItem.media_type === 'video' || featuredItem.file_url;
                    
                    return (
                      <article
                        className="heritage-card hover-lift group cursor-pointer relative overflow-hidden"
                        onClick={() => isVideo ? handlePlayVideo(featuredItem.id, featuredItem.title) : handleReadMore(featuredItem.id, featuredItem.title)}
                      >
                        <div className="absolute top-6 right-6 z-10">
                          <span className="bg-heritage-gold text-heritage-black px-4 py-2 rounded-full text-sm font-semibold modern-font shadow-lg border-2 border-white">
                            {isVideo ? t('featuredVideo') : t('featuredArticle')}
                          </span>
                        </div>
                        
                        <div className="relative mb-6 overflow-hidden rounded-lg">
                          {(featuredItem.image_url || featuredItem.thumbnail_url) && (
                            <img  
                              className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                              alt={`صورة ${featuredItem.title}`}
                              src={featuredItem.image_url || featuredItem.thumbnail_url} />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                          {isVideo && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 group-hover:bg-white/30 transition-colors">
                                <Play size={48} className="text-white" />
                              </div>
                            </div>
                          )}
                          <div className="absolute bottom-6 right-6">
                            <span className="bg-heritage-blue text-white px-4 py-2 rounded-full text-sm font-medium modern-font shadow-lg">
                              {featuredItem.category || 'politics'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <h2 className="text-3xl md:text-4xl font-bold arabic-title text-heritage-black group-hover:text-heritage-gold transition-colors">
                            {featuredItem.title}
                          </h2>
                          
                          <p className="text-heritage-brown arabic-body leading-relaxed text-lg">
                            {featuredItem.excerpt || featuredItem.description}
                          </p>
                          
                          <div className="flex items-center justify-between pt-6 border-t border-sand-300">
                            <div className="flex items-center space-x-4 space-x-reverse text-sm text-heritage-brown">
                              <div className="flex items-center space-x-2 space-x-reverse">
                                <User size={16} className="text-heritage-gold" />
                                <span className="modern-font font-medium">{featuredItem.author || featuredItem.author_name}</span>
                              </div>
                              <div className="flex items-center space-x-2 space-x-reverse">
                                <Calendar size={16} className="text-heritage-gold" />
                                <span className="modern-font">{featuredItem.date || new Date(featuredItem.created_at).toLocaleDateString('ar')}</span>
                              </div>
                              {!isVideo && featuredItem.readTime && (
                                <div className="flex items-center space-x-2 space-x-reverse">
                                  <Clock size={16} className="text-heritage-gold" />
                                  <span className="modern-font">{featuredItem.readTime}</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-4 space-x-reverse">
                              <div className="flex items-center space-x-2 space-x-reverse text-sm text-heritage-brown">
                                <Eye size={16} className="text-heritage-gold" />
                                <span className="modern-font font-medium">{featuredItem.views || 0}</span>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleShare(featuredItem.title);
                                }}
                                className="text-heritage-brown hover:text-heritage-gold transition-colors p-2 rounded-lg hover:bg-sand-200"
                              >
                                <Share2 size={18} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })()
                  }
                </motion.section>
              )}

              {/* Other Content */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <h2 className="text-3xl font-bold arabic-title text-heritage-black mb-10">
                  {selectedContentType === 'videos' ? t('otherVideos') : selectedContentType === 'articles' ? t('otherArticles') : t('otherContent')}
                </h2>
                
                <div className="space-y-6">
                  {getFilteredContent().slice(1).map((item, index) => {
                    const isVideo = item.media_type === 'video' || item.file_url;
                    return (
                      <motion.article
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                        className="heritage-card hover-lift group cursor-pointer"
                        onClick={() => isVideo ? handlePlayVideo(item.id, item.title) : handleReadMore(item.id, item.title)}
                      >
                        <div className="flex flex-col md:flex-row gap-6">
                          <div className="md:w-1/3">
                            <div className="relative overflow-hidden rounded-lg">
                              {(item.image_url || item.thumbnail_url) && (
                                <img  
                                  className="w-full h-48 md:h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                                  alt={`صورة ${item.title}`}
                                  src={item.image_url || item.thumbnail_url} />
                              )}
                              {isVideo && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 group-hover:bg-white/30 transition-colors">
                                    <Play size={24} className="text-white" />
                                  </div>
                                </div>
                              )}
                              {item.trending && (
                                <div className="absolute top-2 right-2">
                                  <span className="bg-red-600 text-white px-2 py-1 rounded text-xs modern-font flex items-center space-x-1 space-x-reverse">
                                    <TrendingUp size={12} />
                                    <span>{t('trending')}</span>
                                  </span>
                                </div>
                              )}
                              <div className="absolute bottom-3 right-3">
                                <span className="bg-heritage-blue text-white px-3 py-1 rounded-full text-xs font-medium modern-font shadow-md">
                                  {item.category || 'politics'}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="md:w-2/3 space-y-3">
                            <h3 className="text-xl font-bold arabic-title text-heritage-black group-hover:text-heritage-gold transition-colors">
                              {item.title}
                            </h3>
                            
                            <p className="text-heritage-brown arabic-body leading-relaxed">
                              {item.excerpt || item.description}
                            </p>
                            
                            <div className="flex items-center justify-between text-sm text-heritage-brown">
                              <div className="flex items-center space-x-4 space-x-reverse">
                                <div className="flex items-center space-x-2 space-x-reverse">
                                  <User size={14} className="text-heritage-gold" />
                                  <span className="modern-font font-medium">{item.author || item.author_name}</span>
                                </div>
                                <div className="flex items-center space-x-2 space-x-reverse">
                                  <Calendar size={14} className="text-heritage-gold" />
                                  <span className="modern-font">{item.date || new Date(item.created_at).toLocaleDateString('ar')}</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-3 space-x-reverse">
                                <div className="flex items-center space-x-2 space-x-reverse">
                                  <Eye size={14} className="text-heritage-gold" />
                                  <span className="modern-font font-medium">{item.views || 0}</span>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleShare(item.title);
                                  }}
                                  className="text-heritage-brown hover:text-heritage-gold transition-colors p-2 rounded-lg hover:bg-sand-200"
                                >
                                  <Share2 size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.article>
                    );
                  })}
                </div>
              </motion.section>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Trending Articles */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="heritage-card"
              >
                <h3 className="text-xl font-bold arabic-title text-heritage-black mb-6 border-b border-sand-300 pb-4 flex items-center space-x-3 space-x-reverse">
                  <TrendingUp className="text-heritage-gold" size={22} />
                  <span>{t('trendingArticles')}</span>
                </h3>
                <div className="space-y-4">
                  {[...trendingArticles, ...trendingVideos].map((item) => {
                    const isVideo = item.media_type === 'video' || item.file_url;
                    return (
                      <article
                        key={item.id}
                        className="cursor-pointer group"
                        onClick={() => isVideo ? handlePlayVideo(item.id, item.title) : handleReadMore(item.id, item.title)}
                      >
                        <div className="flex items-start space-x-2 space-x-reverse">
                          {isVideo && <Video size={14} className="text-heritage-gold mt-1" />}
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold arabic-title text-heritage-black group-hover:text-heritage-gold transition-colors mb-2">
                              {item.title}
                            </h4>
                            <div className="flex items-center justify-between text-xs text-heritage-brown">
                              <span className="modern-font font-medium">{item.region || 'عام'}</span>
                              <div className="flex items-center space-x-1 space-x-reverse">
                                <Eye size={12} className="text-heritage-gold" />
                                <span className="modern-font font-medium">{item.views || 0}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </motion.div>

              {/* Regions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="heritage-card"
              >
                <h3 className="text-xl font-bold arabic-title text-heritage-black mb-6 border-b border-sand-300 pb-4">
                  {t('geographicRegions')}
                </h3>
                <div className="space-y-3">
                  {regions.slice(1).map((region) => {
                    const IconComponent = region.icon;
                    return (
                      <button
                        key={region.id}
                        onClick={() => setSelectedRegion(region.id)}
                        className={`w-full text-right p-4 rounded-xl transition-all duration-300 modern-font flex items-center space-x-3 space-x-reverse shadow-sm hover:shadow-md ${
                          selectedRegion === region.id
                            ? 'bg-heritage-gold text-heritage-black border-2 border-desert-400'
                            : 'hover:bg-sand-200 text-heritage-brown border-2 border-sand-300 bg-white/50'
                        }`}
                      >
                        <IconComponent size={18} className={selectedRegion === region.id ? 'text-heritage-black' : 'text-heritage-gold'} />
                        <span className="font-medium">{region.label}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>

              {/* Historical Timeline */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="heritage-card bg-gradient-to-br from-sand-100 to-sand-200 border-2 border-sand-300"
              >
                <h3 className="text-xl font-bold arabic-title mb-4 text-heritage-black">
                  {t('historicalTimeline')}
                </h3>
                <p className="arabic-body mb-6 text-sm text-heritage-brown leading-relaxed">
                  {t('exploreHistoricalEvents')}
                </p>
                <Button
                  onClick={() => {
                    toast({
                      title: t('timeline'),
                      description: t('featureNotImplemented'),
                      duration: 3000,
                    });
                  }}
                  className="w-full bg-heritage-gold hover:bg-desert-600 text-heritage-black hover:text-white modern-font font-medium py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  {t('showTimeline')}
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Call to Action */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="mt-16 text-center"
          >
            {/* Heritage Contribution block */}
            <div className="mb-12">
              <ContributeHeritage />
            </div>
            <div className="heritage-card bg-gradient-to-br from-heritage-gold/10 to-desert-100/20 border-2 border-heritage-gold/30 max-w-3xl mx-auto">
              <h3 className="text-3xl font-bold arabic-title mb-6 text-heritage-black">
                {t('contributeToResearch')}
              </h3>
              <p className="arabic-body mb-8 leading-relaxed text-heritage-brown text-lg">
                {t('contributeToResearchDescription')}
              </p>
              <Button
                onClick={() => {
                  toast({
                    title: t('shareResearch'),
                    description: t('featureNotImplemented'),
                    duration: 3000,
                  });
                }}
                className="bg-heritage-gold hover:bg-desert-600 text-heritage-black hover:text-white px-10 py-4 modern-font font-medium text-lg rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {t('shareYourResearch')}
              </Button>
            </div>
          </motion.section>
        </div>
      </div>
      
      {videoPlayer.isOpen && (
        <VideoPlayer
          src={videoPlayer.src}
          title={videoPlayer.title}
          onClose={handleCloseVideo}
        />
      )}
    </>
  );
};

export default PoliticsPage;
