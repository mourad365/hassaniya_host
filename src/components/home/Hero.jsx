
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/use-language';

const Hero = () => {
  const { t } = useLanguage();
  const bgImage = "/COVER.jpg";

  return (
    <section 
      className="relative py-28 md:py-36 lg:py-52 overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-heritage-black/70 via-heritage-black/60 to-heritage-black/50"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-heritage-gold/20 via-transparent to-transparent"></div>
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-5xl mx-auto"
        >
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold arabic-title text-white mb-8 drop-shadow-2xl">
            {t('heroTitle')}
          </h1>
          <p className="text-xl md:text-3xl arabic-body text-sand-100 mb-12 leading-relaxed drop-shadow-lg">
            {t('heroSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/news">
              <Button className="btn-heritage px-10 py-4 text-xl modern-font shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300">
                {t('latestNews')}
              </Button>
            </Link>
            <Link to="/culture">
              <Button className="btn-oasis px-10 py-4 text-xl modern-font shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300">
                {t('exploreHeritage')}
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
