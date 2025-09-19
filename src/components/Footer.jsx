
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { newsletterService } from '@/services/interactionService';

const Footer = () => {
  const { t } = useTranslation();
  
  const [email, setEmail] = useState('');

  const socialUrls = {
    facebook: import.meta.env.VITE_SOCIAL_FACEBOOK_URL,
    twitter: import.meta.env.VITE_SOCIAL_TWITTER_URL,
    instagram: import.meta.env.VITE_SOCIAL_INSTAGRAM_URL,
    youtube: import.meta.env.VITE_SOCIAL_YOUTUBE_URL,
  };

  const handleSocialClick = (platform) => {
    const url = socialUrls[platform];
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      toast({
        title: t('socialMedia'),
        description: t('featureNotImplemented'),
        duration: 3000,
      });
    }
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        variant: 'destructive',
        title: t('newsletter'),
        description: t('invalidEmail') || 'يرجى إدخال بريد إلكتروني صالح',
      });
      return;
    }
    try {
      await newsletterService.subscribe(email);
      toast({ title: t('newsletter'), description: t('subscribed') || 'تم الاشتراك بنجاح' });
      setEmail('');
    } catch (err) {
      toast({
        variant: 'destructive',
        title: t('newsletter'),
        description: err?.message || t('subscriptionFailed') || 'فشل الاشتراك',
      });
    }
  };

  const quickLinks = [
    { path: '/', label: t('home') },
    { path: '/news', label: t('breakingNews') },
    { path: '/culture', label: t('cultureAndHeritage') },
    { path: '/politics', label: t('politicsAndHistory') },
    { path: '/literature', label: t('literature') },
    { path: '/contact', label: t('contactUs') }
  ];

  const categories = [
    { path: '/emirates', label: t('emiratesHistory') },
    { path: '/media', label: t('media') },
    { path: '/opinion', label: t('opinionArticles') },
  ];

  return (
    <footer className="bg-white text-black mt-16">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 space-x-reverse">
              <img
                src="/WHAITE LOGO.png"
                alt="شعار الحسانية"
                className="h-10 w-auto object-contain"
              />
              <div>
                <span className="text-xl font-bold arabic-title">{t('siteName')}</span>
                <p className="text-sm text-black modern-font">HASSANIYA</p>
              </div>
            </div>
            <p className="text-black arabic-body leading-relaxed">
              {t('siteDescription')}
            </p>
            
            {/* Social Media */}
            <div className="flex space-x-4 space-x-reverse">
              {[
                { icon: Facebook, key: 'facebook', name: 'فيسبوك' },
                { icon: Twitter, key: 'twitter', name: 'تويتر' },
                { icon: Instagram, key: 'instagram', name: 'إنستغرام' },
                { icon: Youtube, key: 'youtube', name: 'يوتيوب' }
              ].map(({ icon: Icon, key, name }) => (
                <motion.button
                  key={key}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleSocialClick(key)}
                  className="w-10 h-10 bg-[var(--heritage-gold)] rounded-full flex items-center justify-center text-white hover:bg-[var(--desert-brown)] transition-colors"
                >
                  <Icon size={18} />
                </motion.button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <span className="text-lg font-semibold arabic-title text-black">
              {t('quickLinks')}
            </span>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-black hover:text-black transition-colors modern-font block py-1"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <span className="text-lg font-semibold arabic-title text-black">
              {t('categories')}
            </span>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.path}>
                  <Link
                    to={category.path}
                    className="text-black hover:text-black transition-colors modern-font block py-1"
                  >
                    {category.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter & Contact */}
          <div className="space-y-4">
            <span className="text-lg font-semibold arabic-title text-black">
              {t('stayConnected')}
            </span>
            
          
            {/* Contact Info */}
           
              <div className="flex items-center space-x-2 space-x-reverse text-black">
            
              </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[var(--deep-brown)] mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-black text-sm arabic-body">
              {t('copyright')}
            </p>
            <div className="flex space-x-6 space-x-reverse text-sm">
              <Link to="/privacy" className="text-black hover:text-black transition-colors modern-font">
                {t('privacyPolicy')}
              </Link>
              <Link to="/terms" className="text-black hover:text-black transition-colors modern-font">
                {t('termsOfUse')}
              </Link>
              <Link to="/sitemap" className="text-black hover:text-black transition-colors modern-font">
                {t('sitemap')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
