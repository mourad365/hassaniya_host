
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Clock, Eye, Share2, Calendar, User, Tag, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const NewsPage = () => {
  const [news, setNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['الكل', 'سياسة', 'ثقافة', 'تعليم', 'تقنية', 'فنون', 'رياضة', 'اقتصاد'];

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const { data: articles, error } = await supabase
          .from('articles')
          .select(`
            id,
            title,
            excerpt,
            content,
            author_name,
            publish_date,
            image_url,
            is_featured,
            categories (name)
          `)
          .order('publish_date', { ascending: false });

        if (error) {
          console.error('Error fetching news:', error);
          return;
        }

        const formattedNews = articles?.map(article => ({
          id: article.id,
          title: article.title,
          excerpt: article.excerpt,
          content: article.content,
          image: article.image_url,
          category: article.categories?.name || 'عام',
          author: article.author_name,
          date: article.publish_date,
          time: new Date(article.publish_date).toLocaleTimeString('ar-SA', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          views: Math.floor(Math.random() * 1000) + 100,
          readTime: `${Math.floor(Math.random() * 5) + 3} دقائق`,
          isBreaking: article.is_featured
        })) || [];

        setNews(formattedNews);
        setFilteredNews(formattedNews);
      } catch (error) {
        console.error('Error fetching news:', error);
      }
    };

    fetchNews();
  }, []);

  useEffect(() => {
    let filtered = news;

    if (selectedCategory !== 'الكل') {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(article =>
        article.title.includes(searchQuery) ||
        article.excerpt.includes(searchQuery) ||
        article.author.includes(searchQuery)
      );
    }

    setFilteredNews(filtered);
  }, [selectedCategory, searchQuery, news]);

  const handleShare = (title) => {
    toast({
      title: `📤 ${title}`,
      description: t('featureNotImplemented'),
      duration: 3000,
    });
  };

  const handleReadMore = (id, title) => {
    toast({
      title: `📖 ${title}`,
      description: t('featureNotImplemented'),
      duration: 3000,
    });
  };

  return (
    <>
      <Helmet>
        <title>الأخبار العاجلة - الحسانية</title>
        <meta name="description" content="آخر الأخبار والمستجدات حول الثقافة والتراث الحساني من جميع أنحاء العالم" />
        <meta property="og:title" content="الأخبار العاجلة - الحسانية" />
        <meta property="og:description" content="آخر الأخبار والمستجدات حول الثقافة والتراث الحساني من جميع أنحاء العالم" />
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
              الأخبار العاجلة
            </h1>
            <p className="text-xl arabic-body text-[var(--deep-brown)] max-w-2xl mx-auto">
              آخر الأخبار والمستجدات حول الثقافة والتراث الحساني
            </p>
            <div className="w-24 h-1 bg-[var(--heritage-gold)] mx-auto mt-6"></div>
          </motion.div>

          {/* Search and Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="البحث في الأخبار..."
                  className="w-full px-4 py-3 pr-12 rounded-lg border border-[var(--sand-dark)] bg-white/80 focus:outline-none focus:ring-2 focus:ring-[var(--heritage-gold)] arabic-body"
                />
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[var(--desert-brown)]" size={20} />
              </div>

              {/* Category Filter */}
              <div className="flex items-center space-x-2 space-x-reverse">
                <Filter className="text-[var(--desert-brown)]" size={20} />
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-full text-sm modern-font transition-colors ${
                        selectedCategory === category
                          ? 'bg-[var(--heritage-gold)] text-white'
                          : 'bg-white/80 text-[var(--tent-black)] hover:bg-[var(--sand-medium)]'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Breaking News */}
          {filteredNews.some(article => article.isBreaking) && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-8"
            >
              <div className="bg-red-600 text-white p-4 rounded-lg">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <span className="bg-white text-red-600 px-3 py-1 rounded-full text-sm font-bold modern-font animate-pulse">
                    عاجل
                  </span>
                  <h2 className="text-lg font-bold arabic-title">
                    {filteredNews.find(article => article.isBreaking)?.title}
                  </h2>
                </div>
              </div>
            </motion.div>
          )}

          {/* News Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main News */}
            <div className="lg:col-span-2">
              <div className="space-y-8">
                {filteredNews.slice(0, 3).map((article, index) => (
                  <motion.article
                    key={article.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                    className="heritage-card hover-lift group cursor-pointer"
                    onClick={() => handleReadMore(article.id, article.title)}
                  >
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="md:w-1/3">
                        <div className="relative overflow-hidden rounded-lg">
                          <img  
                            className="w-full h-48 md:h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                            alt={`صورة ${article.title}`}
                            src={article.image_url} />
                          {article.isBreaking && (
                            <div className="absolute top-2 right-2">
                              <span className="bg-red-600 text-white px-2 py-1 rounded text-xs modern-font animate-pulse">
                                عاجل
                              </span>
                            </div>
                          )}
                          <div className="absolute bottom-2 right-2">
                            <span className="bg-[var(--heritage-gold)] text-white px-2 py-1 rounded text-xs modern-font">
                              {article.category}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="md:w-2/3 space-y-3">
                        <h2 className="text-xl md:text-2xl font-bold arabic-title text-[var(--tent-black)] group-hover:text-[var(--heritage-gold)] transition-colors">
                          {article.title}
                        </h2>
                        
                        <p className="text-[var(--deep-brown)] arabic-body leading-relaxed">
                          {article.excerpt}
                        </p>
                        
                        <div className="flex items-center justify-between text-sm text-[var(--desert-brown)]">
                          <div className="flex items-center space-x-4 space-x-reverse">
                            <div className="flex items-center space-x-1 space-x-reverse">
                              <User size={14} />
                              <span className="modern-font">{article.author}</span>
                            </div>
                            <div className="flex items-center space-x-1 space-x-reverse">
                              <Calendar size={14} />
                              <span className="modern-font">{article.date}</span>
                            </div>
                            <div className="flex items-center space-x-1 space-x-reverse">
                              <Clock size={14} />
                              <span className="modern-font">{article.time}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3 space-x-reverse">
                            <div className="flex items-center space-x-1 space-x-reverse">
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
                    </div>
                  </motion.article>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Latest News Sidebar */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="heritage-card"
              >
                <h3 className="text-xl font-bold arabic-title text-[var(--tent-black)] mb-6 border-b border-[var(--sand-dark)] pb-3">
                  أحدث الأخبار
                </h3>
                <div className="space-y-4">
                  {filteredNews.slice(3).map((article) => (
                    <article
                      key={article.id}
                      className="cursor-pointer group"
                      onClick={() => handleReadMore(article.id, article.title)}
                    >
                      <h4 className="text-sm font-semibold arabic-title text-[var(--tent-black)] group-hover:text-[var(--heritage-gold)] transition-colors mb-2">
                        {article.title}
                      </h4>
                      <div className="flex items-center justify-between text-xs text-[var(--desert-brown)]">
                        <span className="modern-font">{article.date}</span>
                        <div className="flex items-center space-x-1 space-x-reverse">
                          <Eye size={12} />
                          <span className="modern-font">{article.views}</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </motion.div>

              {/* Categories */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="heritage-card"
              >
                <h3 className="text-xl font-bold arabic-title text-[var(--tent-black)] mb-6 border-b border-[var(--sand-dark)] pb-3">
                  الأقسام
                </h3>
                <div className="space-y-2">
                  {categories.slice(1).map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full text-right p-3 rounded-lg transition-colors modern-font ${
                        selectedCategory === category
                          ? 'bg-[var(--heritage-gold)] text-white'
                          : 'hover:bg-[var(--sand-medium)] text-[var(--tent-black)]'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Newsletter Signup */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="heritage-card oasis-gradient text-white"
              >
                <h3 className="text-xl font-bold arabic-title mb-4">
                  النشرة الإخبارية
                </h3>
                <p className="arabic-body mb-4 text-sm">
                  اشترك لتصلك آخر الأخبار والمقالات
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    toast({
                      title: t('newsletter'),
                      description: t('featureNotImplemented'),
                      duration: 3000,
                    });
                  }}
                  className="space-y-3"
                >
                  <input
                    type="email"
                    placeholder="بريدك الإلكتروني"
                    className="w-full px-3 py-2 rounded-lg text-[var(--tent-black)] arabic-body"
                  />
                  <Button type="submit" className="w-full bg-white text-[var(--oasis-blue)] hover:bg-[var(--sand-light)] modern-font">
                    اشتراك
                  </Button>
                </form>
              </motion.div>
            </div>
          </div>

          {/* Load More */}
          {filteredNews.length > 6 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-center mt-12"
            >
              <Button
                onClick={() => {
                  toast({
                    title: t('loadMore'),
                    description: t('featureNotImplemented'),
                    duration: 3000,
                  });
                }}
                className="btn-heritage px-8 py-3 modern-font"
              >
                تحميل المزيد من الأخبار
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default NewsPage;
