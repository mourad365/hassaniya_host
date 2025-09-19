
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Calendar, User, Eye, Share2, BookOpen, Mic, FileText, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/hooks/use-language';

const LiteraturePage = () => {
  const { t, language, isRTL } = useLanguage();
  const [selectedType, setSelectedType] = useState(t('all'));

  const { data: content = [], isLoading } = useQuery({
    queryKey: ['/api/literature'],
    queryFn: async () => {
      const response = await fetch('/api/literature');
      if (!response.ok) {
        throw new Error('Failed to fetch literature');
      }
      return response.json();
    }
  });

  const { data: contentTypes = [] } = useQuery({
    queryKey: ['/api/literature-types'],
    queryFn: async () => {
      const response = await fetch('/api/literature-types');
      if (!response.ok) {
        return [
          { id: 'all', label: t('allTypes'), icon: BookOpen },
          { id: 'poetry', label: t('poetry'), icon: Quote },
          { id: 'prose', label: t('prose'), icon: FileText },
          { id: 'folktales', label: t('folkTales'), icon: Mic },
          { id: 'translations', label: t('translations'), icon: BookOpen }
        ];
      }
      const data = await response.json();
      return [
        { id: 'all', label: t('allTypes'), icon: BookOpen },
        ...data.map(type => ({
          id: type.id,
          label: language === 'ar' ? type.name : type.nameFr || type.name,
          icon: getIconForType(type.type)
        }))
      ];
    }
  });

  const getIconForType = (type) => {
    const iconMap = {
      poetry: Quote,
      prose: FileText,
      folktales: Mic,
      translations: BookOpen
    };
    return iconMap[type] || BookOpen;
  };


  const filteredContent = selectedType === t('all') 
    ? content 
    : content.filter(item => {
        const typeName = language === 'ar' ? item.type : (item.typeFr || item.type);
        return typeName === selectedType;
      });

  const featuredContent = content.filter(item => item.featured);

  const handleShare = (title) => {
    toast({
      title: t('shareContent'),
      description: t('featureNotImplemented'),
      duration: 3000,
    });
  };

  const handleReadMore = (id, title) => {
    toast({
      title: t('readContent'),
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

  return (
    <>
      <Helmet>
        <title>{t('literatureAndLanguage')} - {t('siteName')}</title>
        <meta name="description" content={t('literaturePageDescription')} />
        <meta property="og:title" content={`${t('literatureAndLanguage')} - ${t('siteName')}`} />
        <meta property="og:description" content={t('literaturePageDescription')} />
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
              الأدب الحساني
            </h1>
            <p className="text-xl arabic-body text-black max-w-3xl mx-auto">
              مكتبة شاملة للأدب الحساني تضم القصائد والنصوص والحكايات الشعبية والترجمات
            </p>
            <div className="w-24 h-1 bg-[var(--heritage-gold)] mx-auto mt-6"></div>
          </motion.div>

          {/* Content Type Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <div className="flex flex-wrap justify-center gap-4">
              {contentTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`flex items-center space-x-2 space-x-reverse px-6 py-3 rounded-full transition-all duration-300 modern-font ${
                      selectedType === type.id
                        ? 'bg-[var(--heritage-gold)] text-white shadow-lg scale-105'
                        : 'bg-white/80 text-[var(--tent-black)] hover:bg-[var(--sand-medium)] hover:scale-102'
                    }`}
                  >
                    <IconComponent size={18} />
                    <span>{type.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Featured Content */}
          {selectedType === 'الكل' && featuredContent.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-16"
            >
              <h2 className="text-3xl font-bold arabic-title text-[var(--tent-black)] mb-8 text-center">
                المحتوى المميز
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {featuredContent.map((item, index) => (
                  <motion.article
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                    className="heritage-card hover-lift group cursor-pointer relative overflow-hidden"
                    onClick={() => handleReadMore(item.id, item.title)}
                  >
                    <div className="absolute top-4 right-4 z-10">
                      <span className="bg-[var(--heritage-gold)] text-white px-3 py-1 rounded-full text-sm modern-font">
                        مميز
                      </span>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <span className="bg-[var(--oasis-blue)] text-white px-3 py-1 rounded-full text-sm modern-font">
                          {contentTypes.find(type => type.id === item.type)?.label}
                        </span>
                        <span className="text-sm text-[var(--desert-brown)] modern-font">
                          {item.category}
                        </span>
                      </div>
                      
                      <h3 className="text-2xl font-bold arabic-title text-[var(--tent-black)] group-hover:text-[var(--heritage-gold)] transition-colors">
                        {item.title}
                      </h3>
                      
                      <p className="text-[var(--deep-brown)] arabic-body leading-relaxed">
                        {item.excerpt}
                      </p>
                      
                      {item.type === 'شعر' && (
                        <div className="bg-[var(--sand-light)] p-4 rounded-lg border-r-4 border-[var(--heritage-gold)]">
                          <pre className="arabic-body text-[var(--tent-black)] whitespace-pre-wrap leading-relaxed">
                            {item.content.split('\n').slice(0, 4).join('\n')}...
                          </pre>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between pt-4 border-t border-[var(--sand-dark)]">
                        <div className="flex items-center space-x-4 space-x-reverse text-sm text-[var(--desert-brown)]">
                          <div className="flex items-center space-x-1 space-x-reverse">
                            <User size={14} />
                            <span className="modern-font">{item.author}</span>
                          </div>
                          <div className="flex items-center space-x-1 space-x-reverse">
                            <Calendar size={14} />
                            <span className="modern-font">{item.date}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLike(item.id, item.title);
                            }}
                            className="flex items-center space-x-1 space-x-reverse text-sm text-[var(--desert-brown)] hover:text-red-500 transition-colors"
                          >
                            <span>❤️</span>
                            <span className="modern-font">{item.likes}</span>
                          </button>
                          <div className="flex items-center space-x-1 space-x-reverse text-sm text-[var(--desert-brown)]">
                            <Eye size={14} />
                            <span className="modern-font">{item.views}</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShare(item.title);
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

          {/* All Content */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h2 className="text-3xl font-bold arabic-title text-black mb-8 text-center">
              {selectedType === 'الكل' ? 'جميع المحتويات' : contentTypes.find(type => type.id === selectedType)?.label}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredContent.map((item, index) => (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                  className="heritage-card hover-lift group cursor-pointer"
                  onClick={() => handleReadMore(item.id, item.title)}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="bg-[var(--oasis-blue)] text-white px-3 py-1 rounded-full text-sm modern-font">
                        {contentTypes.find(type => type.id === item.type)?.label}
                      </span>
                      {item.featured && (
                        <span className="bg-[var(--heritage-gold)] text-white px-2 py-1 rounded text-xs modern-font">
                          مميز
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-bold arabic-title text-[var(--tent-black)] group-hover:text-[var(--heritage-gold)] transition-colors">
                      {item.title}
                    </h3>
                    
                    <p className="text-[var(--deep-brown)] arabic-body leading-relaxed text-sm">
                      {item.excerpt.substring(0, 120)}...
                    </p>
                    
                    {item.type === 'شعر' && (
                      <div className="bg-[var(--sand-light)] p-3 rounded-lg border-r-4 border-[var(--heritage-gold)]">
                        <pre className="arabic-body text-[var(--tent-black)] whitespace-pre-wrap leading-relaxed text-sm">
                          {item.content.split('\n').slice(0, 2).join('\n')}...
                        </pre>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm text-[var(--desert-brown)]">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <User size={14} />
                        <span className="modern-font">{item.author}</span>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Calendar size={14} />
                        <span className="modern-font">{item.date}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-[var(--sand-dark)]">
                      <div className="flex items-center space-x-4 space-x-reverse text-sm text-[var(--desert-brown)]">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLike(item.id, item.title);
                          }}
                          className="flex items-center space-x-1 space-x-reverse hover:text-red-500 transition-colors"
                        >
                          <span>❤️</span>
                          <span className="modern-font">{item.likes}</span>
                        </button>
                        <div className="flex items-center space-x-1 space-x-reverse">
                          <Eye size={14} />
                          <span className="modern-font">{item.views}</span>
                        </div>
                        <span className="modern-font">{item.readTime}</span>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShare(item.title);
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

        </div>
      </div>
    </>
  );
};

export default LiteraturePage;
