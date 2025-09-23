
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/use-language';
import { Heart, Users, BookOpen } from 'lucide-react';

const ContributeHeritage = () => {
  const { t } = useLanguage();

  const contributionFeatures = [
    {
      icon: BookOpen,
      title: 'شارك معارفك',
      description: 'ساهم بمقالاتك وأبحاثك حول الثقافة الحسانية'
    },
    {
      icon: Users,
      title: 'انضم للمجتمع',
      description: 'كن جزءاً من مجتمع المهتمين بالتراث الحساني'
    },
    {
      icon: BookOpen,
      title: 'تعلم وشارك',
      description: 'ساهم في التعلم ومشاركة الثقافة الحسانية'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-heritage-gold/5 via-white to-sand-light/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center mb-6">
            <Heart className="text-heritage-gold mr-3" size={32} />
            <h2 className="text-3xl md:text-4xl font-bold arabic-title text-[var(--tent-black)]">
              ساهم في إثراء التراث
            </h2>
          </div>
          <p className="text-lg md:text-xl arabic-body leading-relaxed text-[var(--deep-brown)] max-w-3xl mx-auto">
            انضم إلينا في رحلة الحفاظ على التراث الحساني ونشره للأجيال القادمة. مساهمتك تساعد في إثراء المحتوى وتوثيق الثقافة الحسانية الأصيلة.
          </p>
          <div className="w-24 h-1 bg-[var(--heritage-gold)] mx-auto mt-6"></div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {contributionFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-sand-200"
            >
              <div className="w-16 h-16 bg-heritage-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <feature.icon className="text-heritage-gold" size={28} />
              </div>
              <h3 className="text-xl font-bold arabic-title text-[var(--tent-black)] mb-3">
                {feature.title}
              </h3>
              <p className="text-[var(--deep-brown)] arabic-body leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-heritage-gold/10 to-heritage-gold/5 rounded-2xl p-8 border border-heritage-gold/20 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold arabic-title text-[var(--tent-black)] mb-4">
              ابدأ مساهمتك اليوم
            </h3>
            <p className="text-[var(--deep-brown)] arabic-body mb-6 leading-relaxed">
              لديك قصة، مقال، أو معلومة تريد مشاركتها؟ تواصل معنا وساعدنا في بناء أكبر مكتبة رقمية للتراث الحساني.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <Button className="bg-heritage-gold hover:bg-heritage-gold/90 text-heritage-black font-semibold px-8 py-3 text-lg modern-font shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                  تواصل معنا
                </Button>
              </Link>
              <Link to="/admin">
                <Button className="bg-white hover:bg-sand-light text-heritage-black border-2 border-heritage-gold font-semibold px-8 py-3 text-lg modern-font shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                  منطقة الإدارة
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ContributeHeritage;
