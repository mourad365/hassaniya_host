import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, User, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useLanguage } from '@/hooks/use-language';

const FeaturedNews = () => {
  const [featuredNews, setFeaturedNews] = useState([]);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchFeaturedNews = async () => {
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
          .eq('is_featured', true)
          .order('publish_date', { ascending: false })
          .limit(3);

        if (error) {
          console.error('Error fetching featured news:', error);
          return;
        }

        const formattedArticles = articles?.map(article => ({
          id: article.id,
          title: article.title,
          excerpt: article.excerpt,
          category: article.categories?.name || 'عام',
          author: article.author_name,
          date: article.publish_date,
          views: typeof article.view_count === 'number' ? article.view_count : undefined,
          image_url: article.image_url
        })) || [];

        setFeaturedNews(formattedArticles);
      } catch (error) {
        console.error('Error fetching featured news:', error);
      }
    };

    fetchFeaturedNews();
  }, []);

  const handleReadMore = (id, title) => {
    toast({
      title: `📖 ${title}`,
      description: t('featureNotImplemented'),
      duration: 3000,
    });
  };

  if (!featuredNews || featuredNews.length === 0) return null;

  return (
    <section className="py-16 bg-sand-light">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold arabic-title text-[var(--tent-black)] mb-4">
            الأخبار المميزة
          </h2>
          <div className="w-24 h-1 bg-[var(--heritage-gold)] mx-auto"></div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {featuredNews.map((article, index) => (
            <motion.article
              key={article.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="heritage-card hover-lift group cursor-pointer"
              onClick={() => handleReadMore(article.id, article.title)}
            >
              <div className="relative mb-4 overflow-hidden rounded-lg">
                <img 
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  alt={`صورة ${article.title}`}
                  src={article.image_url} />
                <div className="absolute top-4 right-4">
                  <span className="bg-[var(--heritage-gold)] text-white px-3 py-1 rounded-full text-sm modern-font">
                    {article.category}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-xl font-bold arabic-title text-[var(--tent-black)] group-hover:text-[var(--heritage-gold)] transition-colors">
                  {article.title}
                </h3>
                
                <p className="text-[var(--deep-brown)] arabic-body leading-relaxed">
                  {article.excerpt}
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
                
                {typeof article.views === 'number' && (
                  <div className="flex items-center justify-between pt-3 border-t border-[var(--sand-dark)]">
                    <div className="flex items-center space-x-4 space-x-reverse text-sm text-[var(--desert-brown)]">
                      <div className="flex items-center space-x-1 space-x-reverse">
                        <Eye size={14} />
                        <span className="modern-font">{article.views}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedNews;
