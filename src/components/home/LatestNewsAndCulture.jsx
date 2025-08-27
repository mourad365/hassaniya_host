import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, User, Eye, ArrowRight, Tag, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useLanguage } from '@/hooks/use-language';

const LatestNewsAndCulture = () => {
    const [latestNews, setLatestNews] = useState([]);
    const [cultureArticles, setCultureArticles] = useState([]);
    const { t } = useLanguage();

    useEffect(() => {
        const fetchLatestNews = async () => {
            try {
                const { data: articles, error } = await supabase
                    .from('articles')
                    .select(`
                        id,
                        title,
                        excerpt,
                        author_name,
                        publish_date,
                        image_url,
                        categories (name)
                    `)
                    .eq('is_featured', false)
                    .order('publish_date', { ascending: false })
                    .limit(3);

                if (error) {
                    console.error('Error fetching latest news:', error);
                    return;
                }

                const formattedNews = articles?.map(article => ({
                    id: article.id,
                    title: article.title,
                    excerpt: article.excerpt,
                    category: article.categories?.name || 'عام',
                    date: article.publish_date,
                    views: Math.floor(Math.random() * 1000) + 100,
                    image_url: article.image_url
                })) || [];

                setLatestNews(formattedNews);
            } catch (error) {
                console.error('Error fetching latest news:', error);
            }
        };

        const fetchCultureArticles = async () => {
            try {
                const { data: articles, error } = await supabase
                    .from('articles')
                    .select(`
                        id,
                        title,
                        excerpt,
                        author_name,
                        publish_date,
                        image_url,
                        categories (name)
                    `)
                    .eq('categories.name', 'ثقافة وتراث')
                    .order('publish_date', { ascending: false })
                    .limit(2);

                if (error) {
                    console.error('Error fetching culture articles:', error);
                    return;
                }

                const formattedCulture = articles?.map(article => ({
                    id: article.id,
                    title: article.title,
                    excerpt: article.excerpt,
                    author: article.author_name,
                    date: article.publish_date,
                    image_url: article.image_url
                })) || [];

                setCultureArticles(formattedCulture);
            } catch (error) {
                console.error('Error fetching culture articles:', error);
            }
        };

        fetchLatestNews();
        fetchCultureArticles();
    }, []);

    const handleReadMore = (id, title) => {
        toast({
            title: `📖 ${title}`,
            description: t('featureNotImplemented'),
            duration: 3000,
        });
    };
    
    return (
        <section className="py-16 bg-sand-medium/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold arabic-title text-[var(--tent-black)]">
                    آخر الأخبار
                  </h2>
                  <Link to="/news" className="text-[var(--heritage-gold)] hover:text-[var(--desert-brown)] transition-colors modern-font flex items-center">
                    عرض الكل <ArrowLeft className="inline mr-2" size={16} />
                  </Link>
                </div>
                
                <div className="space-y-6">
                  {latestNews.map((article) => (
                    <motion.article
                      key={article.id}
                      whileHover={{ x: 10 }}
                      className="flex items-start space-x-4 space-x-reverse p-4 rounded-lg hover:bg-white/70 transition-colors cursor-pointer"
                      onClick={() => handleReadMore(article.id, article.title)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 space-x-reverse mb-2">
                          <Tag size={14} className="text-[var(--heritage-gold)]" />
                          <span className="text-sm text-[var(--heritage-gold)] modern-font">{article.category}</span>
                        </div>
                        <h3 className="text-lg font-semibold arabic-title text-[var(--tent-black)] mb-2 hover:text-[var(--heritage-gold)] transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-[var(--deep-brown)] arabic-body text-sm leading-relaxed mb-3">
                          {article.excerpt}
                        </p>
                        <div className="flex items-center space-x-4 space-x-reverse text-xs text-[var(--desert-brown)]">
                          <div className="flex items-center space-x-1 space-x-reverse">
                            <Calendar size={12} />
                            <span className="modern-font">{article.date}</span>
                          </div>
                          <div className="flex items-center space-x-1 space-x-reverse">
                            <Eye size={12} />
                            <span className="modern-font">{article.views}</span>
                          </div>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold arabic-title text-[var(--tent-black)]">
                    ثقافة وتراث
                  </h2>
                  <Link to="/culture" className="text-[var(--heritage-gold)] hover:text-[var(--desert-brown)] transition-colors modern-font flex items-center">
                    عرض الكل <ArrowLeft className="inline mr-2" size={16} />
                  </Link>
                </div>
                
                <div className="space-y-6">
                  {cultureArticles.map((article) => (
                    <motion.article
                      key={article.id}
                      whileHover={{ scale: 1.02 }}
                      className="heritage-card hover-lift cursor-pointer"
                      onClick={() => handleReadMore(article.id, article.title)}
                    >
                      <div className="flex space-x-4 space-x-reverse">
                        <img 
                          className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                          alt={`صورة ${article.title}`}
                          src={article.image_url} />
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold arabic-title text-[var(--tent-black)] mb-2 hover:text-[var(--heritage-gold)] transition-colors">
                            {article.title}
                          </h3>
                          <p className="text-[var(--deep-brown)] arabic-body text-sm leading-relaxed mb-3">
                            {article.excerpt}
                          </p>
                          <div className="flex items-center space-x-3 space-x-reverse text-xs text-[var(--desert-brown)]">
                            <div className="flex items-center space-x-1 space-x-reverse">
                              <User size={12} />
                              <span className="modern-font">{article.author}</span>
                            </div>
                            <div className="flex items-center space-x-1 space-x-reverse">
                              <Calendar size={12} />
                              <span className="modern-font">{article.date}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>
    );
};

export default LatestNewsAndCulture;
