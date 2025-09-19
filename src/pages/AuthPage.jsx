import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Mail, Key, User, LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { useLanguage } from '@/hooks/use-language';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleAuthAction = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (!error) {
        toast({
          title: `✅ ${t('signInTitle')}`,
          description: t('signInSuccess'),
        });
        navigate('/admin');
      }
    } else {
      const { error } = await signUp(email, password);
      if (!error) {
        toast({
          title: `🎉 ${t('newAccount')}`,
          description: t('signUpSuccess'),
        });
        setIsLogin(true);
      }
    }
    setLoading(false);
  };

  return (
    <>
      <Helmet>
        <title>{isLogin ? t('signInTitle') : t('signUpTitle')} - {t('siteName')}</title>
        <meta name="description" content={isLogin ? t('signInPageDescription') : t('signUpPageDescription')} />
      </Helmet>
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="heritage-card">
            <div className="text-center mb-8">
              <img 
                src="https://horizons-cdn.hostinger.com/42d86645-ea33-4a6a-819e-609c46588941/b0205980cf3889256b96a7fd5a795ccf.png" 
                alt="شعار الحسانية" 
                className="h-20 w-auto mx-auto mb-4"
              />
              <h1 className="text-3xl font-bold arabic-title text-[var(--tent-black)]">
                {isLogin ? t('signInTitle') : t('createNewAccount')}
              </h1>
              <p className="text-[var(--deep-brown)] arabic-body mt-2">
                {isLogin ? t('welcomeBack') : t('joinCommunity')}
              </p>
            </div>
            
            <form onSubmit={handleAuthAction} className="space-y-6">
              <div className="relative">
                <Mail className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[var(--desert-brown)]" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('emailPlaceholder')}
                  required
                  className="w-full px-4 py-3 pr-12 rounded-lg border border-[var(--sand-dark)] bg-white/80 focus:outline-none focus:ring-2 focus:ring-[var(--heritage-gold)] arabic-body"
                />
              </div>
              <div className="relative">
                <Key className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[var(--desert-brown)]" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('passwordPlaceholder')}
                  required
                  className="w-full px-4 py-3 pr-12 rounded-lg border border-[var(--sand-dark)] bg-white/80 focus:outline-none focus:ring-2 focus:ring-[var(--heritage-gold)] arabic-body"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full btn-heritage modern-font text-lg flex items-center justify-center space-x-2 space-x-reverse">
                {loading ? t('pleaseWait') : (isLogin ? <><LogIn size={18} /><span>{t('enter')}</span></> : <><UserPlus size={18} /><span>{t('createAccount')}</span></>)}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-[var(--desert-brown)] hover:text-[var(--heritage-gold)] hover:underline modern-font transition-colors"
              >
                {isLogin ? t('noAccount') : t('hasAccount')}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default AuthPage;