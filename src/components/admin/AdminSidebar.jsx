
import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Newspaper, LogOut, Home, Video, Radio, Tv, Camera, FileText, Upload, PlayCircle, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from '@/components/ui/use-toast';

const AdminSidebar = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "✅ تسجيل الخروج",
      description: "تم تسجيل خروجك بنجاح.",
    });
    navigate('/');
  };

  const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'لوحة التحكم' },
    { to: '/admin/articles', icon: FileText, label: 'إدارة المقالات' },
    { to: '/admin/news', icon: Newspaper, label: 'إدارة الأخبار' },
    { to: '/admin/coverage', icon: Camera, label: 'إدارة التغطيات' },
    { to: '/admin/podcasts', icon: Radio, label: 'إدارة البودكاست' },
    { to: '/admin/programs', icon: Tv, label: 'إدارة البرامج' },
    { to: '/admin/media', icon: Video, label: 'إدارة الوسائط' },
    { to: '/admin/videos', icon: PlayCircle, label: 'إدارة الفيديوهات' },
    { to: '/admin/contacts', icon: MessageSquare, label: 'الرسائل والاتصال' },
    { to: '/admin/upload', icon: Upload, label: 'رفع المحتوى' },
  ];

  return (
    <aside className="w-full lg:w-64 bg-sand-light text-[var(--tent-black)] p-4 lg:p-6 flex flex-col gap-2 border-b lg:border-b-0 lg:border-l border-[var(--sand-dark)]">
      <div>
        <Link to="/" className="flex items-center space-x-3 space-x-reverse mb-6 lg:mb-10">
          <img 
            src="https://horizons-cdn.hostinger.com/42d86645-ea33-4a6a-819e-609c46588941/b0205980cf3889256b96a7fd5a795ccf.png" 
            alt="شعار الحسانية" 
            className="h-8 lg:h-10 w-auto"
          />
          <div>
            <h2 className="text-lg lg:text-xl font-bold arabic-title">إدارة الحسانية</h2>
          </div>
        </Link>
        <nav>
          <ul className="grid grid-cols-2 lg:grid-cols-1 gap-2 lg:gap-0">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/admin'}
                  className={({ isActive }) =>
                    `flex items-center space-x-2 lg:space-x-3 space-x-reverse p-2 lg:p-3 my-1 lg:my-2 rounded-lg transition-colors modern-font text-sm lg:text-base ${
                      isActive
                        ? 'bg-[var(--heritage-gold)] text-[var(--tent-black)]'
                        : 'hover:bg-[var(--sand-medium)]'
                    }`
                  }
                >
                  <item.icon size={18} className="lg:size-5" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 lg:gap-0 mt-4 pt-2 lg:mt-6 lg:pt-3 border-t border-[var(--sand-dark)]">
        <Link to="/" className="flex items-center space-x-2 lg:space-x-3 space-x-reverse p-2 lg:p-3 my-1 lg:my-2 rounded-lg hover:bg-[var(--sand-medium)] transition-colors modern-font text-sm lg:text-base">
          <Home size={18} className="lg:size-5" />
          <span className="truncate">العودة للموقع</span>
        </Link>
        <Button
          onClick={handleSignOut}
          variant="ghost"
          className="w-full justify-start flex items-center space-x-2 lg:space-x-3 space-x-reverse p-2 lg:p-3 text-red-600 hover:bg-red-100 hover:text-red-700 modern-font text-sm lg:text-base"
        >
          <LogOut size={18} className="lg:size-5" />
          <span className="truncate">تسجيل الخروج</span>
        </Button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
