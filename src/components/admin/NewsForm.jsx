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
import { Loader2 } from 'lucide-react';
import { uploadToBunny } from '@/services/mediaService';
import LocalizedFileInput from '@/components/ui/LocalizedFileInput';

const formSchema = z.object({
  title: z.string().min(5, { message: 'العنوان يجب أن يكون 5 أحرف على الأقل' }),
  content: z.string().min(20, { message: 'المحتوى يجب أن يكون 20 حرفًا على الأقل' }),
  excerpt: z.string().min(10, { message: 'المقتطف يجب أن يكون 10 أحرف على الأقل' }),
  category: z.string().nonempty({ message: 'الرجاء اختيار فئة' }),
  priority: z.string().nonempty({ message: 'الرجاء اختيار الأولوية' }),
  location: z.string().optional(),
});

const NewsForm = ({ item, onSuccess, onCancel }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: item?.title || '',
      content: item?.content || '',
      excerpt: item?.excerpt || '',
      category: item?.category || '',
      priority: item?.priority || 'medium',
      location: item?.location || '',
    },
  });

  useEffect(() => {
    if (item) {
      form.reset({
        title: item.title || '',
        content: item.content || '',
        excerpt: item.excerpt || '',
        category: item.category || '',
        priority: item.priority || 'medium',
        location: item.location || '',
      });
    }
  }, [item, form]);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const onSubmit = async (values) => {
    // Check authentication first
    if (!user) {
      toast({
        variant: "destructive",
        title: "خطأ في المصادقة",
        description: "يجب تسجيل الدخول أولاً لإنشاء الأخبار"
      });
      setLoading(false);
      return;
    }

    setLoading(true);
    let imageUrl = null;

    if (imageFile) {
      try {
        // Direct upload to Bunny CDN Storage API
        // IMPORTANT: Bunny Storage API expects the STORAGE ZONE NAME in the URL path,
        // and the STORAGE ZONE PASSWORD in the AccessKey header.
        const fileName = `news/${Date.now()}-${imageFile.name}`;
        const storageZoneName = (import.meta.env.VITE_BUNNY_STORAGE_ZONE_NAME || import.meta.env.VITE_BUNNY_STORAGE_ZONE || '').trim();
        const storagePassword = (import.meta.env.VITE_BUNNY_STORAGE_PASSWORD || import.meta.env.VITE_BUNNY_STORAGE_API_KEY || '').trim();
        const cdnUrl = (import.meta.env.VITE_BUNNY_CDN_URL || '').trim();

        if (!storageZoneName || !storagePassword || !cdnUrl) {
          throw new Error('Bunny Storage configuration is missing (zone name / password / CDN URL)');
        }

        const uploadUrl = `https://storage.bunnycdn.com/${storageZoneName}/${fileName}`;
        const uploadResponse = await fetch(uploadUrl, {
          method: 'PUT',
          headers: {
            'AccessKey': storagePassword,
            'Content-Type': imageFile.type,
          },
          body: imageFile,
        });

        if (!uploadResponse.ok) {
          const errText = await uploadResponse.text().catch(() => '');
          throw new Error(`Upload failed: ${uploadResponse.status} ${uploadResponse.statusText} ${errText}`);
        }

        // Construct the Bunny CDN URL
        imageUrl = `${cdnUrl}/${fileName}`;

        console.log('Image uploaded successfully:', { uploadUrl, imageUrl });

      } catch (error) {
        console.error('Image upload error:', error);
        toast({ 
          variant: "destructive", 
          title: "خطأ في رفع الصورة", 
          description: `فشل في رفع الصورة: ${error.message}. سيتم حفظ الخبر بدون صورة.` 
        });
        imageUrl = null;
      }
    }

    // Get category ID from slug
    const { data: categoryData, error: catError } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', values.category)
      .single();

    if (catError) {
      toast({
        variant: "destructive",
        title: "خطأ في الفئة",
        description: "لم يتم العثور على الفئة المحددة"
      });
      setLoading(false);
      return;
    }

    let error;
    
    if (item) {
      const updateData = {
        title: values.title,
        content: values.content,
        excerpt: values.excerpt,
        category_id: categoryData.id,
        priority: values.priority,
        location: values.location,
        page_slug: values.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
      };
      
      if (imageUrl) {
        updateData.image_url = imageUrl;
      }
      
      const result = await supabase
        .from('news')
        .update(updateData)
        .eq('id', item.id);
      
      error = result.error;
    } else {
      const result = await supabase.from('news').insert({
        title: values.title,
        content: values.content,
        excerpt: values.excerpt,
        category_id: categoryData.id,
        priority: values.priority,
        location: values.location,
        author_id: user.id,
        author_name: user.email.split('@')[0],
        image_url: imageUrl,
        publish_date: new Date().toISOString().slice(0, 10),
        status: 'published',
        page_slug: values.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
      });
      
      error = result.error;
    }

    if (error) {
      toast({ 
        variant: "destructive", 
        title: item ? "فشل تحديث الخبر" : "فشل إنشاء الخبر", 
        description: error.message 
      });
    } else {
      toast({ 
        title: "✅ نجاح", 
        description: item ? "تم تحديث الخبر بنجاح!" : "تم إنشاء الخبر بنجاح!" 
      });
      if (!item) {
        form.reset();
        setImageFile(null);
      }
      if (onSuccess) onSuccess();
    }
    setLoading(false);
  };

  return (
    <Card className="heritage-card my-6">
      <CardHeader>
        <CardTitle className="arabic-title text-2xl">{item ? 'تحرير الخبر' : 'خبر جديد'}</CardTitle>
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
                  <FormControl>
                    <Input placeholder="عنوان الخبر" {...field} className="arabic-body" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="excerpt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="arabic-font">مقتطف</FormLabel>
                  <FormControl>
                    <Textarea placeholder="مقتطف قصير عن الخبر" {...field} className="arabic-body" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="arabic-font">المحتوى</FormLabel>
                  <FormControl>
                    <Textarea placeholder="محتوى الخبر الكامل" rows={10} {...field} className="arabic-body" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="arabic-font">الفئة</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="arabic-body">
                          <SelectValue placeholder="اختر فئة" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="breaking" className="arabic-body">عاجل</SelectItem>
                        <SelectItem value="politics" className="arabic-body">سياسة</SelectItem>
                        <SelectItem value="culture" className="arabic-body">ثقافة</SelectItem>
                        <SelectItem value="sports" className="arabic-body">رياضة</SelectItem>
                        <SelectItem value="economy" className="arabic-body">اقتصاد</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="arabic-font">الأولوية</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="arabic-body">
                          <SelectValue placeholder="اختر الأولوية" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="high" className="arabic-body">عالية</SelectItem>
                        <SelectItem value="medium" className="arabic-body">متوسطة</SelectItem>
                        <SelectItem value="low" className="arabic-body">منخفضة</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="arabic-font">الموقع</FormLabel>
                    <FormControl>
                      <Input placeholder="موقع الخبر" {...field} className="arabic-body" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormItem>
              <FormLabel className="arabic-font">صورة الخبر</FormLabel>
              <FormControl>
                <LocalizedFileInput accept="image/*" onChange={(files) => setImageFile(files && files[0])} />
              </FormControl>
              <FormMessage />
            </FormItem>
            
            <div className="flex justify-end space-x-4 space-x-reverse">
              <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                إلغاء
              </Button>
              <Button type="submit" className="btn-heritage" disabled={loading}>
                {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                {loading ? 'جاري الحفظ...' : (item ? 'تحديث الخبر' : 'حفظ الخبر')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default NewsForm;
