import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Upload } from 'lucide-react';
import LocalizedFileInput from '@/components/ui/LocalizedFileInput';

const createFormSchema = (isEditing = false) => z.object({
  title: z.string().min(3, { message: 'العنوان يجب أن يكون 3 أحرف على الأقل' }),
  description: z.string().min(10, { message: 'الوصف يجب أن يكون 10 أحرف على الأقل' }),
  category_id: z.string().nonempty({ message: 'الرجاء اختيار فئة' }),
  media_type: z.string().nonempty({ message: 'الرجاء اختيار نوع الوسائط' }),
  file: isEditing ? z.any().optional() : z.any().refine(files => files?.length > 0, 'الملف مطلوب.'),
});

const MediaForm = ({ onSuccess, onCancel, editingMedia = null }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [categories, setCategories] = useState([]);
  const isEditing = !!editingMedia;

  const form = useForm({
    resolver: zodResolver(createFormSchema(isEditing)),
    defaultValues: {
      title: editingMedia?.title || '',
      description: editingMedia?.description || '',
      category_id: editingMedia?.category_id?.toString() || '',
      media_type: editingMedia?.media_type || 'video',
    },
  });

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from('categories').select('id, name');
      if (!error) setCategories(data);
    };
    fetchCategories();
  }, []);

  const onSubmit = async (values) => {
    setLoading(true);
    let fileUrl = editingMedia?.file_url || null;

    // Only upload new file if one is provided
    if (values.file && values.file.length > 0) {
      setUploading(true);
      const file = values.file[0];
      const fileName = `${Date.now()}-${file.name}`;

      try {
        // Direct upload to Bunny CDN Storage API
        // Use STORAGE ZONE NAME (path) and STORAGE PASSWORD (AccessKey)
        const storageZoneName = (import.meta.env.VITE_BUNNY_STORAGE_ZONE_NAME || import.meta.env.VITE_BUNNY_STORAGE_ZONE || '').trim();
        const storagePassword = (import.meta.env.VITE_BUNNY_STORAGE_PASSWORD || import.meta.env.VITE_BUNNY_STORAGE_API_KEY || '').trim();
        const cdnUrl = (import.meta.env.VITE_BUNNY_CDN_URL || '').trim();

        if (!storageZoneName || !storagePassword || !cdnUrl) {
          throw new Error('Missing Bunny Storage configuration (zone name/password/CDN URL)');
        }

        const uploadUrl = `https://storage.bunnycdn.com/${storageZoneName}/${fileName}`;
        const uploadResponse = await fetch(uploadUrl, {
          method: 'PUT',
          headers: {
            'AccessKey': storagePassword,
            'Content-Type': file.type,
          },
          body: file,
        });

        if (!uploadResponse.ok) {
          const errText = await uploadResponse.text().catch(() => '');
          throw new Error(`Upload failed: ${uploadResponse.status} ${uploadResponse.statusText} ${errText}`);
        }
        
        // Construct the Bunny CDN URL
        fileUrl = `${cdnUrl}/${fileName}`;
        
      } catch (error) {
        console.error('Upload error:', error);
        
        if (!isEditing) {
          // For new media, show warning but continue
          toast({ 
            variant: "default", 
            title: "تحذير", 
            description: "تم حفظ المحتوى بدون ملف. مشكلة في رفع الملف." 
          });
          fileUrl = null;
        } else {
          // For editing, keep existing file URL
          toast({ 
            variant: "default", 
            title: "تحذير", 
            description: "فشل رفع الملف الجديد. سيتم الاحتفاظ بالملف السابق." 
          });
        }
      }
      setUploading(false);
    }

    const mediaData = {
      title: values.title,
      description: values.description,
      category_id: parseInt(values.category_id),
      media_type: values.media_type,
      file_url: fileUrl,
    };

    // Add additional fields for new media
    if (!isEditing) {
      mediaData.author_name = user.email.split('@')[0];
      mediaData.publish_date = new Date().toISOString().slice(0, 10);
      mediaData.is_featured = false;
    }

    let error;
    if (isEditing) {
      const result = await supabase
        .from('media')
        .update(mediaData)
        .eq('id', editingMedia.id);
      error = result.error;
    } else {
      const result = await supabase.from('media').insert(mediaData);
      error = result.error;
    }

    if (error) {
      toast({ 
        variant: "destructive", 
        title: isEditing ? "فشل تحديث الوسائط" : "فشل حفظ الوسائط", 
        description: error.message 
      });
    } else {
      toast({ 
        title: "✅ نجاح", 
        description: isEditing ? "تم تحديث الوسائط بنجاح!" : "تم رفع الوسائط بنجاح!" 
      });
      form.reset();
      if (onSuccess) onSuccess();
    }
    setLoading(false);
  };

  return (
    <Card className="heritage-card my-6">
      <CardHeader>
        <CardTitle className="arabic-title text-2xl">{isEditing ? 'تعديل الوسائط' : 'وسائط جديدة'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="arabic-font">العنوان</FormLabel>
                  <FormControl><Input placeholder="عنوان المقطع" {...field} className="arabic-body" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="arabic-font">الوصف</FormLabel>
                  <FormControl><Textarea placeholder="وصف قصير للمقطع" {...field} className="arabic-body" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="arabic-font">الفئة</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger className="arabic-body"><SelectValue placeholder="اختر فئة" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {categories.map(cat => <SelectItem key={cat.id} value={String(cat.id)} className="arabic-body">{cat.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="media_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="arabic-font">نوع الوسائط</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger className="arabic-body"><SelectValue placeholder="اختر النوع" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="video" className="arabic-body">فيديو</SelectItem>
                        <SelectItem value="audio" className="arabic-body">صوت</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="arabic-font">ملف الوسائط {isEditing && '(اختياري - اتركه فارغاً للاحتفاظ بالملف الحالي)'}</FormLabel>
                  <FormControl>
                    <LocalizedFileInput accept="video/*,audio/*" onChange={(files) => field.onChange(files)} />
                  </FormControl>
                  {isEditing && editingMedia?.file_url && (
                    <p className="text-sm text-gray-600 arabic-body">الملف الحالي: {editingMedia.file_url.split('/').pop()}</p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            {uploading && (
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                <p className="text-center text-sm mt-1">جاري الرفع...</p>
              </div>
            )}
            <div className="flex justify-end space-x-4 space-x-reverse">
              <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>إلغاء</Button>
              <Button type="submit" className="btn-heritage" disabled={loading}>
                {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                {loading ? (isEditing ? 'جاري التحديث...' : 'جاري الحفظ...') : (isEditing ? 'تحديث الوسائط' : 'حفظ الوسائط')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default MediaForm;