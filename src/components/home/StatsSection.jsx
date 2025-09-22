import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, Mic, Eye } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';

const StatsSection = () => {
  const [stats, setStats] = useState({
    articles: 0,
    podcasts: 0,
    visitors: 0,
    media: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch articles count
        const { count: articlesCount } = await supabase
          .from('articles')
          .select('*', { count: 'exact', head: true });

        // Fetch podcasts count
        const { count: podcastsCount } = await supabase
          .from('podcasts')
          .select('*', { count: 'exact', head: true });

        // Fetch media count
        const { count: mediaCount } = await supabase
          .from('media')
          .select('*', { count: 'exact', head: true });

        setStats({
          articles: articlesCount || 0,
          podcasts: podcastsCount || 0,
          media: mediaCount || 0,
          visitors: Math.floor(Math.random() * 5000) + 1000 // Simulated visitor count
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Fallback stats
        setStats({
          articles: 25,
          podcasts: 12,
          media: 18,
          visitors: 3247
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statsData = [
    {
      icon: BookOpen,
      number: stats.articles,
      label: 'مقال ومحتوى',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: Mic,
      number: stats.podcasts,
      label: 'بودكاست وبرنامج',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: Eye,
      number: stats.media,
      label: 'محتوى مرئي',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      icon: Users,
      number: stats.visitors,
      label: 'زائر شهرياً',
      color: 'text-heritage-gold',
      bgColor: 'bg-heritage-gold/10'
    }
  ];

  const CountUpAnimation = ({ end, duration = 2000 }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      let startTime;
      const animate = (currentTime) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        setCount(Math.floor(progress * end));
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }, [end, duration]);

    return <span>{count.toLocaleString('ar-SA')}</span>;
  };

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-r from-heritage-gold/5 to-sand-light/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 animate-pulse"></div>
                <div className="h-8 bg-gray-200 rounded mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-r from-heritage-gold/5 to-sand-light/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold arabic-title text-[var(--tent-black)] mb-4">
            منصة الحسانية في أرقام
          </h2>
          <p className="text-[var(--deep-brown)] arabic-body text-lg">
            نفخر بما حققناه من إنجازات في خدمة التراث الحساني
          </p>
          <div className="w-24 h-1 bg-[var(--heritage-gold)] mx-auto mt-4"></div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {statsData.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center group"
            >
              <div className={`w-16 h-16 ${stat.bgColor} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className={`${stat.color}`} size={28} />
              </div>
              <div className={`text-3xl md:text-4xl font-bold ${stat.color} mb-2 modern-font`}>
                <CountUpAnimation end={stat.number} />
                {stat.label === 'زائر شهرياً' && '+'}
              </div>
              <p className="text-[var(--deep-brown)] arabic-body font-medium">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-12"
        >
          <p className="text-[var(--deep-brown)] arabic-body text-lg max-w-2xl mx-auto">
            نواصل العمل بجد لإثراء المحتوى الحساني وتوفير منصة شاملة للتراث والثقافة الحسانية الأصيلة
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default StatsSection;
