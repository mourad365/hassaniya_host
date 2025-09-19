import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '@/hooks/use-language';
import FacebookFeed from '@/components/FacebookFeed';
import '../components/FacebookFeed.css';

const FacebookPage = () => {
  const { t } = useLanguage();

  return (
    <>
      <Helmet>
        <title>{t('siteName')} - Facebook Feed</title>
        <meta name="description" content="Follow our latest updates and posts on Facebook" />
        <meta property="og:title" content={`${t('siteName')} - Facebook Feed`} />
        <meta property="og:description" content="Follow our latest updates and posts on Facebook" />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-sand-50 to-sand-100">
        <div className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-heritage-black mb-4 modern-font">
              {t('followUsOnFacebook') || 'Follow Us on Facebook'}
            </h1>
            <p className="text-lg text-heritage-brown max-w-2xl mx-auto leading-relaxed">
              {t('facebookDescription') || 'Stay connected with our latest news, updates, and community discussions on our official Facebook page.'}
            </p>
          </div>

          {/* Facebook Feed Component */}
          <FacebookFeed 
            pageUrl="https://www.facebook.com/101470072189930"
            pageId="101470072189930"
          />

          {/* Call to Action Section */}
          <div className="text-center mt-12">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto border border-sand-200">
              <h2 className="text-2xl font-bold text-heritage-black mb-4 modern-font">
                {t('joinOurCommunity') || 'Join Our Community'}
              </h2>
              <p className="text-heritage-brown mb-6">
                {t('facebookCTA') || 'Like our page and be the first to know about our latest content, events, and cultural discussions.'}
              </p>
              <a
                href="https://www.facebook.com/101470072189930"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-[#1877f2] hover:bg-[#166fe5] text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                {t('visitFacebookPage') || 'Visit Facebook Page'}
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FacebookPage;
