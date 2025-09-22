import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2, Shield, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const ProtectedRoute = ({ 
  children, 
  requireAdmin = true, 
  requiredPermission = null,
  fallbackPath = '/auth' 
}) => {
  const { 
    user, 
    loading, 
    isAdmin, 
    hasPermission, 
    canAccessAdmin,
    isSessionValid,
    isSessionExpiringSoon,
    signOut
  } = useAuth();
  
  const location = useLocation();
  const { toast } = useToast();
  const [sessionWarningShown, setSessionWarningShown] = useState(false);

  // Check session expiry
  useEffect(() => {
    if (user && isSessionExpiringSoon() && !sessionWarningShown) {
      setSessionWarningShown(true);
      toast({
        title: "تنبيه انتهاء الجلسة",
        description: "ستنتهي جلستك قريباً. يرجى حفظ عملك.",
        variant: "destructive",
      });
    }
  }, [user, isSessionExpiringSoon, sessionWarningShown, toast]);

  // Show loading spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sand-light">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin text-[var(--heritage-gold)] mx-auto mb-4" />
          <p className="text-gray-600 arabic-body">جاري التحقق من الصلاحيات...</p>
        </div>
      </div>
    );
  }

  // Check if user is logged in
  if (!user) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Check if session is valid
  if (!isSessionValid()) {
    // Auto sign out invalid sessions
    signOut();
    return <Navigate to={fallbackPath} state={{ from: location, expired: true }} replace />;
  }

  // Check admin access for admin routes
  if (requireAdmin && !canAccessAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sand-light p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 arabic-title mb-2">
            وصول غير مسموح
          </h2>
          <p className="text-gray-600 arabic-body mb-6">
            ليس لديك صلاحية للوصول إلى لوحة الإدارة
          </p>
          <div className="space-y-3">
            <Button 
              onClick={() => window.history.back()}
              className="w-full"
              variant="outline"
            >
              العودة للخلف
            </Button>
            <Button 
              onClick={signOut}
              className="w-full"
              variant="destructive"
            >
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Check specific permission if required
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sand-light p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 arabic-title mb-2">
            صلاحية مطلوبة
          </h2>
          <p className="text-gray-600 arabic-body mb-6">
            تحتاج إلى صلاحية خاصة للوصول إلى هذه الصفحة
          </p>
          <Button 
            onClick={() => window.history.back()}
            className="w-full"
          >
            العودة للخلف
          </Button>
        </div>
      </div>
    );
  }

  // Email confirmation check for admin users
  if (requireAdmin && !user.email_confirmed_at) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sand-light p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <AlertTriangle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 arabic-title mb-2">
            تأكيد البريد الإلكتروني مطلوب
          </h2>
          <p className="text-gray-600 arabic-body mb-6">
            يرجى تأكيد بريدك الإلكتروني للوصول إلى لوحة الإدارة
          </p>
          <Button 
            onClick={signOut}
            className="w-full"
            variant="outline"
          >
            تسجيل الخروج
          </Button>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;