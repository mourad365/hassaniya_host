import React from 'react';
import { Helmet } from 'react-helmet-async';
import VideoLibrary from '@/components/VideoLibrary';
import { useLanguage } from '@/hooks/use-language';

const VideoPage = () => {
  const { t } = useLanguage();

  return (
    <>
      <Helmet>
        <title>{t('videos')} - {t('siteName')}</title>
        <meta name="description" content="مكتبة الفيديوهات التراثية والثقافية الحسانية" />
        <meta property="og:title" content={`${t('videos')} - ${t('siteName')}`} />
        <meta property="og:description" content="مكتبة الفيديوهات التراثية والثقافية الحسانية" />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <VideoLibrary />
    </>
  );
};

export default VideoPage;
