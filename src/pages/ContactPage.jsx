import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Mail, Phone, MapPin, User, FileText, MessageSquare, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useLanguage } from '@/hooks/use-language';

const ContactPage = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.subject && formData.message) {
      setLoading(true);
      const { error } = await supabase.from('contacts').insert([
        { 
          name: formData.name, 
          email: formData.email,
          subject: formData.subject,
          message: formData.message
        }
      ]);
      setLoading(false);

      if (error) {
        toast({
          title: "خطأ في الإرسال",
          description: "حدث خطأ أثناء إرسال رسالتك. يرجى المحاولة مرة أخرى.",
          variant: "destructive",
          duration: 3000,
        });
      } else {
        toast({
          title: "تم الإرسال بنجاح",
          description: "شكراً لك! تم إرسال رسالتك بنجاح. سنتواصل معك قريباً.",
          duration: 5000,
        });
        setFormData({ name: '', email: '', subject: '', message: '' });
      }
    } else {
      toast({
        title: "حقول مطلوبة",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "البريد الإلكتروني",
      value: "Haroudeahmed@gmail.com",
      description: "للاستفسارات العامة والتواصل",
      ltr: true
    },
    {
      icon: Phone,
      title: "الهاتف",
      value: "+222 36329095",
      description: "للتواصل المباشر",
      ltr: true
    },
    {
      icon: MapPin,
      title: "العنوان",
      value: "نواكشوط، موريتانيا",
      description: "المقر الرئيسي"
    }
  ];

  return (
    <>
      <Helmet>
        <title>تواصل معنا - الحسانية</title>
        <meta name="description" content="تواصل مع فريق الحسانية للاستفسارات والاقتراحات" />
        <meta property="og:title" content="تواصل معنا - الحسانية" />
        <meta property="og:description" content="تواصل مع فريق الحسانية للاستفسارات والاقتراحات" />
      </Helmet>

      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold arabic-title text-[var(--tent-black)] mb-4">تواصل معنا</h1>
            <p className="text-xl arabic-body text-[var(--deep-brown)] max-w-3xl mx-auto">
              نحن هنا للاستماع إليك. تواصل معنا لأي استفسارات أو اقتراحات أو شراكات
            </p>
            <div className="w-24 h-1 bg-[var(--heritage-gold)] mx-auto mt-6"></div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="heritage-card"
            >
              <h2 className="text-2xl font-bold arabic-title text-[var(--tent-black)] mb-8">أرسل لنا رسالة</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                  <User className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[var(--desert-brown)]" size={20} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="الاسم الكامل"
                    required
                    className="w-full px-4 py-3 pr-12 rounded-lg border border-[var(--sand-dark)] bg-white/80 focus:outline-none focus:ring-2 focus:ring-[var(--heritage-gold)] arabic-body"
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[var(--desert-brown)]" size={20} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="البريد الإلكتروني"
                    required
                    className="w-full px-4 py-3 pr-12 rounded-lg border border-[var(--sand-dark)] bg-white/80 focus:outline-none focus:ring-2 focus:ring-[var(--heritage-gold)] arabic-body"
                  />
                </div>
                <div className="relative">
                  <FileText className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[var(--desert-brown)]" size={20} />
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="الموضوع"
                    required
                    className="w-full px-4 py-3 pr-12 rounded-lg border border-[var(--sand-dark)] bg-white/80 focus:outline-none focus:ring-2 focus:ring-[var(--heritage-gold)] arabic-body"
                  />
                </div>
                <div className="relative">
                  <MessageSquare className="absolute right-4 top-4 text-[var(--desert-brown)]" size={20} />
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="رسالتك"
                    rows="6"
                    required
                    className="w-full px-4 py-3 pr-12 rounded-lg border border-[var(--sand-dark)] bg-white/80 focus:outline-none focus:ring-2 focus:ring-[var(--heritage-gold)] arabic-body"
                  ></textarea>
                </div>
                <Button type="submit" disabled={loading} className="w-full btn-heritage modern-font text-lg flex items-center justify-center space-x-2 space-x-reverse">
                  <Send size={18} />
                  <span>{loading ? 'جاري الإرسال...' : 'إرسال الرسالة'}</span>
                </Button>
              </form>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-8"
            >
              {contactInfo.map((info, index) => {
                const IconComponent = info.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                    className="heritage-card hover-lift flex items-start space-x-4 space-x-reverse"
                  >
                    <div className="bg-[var(--heritage-gold)] text-white p-4 rounded-full">
                      <IconComponent size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold arabic-title text-[var(--tent-black)] mb-2">
                        {info.title}
                      </h3>
                      <p className="text-lg text-[var(--deep-brown)] modern-font mb-2" dir={info.ltr ? 'ltr' : undefined}>{info.value}</p>
                      <p className="text-sm text-[var(--desert-brown)] arabic-body">{info.description}</p>
                    </div>
                  </motion.div>
                );
              })}
              
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactPage;