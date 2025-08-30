
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Calendar, User, Eye, Share2, MessageCircle, ThumbsUp, Edit3, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/hooks/use-language';
import { supabase } from '@/lib/customSupabaseClient';

const OpinionPage = () => {
  const { t, language, isRTL } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState(t('all'));

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['articles', { category: 'opinion' }],
    queryFn: async () => {
      // Get opinion category ID first
      const { data: opinionCategories, error: catError } = await supabase
        .from('categories')
        .select('id, slug')
        .eq('type', 'opinion');
      
      // If no opinion categories exist, return mock data
      if (catError || !opinionCategories || opinionCategories.length === 0) {
        console.warn('Opinion categories not found, returning mock data');
        return [
          {
            id: 1,
            title: "رأي في القضايا المعاصرة",
            excerpt: "تحليل معمق للقضايا الراهنة من منظور حساني أصيل",
            author: "د. أحمد ولد محمد",
            authorBio: "كاتب وباحث في الشؤون السياسية",
            date: "2024-01-15",
            views: 1234,
            likes: 45,
            comments: 12,
            readTime: "5 دقائق",
            category: "رأي سياسي",
            featured: true,
            author_image: "/LOGO.png"
          },
          {
            id: 2,
            title: "نحو تطوير التعليم الحساني",
            excerpt: "مقترحات عملية لتطوير منظومة التعليم باللغة الحسانية",
            author: "فاطمة بنت أحمد",
            authorBio: "خبيرة في التربية والتعليم",
            date: "2024-01-10",
            views: 987,
            likes: 32,
            comments: 8,
            readTime: "7 دقائق",
            category: "رأي تعليمي",
            featured: false,
            author_image: "/LOGO.png"
          }
        ];
      }

      // Get category IDs for the IN query
      const categoryIds = opinionCategories.map(cat => cat.id);

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

  const { data: categories = [] } = useQuery({
    queryKey: ['categories', 'opinion'],
    queryFn: async () => {
      // Always return the Arabic categories for opinion page
      return [
        t('all'),
        'رأي سياسي',
        'رأي اجتماعي', 
        'رأي ثقافي',
        'رأي اقتصادي'
      ];
    }
  });

  const filteredArticles = selectedCategory === t('all') 
    ? articles 
    : articles.filter(article => {
        const categoryName = language === 'ar' ? article.category : (article.categoryFr || article.category);
        return categoryName === selectedCategory;
      });

  const featuredArticles = articles.filter(article => article.featured);

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

  const handleLike = (id, title) => {
    toast({
      title: t('like'),
      description: t('featureNotImplemented'),
      duration: 3000,
    });
  };

  const handleComment = (id, title) => {
    toast({
      title: t('comment'),
      description: t('featureNotImplemented'),
      duration: 3000,
    });
  };

  return (
    <>
      <Helmet>
        <title>{t('opinionArticles')} - {t('siteName')}</title>
        <meta name="description" content={t('opinionPageDescription')} />
        <meta property="og:title" content={`${t('opinionArticles')} - ${t('siteName')}`} />
        <meta property="og:description" content={t('opinionPageDescription')} />
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
              {t('opinionArticles')}
            </h1>
            <p className="text-xl arabic-body text-black max-w-3xl mx-auto">
              {t('opinionPageDescription')}
            </p>
            <div className="w-24 h-1 bg-[var(--heritage-gold)] mx-auto mt-6"></div>
          </motion.div>

          {/* Loading State */}
          {isLoading ? (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="animate-pulse">
                <div className="h-10 bg-sand-200 rounded w-48 mb-8 mx-auto"></div>
                <div className="flex justify-center gap-3 mb-12">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-8 bg-sand-200 rounded-full w-24"></div>
                  ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-white rounded-xl shadow-lg p-6">
                        <div className="h-4 bg-sand-200 rounded mb-3"></div>
                        <div className="h-6 bg-sand-200 rounded mb-3"></div>
                        <div className="h-16 bg-sand-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                      <div className="h-32 bg-sand-200 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Category Filter */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-12"
              >
                <div className="flex flex-wrap justify-center gap-3">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-full text-sm modern-font transition-all duration-300 ${
                        selectedCategory === category
                          ? 'bg-[var(--heritage-gold)] text-black shadow-lg scale-105'
                          : 'bg-white/80 text-[var(--tent-black)] hover:bg-[var(--sand-medium)] hover:scale-102'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Featured Articles */}
              {selectedCategory === 'الكل' && featuredArticles.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="mb-12"
                >
                  <h2 className="text-2xl font-bold arabic-title text-[var(--tent-black)] mb-8">
                    {t('featuredArticles')}
                  </h2>
                  <div className="space-y-8">
                    {featuredArticles.map((article, index) => (
                      <motion.article
                        key={article.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                        className="heritage-card hover-lift group cursor-pointer"
                        onClick={() => handleReadMore(article.id, article.title)}
                      >
                        <div className="flex items-start space-x-4 space-x-reverse mb-6">
                          {article.author_image && (
                            <img  
                              className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                              alt={`صورة ${article.author}`}
                              src={article.author_image} />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h4 className="font-semibold arabic-title text-[var(--tent-black)]">{article.author}</h4>
                                <p className="text-sm text-[var(--desert-brown)] modern-font">{article.authorBio}</p>
                              </div>
                              <span className="bg-[var(--heritage-gold)] text-white px-3 py-1 rounded-full text-sm modern-font">
                                {t('featured')}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <span className="bg-[var(--oasis-blue)] text-white px-3 py-1 rounded-full text-sm modern-font">
                              {article.category}
                            </span>
                            <span className="text-sm text-[var(--desert-brown)] modern-font">
                              {article.readTime}
                            </span>
                          </div>
                          
                          <h3 className="text-2xl font-bold arabic-title text-[var(--tent-black)] group-hover:text-[var(--heritage-gold)] transition-colors">
                            {language === 'ar' ? article.title : (article.titleFr || article.title)}
                          </h3>
                          
                          <p className="text-black arabic-body leading-relaxed">
                            {language === 'ar' ? article.excerpt : (article.excerptFr || article.excerpt)}
                          </p>
                          
                          <div className="flex items-center justify-between pt-4 border-t border-[var(--sand-dark)]">
                            <div className="flex items-center space-x-4 space-x-reverse text-sm text-[var(--desert-brown)]">
                              <div className="flex items-center space-x-1 space-x-reverse">
                                <Calendar size={14} />
                                <span className="modern-font">{article.date}</span>
                              </div>
                              <div className="flex items-center space-x-1 space-x-reverse">
                                <Eye size={14} />
                                <span className="modern-font">{article.views}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3 space-x-reverse">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleLike(article.id, article.title);
                                }}
                                className="flex items-center space-x-1 space-x-reverse text-sm text-[var(--desert-brown)] hover:text-red-500 transition-colors"
                              >
                                <ThumbsUp size={14} />
                                <span className="modern-font">{article.likes}</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleComment(article.id, article.title);
                                }}
                                className="flex items-center space-x-1 space-x-reverse text-sm text-[var(--desert-brown)] hover:text-[var(--heritage-gold)] transition-colors"
                              >
                                <MessageCircle size={14} />
                                <span className="modern-font">{article.comments}</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleShare(article.title);
                                }}
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

              {/* All Articles */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <h2 className="text-2xl font-bold arabic-title text-[var(--tent-black)] mb-8">
                  {selectedCategory === t('all') ? t('allArticles') : selectedCategory}
                </h2>
                
                <div className="space-y-6">
                  {filteredArticles.map((article, index) => (
                    <motion.article
                      key={article.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                      className="heritage-card hover-lift group cursor-pointer"
                      onClick={() => handleReadMore(article.id, article.title)}
                    >
                      <div className="flex items-start space-x-4 space-x-reverse mb-4">
                        {article.author_image && (
                          <img  
                            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                            alt={`صورة ${article.author}`}
                            src={article.author_image} />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold arabic-title text-[var(--tent-black)] text-sm">{article.author}</h4>
                              <p className="text-xs text-[var(--desert-brown)] modern-font">{article.authorBio}</p>
                            </div>
                            {article.featured && (
                              <span className="bg-[var(--heritage-gold)] text-white px-2 py-1 rounded text-xs modern-font">
                                {t('featured')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <span className="bg-[var(--oasis-blue)] text-white px-3 py-1 rounded-full text-sm modern-font">
                            {article.category}
                          </span>
                          <span className="text-sm text-[var(--desert-brown)] modern-font">
                            {article.readTime}
                          </span>
                        </div>
                        
                        <h3 className="text-xl font-bold arabic-title text-[var(--tent-black)] group-hover:text-[var(--heritage-gold)] transition-colors">
                          {language === 'ar' ? article.title : (article.titleFr || article.title)}
                        </h3>
                        
                        <p className="text-black arabic-body leading-relaxed text-sm">
                          {((language === 'ar' ? article.excerpt : (article.excerptFr || article.excerpt)) || '').substring(0, 150)}...
                        </p>
                        
                        <div className="flex items-center justify-between pt-3 border-t border-[var(--sand-dark)]">
                          <div className="flex items-center space-x-4 space-x-reverse text-sm text-[var(--desert-brown)]">
                            <div className="flex items-center space-x-1 space-x-reverse">
                              <Calendar size={14} />
                              <span className="modern-font">{article.date}</span>
                            </div>
                            <div className="flex items-center space-x-1 space-x-reverse">
                              <Eye size={14} />
                              <span className="modern-font">{article.views}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3 space-x-reverse">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLike(article.id, article.title);
                              }}
                              className="flex items-center space-x-1 space-x-reverse text-sm text-[var(--desert-brown)] hover:text-red-500 transition-colors"
                            >
                              <ThumbsUp size={14} />
                              <span className="modern-font">{article.likes}</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleComment(article.id, article.title);
                              }}
                              className="flex items-center space-x-1 space-x-reverse text-sm text-[var(--desert-brown)] hover:text-[var(--heritage-gold)] transition-colors"
                            >
                              <MessageCircle size={14} />
                              <span className="modern-font">{article.comments}</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShare(article.title);
                              }}
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
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Write Article CTA */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="heritage-card bg-white text-black"
              >
                <h3 className="text-xl font-bold arabic-title mb-4 flex items-center space-x-2 space-x-reverse">
                  <Edit3 size={20} />
                  <span>{t('writeArticle')}</span>
                </h3>
                <p className="arabic-body mb-4 text-sm">
                  {t('writeArticleDescription')}
                </p>
                <Button
                  onClick={() => {
                    toast({
                      title: t('writeArticle'),
                      description: t('featureNotImplemented'),
                      duration: 3000,
                    });
                  }}
                  className="w-full bg-white text-black hover:bg-[var(--sand-light)] modern-font"
                >
                  {t('startWriting')}
                </Button>
              </motion.div>

              {/* Popular Articles */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="heritage-card"
              >
                <h3 className="text-xl font-bold arabic-title text-[var(--tent-black)] mb-6 border-b border-[var(--sand-dark)] pb-3">
                  {t('mostRead')}
                </h3>
                <div className="space-y-4">
                  {articles.slice(0, 5).map((article, index) => (
                    <article
                      key={article.id}
                      className="cursor-pointer group"
                      onClick={() => handleReadMore(article.id, article.title)}
                    >
                      <h4 className="text-sm font-semibold arabic-title text-[var(--tent-black)] group-hover:text-[var(--heritage-gold)] transition-colors mb-2">
                        {language === 'ar' ? article.title : (article.titleFr || article.title)}
                      </h4>
                      <div className="flex items-center justify-between text-xs text-[var(--desert-brown)]">
                        <span className="modern-font">{language === 'ar' ? article.author : (article.authorFr || article.author)}</span>
                        <div className="flex items-center space-x-1 space-x-reverse">
                          <Eye size={12} />
                          <span className="modern-font">{article.views}</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </motion.div>

              {/* Newsletter */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="heritage-card bg-white text-black"
              >
                <h3 className="text-xl font-bold arabic-title mb-4 flex items-center space-x-2 space-x-reverse">
                  <Send size={20} />
                  <span>{t('weeklyNewsletter')}</span>
                </h3>
                <p className="arabic-body mb-4 text-sm">
                  {t('newsletterDescription')}
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    toast({
                      title: t('weeklyNewsletter'),
                      description: t('featureNotImplemented'),
                      duration: 3000,
                    });
                  }}
                  className="space-y-3"
                >
                  <input
                    type="email"
                    placeholder={t('emailPlaceholder')}
                    className="w-full px-3 py-2 rounded-lg text-[var(--tent-black)] arabic-body"
                  />
                  <Button type="submit" className="w-full bg-white text-black hover:bg-[var(--sand-light)] modern-font">
                    {t('subscribe')}
                  </Button>
                </form>
              </motion.div>
            </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default OpinionPage;
