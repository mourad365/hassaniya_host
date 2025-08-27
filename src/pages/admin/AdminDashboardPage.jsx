
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Newspaper, Users, BarChart } from 'lucide-react';

const AdminDashboardPage = () => {
  const { user } = useAuth();

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
              <Newspaper className="h-4 w-4 text-[var(--desert-brown)]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold modern-font">1,234</div>
              <p className="text-xs text-[var(--desert-brown)] modern-font">
                +20.1% من الشهر الماضي
              </p>
            </CardContent>
          </Card>
          <Card className="heritage-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium modern-font">المستخدمون</CardTitle>
              <Users className="h-4 w-4 text-[var(--desert-brown)]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold modern-font">+2350</div>
              <p className="text-xs text-[var(--desert-brown)] modern-font">
                +180.1% من الشهر الماضي
              </p>
            </CardContent>
          </Card>
          <Card className="heritage-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium modern-font">المشاهدات هذا الشهر</CardTitle>
              <BarChart className="h-4 w-4 text-[var(--desert-brown)]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold modern-font">+12,234</div>
              <p className="text-xs text-[var(--desert-brown)] modern-font">
                +19% من الشهر الماضي
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="text-center mt-8">
            <p className="text-gray-500 modern-font">🚧 هذه البيانات هي مجرد مثال. سيتم ربطها بالبيانات الحقيقية قريباً!</p>
        </div>
      </div>
    </>
  );
};

export default AdminDashboardPage;
