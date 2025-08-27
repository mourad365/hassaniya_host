
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Calendar, User, Eye, Share2, BookOpen, Music, Palette, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/hooks/use-language';

const CulturePage = () => {
  const { t, language, isRTL } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState(t('all'));

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['/api/articles', { category: 'culture' }],
    queryFn: async () => {
      const response = await fetch('/api/articles?category=culture');
      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }
      return response.json();
    }
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories', 'culture'],
    queryFn: async () => {
      const response = await fetch('/api/categories?type=culture');
      if (!response.ok) {
        return [
          { id: 'all', label: t('all'), icon: BookOpen },
          { id: 'traditions', label: t('traditionsAndCustoms'), icon: User },
          { id: 'music', label: t('traditionalMusic'), icon: Music },
          { id: 'arts', label: t('folkArts'), icon: Palette },
          { id: 'documentation', label: t('visualDocumentation'), icon: Camera }
        ];
      }
      const data = await response.json();
      return [
        { id: 'all', label: t('all'), icon: BookOpen },
        ...data.map(cat => ({
          id: cat.id,
          label: language === 'ar' ? cat.name : cat.nameFr || cat.name,
          icon: getIconForCategory(cat.type)
        }))
      ];
    }
  });

  const getIconForCategory = (type) => {
    const iconMap = {
      traditions: User,
      music: Music,
      arts: Palette,
      documentation: Camera
    };
    return iconMap[type] || BookOpen;
  };


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

  return (
    <>
      <Helmet>
        <title>{t('cultureAndHeritage')} - {t('siteName')}</title>
        <meta name="description" content={t('culturePageDescription')} />
        <meta property="og:title" content={`${t('cultureAndHeritage')} - ${t('siteName')}`} />
        <meta property="og:description" content={t('culturePageDescription')} />
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
              الثقافة والتراث
            </h1>
            <p className="text-xl arabic-body text-[var(--deep-brown)] max-w-3xl mx-auto">
              استكشف عمق الثقافة الحسانية الأصيلة وتراثها العريق عبر العادات والتقاليد والفنون
            </p>
            <div className="w-24 h-1 bg-[var(--heritage-gold)] mx-auto mt-6"></div>
          </motion.div>

          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <div className="flex flex-wrap justify-center gap-4">
              {categories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center space-x-2 space-x-reverse px-6 py-3 rounded-full transition-all duration-300 modern-font ${
                      selectedCategory === category.id
                        ? 'bg-[var(--heritage-gold)] text-white shadow-lg scale-105'
                        : 'bg-white/80 text-[var(--tent-black)] hover:bg-[var(--sand-medium)] hover:scale-102'
                    }`}
                  >
                    <IconComponent size={18} />
                    <span>{category.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Featured Articles */}
          {selectedCategory === 'الكل' && featuredArticles.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-16"
            >
              <h2 className="text-3xl font-bold arabic-title text-[var(--tent-black)] mb-8 text-center">
                المقالات المميزة
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {featuredArticles.map((article, index) => (
                  <motion.article
                    key={article.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                    className="heritage-card hover-lift group cursor-pointer relative overflow-hidden"
                    onClick={() => handleReadMore(article.id, article.title)}
                  >
                    <div className="absolute top-4 right-4 z-10">
                      <span className="bg-[var(--heritage-gold)] text-white px-3 py-1 rounded-full text-sm modern-font">
                        مميز
                      </span>
                    </div>
                    
                    <div className="relative mb-6 overflow-hidden rounded-lg">
                      {article.image_url && (
                        <img  
                          className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                          alt={`صورة ${article.title}`}
                          src={article.image_url} />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <span className="bg-[var(--oasis-blue)] text-white px-3 py-1 rounded-full text-sm modern-font">
                          {categories.find(cat => cat.id === article.category)?.label}
                        </span>
                      </div>
                      
                      <h3 className="text-2xl font-bold arabic-title text-[var(--tent-black)] group-hover:text-[var(--heritage-gold)] transition-colors">
                        {article.title}
                      </h3>
                      
                      <p className="text-[var(--deep-brown)] arabic-body leading-relaxed">
                        {article.excerpt}
                      </p>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-[var(--sand-dark)]">
                        <div className="flex items-center space-x-4 space-x-reverse text-sm text-[var(--desert-brown)]">
                          <div className="flex items-center space-x-1 space-x-reverse">
                            <User size={14} />
                            <span className="modern-font">{article.author}</span>
                          </div>
                          <div className="flex items-center space-x-1 space-x-reverse">
                            <Calendar size={14} />
                            <span className="modern-font">{article.date}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <div className="flex items-center space-x-1 space-x-reverse text-sm text-[var(--desert-brown)]">
                            <Eye size={14} />
                            <span className="modern-font">{article.views}</span>
                          </div>
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
            <h2 className="text-3xl font-bold arabic-title text-[var(--tent-black)] mb-8 text-center">
              {selectedCategory === 'الكل' ? 'جميع المقالات' : categories.find(cat => cat.id === selectedCategory)?.label}
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
                    {article.image_url && (
                      <img  
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        alt={`صورة ${article.title}`}
                        src={article.image_url} />
                    )}
                    <div className="absolute top-4 right-4">
                      <span className="bg-[var(--oasis-blue)] text-white px-3 py-1 rounded-full text-sm modern-font">
                        {categories.find(cat => cat.id === article.category)?.label}
                      </span>
                    </div>
                    {article.featured && (
                      <div className="absolute top-4 left-4">
                        <span className="bg-[var(--heritage-gold)] text-white px-2 py-1 rounded text-xs modern-font">
                          مميز
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3">
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
                        <span className="modern-font">{article.readTime}</span>
                      </div>
                      
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
                </motion.article>
              ))}
            </div>
          </motion.section>

          {/* Call to Action */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-16 text-center"
          >
            <div className="heritage-card oasis-gradient text-white max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold arabic-title mb-4">
                شارك في حفظ التراث
              </h3>
              <p className="arabic-body mb-6 leading-relaxed">
                هل لديك معلومات أو قصص تراثية تود مشاركتها؟ ساهم في إثراء المحتوى الثقافي لمنصة الحسانية
              </p>
              <Button
                onClick={() => {
                  toast({
                    title: t('shareContent'),
                    description: t('featureNotImplemented'),
                    duration: 3000,
                  });
                }}
                className="bg-white text-[var(--oasis-blue)] hover:bg-[var(--sand-light)] px-8 py-3 modern-font"
              >
                شارك محتواك
              </Button>
            </div>
          </motion.section>
        </div>
      </div>
    </>
  );
};

export default CulturePage;
