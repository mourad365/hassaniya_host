
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/use-language';
import { MessageCircle, PenTool, ArrowRight } from 'lucide-react';

const CallToAction = () => {
    const { t } = useLanguage();
    
    const bgImage = "/COVER.jpg";
    
    return (
        <section 
          className="py-20 bg-cover bg-center bg-fixed relative"
          style={{ backgroundImage: `url(${bgImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-heritage-black/80 via-heritage-black/70 to-heritage-black/80"></div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto"
            >
              <h2 className="text-3xl md:text-5xl font-bold arabic-title mb-6 text-white drop-shadow-2xl">
                انضم إلى مجتمع الحسانية
              </h2>
              <p className="text-xl md:text-2xl arabic-body mb-12 leading-relaxed text-sand-100 drop-shadow-lg">
                كن جزءاً من رحلة الحفاظ على التراث الحساني ونشر الثقافة الأصيلة للعالم
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
                >
                  <MessageCircle className="text-heritage-gold mx-auto mb-4" size={40} />
                  <h3 className="text-xl font-bold text-white mb-3 arabic-title">تواصل معنا</h3>
                  <p className="text-sand-100 arabic-body mb-4">
                    لديك استفسار أو اقتراح؟ نحن هنا للاستماع إليك
                  </p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
                >
                  <PenTool className="text-heritage-gold mx-auto mb-4" size={40} />
                  <h3 className="text-xl font-bold text-white mb-3 arabic-title">شارك مقالك</h3>
                  <p className="text-sand-100 arabic-body mb-4">
                    ساهم في إثراء المحتوى بمقالاتك وأبحاثك القيمة
                  </p>
                </motion.div>
              </div>
              
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-6 justify-center"
              >
                <Link to="/contact">
                  <Button className="bg-heritage-gold hover:bg-heritage-gold/90 text-heritage-black font-bold px-10 py-4 text-lg modern-font shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 group">
                    <MessageCircle size={20} className="ml-3 group-hover:rotate-12 transition-transform" />
                    تواصل معنا
                    <ArrowRight size={20} className="mr-3 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/opinion">
                  <Button className="bg-white/20 hover:bg-white/30 text-white border-2 border-white/50 hover:border-white font-bold px-10 py-4 text-lg modern-font shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 backdrop-blur-sm group">
                    <PenTool size={20} className="ml-3 group-hover:rotate-12 transition-transform" />
                    شارك مقالك
                    <ArrowRight size={20} className="mr-3 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>
    );
};

export default CallToAction;
