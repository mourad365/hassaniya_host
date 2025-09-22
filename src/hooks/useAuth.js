/**
 * Enhanced authentication hook with security features
 */
import { useContext } from 'react';
import { AuthContext } from '@/contexts/SupabaseAuthContext';
import { SECURITY_CONFIG } from '@/utils/config';

/**
 * Enhanced authentication hook with additional security features
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  const { user, profile, session, loading, signUp, signIn, signOut } = context;
  
  /**
   * Check if user has admin privileges
   */
  const isAdmin = () => {
    return profile?.role === 'admin' || profile?.is_admin === true;
  };
  
  /**
   * Check if user has specific permission
   */
  const hasPermission = (permission) => {
    if (!profile) return false;
    if (isAdmin()) return true;
    
    return profile.permissions?.includes(permission) || false;
  };
  
  /**
   * Check if user can access admin routes
   */
  const canAccessAdmin = () => {
    return isAdmin() && user?.email_confirmed_at;
  };
  
  /**
   * Check if session is still valid
   */
  const isSessionValid = () => {
    if (!session) return false;
    
    const expiresAt = new Date(session.expires_at * 1000);
    const now = new Date();
    const timeUntilExpiry = expiresAt.getTime() - now.getTime();
    
    return timeUntilExpiry > 0;
  };
  
  /**
   * Check if session is about to expire (within 5 minutes)
   */
  const isSessionExpiringSoon = () => {
    if (!session) return false;
    
    const expiresAt = new Date(session.expires_at * 1000);
    const now = new Date();
    const timeUntilExpiry = expiresAt.getTime() - now.getTime();
    const fiveMinutes = 5 * 60 * 1000;
    
    return timeUntilExpiry > 0 && timeUntilExpiry < fiveMinutes;
  };
  
  /**
   * Get user display name
   */
  const getDisplayName = () => {
    if (profile?.full_name) return profile.full_name;
    if (profile?.username) return profile.username;
    if (user?.email) return user.email.split('@')[0];
    return 'مستخدم';
  };
  
  /**
   * Get user avatar URL
   */
  const getAvatarUrl = () => {
    return profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(getDisplayName())}&background=D4AF37&color=1a1a1a&size=128`;
  };
  
  /**
   * Enhanced sign in with rate limiting check
   */
  const secureSignIn = async (email, password) => {
    // This would ideally be implemented with proper backend rate limiting
    // For now, we'll add basic client-side validation
    if (!email || !password) {
      return { error: { message: 'البريد الإلكتروني وكلمة المرور مطلوبان' } };
    }
    
    if (password.length < 6) {
      return { error: { message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' } };
    }
    
    return await signIn(email, password);
  };
  
  /**
   * Enhanced sign up with validation
   */
  const secureSignUp = async (email, password, userData = {}) => {
    // Validate input
    if (!email || !password) {
      return { error: { message: 'البريد الإلكتروني وكلمة المرور مطلوبان' } };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { error: { message: 'البريد الإلكتروني غير صحيح' } };
    }
    
    if (password.length < 8) {
      return { error: { message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' } };
    }
    
    // Check password strength
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (!hasUppercase || !hasLowercase || !hasNumbers) {
      return { 
        error: { 
          message: 'كلمة المرور يجب أن تحتوي على أحرف كبيرة وصغيرة وأرقام' 
        } 
      };
    }
    
    return await signUp(email, password, {
      options: {
        data: userData
      }
    });
  };
  
  return {
    // Original context values
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    
    // Enhanced methods
    isAdmin,
    hasPermission,
    canAccessAdmin,
    isSessionValid,
    isSessionExpiringSoon,
    getDisplayName,
    getAvatarUrl,
    secureSignIn,
    secureSignUp
  };
};
