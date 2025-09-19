
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Newspaper, Users, BarChart, Video, Radio, Camera, FileText, MessageSquare } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    articles: 0,
    news: 0,
    podcasts: 0,
    programs: 0,
    coverage: 0,
    media: 0,
    contacts: 0,
    newContacts: 0,
    loading: true
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [articlesResult, newsResult, podcastsResult, programsResult, coverageResult, mediaResult, contactsResult, newContactsResult] = await Promise.all([
          supabase.from('articles').select('id', { count: 'exact', head: true }),
          supabase.from('news').select('id', { count: 'exact', head: true }),
          supabase.from('podcasts').select('id', { count: 'exact', head: true }),
          supabase.from('programs').select('id', { count: 'exact', head: true }),
          supabase.from('coverage').select('id', { count: 'exact', head: true }),
          supabase.from('media').select('id', { count: 'exact', head: true }),
          supabase.from('contacts').select('id', { count: 'exact', head: true }),
          supabase.from('contacts').select('id', { count: 'exact', head: true }).eq('status', 'new')
        ]);

        setStats({
          articles: articlesResult.count || 0,
          news: newsResult.count || 0,
          podcasts: podcastsResult.count || 0,
          programs: programsResult.count || 0,
          coverage: coverageResult.count || 0,
          media: mediaResult.count || 0,
          contacts: contactsResult.count || 0,
          newContacts: newContactsResult.count || 0,
          loading: false
        });
      } catch (error) {
        console.error('خطأ في تحميل الإحصائيات:', error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, []);

  return (
    <>
      <Helmet>
        <title>لوحة التحكم - الحسانية</title>
      </Helmet>
      <div className="space-y-8">
        <h1 className="text-4xl font-bold arabic-title text-[var(--tent-black)]">
          مرحباً بك في لوحة التحكم، {user?.email?.split('@')[0] || 'أيها المدير'}!
        </h1>
        <p className="text-lg text-[var(--deep-brown)] arabic-body">
          هنا يمكنك إدارة محتوى منصة الحسانية بكل سهولة.
        </p>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="heritage-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium modern-font">إجمالي المقالات</CardTitle>
              <FileText className="h-4 w-4 text-[var(--desert-brown)]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold modern-font">
                {stats.loading ? '...' : stats.articles}
              </div>
              <p className="text-xs text-[var(--desert-brown)] modern-font">
                مقالات منشورة
              </p>
            </CardContent>
          </Card>
          <Card className="heritage-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium modern-font">الأخبار</CardTitle>
              <Newspaper className="h-4 w-4 text-[var(--desert-brown)]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold modern-font">
                {stats.loading ? '...' : stats.news}
              </div>
              <p className="text-xs text-[var(--desert-brown)] modern-font">
                أخبار منشورة
              </p>
            </CardContent>
          </Card>
          <Card className="heritage-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium modern-font">البودكاست</CardTitle>
              <Radio className="h-4 w-4 text-[var(--desert-brown)]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold modern-font">
                {stats.loading ? '...' : stats.podcasts}
              </div>
              <p className="text-xs text-[var(--desert-brown)] modern-font">
                حلقات بودكاست
              </p>
            </CardContent>
          </Card>
          <Card className="heritage-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium modern-font">البرامج</CardTitle>
              <Video className="h-4 w-4 text-[var(--desert-brown)]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold modern-font">
                {stats.loading ? '...' : stats.programs}
              </div>
              <p className="text-xs text-[var(--desert-brown)] modern-font">
                برامج منتجة
              </p>
            </CardContent>
          </Card>
          <Card className="heritage-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium modern-font">التغطيات</CardTitle>
              <Camera className="h-4 w-4 text-[var(--desert-brown)]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold modern-font">
                {stats.loading ? '...' : stats.coverage}
              </div>
              <p className="text-xs text-[var(--desert-brown)] modern-font">
                تغطيات إعلامية
              </p>
            </CardContent>
          </Card>
          <Card className="heritage-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium modern-font">الوسائط</CardTitle>
              <BarChart className="h-4 w-4 text-[var(--desert-brown)]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold modern-font">
                {stats.loading ? '...' : stats.media}
              </div>
              <p className="text-xs text-[var(--desert-brown)] modern-font">
                ملفات وسائط
              </p>
            </CardContent>
          </Card>
          <Card className="heritage-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium modern-font">الرسائل الجديدة</CardTitle>
              <MessageSquare className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold modern-font text-blue-600">
                {stats.loading ? '...' : stats.newContacts}
              </div>
              <p className="text-xs text-[var(--desert-brown)] modern-font">
                رسائل غير مقروءة
              </p>
            </CardContent>
          </Card>
          <Card className="heritage-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium modern-font">إجمالي الرسائل</CardTitle>
              <Users className="h-4 w-4 text-[var(--desert-brown)]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold modern-font">
                {stats.loading ? '...' : stats.contacts}
              </div>
              <p className="text-xs text-[var(--desert-brown)] modern-font">
                رسائل الزوار
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default AdminDashboardPage;
