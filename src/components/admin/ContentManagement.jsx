import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, Play, Download } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const ContentManagement = ({ 
  contentType, 
  tableName, 
  title, 
  FormComponent, 
  columns = [],
  additionalActions = []
}) => {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const { toast } = useToast();

  const fetchItems = async () => {
    setLoading(true);
    const selectFields = columns.map(col => col.key).join(', ');
    const { data, error } = await supabase
      .from(tableName)
      .select(`id, ${selectFields}, created_at`)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        variant: "destructive",
        title: `خطأ في تحميل ${title}`,
        description: error.message,
      });
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, [tableName]);

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingItem(null);
    fetchItems();
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    const { error } = await supabase
      .from(tableName)
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
        description: `تم حذف العنصر بنجاح`,
      });
      fetchItems();
    }
    setDeletingId(null);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  const renderCellContent = (item, column) => {
    const value = item[column.key];
    
    switch (column.type) {
      case 'date':
        return new Date(value).toLocaleDateString('ar-SA');
      case 'status':
        return (
          <span className={`px-2 py-1 text-xs rounded-full ${
            value === 'published' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'
          }`}>
            {value === 'published' ? 'منشور' : 'مسودة'}
          </span>
        );
      case 'media':
        return value ? (
          <div className="flex items-center space-x-2 space-x-reverse">
            <Play size={16} className="text-blue-600" />
            <span className="text-sm">متوفر</span>
          </div>
        ) : (
          <span className="text-gray-400 text-sm">غير متوفر</span>
        );
      case 'excerpt':
        return value ? (
          <div className="max-w-xs">
            <div className="font-semibold">{item.title}</div>
            <div className="text-sm text-gray-600 mt-1 line-clamp-2">{value}</div>
          </div>
        ) : item.title;
      default:
        return value || 'غير محدد';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold arabic-title text-[var(--tent-black)]">{title}</h1>
        <Button onClick={() => setShowForm(true)} className="btn-heritage modern-font flex items-center space-x-2 space-x-reverse">
          <PlusCircle size={20} />
          <span>إضافة جديد</span>
        </Button>
      </div>

      {showForm && FormComponent && (
        <FormComponent 
          item={editingItem}
          onSuccess={handleFormSuccess} 
          onCancel={handleCancelForm} 
        />
      )}

      <div className="bg-white/80 rounded-lg shadow-md overflow-hidden border border-[var(--sand-dark)]">
        <table className="w-full text-right">
          <thead className="bg-[var(--sand-medium)]">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="p-4 font-bold arabic-title">
                  {column.label}
                </th>
              ))}
              <th className="p-4 font-bold arabic-title">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + 1} className="text-center p-8 modern-font">
                  جاري التحميل...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="text-center p-8 modern-font">
                  لا توجد عناصر
                </td>
              </tr>
            ) : (
              items.map(item => (
                <tr key={item.id} className="border-b border-[var(--sand-dark)] last:border-b-0 hover:bg-sand-light/50">
                  {columns.map((column) => (
                    <td key={column.key} className="p-4 arabic-body">
                      {renderCellContent(item, column)}
                    </td>
                  ))}
                  <td className="p-4 modern-font">
                    <div className="flex space-x-2 space-x-reverse">
                      {additionalActions.map((action, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          size="sm"
                          onClick={() => action.onClick(item)}
                          className={action.className}
                        >
                          {action.icon}
                        </Button>
                      ))}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEdit(item)}
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
                            disabled={deletingId === item.id}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="arabic-title">تأكيد الحذف</AlertDialogTitle>
                            <AlertDialogDescription className="arabic-body">
                              هل أنت متأكد من حذف هذا العنصر؟ لا يمكن التراجع عن هذا الإجراء.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="modern-font">إلغاء</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDelete(item.id)}
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
  );
};

export default ContentManagement;
