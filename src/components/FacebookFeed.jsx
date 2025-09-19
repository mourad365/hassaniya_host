import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from '@/hooks/use-language';

const FacebookFeed = ({ 
  pageUrl = "https://www.facebook.com/101470072189930",
  pageId = "101470072189930",
  showHeader = true,
  maxPosts = 6,
  enableInfiniteScroll = false
}) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef(null);
  const observerRef = useRef(null);
  const { t, isRTL } = useLanguage();

  // Facebook Page Access Token from environment variables
  const PAGE_ACCESS_TOKEN = import.meta.env.VITE_FACEBOOK_PAGE_ACCESS_TOKEN;

  const fetchFacebookPosts = useCallback(async (isLoadMore = false, afterToken = null) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      
      // Build URL with pagination support
      let url = `https://graph.facebook.com/v19.0/${pageId}/posts?fields=id,message,created_time,full_picture,permalink_url&access_token=${PAGE_ACCESS_TOKEN}&limit=${maxPosts}`;
      
      if (afterToken) {
        url += `&after=${afterToken}`;
      }
      
      console.log('Fetching Facebook posts:', { isLoadMore, afterToken, url: url.replace(PAGE_ACCESS_TOKEN, 'TOKEN_HIDDEN') });
        
      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to fetch Facebook posts');
      }

      const data = await response.json();
      const newPosts = data.data || [];
      
      console.log('Fetched Facebook posts:', { count: newPosts.length, hasNextPage: !!data.paging?.next });
      
      if (isLoadMore) {
        setPosts(prev => [...prev, ...newPosts]);
      } else {
        setPosts(newPosts);
      }
      
      // Handle pagination regardless of infinite scroll setting
      if (data.paging?.cursors?.after) {
        setNextPageToken(data.paging.cursors.after);
        setHasMore(true);
      } else {
        setNextPageToken(null);
        setHasMore(false);
      }
      
    } catch (err) {
      console.error('Error fetching Facebook posts:', err);
      setError(err.message);
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [pageId, PAGE_ACCESS_TOKEN, maxPosts, enableInfiniteScroll]);

  useEffect(() => {
    // Only fetch if we have a non-empty token
    if (typeof PAGE_ACCESS_TOKEN === 'string' && PAGE_ACCESS_TOKEN.trim().length > 0) {
      fetchFacebookPosts(false, null);
    } else {
      setLoading(false);
      setError('Facebook API credentials not configured');
    }
  }, [fetchFacebookPosts]);

  // Infinite scroll using IntersectionObserver
  useEffect(() => {
    if (!enableInfiniteScroll || !sentinelRef.current) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && !loading && !loadingMore && hasMore && nextPageToken) {
          fetchFacebookPosts(true, nextPageToken);
        }
      },
      { root: null, rootMargin: '200px', threshold: 0 }
    );

    observerRef.current.observe(sentinelRef.current);

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [enableInfiniteScroll, loading, loadingMore, hasMore, nextPageToken, fetchFacebookPosts]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-heritage-gold mb-4"></div>
          <p className="text-heritage-brown text-lg modern-font">
            {t('loading') || 'جاري التحميل...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center shadow-sm">
          <h3 className="text-xl font-semibold text-red-800 mb-2 modern-font">
            {t('failedToLoadPosts') || 'فشل في تحميل المنشورات'}
          </h3>
          <p className="text-red-600 mb-4">{error}</p>
          <p className="text-sm text-red-500">
            {t('checkFacebookToken') || 'تأكد من صحة رمز الوصول لصفحة فيسبوك'}
          </p>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <div className="bg-sand-50 border border-sand-200 rounded-xl p-6 text-center shadow-sm">
          <h3 className="text-xl font-semibold text-heritage-black mb-2 modern-font">
            {t('noPostsFound') || 'لا توجد منشورات'}
          </h3>
          <p className="text-heritage-brown">
            {t('noPostsAvailable') || 'لا توجد منشورات متاحة في الوقت الحالي'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {showHeader && (
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-heritage-black mb-3 modern-font">
            {t('latestFacebookPosts') || 'آخر منشورات فيسبوك'}
          </h2>
          <p className="text-heritage-brown text-lg">
            {t('followLatestUpdates') || 'تابع آخر الأخبار والتحديثات على صفحتنا الرسمية'}
          </p>
        </div>
      )}
      
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-sand-200 group">
            {post.full_picture && (
              <div className="aspect-video w-full overflow-hidden">
                <img 
                  src={post.full_picture} 
                  alt={t('facebookPost') || 'منشور فيسبوك'} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            
            <div className="p-5 space-y-4">
              {post.message && (
                <p className={`text-heritage-black text-sm leading-relaxed line-clamp-4 modern-font ${isRTL ? 'text-right' : 'text-left'}`}>
                  {post.message}
                </p>
              )}
              
              <div className={`flex items-center justify-between text-xs text-heritage-brown ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="bg-sand-100 px-2 py-1 rounded-full">
                  {formatDate(post.created_time)}
                </span>
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4 text-[#1877f2]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
              </div>
              
              <a
                href={post.permalink_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-full text-center bg-gradient-to-r from-[#1877f2] to-[#166fe5] hover:from-[#166fe5] hover:to-[#1565c0] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md modern-font"
              >
                {t('viewOnFacebook') || 'عرض على فيسبوك'}
              </a>
            </div>
          </div>
        ))}
      </div>
      
      {/* Load more indicator / fallback button for infinite scroll */}
      {posts.length > 0 && (
        <div className="flex items-center justify-center mt-8">
          {loadingMore && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#1877f2]"></div>
              <p className="text-sm text-heritage-brown mt-2">جاري تحميل المزيد من المنشورات...</p>
            </div>
          )}
          {!loadingMore && hasMore && nextPageToken && (
            <button
              onClick={() => fetchFacebookPosts(true, nextPageToken)}
              className="px-6 py-2 bg-[#1877f2] text-white rounded-lg shadow hover:shadow-md transition modern-font"
            >
              عرض المزيد من المنشورات
            </button>
          )}
        </div>
      )}
      
      {/* Sentinel for IntersectionObserver */}
      {enableInfiniteScroll && <div ref={sentinelRef} className="h-1 w-full"></div>}
      
      {showHeader && (
        <div className="text-center mt-8">
          <a
            href={pageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 bg-heritage-gold hover:bg-heritage-gold/90 text-heritage-black font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg modern-font"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            {t('visitOurPage') || 'زيارة صفحتنا'}
          </a>
        </div>
      )}
    </div>
  );
};

export default FacebookFeed;
