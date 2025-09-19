import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Newspaper, Camera, Radio, Tv, Video, Upload } from 'lucide-react';

// Import all the form components
import NewsForm from '@/components/admin/NewsForm';
import ArticleForm from '@/components/admin/ArticleForm';
import CoverageForm from '@/components/admin/CoverageForm';
import PodcastForm from '@/components/admin/PodcastForm';
import ProgramForm from '@/components/admin/ProgramForm';
import MediaForm from '@/components/admin/MediaForm';

const ContentUploadPage = () => {
  const [activeTab, setActiveTab] = useState('news');

  const contentTypes = [
    {
      id: 'news',
      label: 'خبر جديد',
      icon: Newspaper,
      description: 'إضافة خبر جديد مع الصور والتفاصيل',
      component: NewsForm
    },
    {
      id: 'article',
      label: 'مقال جديد',
      icon: FileText,
      description: 'كتابة مقال تفصيلي أو تحليلي',
      component: ArticleForm
    },
    {
      id: 'coverage',
      label: 'تغطية جديدة',
      icon: Camera,
      description: 'تغطية لحدث أو مناسبة خاصة',
      component: CoverageForm
    },
    {
      id: 'podcast',
      label: 'بودكاست جديد',
      icon: Radio,
      description: 'رفع حلقة بودكاست صوتية',
      component: PodcastForm
    },
    {
      id: 'program',
      label: 'برنامج جديد',
      icon: Tv,
      description: 'إضافة حلقة برنامج تلفزيوني',
      component: ProgramForm
    },
    {
      id: 'media',
      label: 'وسائط جديدة',
      icon: Video,
      description: 'رفع فيديو أو ملف صوتي',
      component: MediaForm
    }
  ];

  const handleFormSuccess = () => {
    // Could add some global success handling here
    console.log('Content uploaded successfully');
  };

  const handleFormCancel = () => {
    // Could add some global cancel handling here
    console.log('Upload cancelled');
  };

  return (
    <>
      <Helmet>
        <title>رفع المحتوى - الحسانية</title>
      </Helmet>
      
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold arabic-title text-[var(--tent-black)] mb-4">
            رفع المحتوى
          </h1>
          <p className="text-lg text-[var(--deep-brown)] arabic-body">
            اختر نوع المحتوى الذي تريد رفعه وإضافته للمنصة
          </p>
        </div>

        {/* Content Type Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {contentTypes.map((type) => {
            const IconComponent = type.icon;
            return (
              <Card 
                key={type.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${
                  activeTab === type.id 
                    ? 'border-[var(--heritage-gold)] bg-[var(--heritage-gold)]/10' 
                    : 'border-[var(--sand-dark)] hover:border-[var(--heritage-gold)]/50'
                }`}
                onClick={() => setActiveTab(type.id)}
              >
                <CardHeader className="text-center pb-2">
                  <div className="flex justify-center mb-3">
                    <div className={`p-3 rounded-full ${
                      activeTab === type.id 
                        ? 'bg-[var(--heritage-gold)] text-[var(--tent-black)]' 
                        : 'bg-[var(--sand-medium)] text-[var(--deep-brown)]'
                    }`}>
                      <IconComponent size={24} />
                    </div>
                  </div>
                  <CardTitle className="text-lg arabic-title">{type.label}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-[var(--deep-brown)] arabic-body text-center">
                    {type.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Content Form */}
        <Card className="heritage-card">
          <CardHeader>
            <CardTitle className="arabic-title text-2xl flex items-center gap-3">
              {(() => {
                const activeType = contentTypes.find(t => t.id === activeTab);
                const IconComponent = activeType?.icon || Upload;
                return (
                  <>
                    <IconComponent size={28} />
                    {activeType?.label || 'رفع محتوى'}
                  </>
                );
              })()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="hidden">
                {contentTypes.map((type) => (
                  <TabsTrigger key={type.id} value={type.id}>
                    {type.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {contentTypes.map((type) => {
                const FormComponent = type.component;
                return (
                  <TabsContent key={type.id} value={type.id} className="mt-0">
                    <FormComponent
                      onSuccess={handleFormSuccess}
                      onCancel={handleFormCancel}
                    />
                  </TabsContent>
                );
              })}
            </Tabs>
          </CardContent>
        </Card>

        {/* Quick Tips */}
        <Card className="bg-[var(--sand-light)] border-[var(--sand-dark)]">
          <CardHeader>
            <CardTitle className="arabic-title text-lg">نصائح مهمة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm arabic-body">
              <div className="space-y-2">
                <h4 className="font-semibold text-[var(--tent-black)]">✅ نصائح عامة:</h4>
                <ul className="space-y-1 text-[var(--deep-brown)]">
                  <li>• اكتب عناوين واضحة وجذابة</li>
                  <li>• أضف وصفاً مختصراً ومفيداً</li>
                  <li>• اختر الفئة المناسبة للمحتوى</li>
                  <li>• تأكد من صحة المعلومات قبل النشر</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-[var(--tent-black)]">📁 نصائح للملفات:</h4>
                <ul className="space-y-1 text-[var(--deep-brown)]">
                  <li>• استخدم صور عالية الجودة (JPG, PNG)</li>
                  <li>• حجم الفيديو يفضل أن يكون أقل من 500MB</li>
                  <li>• تأكد من وضوح الصوت في الملفات الصوتية</li>
                  <li>• اختر أسماء ملفات وصفية</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ContentUploadPage;
