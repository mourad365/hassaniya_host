
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import ArticleForm from '@/components/admin/ArticleForm';

const ArticleManagementPage = () => {
  const { t } = useTranslation();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const fetchArticles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('articles')
      .select('id, title, publish_date, status')
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
    fetchArticles();
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

        {showForm && <ArticleForm onSuccess={handleFormSuccess} onCancel={() => setShowForm(false)} />}

        <div className="bg-white/80 rounded-lg shadow-md overflow-hidden border border-[var(--sand-dark)]">
          <table className="w-full text-right">
            <thead className="bg-[var(--sand-medium)]">
              <tr>
                <th className="p-4 font-bold arabic-title">{t('title')}</th>
                <th className="p-4 font-bold arabic-title">{t('publishDate')}</th>
                <th className="p-4 font-bold arabic-title">{t('status')}</th>
                <th className="p-4 font-bold arabic-title">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="text-center p-8 modern-font">{t('loadingArticles')}</td></tr>
              ) : articles.length === 0 ? (
                <tr><td colSpan="4" className="text-center p-8 modern-font">{t('noArticlesFound')}</td></tr>
              ) : (
                articles.map(article => (
                  <tr key={article.id} className="border-b border-[var(--sand-dark)] last:border-b-0 hover:bg-sand-light/50">
                    <td className="p-4 arabic-body">{article.title}</td>
                    <td className="p-4 modern-font">{article.publish_date}</td>
                    <td className="p-4 modern-font">
                      <span className={`px-2 py-1 text-xs rounded-full ${article.status === 'published' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
                        {article.status === 'published' ? t('published') : t('draft')}
                      </span>
                    </td>
                    <td className="p-4 modern-font">
                      <Button variant="ghost" size="sm" onClick={() => toast({ title: t('underDevelopment') })}>{t('edit')}</Button>
                      <Button variant="ghost" size="sm" className="text-red-500" onClick={() => toast({ title: t('underDevelopment') })}>{t('delete')}</Button>
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
