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

const formSchema = z.object({
  title: z.string().min(5, { message: 'العنوان يجب أن يكون 5 أحرف على الأقل' }),
  content: z.string().min(20, { message: 'المحتوى يجب أن يكون 20 حرفًا على الأقل' }),
  excerpt: z.string().min(10, { message: 'المقتطف يجب أن يكون 10 أحرف على الأقل' }),
  coverage_type: z.string().nonempty({ message: 'نوع التغطية مطلوب' }),
  event_location: z.string().min(2, { message: 'موقع الحدث مطلوب' }),
  event_date: z.string().nonempty({ message: 'تاريخ الحدث مطلوب' }),
  reporter_name: z.string().min(2, { message: 'اسم المراسل مطلوب' }),
});

const CoverageForm = ({ item, onSuccess, onCancel }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: item?.title || '',
      content: item?.content || '',
      excerpt: item?.excerpt || '',
      coverage_type: item?.coverage_type || '',
      event_location: item?.event_location || '',
      event_date: item?.event_date || '',
      reporter_name: item?.reporter_name || '',
    },
  });

  useEffect(() => {
    if (item) {
      form.reset({
        title: item.title || '',
        content: item.content || '',
        excerpt: item.excerpt || '',
        coverage_type: item.coverage_type || '',
        event_location: item.event_location || '',
        event_date: item.event_date || '',
        reporter_name: item.reporter_name || '',
      });
    }
  }, [item, form]);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleVideoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0]);
    }
  };

  const onSubmit = async (values) => {
    setLoading(true);
    let imageUrl = item?.image_url || null;
    let videoUrl = item?.video_url || null;

    // Upload image file if provided
    if (imageFile) {
      try {
        const uploadResult = await uploadToBunny(imageFile, 'coverage/images', 'ar');
        if (uploadResult.success) {
          imageUrl = uploadResult.url;
        }
      } catch (error) {
        console.warn('Image upload error:', error);
      }
    }

    // Upload video file if provided
    if (videoFile) {
      try {
        const uploadResult = await uploadToBunny(videoFile, 'coverage/videos', 'ar');
        if (uploadResult.success) {
          videoUrl = uploadResult.url;
        }
      } catch (error) {
        console.warn('Video upload error:', error);
      }
    }

    let error;
    
    if (item) {
      const updateData = {
        title: values.title,
        content: values.content,
        excerpt: values.excerpt,
        coverage_type: values.coverage_type,
        event_location: values.event_location,
        event_date: values.event_date,
        reporter_name: values.reporter_name,
        page_slug: values.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
      };
      
      if (imageUrl) updateData.image_url = imageUrl;
      if (videoUrl) updateData.video_url = videoUrl;
      
      const result = await supabase
        .from('coverage')
        .update(updateData)
        .eq('id', item.id);
      
      error = result.error;
    } else {
      const result = await supabase.from('coverage').insert({
        title: values.title,
        content: values.content,
        excerpt: values.excerpt,
        coverage_type: values.coverage_type,
        event_location: values.event_location,
        event_date: values.event_date,
        reporter_name: values.reporter_name,
        author_id: user.id,
        author_name: user.email.split('@')[0],
        image_url: imageUrl,
        video_url: videoUrl,
        publish_date: new Date().toISOString().slice(0, 10),
        status: 'published',
        page_slug: values.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
      });
      
      error = result.error;
    }

    if (error) {
      toast({ 
        variant: "destructive", 
        title: item ? "فشل تحديث التغطية" : "فشل إنشاء التغطية", 
        description: error.message 
      });
    } else {
      toast({ 
        title: "✅ نجاح", 
        description: item ? "تم تحديث التغطية بنجاح!" : "تم إنشاء التغطية بنجاح!" 
      });
      if (!item) {
        form.reset();
        setImageFile(null);
        setVideoFile(null);
      }
      if (onSuccess) onSuccess();
    }
    setLoading(false);
  };

  return (
    <Card className="heritage-card my-6">
      <CardHeader>
        <CardTitle className="arabic-title text-2xl">{item ? 'تحرير التغطية' : 'تغطية جديدة'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="arabic-font">عنوان التغطية</FormLabel>
                  <FormControl>
                    <Input placeholder="عنوان التغطية الإعلامية" {...field} className="arabic-body" />
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
                    <Textarea placeholder="مقتطف قصير عن التغطية" {...field} className="arabic-body" />
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
                  <FormLabel className="arabic-font">محتوى التغطية</FormLabel>
                  <FormControl>
                    <Textarea placeholder="المحتوى الكامل للتغطية الإعلامية" rows={10} {...field} className="arabic-body" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="coverage_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="arabic-font">نوع التغطية</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="arabic-body">
                          <SelectValue placeholder="اختر نوع التغطية" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="live" className="arabic-body">تغطية مباشرة</SelectItem>
                        <SelectItem value="event" className="arabic-body">تغطية حدث</SelectItem>
                        <SelectItem value="conference" className="arabic-body">مؤتمر</SelectItem>
                        <SelectItem value="interview" className="arabic-body">مقابلة</SelectItem>
                        <SelectItem value="report" className="arabic-body">تقرير إخباري</SelectItem>
                        <SelectItem value="cultural" className="arabic-body">فعالية ثقافية</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="reporter_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="arabic-font">اسم المراسل</FormLabel>
                    <FormControl>
                      <Input placeholder="اسم المراسل أو الصحفي" {...field} className="arabic-body" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="event_location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="arabic-font">موقع الحدث</FormLabel>
                    <FormControl>
                      <Input placeholder="مكان الحدث أو الفعالية" {...field} className="arabic-body" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="event_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="arabic-font">تاريخ الحدث</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="arabic-body" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormItem>
                <FormLabel className="arabic-font">صورة التغطية</FormLabel>
                <FormControl>
                  <Input type="file" accept="image/*" onChange={handleImageChange} className="arabic-body" />
                </FormControl>
                <FormMessage />
              </FormItem>
              
              <FormItem>
                <FormLabel className="arabic-font">فيديو التغطية (اختياري)</FormLabel>
                <FormControl>
                  <Input type="file" accept="video/*" onChange={handleVideoChange} className="arabic-body" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </div>
            
            <div className="flex justify-end space-x-4 space-x-reverse">
              <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                إلغاء
              </Button>
              <Button type="submit" className="btn-heritage" disabled={loading}>
                {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                {loading ? 'جاري الحفظ...' : (item ? 'تحديث التغطية' : 'حفظ التغطية')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CoverageForm;
