
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
import NewsDetailPage from '@/pages/NewsDetailPage';
import CulturePage from '@/pages/CulturePage';
import PoliticsPage from '@/pages/PoliticsPage';
import ProgramsPage from '@/pages/ProgramsPage';
import ProgramDetailPage from '@/pages/ProgramDetailPage';
import LiteraturePage from '@/pages/LiteraturePage';
import EmiratesPage from '@/pages/EmiratesPage';
import MediaPage from '@/pages/MediaPage';
import OpinionPage from '@/pages/OpinionPage';
import ContactPage from '@/pages/ContactPage.jsx';
import FacebookPage from '@/pages/FacebookPage';
import VideoPage from '@/pages/VideoPage';
import VideosPage from '@/pages/VideosPage';
import AuthPage from '@/pages/AuthPage';
import ArticleDetailPage from '@/pages/ArticleDetailPage';
import PodcastDetailPage from '@/pages/PodcastDetailPage';
import CoverageDetailPage from '@/pages/CoverageDetailPage';
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import ArticleManagementPage from '@/pages/admin/ArticleManagementPage';
import NewsManagementPage from '@/pages/admin/NewsManagementPage';
import CoverageManagementPage from '@/pages/admin/CoverageManagementPage';
import PodcastManagementPage from '@/pages/admin/PodcastManagementPage';
import ProgramManagementPage from '@/pages/admin/ProgramManagementPage';
import MediaManagementPage from '@/pages/admin/MediaManagementPage';
import VideoManagementPage from '@/pages/admin/VideoManagementPage';
import ContentUploadPage from '@/pages/admin/ContentUploadPage';
import ContactsPage from '@/pages/admin/ContactsPage';
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
                  <Route path="/news" element={<NewsManagementPage />} />
                  <Route path="/coverage" element={<CoverageManagementPage />} />
                  <Route path="/podcasts" element={<PodcastManagementPage />} />
                  <Route path="/programs" element={<ProgramManagementPage />} />
                  <Route path="/media" element={<MediaManagementPage />} />
                  <Route path="/videos" element={<VideoManagementPage />} />
                  <Route path="/contacts" element={<ContactsPage />} />
                  <Route path="/upload" element={<ContentUploadPage />} />
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
                  <Route path="/news/:slug" element={<NewsDetailPage />} />
                  <Route path="/articles/:slug" element={<ArticleDetailPage />} />
                  <Route path="/programs/:slug" element={<ProgramDetailPage />} />
                  <Route path="/podcasts/:slug" element={<PodcastDetailPage />} />
                  <Route path="/coverage/:slug" element={<CoverageDetailPage />} />
                  <Route path="/culture" element={<CulturePage />} />
                  <Route path="/politics" element={<PoliticsPage />} />
                  <Route path="/programs" element={<ProgramsPage />} />
                  <Route path="/literature" element={<LiteraturePage />} />
                  <Route path="/emirates" element={<EmiratesPage />} />
                  <Route path="/media" element={<MediaPage />} />
                  <Route path="/videos" element={<VideosPage />} />
                  <Route path="/opinion" element={<OpinionPage />} />
                  <Route path="/facebook" element={<FacebookPage />} />
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
