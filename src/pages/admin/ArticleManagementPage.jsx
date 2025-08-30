
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, Eye } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import ArticleForm from '@/components/admin/ArticleForm';

const ArticleManagementPage = () => {
  const { t } = useTranslation();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const { toast } = useToast();

  const fetchArticles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('articles')
      .select('id, title, publish_date, status, excerpt, author_name')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        variant: "destructive",
        title: t('fetchArticlesError'),
        description: error.message,
      });
    } else {
      setArticles(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingArticle(null);
    fetchArticles();
  };

  const handleEdit = (article) => {
    setEditingArticle(article);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        variant: "destructive",
        title: "خطأ في الحذف",
        description: error.message,
      });
    } else {
      toast({
        title: "✅ تم الحذف",
        description: "تم حذف المقال بنجاح",
      });
      fetchArticles();
    }
    setDeletingId(null);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingArticle(null);
  };

  return (
    <>
      <Helmet>
        <title>{t('articleManagement')} - {t('siteName')}</title>
      </Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold arabic-title text-[var(--tent-black)]">{t('articleManagement')}</h1>
          <Button onClick={() => setShowForm(true)} className="btn-heritage modern-font flex items-center space-x-2 space-x-reverse">
            <PlusCircle size={20} />
            <span>{t('addNewArticle')}</span>
          </Button>
        </div>

        {showForm && (
          <ArticleForm 
            article={editingArticle}
            onSuccess={handleFormSuccess} 
            onCancel={handleCancelForm} 
          />
        )}

        <div className="bg-white/80 rounded-lg shadow-md overflow-hidden border border-[var(--sand-dark)]">
          <table className="w-full text-right">
            <thead className="bg-[var(--sand-medium)]">
              <tr>
                <th className="p-4 font-bold arabic-title">{t('title')}</th>
                <th className="p-4 font-bold arabic-title">المؤلف</th>
                <th className="p-4 font-bold arabic-title">{t('publishDate')}</th>
                <th className="p-4 font-bold arabic-title">{t('status')}</th>
                <th className="p-4 font-bold arabic-title">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center p-8 modern-font">{t('loadingArticles')}</td></tr>
              ) : articles.length === 0 ? (
                <tr><td colSpan="5" className="text-center p-8 modern-font">{t('noArticlesFound')}</td></tr>
              ) : (
                articles.map(article => (
                  <tr key={article.id} className="border-b border-[var(--sand-dark)] last:border-b-0 hover:bg-sand-light/50">
                    <td className="p-4 arabic-body">
                      <div className="font-semibold">{article.title}</div>
                      {article.excerpt && (
                        <div className="text-sm text-gray-600 mt-1 line-clamp-2">{article.excerpt}</div>
                      )}
                    </td>
                    <td className="p-4 modern-font">{article.author_name || 'غير محدد'}</td>
                    <td className="p-4 modern-font">{new Date(article.publish_date).toLocaleDateString('ar-SA')}</td>
                    <td className="p-4 modern-font">
                      <span className={`px-2 py-1 text-xs rounded-full ${article.status === 'published' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
                        {article.status === 'published' ? t('published') : t('draft')}
                      </span>
                    </td>
                    <td className="p-4 modern-font">
                      <div className="flex space-x-2 space-x-reverse">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEdit(article)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit size={16} />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-500 hover:text-red-700"
                              disabled={deletingId === article.id}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="arabic-title">تأكيد الحذف</AlertDialogTitle>
                              <AlertDialogDescription className="arabic-body">
                                هل أنت متأكد من حذف المقال "{article.title}"؟ لا يمكن التراجع عن هذا الإجراء.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="modern-font">إلغاء</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(article.id)}
                                className="bg-red-600 hover:bg-red-700 modern-font"
                              >
                                حذف
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default ArticleManagementPage;
