import React from 'react';
import { useLanguage } from '@/hooks/use-language';

const Logo = ({ 
  variant = 'white', // 'white' or 'color'
  size = 'md', // 'sm', 'md', 'lg'
  className = '' 
}) => {
  const { t } = useLanguage();
  
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-16',
    xl: 'h-24',
    '2xl': 'h-32',
    '3xl': 'h-40'
  };
  
  return (
    <img
      src={`${import.meta.env.BASE_URL}LOGO.png`}
      alt={t('siteName') || 'الحسانية'}
      className={`${sizeClasses[size]} w-auto object-contain ${className}`}
      onError={(e) => {
        console.error('Logo failed:', e.target.src);
        e.target.src = `${import.meta.env.BASE_URL}WHAITE LOGO.png`;
        e.target.onerror = () => {
          console.error('Both logos failed');
          e.target.style.display = 'none';
        };
      }}
      onLoad={() => console.log('Logo loaded successfully')}
    />
  );
};

export default Logo;
