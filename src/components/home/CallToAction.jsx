
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/use-language';

const CallToAction = () => {
    const { t } = useLanguage();
    
    return (
        <section className="py-20 heritage-gradient">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto"
            >
              <h2 className="text-3xl md:text-4xl font-bold arabic-title mb-6 text-black">
                {t('joinHassaniyaCommunity')}
              </h2>
              <p className="text-xl arabic-body mb-8 leading-relaxed text-black">
                {t('joinCommunityDescription')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/contact">
                  <Button variant="outline" className="bg-white text-black hover:bg-[var(--sand-light)] px-8 py-3 text-lg modern-font border-2 border-transparent hover:border-transparent">
                    {t('contactUs')}
                  </Button>
                </Link>
                <Link to="/opinion">
                  <Button variant="outline" className="bg-white text-black hover:bg-[var(--sand-light)] px-8 py-3 text-lg modern-font border-2 border-transparent hover:border-transparent">
                    {t('shareYourArticle')}
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
    );
};

export default CallToAction;
