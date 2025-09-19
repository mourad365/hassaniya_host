import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/use-language';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import Logo from '@/components/Logo';

const Header = () => {
  const { t, changeLanguage, currentLanguage, isRTL } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const navigationItems = [
    { path: '/', slug: 'home', label: t('home') },
    { path: '/news', slug: 'news', label: t('breakingNews') },
    { path: '/culture', slug: 'culture', label: t('cultureAndHeritage') },
    { path: '/politics', slug: 'politics', label: t('politicsAndHistory') },
    { path: '/literature', slug: 'literature', label: t('literature') },
    { path: '/emirates', slug: 'emirates', label: t('emiratesHistory') },
    { path: '/programs', slug: 'programs', label: t('programs') },
    { path: '/media', slug: 'media', label: t('media') },
    { path: '/opinion', slug: 'opinion', label: t('opinionArticles') },
   // { path: '/facebook', slug: 'facebook', label: t('facebook') || 'Facebook' },
    { path: '/contact', slug: 'contact', label: t('contactUs') }
  ];

  const handleLanguageToggle = () => {
    const newLang = currentLanguage === 'ar' ? 'fr' : 'ar';
    changeLanguage(newLang);
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const isActiveRoute = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-sand-50/95 backdrop-blur-md border-b border-sand-300 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
            <Logo variant="color" size="lg" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className={`flex items-center space-x-6 ${isRTL ? 'space-x-reverse' : ''}`}>
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  data-testid={`nav-link-${item.slug}`}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 modern-font ${
                    isActiveRoute(item.path)
                      ? 'text-heritage-black bg-heritage-gold shadow-md transform scale-105'
                      : 'text-heritage-brown hover:text-heritage-black hover:bg-sand-200'
                  }`}
                >
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className={`flex items-center space-x-3 ${isRTL ? 'space-x-reverse' : ''}`}>
            {/* Search Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-heritage-brown hover:text-heritage-black hover:bg-sand-200 rounded-xl p-3"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Language Toggle */}
            <Button
              onClick={handleLanguageToggle}
              variant="outline"
              size="sm"
              className="text-sm border-sand-400 hover:border-heritage-gold hover:bg-heritage-gold hover:text-heritage-black rounded-xl px-4 py-2 font-medium transition-all duration-300"
            >
              {currentLanguage === 'ar' ? 'FR' : 'ع'}
            </Button>

            {/* Auth Links (Desktop) */}
            {!user ? (
              <Link to="/auth" className="hidden md:block">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-heritage-brown hover:text-heritage-black hover:bg-sand-200 rounded-xl px-4 py-2 modern-font"
                >
                  {t('signIn')}
                </Button>
              </Link>
            ) : (
              <Link to="/admin" className="hidden md:block">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-heritage-brown hover:text-heritage-black hover:bg-sand-200 rounded-xl px-4 py-2 modern-font"
                >
                  {t('admin')}
                </Button>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              onClick={handleMobileMenuToggle}
              variant="ghost"
              size="sm"
              className="md:hidden text-heritage-brown hover:text-heritage-black hover:bg-sand-200 rounded-xl p-3"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-sand-100/95 backdrop-blur-sm border-t border-sand-300 rounded-b-2xl shadow-lg mobile-menu-enter">
            <div className="px-4 py-4 space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  data-testid={`mobile-nav-link-${item.slug}`}
                  onClick={closeMobileMenu}
                  className={`block px-4 py-3 text-base font-medium rounded-xl transition-all duration-300 modern-font ${
                    isActiveRoute(item.path)
                      ? 'text-heritage-black bg-heritage-gold shadow-md'
                      : 'text-heritage-brown hover:text-heritage-black hover:bg-sand-200'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              {/* Auth Link (Mobile) */}
              {!user ? (
                <Link
                  to="/auth"
                  onClick={closeMobileMenu}
                  className="block px-4 py-3 text-base font-medium text-heritage-brown hover:text-heritage-black hover:bg-sand-200 rounded-xl transition-all duration-300 modern-font"
                >
                  {t('signIn')}
                </Link>
              ) : (
                <Link
                  to="/admin"
                  onClick={closeMobileMenu}
                  className="block px-4 py-3 text-base font-medium text-heritage-brown hover:text-heritage-black hover:bg-sand-200 rounded-xl transition-all duration-300 modern-font"
                >
                  {t('admin')}
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Header;