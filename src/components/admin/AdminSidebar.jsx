
import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Newspaper, LogOut, Home, Video } from 'lucide-react';
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
    { to: '/admin/articles', icon: Newspaper, label: 'إدارة المقالات' },
    { to: '/admin/media', icon: Video, label: 'إدارة الوسائط' },
  ];

  return (
    <aside className="w-64 bg-sand-light text-[var(--tent-black)] p-6 flex flex-col justify-between border-l border-[var(--sand-dark)]">
      <div>
        <Link to="/" className="flex items-center space-x-3 space-x-reverse mb-10">
          <img 
            src="https://horizons-cdn.hostinger.com/42d86645-ea33-4a6a-819e-609c46588941/b0205980cf3889256b96a7fd5a795ccf.png" 
            alt="شعار الحسانية" 
            className="h-10 w-auto"
          />
          <div>
            <h2 className="text-xl font-bold arabic-title">إدارة الحسانية</h2>
          </div>
        </Link>
        <nav>
          <ul>
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/admin'}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 space-x-reverse p-3 my-2 rounded-lg transition-colors modern-font ${
                      isActive
                        ? 'bg-[var(--heritage-gold)] text-white'
                        : 'hover:bg-[var(--sand-medium)]'
                    }`
                  }
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div>
        <Link to="/" className="flex items-center space-x-3 space-x-reverse p-3 my-2 rounded-lg hover:bg-[var(--sand-medium)] transition-colors modern-font">
          <Home size={20} />
          <span>العودة للموقع</span>
        </Link>
        <Button
          onClick={handleSignOut}
          variant="ghost"
          className="w-full justify-start flex items-center space-x-3 space-x-reverse p-3 text-red-600 hover:bg-red-100 hover:text-red-700 modern-font"
        >
          <LogOut size={20} />
          <span>تسجيل الخروج</span>
        </Button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
