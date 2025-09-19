import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

const BulkNewsStatusUpdater = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchAllNews();
  }, []);

  const fetchAllNews = async () => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('id, title, status, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNews(data || []);
    } catch (err) {
      console.error('Error fetching news:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      setUpdating(true);
      const { error } = await supabase
        .from('news')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setNews(prev => prev.map(item => 
        item.id === id ? { ...item, status: newStatus } : item
      ));
    } catch (err) {
      console.error('Error updating status:', err);
      alert('فشل في تحديث الحالة: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const bulkUpdateToPublished = async () => {
    const nonPublished = news.filter(item => item.status !== 'published');
    if (nonPublished.length === 0) {
      alert('جميع الأخبار منشورة بالفعل');
      return;
    }

    if (!confirm(`هل تريد نشر ${nonPublished.length} خبر؟`)) return;

    try {
      setUpdating(true);
      const { error } = await supabase
        .from('news')
        .update({ status: 'published' })
        .in('id', nonPublished.map(item => item.id));

      if (error) throw error;
      
      // Update local state
      setNews(prev => prev.map(item => ({ ...item, status: 'published' })));
      alert('تم نشر جميع الأخبار بنجاح!');
    } catch (err) {
      console.error('Error bulk updating:', err);
      alert('فشل في النشر المجمع: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">جاري التحميل...</div>;
  }

  const statusGroups = news.reduce((acc, item) => {
    const status = item.status || 'null';
    if (!acc[status]) acc[status] = 0;
    acc[status]++;
    return acc;
  }, {});

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">إدارة حالة الأخبار</h2>
      
      {/* Statistics */}
      <div className="bg-gray-50 p-4 rounded mb-6">
        <h3 className="font-semibold mb-2">إحصائيات:</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(statusGroups).map(([status, count]) => (
            <div key={status} className="text-center p-2 bg-white rounded">
              <div className="font-bold text-lg">{count}</div>
              <div className="text-sm text-gray-600">{status}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="mb-6">
        <button
          onClick={bulkUpdateToPublished}
          disabled={updating}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {updating ? 'جاري النشر...' : 'نشر جميع الأخبار'}
        </button>
      </div>

      {/* Individual Items */}
      <div className="space-y-3">
        {news.map(item => (
          <div key={item.id} className="flex items-center justify-between p-3 border rounded">
            <div className="flex-1">
              <h4 className="font-medium">{item.title}</h4>
              <div className="text-sm text-gray-500">
                الحالة: {item.status || 'غير محدد'} | ID: {item.id}
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={item.status || ''}
                onChange={(e) => updateStatus(item.id, e.target.value)}
                disabled={updating}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="">غير محدد</option>
                <option value="draft">مسودة</option>
                <option value="published">منشور</option>
                <option value="archived">مؤرشف</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BulkNewsStatusUpdater;
