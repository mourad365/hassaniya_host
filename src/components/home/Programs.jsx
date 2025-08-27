
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';
import { PlayCircle, Mic } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useLanguage } from '@/hooks/use-language';

const ProgramCard = ({ program, index, t }) => {
  const handleProgramClick = (title) => {
    toast({
      title: `🎧 ${title}`,
      description: t('featureNotImplemented'),
      duration: 3000,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative group overflow-hidden rounded-xl shadow-lg cursor-pointer"
      onClick={() => handleProgramClick(program.title)}
    >
      <img 
        className="w-full h-64 object-cover transform group-hover:scale-110 transition-transform duration-500 ease-in-out"
        alt={program.title}
        src={program.file_url} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
      <div className="absolute inset-0 flex flex-col justify-end p-6">
        <div className="flex items-center space-x-2 space-x-reverse mb-2">
          <div className="bg-[var(--heritage-gold)] p-1.5 rounded-full">
            <Mic size={16} className="text-white" />
          </div>
          <span className="text-sm font-semibold text-[var(--heritage-gold)] modern-font">{program.media_type}</span>
        </div>
        <h3 className="text-2xl font-bold text-white arabic-title mb-2">{program.title}</h3>
        <p className="text-sand-light arabic-body text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 max-h-0 group-hover:max-h-20">
          {program.description}
        </p>
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all duration-300">
        <PlayCircle size={40} className="text-white" />
      </div>
    </motion.div>
  );
};

const Programs = () => {
  const [programs, setPrograms] = useState([]);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const { data: media, error } = await supabase
          .from('media')
          .select('*')
          .eq('is_featured', true)
          .order('publish_date', { ascending: false })
          .limit(4);

        if (error) {
          console.error('Error fetching programs:', error);
          return;
        }

        setPrograms(media || []);
      } catch (error) {
        console.error('Error fetching programs:', error);
      }
    };

    fetchPrograms();
  }, []);

  const bgImage = "/COVER.jpg";

  return (
    <section 
        className="py-20 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-deep-brown/80"></div>
      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold arabic-title text-white mb-4">
            {t('programsAndPodcasts')}
          </h2>
          <div className="w-24 h-1 bg-[var(--heritage-gold)] mx-auto"></div>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {programs.map((program, index) => (
            <ProgramCard key={index} program={program} index={index} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Programs;
