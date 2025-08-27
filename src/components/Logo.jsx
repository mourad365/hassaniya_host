import React from 'react';
import { useLanguage } from '@/hooks/use-language';

const Logo = ({ 
  variant = 'white', // 'white' or 'color'
  size = 'md', // 'sm', 'md', 'lg'
  className = '' 
}) => {
  const { t } = useLanguage();
  
  const sizeClasses = {
    sm: 'h-8 w-auto',
    md: 'h-12 w-auto',
    lg: 'h-16 w-auto'
  };
  
  const logoSrc = variant === 'white' ? '/WHAITE LOGO.png' : '/LOGO.png';
  
  return (
    <img
      src={logoSrc}
      alt={t('siteName') || 'الحسانية'}
      className={`object-contain ${sizeClasses[size]} ${className}`}
    />
  );
};

export default Logo;
