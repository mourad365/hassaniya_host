
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useLanguage } from '@/hooks/use-language';

const Literature = () => {
    const [literatureContent, setLiteratureContent] = useState([]);
    const { t } = useLanguage();

    // Fallback content when database is empty
    const fallbackContent = [
        {
            id: 'fallback-1',
            title: 'من روائع الشعر الحساني',
            excerpt: 'الشعر الحساني يحمل في طياته عبق التاريخ وجمال الصحراء، حيث تتداخل الكلمات مع نسائم الرمال لتحكي قصص الأجداد وحكايات البطولة والحب.',
            type: 'شعر',
            author: 'شاعر حساني',
            date: new Date().toISOString().split('T')[0],
            isFallback: true
        },
        {
            id: 'fallback-2',
            title: 'حكايات من التراث الحساني',
            excerpt: 'تزخر الثقافة الحسانية بالحكايات الشعبية التي تنقل الحكمة والتجارب عبر الأجيال، وتعكس قيم المجتمع وتقاليده العريقة في قالب أدبي جميل.',
            type: 'أدب شعبي',
            author: 'راوي تراثي',
            date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
            isFallback: true
        }
    ];

    useEffect(() => {
        const fetchLiteratureContent = async () => {
            try {
                const { data: articles, error } = await supabase
                    .from('articles')
                    .select(`
                        id,
                        title,
                        excerpt,
                        author_name,
                        publish_date,
                        categories (name)
                    `)
                    .eq('categories.name', 'أدب وشعر')
                    .order('publish_date', { ascending: false })
                    .limit(2);

                if (error) {
                    console.error('Error fetching literature content:', error);
                    setLiteratureContent(fallbackContent);
                    return;
                }

                const formattedContent = articles?.map(article => ({
                    id: article.id,
                    title: article.title,
                    excerpt: article.excerpt,
                    type: article.categories?.name || 'أدب',
                    author: article.author_name,
                    date: article.publish_date
                })) || [];

                // Use fallback content if no articles found
                if (formattedContent.length === 0) {
                    setLiteratureContent(fallbackContent);
                } else {
                    setLiteratureContent(formattedContent);
                }
            } catch (error) {
                console.error('Error fetching literature content:', error);
                setLiteratureContent(fallbackContent);
            }
        };

        fetchLiteratureContent();
    }, []);

    const handleReadMore = (id, title) => {
        toast({
            title: `📖 ${title}`,
            description: t('featureNotImplemented'),
            duration: 3000,
        });
    };

    return (
        <section className="py-16 bg-white/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold arabic-title text-[var(--tent-black)] mb-4">
                {t('fromHassaniyaLiterature')}
              </h2>
              <div className="w-24 h-1 bg-[var(--heritage-gold)] mx-auto"></div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {literatureContent.map((content, index) => (
                <motion.article
                  key={content.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="heritage-card hover-lift cursor-pointer"
                  onClick={() => handleReadMore(content.id, content.title)}
                >
                  <div className="flex items-center space-x-3 space-x-reverse mb-4">
                    <span className="bg-[var(--oasis-blue)] text-white px-3 py-1 rounded-full text-sm modern-font">
                      {content.type}
                    </span>
                    {content.isFallback && (
                      <span className="bg-heritage-gold/20 text-heritage-gold px-2 py-1 rounded-full text-xs modern-font">
                        محتوى تجريبي
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold arabic-title text-[var(--tent-black)] mb-3 hover:text-[var(--heritage-gold)] transition-colors">
                    {content.title}
                  </h3>
                  
                  <p className="text-[var(--deep-brown)] arabic-body leading-relaxed mb-4">
                    {content.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-[var(--desert-brown)]">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <User size={14} />
                      <span className="modern-font">{content.author}</span>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Calendar size={14} />
                      <span className="modern-font">{content.date}</span>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Link to="/literature">
                <Button className="btn-oasis px-8 py-3 modern-font">
                  {t('exploreMoreLiterature')}
                </Button>
              </Link>
            </div>
          </div>
        </section>
    );
};

export default Literature;
