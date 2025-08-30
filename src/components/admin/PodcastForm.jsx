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
  episode_number: z.string().nonempty({ message: 'رقم الحلقة مطلوب' }),
  duration: z.string().optional(),
  host_name: z.string().min(2, { message: 'اسم المقدم مطلوب' }),
  guest_name: z.string().optional(),
  season: z.string().optional(),
});

const PodcastForm = ({ item, onSuccess, onCancel }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: item?.title || '',
      description: item?.description || '',
      episode_number: item?.episode_number || '',
      duration: item?.duration || '',
      host_name: item?.host_name || '',
      guest_name: item?.guest_name || '',
      season: item?.season || '1',
    },
  });

  useEffect(() => {
    if (item) {
      form.reset({
        title: item.title || '',
        description: item.description || '',
        episode_number: item.episode_number || '',
        duration: item.duration || '',
        host_name: item.host_name || '',
        guest_name: item.guest_name || '',
        season: item.season || '1',
      });
    }
  }, [item, form]);

  const handleAudioChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0]);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const onSubmit = async (values) => {
    setLoading(true);
    let audioUrl = item?.audio_url || null;
    let imageUrl = item?.image_url || null;

    // Upload audio file if provided
    if (audioFile) {
      try {
        const uploadResult = await uploadToBunny(audioFile, 'podcasts/audio', 'ar');
        if (uploadResult.success) {
          audioUrl = uploadResult.url;
        } else {
          throw new Error(uploadResult.error || 'Audio upload failed');
        }
      } catch (error) {
        console.warn('Audio upload error:', error);
        toast({ 
          variant: "destructive", 
          title: "خطأ في رفع الملف الصوتي", 
          description: error.message 
        });
        setLoading(false);
        return;
      }
    }

    // Upload image file if provided
    if (imageFile) {
      try {
        const uploadResult = await uploadToBunny(imageFile, 'podcasts/thumbnails', 'ar');
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
        episode_number: parseInt(values.episode_number),
        duration: values.duration,
        host_name: values.host_name,
        guest_name: values.guest_name,
        season: values.season,
        page_slug: values.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
      };
      
      if (audioUrl) updateData.audio_url = audioUrl;
      if (imageUrl) updateData.image_url = imageUrl;
      
      const result = await supabase
        .from('podcasts')
        .update(updateData)
        .eq('id', item.id);
      
      error = result.error;
    } else {
      const result = await supabase.from('podcasts').insert({
        title: values.title,
        description: values.description,
        episode_number: parseInt(values.episode_number),
        duration: values.duration,
        host_name: values.host_name,
        guest_name: values.guest_name,
        season: values.season,
        author_id: user.id,
        author_name: user.email.split('@')[0],
        audio_url: audioUrl,
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
        title: item ? "فشل تحديث البودكاست" : "فشل إنشاء البودكاست", 
        description: error.message 
      });
    } else {
      toast({ 
        title: "✅ نجاح", 
        description: item ? "تم تحديث البودكاست بنجاح!" : "تم إنشاء البودكاست بنجاح!" 
      });
      if (!item) {
        form.reset();
        setAudioFile(null);
        setImageFile(null);
      }
      if (onSuccess) onSuccess();
    }
    setLoading(false);
  };

  return (
    <Card className="heritage-card my-6">
      <CardHeader>
        <CardTitle className="arabic-title text-2xl">{item ? 'تحرير البودكاست' : 'بودكاست جديد'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="arabic-font">عنوان الحلقة</FormLabel>
                  <FormControl>
                    <Input placeholder="عنوان حلقة البودكاست" {...field} className="arabic-body" />
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
                  <FormLabel className="arabic-font">وصف الحلقة</FormLabel>
                  <FormControl>
                    <Textarea placeholder="وصف مفصل عن محتوى الحلقة" rows={6} {...field} className="arabic-body" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
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
                      <Input placeholder="45:30" {...field} className="arabic-body" />
                    </FormControl>
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
                      <Input placeholder="اسم المقدم" {...field} className="arabic-body" />
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
                <FormLabel className="arabic-font">الملف الصوتي</FormLabel>
                <FormControl>
                  <Input type="file" accept="audio/*" onChange={handleAudioChange} className="arabic-body" />
                </FormControl>
                <FormMessage />
              </FormItem>
              
              <FormItem>
                <FormLabel className="arabic-font">صورة الحلقة</FormLabel>
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
                {loading ? 'جاري الحفظ...' : (item ? 'تحديث البودكاست' : 'حفظ البودكاست')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default PodcastForm;
