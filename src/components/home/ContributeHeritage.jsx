
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/use-language';

const ContributeHeritage = () => {
  const { t } = useLanguage();

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold arabic-title mb-4 text-black">
            {t('contributeToHeritage')}
          </h2>
          <p className="text-lg md:text-xl arabic-body mb-8 leading-relaxed text-black">
            {t('contributeToHeritageDescription')}
          </p>
          <div className="flex justify-center">
            <Link to="/contact">
              <Button className="bg-white text-black hover:bg-[var(--sand-light)] px-8 py-3 text-lg modern-font border border-[var(--sand-dark)]">
                {t('shareYourContent')}
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContributeHeritage;
