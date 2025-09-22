
import React from 'react';
import { Helmet } from 'react-helmet-async';
import Hero from '@/components/home/Hero';
import FeaturedNews from '@/components/home/FeaturedNews';
import LatestNewsAndCulture from '@/components/home/LatestNewsAndCulture';
import Literature from '@/components/home/Literature';
import CallToAction from '@/components/home/CallToAction';
import Programs from '@/components/home/Programs';
import ContributeHeritage from '@/components/home/ContributeHeritage';
import SocialMediaSection from '@/components/home/SocialMediaSection';

const HomePage = () => {
  return (
    <>
      <Helmet>
        <title>الحسانية - الصفحة الرئيسية</title>
        <meta name="description" content="الصفحة الرئيسية لمنصة الحسانية - آخر الأخبار والمقالات حول الثقافة والتراث الحساني" />
        <meta property="og:title" content="الحسانية - الصفحة الرئيسية" />
        <meta property="og:description" content="الصفحة الرئيسية لمنصة الحسانية - آخر الأخبار والمقالات حول الثقافة والتراث الحساني" />
      </Helmet>

      <div className="min-h-screen">
        <Hero />
        <FeaturedNews />
        <Programs />
        <LatestNewsAndCulture />
        <SocialMediaSection />
        <Literature />
        <ContributeHeritage />
        <CallToAction />
      </div>
    </>
  );
};

export default HomePage;

