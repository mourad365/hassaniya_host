import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Calendar, User, Eye, Share2, BookOpen, Music, Palette, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/hooks/use-language';
import { supabase } from '@/lib/customSupabaseClient';

const CulturePage = () => {
  const { t, language, isRTL } = useLanguage();
  // Use stable ID for selection; render label with t('all')
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['/api/articles', { category: 'culture' }],
    queryFn: async () => {
      // Get all culture-related category IDs
      const { data: cultureCategories, error: catError } = await supabase
        .from('categories')
        .select('id, slug')
        .eq('type', 'culture');
      
      // If no culture categories exist, return mock data
      if (catError || !cultureCategories || cultureCategories.length === 0) {
        console.warn('Culture categories not found, returning mock data');
        return [
          {
            id: 1,
            title: "التراث الحساني الأصيل",
            excerpt: "استكشاف عميق للتراث الحساني وعاداته وتقاليده العريقة التي تمتد عبر القرون",
            author_name: "د. محمد الأمين",
            publish_date: "2024-01-15",
            views: 1234,
            read_time: "5 دقائق",
            category: "traditions",
            featured: true,
            image_url: "/COVER.jpg",
            categories: { slug: "traditions", name: "تقاليد وعادات" }
          },
          {
            id: 2,
            title: "الموسيقى التقليدية الحسانية",
            excerpt: "رحلة في عالم الألحان والإيقاعات التراثية التي تحكي قصص الصحراء",
            author_name: "أحمد ولد محمد",
            publish_date: "2024-01-10",
            views: 987,
            read_time: "7 دقائق",
            category: "music",
            featured: false,
            image_url: "/COVER.jpg",
            categories: { slug: "music", name: "موسيقى تراثية" }
          },
          {
            id: 3,
            title: "الفنون الشعبية والحرف التقليدية",
            excerpt: "توثيق للحرف والفنون التقليدية التي تعكس إبداع الإنسان الحساني",
            author_name: "فاطمة بنت أحمد",
            publish_date: "2024-01-05",
            views: 756,
            read_time: "6 دقائق",
            category: "arts",
            featured: true,
            image_url: "/COVER.jpg",
            categories: { slug: "arts", name: "فنون شعبية" }
          },
          {
            id: 4,
            title: "توثيق التراث الحساني بصرياً",
            excerpt: "مشروع توثيق شامل للتراث الحساني من خلال الصور والفيديوهات التاريخية",
            author_name: "مريم بنت سالم",
            publish_date: "2024-01-01",
            views: 543,
            read_time: "4 دقائق",
            category: "documentation",
            featured: false,
            image_url: "/COVER.jpg",
            categories: { slug: "documentation", name: "توثيق بصري" }
          }
        ];
      }

      // Get category IDs for the IN query
      const categoryIds = cultureCategories.map(cat => cat.id);

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
    queryKey: ['/api/categories', 'culture'],
    queryFn: async () => {
      // Always return the Arabic categories for culture page
      return [
        { id: 'all', label: t('all'), icon: BookOpen },
        { id: 'traditions', label: t('traditionsAndCustoms'), icon: User },
        { id: 'music', label: t('traditionalMusic'), icon: Music },
        { id: 'arts', label: t('folkArts'), icon: Palette },
        { id: 'documentation', label: t('visualDocumentation'), icon: Camera }
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

  // Filter by category slug; 'all' shows everything
  const filteredArticles = selectedCategory === 'all'
    ? articles
    : articles.filter(article => article.categories?.slug === selectedCategory || article.category === selectedCategory);

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
              {t('cultureAndHeritage')}
            </h1>
            <p className="text-xl arabic-body text-[var(--deep-brown)] max-w-3xl mx-auto">
              {t('culturePageIntro')}
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
                        ? 'bg-[var(--heritage-gold)] text-black shadow-lg scale-105'
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
          {selectedCategory === 'all' && featuredArticles.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-16"
            >
              <h2 className="text-3xl font-bold arabic-title text-[var(--tent-black)] mb-8 text-center">
                {t('featuredArticles')}
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
                        {t('featured')}
                      </span>
                    </div>
                    
                    <div className="relative mb-6 overflow-hidden rounded-lg">
                      {article.image_url && (
                        <img  
                          className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                          alt={article.title}
                          src={article.image_url} />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <span className="bg-[var(--oasis-blue)] text-white px-3 py-1 rounded-full text-sm modern-font">
                          {categories.find(cat => cat.id === (article.categories?.slug || article.category))?.label}
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
                            <span className="modern-font">{article.author_name}</span>
                          </div>
                          <div className="flex items-center space-x-1 space-x-reverse">
                            <Calendar size={14} />
                            <span className="modern-font">{new Date(article.publish_date).toLocaleDateString('ar-SA')}</span>
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
              {selectedCategory === 'all' ? t('allArticles') : categories.find(cat => cat.id === selectedCategory)?.label}
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
                        alt={article.title}
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
                          {t('featured')}
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
                        <span className="modern-font">{article.author_name}</span>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Calendar size={14} />
                        <span className="modern-font">{new Date(article.publish_date).toLocaleDateString('ar-SA')}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-[var(--sand-dark)]">
                      <div className="flex items-center space-x-4 space-x-reverse text-sm text-[var(--desert-brown)]">
                        <div className="flex items-center space-x-1 space-x-reverse">
                          <Eye size={14} />
                          <span className="modern-font">{article.views}</span>
                        </div>
                        <span className="modern-font">{article.read_time}</span>
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
                {t('contributeToHeritage')}
              </h3>
              <p className="arabic-body mb-6 leading-relaxed">
                {t('contributeToHeritageDescription')}
              </p>
              <Button
                onClick={() => {
                  toast({
                    title: t('shareYourContent'),
                    description: t('featureNotImplemented'),
                    duration: 3000,
                  });
                }}
                className="bg-white text-black hover:bg-[var(--sand-light)] px-8 py-3 modern-font"
              >
                {t('shareYourContent')}
              </Button>
            </div>
          </motion.section>
        </div>
      </div>
    </>
  );
};

export default CulturePage;
//just test