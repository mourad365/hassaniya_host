
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import Logo from '@/components/Logo';

const Footer = () => {
  const { t } = useTranslation();
  
  const handleSocialClick = (platform) => {
    toast({
      title: t('socialMedia'),
      description: t('featureNotImplemented'),
      duration: 3000,
    });
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    toast({
      title: t('newsletter'),
      description: t('featureNotImplemented'),
      duration: 3000,
    });
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
              <Logo variant="white" size="sm" />
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
                { icon: Facebook, name: 'فيسبوك' },
                { icon: Twitter, name: 'تويتر' },
                { icon: Instagram, name: 'إنستغرام' },
                { icon: Youtube, name: 'يوتيوب' }
              ].map(({ icon: Icon, name }) => (
                <motion.button
                  key={name}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleSocialClick(t(name.toLowerCase()))}
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
            
            {/* Newsletter */}
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <p className="text-black text-sm arabic-body">
                {t('subscribeNewsletter')}
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  className="flex-1 px-3 py-2 bg-white text-black rounded-r-lg border border-[var(--desert-brown)] focus:outline-none focus:ring-2 focus:ring-[var(--heritage-gold)] arabic-body"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-black text-white rounded-l-lg hover:bg-black transition-colors"
                >
                  <Mail size={18} />
                </button>
              </div>
            </form>

            {/* Contact Info */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2 space-x-reverse text-black">
                <Mail size={16} />
                <span className="modern-font">info@hassaniya.com</span>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse text-black">
                <Phone size={16} />
                <span className="modern-font">+971 XX XXX XXXX</span>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse text-black">
                <MapPin size={16} />
                <span className="arabic-body">{t('uae')}</span>
              </div>
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
