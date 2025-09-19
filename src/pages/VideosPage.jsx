import React from 'react';
import { Helmet } from 'react-helmet-async';
import VideoLibrary from '@/components/VideoLibrary';

const VideosPage = () => {
  return (
    <>
      <Helmet>
        <title>مكتبة الفيديو - الحسانية</title>
        <meta name="description" content="مكتبة شاملة للفيديوهات التراثية والثقافية الحسانية" />
        <meta property="og:title" content="مكتبة الفيديو - الحسانية" />
        <meta property="og:description" content="شاهد مجموعة من الفيديوهات التراثية والثقافية الحسانية" />
      </Helmet>

      <div className="min-h-screen">
        <VideoLibrary />
      </div>
    </>
  );
};

export default VideosPage;
