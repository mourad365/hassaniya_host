
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import FacebookFeed from '@/components/FacebookFeed';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { getBunnyImageUrl } from '@/utils/bunnyImageUtils';

const NewsPage = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(null);
  const PAGE_SIZE = 12;
  const sentinelRef = useRef(null);
  const observerRef = useRef(null);

  const fetchPage = useCallback(async (targetPage = 0) => {
    try {
      const isFirstPage = targetPage === 0;
      if (isFirstPage) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const from = targetPage * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      // On first load, fetch total count of published news
      if (isFirstPage) {
        // Check total count regardless of status
        const { count: totalCount, error: totalCountError } = await supabase
          .from('news')
          .select('*', { count: 'exact', head: true });
        
        // Check published count
        const { count, error: countError } = await supabase
          .from('news')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'published');
        
        if (totalCountError || countError) {
          console.warn('Failed to get news count:', totalCountError || countError);
        } else {
          console.log('📊 Database stats:');
          console.log(`  Total news items: ${totalCount ?? 0}`);
          console.log(`  Published news items: ${count ?? 0}`);
          setTotalCount(count ?? 0);
        }

        // Also check what statuses exist
        const { data: statusCheck } = await supabase
          .from('news')
          .select('id, title, status')
          .order('created_at', { ascending: false });
        
        if (statusCheck) {
          console.log('📝 News items by status:');
          const statusGroups = statusCheck.reduce((acc, item) => {
            const status = item.status || 'null';
            if (!acc[status]) acc[status] = [];
            acc[status].push(item);
            return acc;
          }, {});
          
          Object.entries(statusGroups).forEach(([status, items]) => {
            console.log(`  ${status}: ${items.length} items`);
          });
        }
      }

      const { data, error } = await supabase
        .from('news')
        .select(`
          *,
          categories (
            name,
            slug
          )
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      console.log(`Fetched news data (page ${targetPage}) from ${from} to ${to}:`, data);

      const items = data || [];
      setNews((prev) => (isFirstPage ? items : [...prev, ...items]));
      // Determine if there are potentially more items
      if (totalCount != null) {
        const currentTotal = (isFirstPage ? items.length : (news.length + items.length));
        setHasMore(currentTotal < totalCount);
      } else {
        setHasMore(items.length === PAGE_SIZE);
      }
      setPage(targetPage);
    } catch (err) {
      console.error('خطأ في تحميل الأخبار:', err);
      setError(err.message);
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [PAGE_SIZE, totalCount, news.length]);

  useEffect(() => {
    fetchPage(0);
  }, [fetchPage]);

  // Infinite scroll using IntersectionObserver
  useEffect(() => {
    if (!sentinelRef.current) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && !loading && !loadingMore && hasMore) {
          fetchPage(page + 1);
        }
      },
      { root: null, rootMargin: '200px', threshold: 0 }
    );

    observerRef.current.observe(sentinelRef.current);

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [loading, loadingMore, hasMore, page, fetchPage]);

  // If content doesn't fill the viewport, load more immediately
  useEffect(() => {
    if (!loading && !loadingMore && hasMore) {
      const notEnoughContent = document.body.offsetHeight <= window.innerHeight + 100;
      if (notEnoughContent) {
        fetchPage(page + 1);
      }
    }
  }, [loading, loadingMore, hasMore, page, fetchPage]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <Helmet>
        <title>الأخبار - الحسانية</title>
        <meta name="description" content="آخر الأخبار والمستجدات من منصة الحسانية" />
        <meta property="og:title" content="الأخبار - الحسانية" />
        <meta property="og:description" content="تابع آخر الأخبار والتحديثات من منصة الحسانية" />
      </Helmet>

      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          {/* News Section */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-[var(--tent-black)] mb-4 arabic-title">
                آخر الأخبار
              </h1>
              <p className="text-lg text-[var(--deep-brown)] arabic-body">
                تابع آخر المستجدات والأحداث المهمة
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--heritage-gold)] mb-4"></div>
                <p className="text-[var(--deep-brown)] text-lg modern-font">جاري التحميل...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center shadow-sm">
                <h3 className="text-xl font-semibold text-red-800 mb-2 modern-font">
                  فشل في تحميل الأخبار
                </h3>
                <p className="text-red-600">{error}</p>
              </div>
            ) : news.length === 0 ? (
              <div className="bg-[var(--sand-light)] border border-[var(--sand-dark)] rounded-xl p-8 text-center shadow-sm">
                <h3 className="text-xl font-semibold text-[var(--tent-black)] mb-2 modern-font">
                  لا توجد أخبار
                </h3>
                <p className="text-[var(--deep-brown)]">لا توجد أخبار منشورة في الوقت الحالي</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {news.map((item) => (
                  <article key={item.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-[var(--sand-dark)] group">
                    {item.image_url && item.image_url.trim() !== '' && (
                      <div className="aspect-video w-full overflow-hidden">
                        <img 
                          src={getBunnyImageUrl(item.image_url)} 
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            console.log('NewsPage - Image failed to load:', {
                              original: item.image_url,
                              bunnyUrl: getBunnyImageUrl(item.image_url)
                            });
                            e.target.style.display = 'none';
                            e.target.parentElement.style.display = 'none';
                          }}
                          onLoad={() => {
                            console.log('NewsPage - Image loaded successfully:', {
                              original: item.image_url,
                              bunnyUrl: getBunnyImageUrl(item.image_url)
                            });
                          }}
                        />
                      </div>
                    )}
                    
                    <div className="p-6">
                      {item.categories && (
                        <span className="inline-block bg-[var(--heritage-gold)] text-[var(--tent-black)] px-3 py-1 rounded-full text-sm font-medium mb-3 modern-font">
                          {item.categories.name}
                        </span>
                      )}
                      
                      <h2 className="text-xl font-bold text-[var(--tent-black)] mb-3 arabic-title line-clamp-2 group-hover:text-[var(--desert-brown)] transition-colors">
                        {item.title}
                      </h2>
                      
                      <p className="text-[var(--deep-brown)] text-sm leading-relaxed mb-4 arabic-body line-clamp-3">
                        {item.excerpt}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-[var(--desert-brown)] mb-4">
                        <div className="flex items-center space-x-1 space-x-reverse">
                          <Calendar size={14} />
                          <span>{formatDate(item.created_at)}</span>
                        </div>
                        {item.location && (
                          <div className="flex items-center space-x-1 space-x-reverse">
                            <MapPin size={14} />
                            <span>{item.location}</span>
                          </div>
                        )}
                      </div>
                      
                      <Link
                        to={`/news/${item.page_slug || item.id}`}
                        className="inline-block w-full text-center bg-gradient-to-r from-[var(--heritage-gold)] to-[var(--desert-brown)] hover:from-[var(--desert-brown)] hover:to-[var(--heritage-gold)] text-[var(--tent-black)] font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md modern-font"
                      >
                        قراءة المزيد
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
            {/* Load more indicator / fallback button */}
            {news.length > 0 && (
              <div className="flex items-center justify-center mt-8">
                {loadingMore && (
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--heritage-gold)]"></div>
                  </div>
                )}
                {!loadingMore && hasMore && (
                  <button
                    onClick={() => fetchPage(page + 1)}
                    className="px-6 py-2 bg-[var(--heritage-gold)] text-[var(--tent-black)] rounded-lg shadow hover:shadow-md transition modern-font"
                  >
                    عرض المزيد
                  </button>
                )}
              </div>
            )}
            {/* Sentinel for IntersectionObserver */}
            <div ref={sentinelRef} className="h-1 w-full"></div>
          </div>

          {/* Facebook Feed Section */}
          <div className="mt-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[var(--tent-black)] mb-4 arabic-title">
                منشورات فيسبوك
              </h2>
              <p className="text-lg text-[var(--deep-brown)] arabic-body">
                تابعونا أيضاً على صفحتنا الرسمية في فيسبوك
              </p>
            </div>
            <FacebookFeed showHeader={false} maxPosts={6} />
          </div>
        </div>
      </div>
    </>
  );
};

export default NewsPage;
