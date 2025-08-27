
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2, Edit, Trash2, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import MediaForm from '@/components/admin/MediaForm';
// Simple custom dialog component
const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, itemTitle }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative bg-white rounded-lg shadow-lg p-6 max-w-md mx-4">
        <h3 className="text-lg font-bold arabic-title mb-4">{title}</h3>
        <p className="arabic-body mb-2">{message}</p>
        <p className="arabic-body font-semibold mb-6">{itemTitle}</p>
        <div className="flex justify-end space-x-4 space-x-reverse">
          <Button variant="outline" onClick={onClose} className="arabic-body">
            إلغاء
          </Button>
          <Button 
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white arabic-body"
          >
            حذف
          </Button>
        </div>
      </div>
    </div>
  );
};

const MediaManagementPage = () => {
  const { t } = useTranslation();
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMedia, setEditingMedia] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, item: null });
  const { toast } = useToast();

  const fetchMedia = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('media')
      .select(`
        id, title, description, media_type, publish_date, 
        file_url, author_name, is_featured,
        categories(name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        variant: "destructive",
        title: t('fetchMediaError'),
        description: error.message,
      });
    } else {
      setMedia(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingMedia(null);
    fetchMedia();
  };

  const handleEdit = (mediaItem) => {
    setEditingMedia(mediaItem);
    setShowForm(true);
  };

  const handleDeleteClick = (item) => {
    setDeleteDialog({ isOpen: true, item });
  };

  const handleDeleteConfirm = async () => {
    const id = deleteDialog.item.id;
    setDeletingId(id);
    setDeleteDialog({ isOpen: false, item: null });
    
    const { error } = await supabase
      .from('media')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        variant: "destructive",
        title: t('deleteError'),
        description: error.message,
      });
    } else {
      toast({
        title: t('deleteSuccess'),
      });
      fetchMedia();
    }
    setDeletingId(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, item: null });
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingMedia(null);
  };

  return (
    <>
      <Helmet>
        <title>{t('mediaManagement')} - {t('siteName')}</title>
      </Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold arabic-title text-[var(--tent-black)]">{t('mediaManagement')}</h1>
          <Button onClick={() => setShowForm(true)} className="btn-heritage modern-font flex items-center space-x-2 space-x-reverse">
            <PlusCircle size={20} />
            <span>{t('addNewMedia')}</span>
          </Button>
        </div>

        {showForm && (
          <MediaForm 
            onSuccess={handleFormSuccess} 
            onCancel={handleCancelForm}
            editingMedia={editingMedia}
          />
        )}

        <div className="bg-white/80 rounded-lg shadow-md overflow-hidden border border-[var(--sand-dark)] overflow-x-auto">
          <table className="w-full text-right min-w-[800px]">
            <thead className="bg-[var(--sand-medium)]">
              <tr>
                <th className="p-4 font-bold arabic-title">{t('title')}</th>
                <th className="p-4 font-bold arabic-title">{t('type')}</th>
                <th className="p-4 font-bold arabic-title">{t('category')}</th>
                <th className="p-4 font-bold arabic-title">{t('author')}</th>
                <th className="p-4 font-bold arabic-title">{t('publishDate')}</th>
                <th className="p-4 font-bold arabic-title">{t('fileUrl')}</th>
                <th className="p-4 font-bold arabic-title">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center p-8 modern-font"><Loader2 className="inline-block animate-spin mr-2" />{t('loadingMedia')}</td></tr>
              ) : media.length === 0 ? (
                <tr><td colSpan="7" className="text-center p-8 modern-font">{t('noMediaFound')}</td></tr>
              ) : (
                media.map(item => (
                  <tr key={item.id} className="border-b border-[var(--sand-dark)] last:border-b-0 hover:bg-sand-light/50">
                    <td className="p-4 arabic-body">
                      <div className="font-semibold">{item.title}</div>
                      {item.description && (
                        <div className="text-sm text-gray-600 mt-1 truncate max-w-xs">
                          {item.description.length > 50 ? `${item.description.substring(0, 50)}...` : item.description}
                        </div>
                      )}
                    </td>
                    <td className="p-4 modern-font">
                      <span className={`px-2 py-1 rounded text-xs ${
                        item.media_type === 'video' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {item.media_type === 'video' ? 'فيديو' : 'صوت'}
                      </span>
                    </td>
                    <td className="p-4 arabic-body">{item.categories?.name || 'غير محدد'}</td>
                    <td className="p-4 modern-font">{item.author_name}</td>
                    <td className="p-4 modern-font">{item.publish_date}</td>
                    <td className="p-4 modern-font">
                      {item.file_url ? (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => window.open(item.file_url, '_blank')}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink size={16} className="ml-1" />
                          عرض
                        </Button>
                      ) : (
                        <span className="text-gray-400 text-sm">لا يوجد ملف</span>
                      )}
                    </td>
                    <td className="p-4 modern-font">
                      <div className="flex space-x-2 space-x-reverse">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit size={16} className="ml-1" />
                          {t('edit')}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-800"
                          disabled={deletingId === item.id}
                          onClick={() => handleDeleteClick(item)}
                        >
                          {deletingId === item.id ? (
                            <Loader2 size={16} className="animate-spin ml-1" />
                          ) : (
                            <Trash2 size={16} className="ml-1" />
                          )}
                          {t('delete')}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <ConfirmDialog
          isOpen={deleteDialog.isOpen}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          title={t('confirmDelete')}
          message={t('confirmDeleteMessage')}
          itemTitle={deleteDialog.item?.title}
        />
      </div>
    </>
  );
};

export default MediaManagementPage;
