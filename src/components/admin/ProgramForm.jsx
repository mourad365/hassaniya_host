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
  description: z.string().min(20, { message: 'الوصف يجب أن يكون 20 حرفًا على الأقل' }),
  program_type: z.string().nonempty({ message: 'نوع البرنامج مطلوب' }),
  episode_number: z.string().optional(),
  season: z.string().optional(),
  host_name: z.string().min(2, { message: 'اسم المقدم مطلوب' }),
  guest_name: z.string().optional(),
  duration: z.string().optional(),
  air_date: z.string().optional(),
});

const ProgramForm = ({ item, onSuccess, onCancel }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: item?.title || '',
      description: item?.description || '',
      program_type: item?.program_type || '',
      episode_number: item?.episode_number || '',
      season: item?.season || '1',
      host_name: item?.host_name || '',
      guest_name: item?.guest_name || '',
      duration: item?.duration || '',
      air_date: item?.air_date || '',
    },
  });

  useEffect(() => {
    if (item) {
      form.reset({
        title: item.title || '',
        description: item.description || '',
        program_type: item.program_type || '',
        episode_number: item.episode_number || '',
        season: item.season || '1',
        host_name: item.host_name || '',
        guest_name: item.guest_name || '',
        duration: item.duration || '',
        air_date: item.air_date || '',
      });
    }
  }, [item, form]);

  const handleVideoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0]);
    }
  };

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
        description: "يجب تسجيل الدخول أولاً لإنشاء البرامج"
      });
      return;
    }

    setLoading(true);
    let videoUrl = item?.video_url || null;
    let imageUrl = item?.image_url || null;

    // Upload video file if provided
    if (videoFile) {
      try {
        const uploadResult = await uploadToBunny(videoFile, 'programs/videos', 'ar');
        if (uploadResult.success) {
          videoUrl = uploadResult.url;
        } else {
          throw new Error(uploadResult.error || 'Video upload failed');
        }
      } catch (error) {
        console.warn('Video upload error:', error);
        toast({ 
          variant: "destructive", 
          title: "خطأ في رفع الفيديو", 
          description: error.message 
        });
        setLoading(false);
        return;
      }
    }

    // Upload image file if provided
    if (imageFile) {
      try {
        const uploadResult = await uploadToBunny(imageFile, 'programs/thumbnails', 'ar');
        if (uploadResult.success) {
          imageUrl = uploadResult.url;
        }
      } catch (error) {
        console.warn('Image upload error:', error);
      }
    }

    let error;
    
    if (item) {
      const updateData = {
        title: values.title,
        description: values.description,
        program_type: values.program_type,
        episode_number: values.episode_number ? parseInt(values.episode_number) : null,
        season: values.season,
        host_name: values.host_name,
        guest_name: values.guest_name,
        duration: values.duration,
        air_date: values.air_date || new Date().toISOString().slice(0, 10),
        page_slug: values.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
      };
      
      if (videoUrl) updateData.video_url = videoUrl;
      if (imageUrl) updateData.image_url = imageUrl;
      
      const result = await supabase
        .from('programs')
        .update(updateData)
        .eq('id', item.id);
      
      error = result.error;
    } else {
      const result = await supabase.from('programs').insert({
        title: values.title,
        description: values.description,
        program_type: values.program_type,
        episode_number: values.episode_number ? parseInt(values.episode_number) : null,
        season: values.season,
        host_name: values.host_name,
        guest_name: values.guest_name,
        duration: values.duration,
        air_date: values.air_date || new Date().toISOString().slice(0, 10),
        author_id: user.id,
        author_name: user.email.split('@')[0],
        video_url: videoUrl,
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
        title: item ? "فشل تحديث البرنامج" : "فشل إنشاء البرنامج", 
        description: error.message 
      });
    } else {
      toast({ 
        title: "✅ نجاح", 
        description: item ? "تم تحديث البرنامج بنجاح!" : "تم إنشاء البرنامج بنجاح!" 
      });
      if (!item) {
        form.reset();
        setVideoFile(null);
        setImageFile(null);
      }
      if (onSuccess) onSuccess();
    }
    setLoading(false);
  };

  return (
    <Card className="heritage-card my-6">
      <CardHeader>
        <CardTitle className="arabic-title text-2xl">{item ? 'تحرير البرنامج' : 'برنامج جديد'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="arabic-font">عنوان البرنامج/الحلقة</FormLabel>
                  <FormControl>
                    <Input placeholder="عنوان البرنامج أو الحلقة" {...field} className="arabic-body" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="arabic-font">وصف البرنامج</FormLabel>
                  <FormControl>
                    <Textarea placeholder="وصف مفصل عن محتوى البرنامج" rows={6} {...field} className="arabic-body" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="program_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="arabic-font">نوع البرنامج</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="arabic-body">
                          <SelectValue placeholder="اختر نوع البرنامج" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="khutwa" className="arabic-body">برنامج خطوة</SelectItem>
                        <SelectItem value="maqal" className="arabic-body">برنامج المقال</SelectItem>
                        <SelectItem value="ayan" className="arabic-body">برنامج أعيان</SelectItem>
                        <SelectItem value="interview" className="arabic-body">مقابلة</SelectItem>
                        <SelectItem value="documentary" className="arabic-body">وثائقي</SelectItem>
                        <SelectItem value="cultural" className="arabic-body">ثقافي</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="host_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="arabic-font">مقدم البرنامج</FormLabel>
                    <FormControl>
                      <Input placeholder="اسم مقدم البرنامج" {...field} className="arabic-body" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <FormField
                control={form.control}
                name="episode_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="arabic-font">رقم الحلقة</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="1" {...field} className="arabic-body" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="season"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="arabic-font">الموسم</FormLabel>
                    <FormControl>
                      <Input placeholder="1" {...field} className="arabic-body" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="arabic-font">المدة</FormLabel>
                    <FormControl>
                      <Input placeholder="30:00" {...field} className="arabic-body" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="air_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="arabic-font">تاريخ البث</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="arabic-body" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="guest_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="arabic-font">الضيف (اختياري)</FormLabel>
                  <FormControl>
                    <Input placeholder="اسم الضيف" {...field} className="arabic-body" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormItem>
                <FormLabel className="arabic-font">ملف الفيديو</FormLabel>
                <FormControl>
                  <Input type="file" accept="video/*" onChange={handleVideoChange} className="arabic-body" />
                </FormControl>
                <FormMessage />
              </FormItem>
              
              <FormItem>
                <FormLabel className="arabic-font">صورة البرنامج</FormLabel>
                <FormControl>
                  <Input type="file" accept="image/*" onChange={handleImageChange} className="arabic-body" />
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
                {loading ? 'جاري الحفظ...' : (item ? 'تحديث البرنامج' : 'حفظ البرنامج')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ProgramForm;
