import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Facebook, ExternalLink, Calendar, MessageCircle, Users } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';

const SocialMediaSection = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useLanguage();

  // Facebook Page Access Token from environment variables
  const PAGE_ACCESS_TOKEN = import.meta.env.VITE_FACEBOOK_PAGE_ACCESS_TOKEN || import.meta.env.VITE_FACEBOOK_PAGE_TOKEN;
  const PAGE_ID = import.meta.env.VITE_FACEBOOK_PAGE_ID || "101470072189930";

  useEffect(() => {
    const fetchFacebookPosts = async () => {
      // Check if Facebook token is configured
      if (!PAGE_ACCESS_TOKEN || PAGE_ACCESS_TOKEN.trim() === '' || PAGE_ACCESS_TOKEN === 'your_facebook_page_access_token_here') {
        // Not configured -> render nothing
        setPosts([]);
        setLoading(false);
        return;
      }

      try {
        const url = `https://graph.facebook.com/v19.0/${PAGE_ID}/posts?fields=id,message,created_time,full_picture,permalink_url&access_token=${PAGE_ACCESS_TOKEN}&limit=3`;
        
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error('Failed to fetch Facebook posts');
        }

        const data = await response.json();
        const fetchedPosts = data.data || [];
        
        setPosts(fetchedPosts);
      } catch (err) {
        console.error('Error fetching Facebook posts:', err);
        setError(err.message);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFacebookPosts();
  }, [PAGE_ACCESS_TOKEN, PAGE_ID]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const truncateMessage = (message, maxLength = 120) => {
    if (!message) return '';
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  if (loading) return null;

  if (error) return null;

  if (posts.length === 0) return null;

  return (
    <section className="py-16 bg-gradient-to-br from-sand-light via-white to-sand-light">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <Facebook className="text-[#1877f2] mr-3" size={32} />
            <h2 className="text-3xl md:text-4xl font-bold arabic-title text-[var(--tent-black)]">
              تابعونا على فيسبوك
            </h2>
          </div>
          <p className="text-[var(--deep-brown)] arabic-body text-lg max-w-2xl mx-auto">
            آخر الأخبار والتحديثات من صفحتنا الرسمية على فيسبوك
          </p>
          <div className="w-24 h-1 bg-[var(--heritage-gold)] mx-auto mt-4"></div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.slice(0, 3).map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-sand-200 group"
            >
              {post.full_picture && (
                <div className="aspect-video w-full overflow-hidden">
                  <img 
                    src={post.full_picture} 
                    alt="منشور فيسبوك" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = '/COVER.jpg'; // Fallback image
                    }}
                  />
                </div>
              )}
              
              <div className="p-6 space-y-4">
                {post.isFallback && (
                  <div className="flex items-center space-x-2 space-x-reverse mb-3">
                    <div className="w-2 h-2 bg-heritage-gold rounded-full"></div>
                    <span className="text-sm text-heritage-gold modern-font font-medium">
                      محتوى ترويجي
                    </span>
                  </div>
                )}
                
                {post.message && (
                  <p className="text-[var(--tent-black)] arabic-body leading-relaxed">
                    {truncateMessage(post.message)}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-sm text-[var(--desert-brown)]">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Calendar size={14} />
                    <span className="modern-font">{formatDate(post.created_time)}</span>
                  </div>
                  <div className="flex items-center space-x-1 space-x-reverse">
                    <Facebook size={14} className="text-[#1877f2]" />
                    <span className="text-xs">فيسبوك</span>
                  </div>
                </div>
                
                <a
                  href={post.permalink_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-full bg-gradient-to-r from-[#1877f2] to-[#166fe5] hover:from-[#166fe5] hover:to-[#1565c0] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md modern-font group"
                >
                  <span>عرض على فيسبوك</span>
                  <ExternalLink size={16} className="mr-2 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-12"
        >
          <div className="bg-gradient-to-r from-heritage-gold/10 to-heritage-gold/5 rounded-2xl p-8 border border-heritage-gold/20">
            <div className="flex items-center justify-center mb-4">
              <Users className="text-heritage-gold mr-3" size={28} />
              <h3 className="text-2xl font-bold arabic-title text-[var(--tent-black)]">
                انضم إلى مجتمعنا
              </h3>
            </div>
            <p className="text-[var(--deep-brown)] arabic-body mb-6 max-w-xl mx-auto">
              تابع صفحتنا الرسمية للحصول على آخر الأخبار والتحديثات اليومية
            </p>
            <a
              href={`https://www.facebook.com/${PAGE_ID}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 bg-[#1877f2] hover:bg-[#166fe5] text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg modern-font"
            >
              <Facebook size={20} className="ml-3" />
              زيارة صفحتنا على فيسبوك
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SocialMediaSection;
