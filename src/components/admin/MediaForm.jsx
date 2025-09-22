import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Upload, Shield } from 'lucide-react';
import LocalizedFileInput from '@/components/ui/LocalizedFileInput';
import { getCollectionIdByKey, getCollectionOptions } from '@/utils/bunnyVideoCollections';
import { validateFileUpload } from '@/utils/formValidation';
import { FILE_SECURITY, sanitizeContentData, sanitizeString } from '@/utils/security';

const createFormSchema = (isEditing = false) => z.object({
  title: z.string()
    .min(3, { message: 'العنوان يجب أن يكون 3 أحرف على الأقل' })
    .max(200, { message: 'العنوان يجب أن يكون أقل من 200 حرف' })
    .refine(val => sanitizeString(val).length >= 3, { message: 'العنوان غير صحيح' }),
  description: z.string()
    .min(10, { message: 'الوصف يجب أن يكون 10 أحرف على الأقل' })
    .max(1000, { message: 'الوصف يجب أن يكون أقل من 1000 حرف' }),
  category_id: z.string()
    .nonempty({ message: 'الرجاء اختيار فئة' })
    .refine(val => /^\d+$/.test(val), { message: 'معرف الفئة غير صحيح' }),
  media_type: z.enum(['video', 'audio', 'image'], { message: 'نوع الوسائط غير صحيح' }),
  file: isEditing 
    ? z.any().optional() 
    : z.any().refine(files => {
        if (!files || files.length === 0) return false;
        const file = files[0];
        const validation = validateFileUpload(file, 'video'); // Will adjust based on media_type
        return validation.isValid;
      }, { message: 'الملف غير صحيح أو حجمه كبير جداً' }),
  bunny_collection_id: z.string().optional(),
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
      bunny_collection_id: '',
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

      try {
        // Determine upload method based on media type
        if (values.media_type === 'video') {
          // Upload to Bunny Video Library for videos
          // Use explicitly selected Bunny collection if provided, otherwise fallback to category-name mapping
          let collectionId = (values.bunny_collection_id || '').trim();
          if (collectionId === 'auto') collectionId = '';
          if (!collectionId) {
            const selectedCategory = categories.find(c => String(c.id) === String(values.category_id));
            const categoryName = selectedCategory?.name?.toLowerCase() || '';
            let collectionKey = '';
            if (categoryName.includes('أعيان') || categoryName.includes('اعيان') || categoryName.includes('aayan') || categoryName.includes('a3yan')) {
              collectionKey = 'aayan';
            } else if (categoryName.includes('akwabir') || categoryName.includes('أكابر') || categoryName.includes('اكابر')) {
              collectionKey = 'podcast_akwabir';
            } else if (categoryName.includes('news') || categoryName.includes('أخبار') || categoryName.includes('الاخبار')) {
              collectionKey = 'news';
            } else if (categoryName.includes('khutwa') || categoryName.includes('خطوة')) {
              collectionKey = 'khutwa';
            } else if (categoryName.includes('elhoughoul') || categoryName.includes('الحقوق')) {
              collectionKey = 'elhoughoul';
            } else if (categoryName.includes('تغطيات') || categoryName.includes('coverages')) {
              collectionKey = 'coverages';
            } else if (categoryName.includes('اعلانات') || categoryName.includes('adverts')) {
              collectionKey = 'adverts';
            }
            collectionId = getCollectionIdByKey(collectionKey);
          }
          fileUrl = await uploadToBunnyVideoLibrary(file, values.title, collectionId);
        } else {
          // Upload to Bunny Storage for audio files
          fileUrl = await uploadToBunnyStorage(file);
        }
        
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

  // Upload video to Bunny Video Library
  const uploadToBunnyVideoLibrary = async (file, title, collectionId) => {
    const libraryId = import.meta.env.VITE_BUNNY_VIDEO_LIBRARY_ID;
    const apiKey = import.meta.env.VITE_BUNNY_VIDEO_API_KEY;

    if (!libraryId || !apiKey) {
      throw new Error('Missing Bunny Video Library configuration');
    }

    setUploadProgress(10);

    // Step 1: Create video object in Bunny Stream
    const createResponse = await fetch(
      `https://video.bunnycdn.com/library/${libraryId}/videos`,
      {
        method: 'POST',
        headers: {
          'AccessKey': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: title || 'Untitled Video',
          // Attach to collection if provided
          ...(collectionId ? { collectionId } : {}),
          // Respect default access mode if configured on server as public/token
          // Note: For token auth, ensure Video Library settings are configured in the dashboard
        })
      }
    );

    if (!createResponse.ok) {
      throw new Error('فشل في إنشاء الفيديو في مكتبة Bunny');
    }

    const videoData = await createResponse.json();
    setUploadProgress(30);

    // Step 2: Upload video file
    const uploadResponse = await fetch(
      `https://video.bunnycdn.com/library/${libraryId}/videos/${videoData.guid}`,
      {
        method: 'PUT',
        headers: {
          'AccessKey': apiKey,
          'Content-Type': 'application/octet-stream'
        },
        body: file
      }
    );

    if (!uploadResponse.ok) {
      throw new Error('فشل في رفع الفيديو إلى مكتبة Bunny');
    }

    setUploadProgress(90);
    
    // Return the video GUID (this is what gets stored in database)
    return videoData.guid;
  };

  // Upload audio to Bunny Storage (existing method)
  const uploadToBunnyStorage = async (file) => {
    const fileName = `${Date.now()}-${file.name}`;
    const storageZoneName = (import.meta.env.VITE_BUNNY_STORAGE_ZONE_NAME || import.meta.env.VITE_BUNNY_STORAGE_ZONE || '').trim();
    const storagePassword = (import.meta.env.VITE_BUNNY_STORAGE_PASSWORD || import.meta.env.VITE_BUNNY_STORAGE_API_KEY || '').trim();
    const cdnUrl = (import.meta.env.VITE_BUNNY_CDN_URL || '').trim();

    if (!storageZoneName || !storagePassword || !cdnUrl) {
      throw new Error('Missing Bunny Storage configuration (zone name/password/CDN URL)');
    }

    setUploadProgress(30);

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
    
    setUploadProgress(90);
    
    // Construct the Bunny CDN URL
    return `${cdnUrl}/${fileName}`;
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
            
            {/* Bunny Collection selector - only show for videos */}
            {form.watch('media_type') === 'video' && (
              <FormField
                control={form.control}
                name="bunny_collection_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="arabic-font">المجموعة  (اختياري)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger className="arabic-body"><SelectValue placeholder="اختر مجموعة أو اتركها فارغة للتحديد التلقائي" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="auto" className="arabic-body">تحديد تلقائي حسب الفئة</SelectItem>
                        {getCollectionOptions().map(option => (
                          <SelectItem key={option.id} value={option.id} className="arabic-body">
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                    <p className="text-sm text-gray-600 arabic-body mt-1">
                      إذا لم تختر مجموعة، سيتم تحديدها تلقائياً حسب اسم الفئة
                    </p>
                  </FormItem>
                )}
              />
            )}

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
                    <p className="text-sm text-gray-600 arabic-body">
                      الملف الحالي: {editingMedia.media_type === 'video' && editingMedia.file_url.length === 36 
                        ? `فيديو Bunny Stream (${editingMedia.file_url.substring(0, 8)}...)` 
                        : editingMedia.file_url.split('/').pop()}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            {uploading && (
              <div className="space-y-2">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                </div>
                <p className="text-center text-sm mt-1 arabic-body">
                  {uploadProgress < 30 ? 'جاري إنشاء الفيديو...' : 
                   uploadProgress < 90 ? 'جاري رفع الملف...' : 
                   'جاري الانتهاء...'} ({uploadProgress}%)
                </p>
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