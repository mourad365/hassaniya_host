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
          <div className="max-w-xs lg:max-w-sm xl:max-w-md">
            <div className="font-semibold text-sm lg:text-base truncate">{item.title}</div>
            <div className="text-xs lg:text-sm text-gray-600 mt-1 line-clamp-2">{value}</div>
          </div>
        ) : item.title;
      default:
        return value || 'غير محدد';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold arabic-title text-[var(--tent-black)]">{title}</h1>
        <Button onClick={() => setShowForm(true)} className="btn-heritage modern-font flex items-center space-x-2 space-x-reverse w-full sm:w-auto">
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

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white/80 rounded-lg shadow-md overflow-hidden border border-[var(--sand-dark)]">
        <div className="overflow-x-auto">
          <table className="w-full text-right min-w-[800px]">
            <thead className="bg-[var(--sand-medium)]">
              <tr>
                {columns.map((column) => (
                  <th key={column.key} className="p-3 lg:p-4 font-bold arabic-title text-sm lg:text-base whitespace-nowrap">
                    {column.label}
                  </th>
                ))}
                <th className="p-3 lg:p-4 font-bold arabic-title text-sm lg:text-base">الإجراءات</th>
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
                      <td key={column.key} className="p-3 lg:p-4 arabic-body text-sm lg:text-base">
                        {renderCellContent(item, column)}
                      </td>
                    ))}
                    <td className="p-3 lg:p-4 modern-font">
                      <div className="flex space-x-1 lg:space-x-2 space-x-reverse">
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
                          <Edit size={14} />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-500 hover:text-red-700"
                              disabled={deletingId === item.id}
                            >
                              <Trash2 size={14} />
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

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {loading ? (
          <div className="text-center p-8 modern-font bg-white/80 rounded-lg">
            جاري التحميل...
          </div>
        ) : items.length === 0 ? (
          <div className="text-center p-8 modern-font bg-white/80 rounded-lg">
            لا توجد عناصر
          </div>
        ) : (
          items.map(item => (
            <div key={item.id} className="bg-white/80 rounded-lg shadow-md border border-[var(--sand-dark)] p-4">
              {columns.map((column) => (
                <div key={column.key} className="mb-3 last:mb-0">
                  <div className="text-sm font-semibold text-gray-600 arabic-title mb-1">
                    {column.label}
                  </div>
                  <div className="arabic-body text-sm">
                    {renderCellContent(item, column)}
                  </div>
                </div>
              ))}
              <div className="flex justify-end space-x-2 space-x-reverse mt-4 pt-3 border-t border-gray-200">
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
                  <AlertDialogContent className="max-w-sm mx-auto">
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
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ContentManagement;
