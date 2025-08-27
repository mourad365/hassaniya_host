
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import './i18n';
import HomePage from '@/pages/HomePage';
import NewsPage from '@/pages/NewsPage';
import CulturePage from '@/pages/CulturePage';
import PoliticsPage from '@/pages/PoliticsPage';
import ProgramsPage from '@/pages/ProgramsPage';
import LiteraturePage from '@/pages/LiteraturePage';
import EmiratesPage from '@/pages/EmiratesPage';
import MediaPage from '@/pages/MediaPage';
import OpinionPage from '@/pages/OpinionPage';
import ContactPage from '@/pages/ContactPage.jsx';
import AuthPage from '@/pages/AuthPage';
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import ArticleManagementPage from '@/pages/admin/ArticleManagementPage';
import MediaManagementPage from '@/pages/admin/MediaManagementPage';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';

function App() {
  const { t } = useTranslation();
  
  return (
    <HelmetProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="min-h-screen bg-sand-light">
        <Helmet>
          <title>{t('siteName')} - {t('siteDescription')}</title>
          <meta name="description" content={t('siteDescription')} />
          <meta property="og:title" content={`${t('siteName')} - ${t('siteDescription')}`} />
          <meta property="og:description" content={t('siteDescription')} />
          <meta property="og:type" content="website" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        </Helmet>
        
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          
          <Route path="/admin/*" element={
            <ProtectedRoute>
              <AdminLayout>
                <Routes>
                  <Route path="/" element={<AdminDashboardPage />} />
                  <Route path="/articles" element={<ArticleManagementPage />} />
                  <Route path="/media" element={<MediaManagementPage />} />
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          } />

          <Route path="/*" element={
            <>
              <Header />
              <main className="min-h-screen">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/news" element={<NewsPage />} />
                  <Route path="/culture" element={<CulturePage />} />
                  <Route path="/politics" element={<PoliticsPage />} />
                  <Route path="/programs" element={<ProgramsPage />} />
                  <Route path="/literature" element={<LiteraturePage />} />
                  <Route path="/emirates" element={<EmiratesPage />} />
                  <Route path="/media" element={<MediaPage />} />
                  <Route path="/opinion" element={<OpinionPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                </Routes>
              </main>
              <Footer />
            </>
          } />
        </Routes>
        
        <Toaster />
        </div>
      </Router>
    </HelmetProvider>
  );
}

export default App;
