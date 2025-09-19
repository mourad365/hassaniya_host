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
import { Switch } from '@/components/ui/switch';
import LocalizedFileInput from '@/components/ui/LocalizedFileInput';
import { Upload } from 'tus-js-client';

const formSchema = z.object({
  // Required to satisfy DB NOT NULL constraints
  title: z.string().min(1, 'العنوان مطلوب'),
  description: z.string().min(1, 'الوصف مطلوب'),
  host_name: z.string().min(1, 'اسم المقدم مطلوب'),

  // Optional fields
  episode_number: z.string().optional(),
  duration: z.string().optional(),
  guest_name: z.string().optional(),
  season: z.string().optional(),
  program_type: z.enum(['khutwa', 'maqal', 'ayan', 'other']).optional(),
  custom_program_type: z.string().optional(),
});

const PodcastForm = ({ item, onSuccess, onCancel }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [uploadAsVideo, setUploadAsVideo] = useState(false);
  const [programType, setProgramType] = useState('khutwa');

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
      program_type: item?.program_type || 'khutwa',
      custom_program_type: item?.custom_program_type || '',
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
        program_type: item.program_type || 'khutwa',
        custom_program_type: item.custom_program_type || '',
      });
      setProgramType(item.program_type || 'khutwa');
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

  const handleVideoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      if (!f.type || !f.type.startsWith('video/')) {
        toast({
          variant: 'destructive',
          title: 'ملف غير صالح',
          description: 'يرجى اختيار ملف فيديو صالح (video/*)'
        });
        return;
      }
      setVideoFile(f);
    }
  };

  const onSubmit = async (values) => {
    setLoading(true);
    let audioUrl = item?.audio_url || null;
    let imageUrl = item?.image_url || null;
    let videoUrl = null;

    // Upload audio file if provided
    if (audioFile) {
      try {
        const fileName = `podcasts/audio/${Date.now()}-${audioFile.name}`;
        const storageZoneName = (import.meta.env.VITE_BUNNY_STORAGE_ZONE_NAME || import.meta.env.VITE_BUNNY_STORAGE_ZONE || '').trim();
        const storagePassword = (import.meta.env.VITE_BUNNY_STORAGE_PASSWORD || import.meta.env.VITE_BUNNY_STORAGE_API_KEY || '').trim();
        const cdnUrl = (import.meta.env.VITE_BUNNY_CDN_URL || '').trim();

        if (!storageZoneName || !storagePassword || !cdnUrl) {
          throw new Error('Bunny Storage configuration is missing');
        }

        const uploadResponse = await fetch(`https://storage.bunnycdn.com/${storageZoneName}/${fileName}`, {
          method: 'PUT',
          headers: {
            'AccessKey': storagePassword,
            'Content-Type': audioFile.type,
          },
          body: audioFile,
        });

        if (!uploadResponse.ok) {
          const errText = await uploadResponse.text().catch(() => '');
          throw new Error(`Audio upload failed: ${uploadResponse.status} ${uploadResponse.statusText} ${errText}`);
        }

        audioUrl = `${cdnUrl}/${fileName}`;
        console.log('Audio uploaded successfully:', audioUrl);
        
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
        const fileName = `podcasts/thumbnails/${Date.now()}-${imageFile.name}`;
        const storageZoneName = (import.meta.env.VITE_BUNNY_STORAGE_ZONE_NAME || import.meta.env.VITE_BUNNY_STORAGE_ZONE || '').trim();
        const storagePassword = (import.meta.env.VITE_BUNNY_STORAGE_PASSWORD || import.meta.env.VITE_BUNNY_STORAGE_API_KEY || '').trim();
        const cdnUrl = (import.meta.env.VITE_BUNNY_CDN_URL || '').trim();

        const uploadResponse = await fetch(`https://storage.bunnycdn.com/${storageZoneName}/${fileName}`, {
          method: 'PUT',
          headers: {
            'AccessKey': storagePassword,
            'Content-Type': imageFile.type,
          },
          body: imageFile,
        });

        if (uploadResponse.ok) {
          imageUrl = `${cdnUrl}/${fileName}`;
          console.log('Image uploaded successfully:', imageUrl);
        }
      } catch (error) {
        console.warn('Image upload error:', error);
      }
    }

    // Upload video to Bunny Video Library using TUS (resumable) if provided and enabled
    if (videoFile && uploadAsVideo) {
      try {
        const videoApiKey = (import.meta.env.VITE_BUNNY_VIDEO_API_KEY || '').trim();
        const libraryId = (import.meta.env.VITE_BUNNY_VIDEO_LIBRARY_ID || '').trim();
        if (!videoApiKey || !libraryId) {
          throw new Error('Bunny Video configuration is missing');
        }

        const endpoint = `https://video.bunnycdn.com/tus/${libraryId}`;
        const title = values.title && values.title.trim() ? values.title.trim() : 'Untitled';

        const uploadWithHeaders = (headers) => {
          const upload = new Upload(videoFile, {
            endpoint,
            headers,
            metadata: {
              filename: videoFile.name,
              filetype: videoFile.type || 'video/mp4',
              title,
            },
            onProgress: (bytesUploaded, bytesTotal) => {
              const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(1);
              console.log(`Uploading video: ${bytesUploaded}/${bytesTotal} (${percentage}%)`);
            },
          });

          return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('Video upload timed out'));
            }, 30 * 60 * 1000);

            upload.options.onError = (err) => {
              clearTimeout(timeout);
              console.error('TUS upload error:', err);
              reject(err);
            };

            upload.options.onSuccess = () => {
              clearTimeout(timeout);
              console.log('TUS upload completed. Upload URL:', upload.url);
              resolve(upload);
            };

            upload.start();
          });
        };

        let upload;
        try {
          // Try AccessKey header first
          upload = await uploadWithHeaders({ AccessKey: videoApiKey });
        } catch (e1) {
          // Retry with Authorization: Bearer
          console.warn('AccessKey TUS attempt failed, retrying with Authorization Bearer...');
          upload = await uploadWithHeaders({ Authorization: `Bearer ${videoApiKey}` });
        }

        // Extract GUID from the final upload URL
        const uploadUrl = String(upload.url || '');
        const parts = uploadUrl.split('/');
        const videoId = parts[parts.length - 1];
        if (!videoId || videoId.length < 10) {
          throw new Error(`Could not determine video GUID from upload URL: ${uploadUrl}`);
        }

        const videoCdnHostname = (import.meta.env.VITE_BUNNY_VIDEO_CDN_HOSTNAME || 'vz-a9578edc-805.b-cdn.net').trim();
        videoUrl = `https://${videoCdnHostname}/${videoId}/playlist.m3u8`;
        console.log('Video uploaded successfully:', videoUrl);
      } catch (error) {
        console.warn('Video upload error:', error);
        toast({ 
          variant: "default", 
          title: "تحذير", 
          description: "فشل في رفع الفيديو. سيتم حفظ البودكاست بدون فيديو." 
        });
      }
    }

    let error;
    
    const hasVal = (v) => v !== undefined && v !== null && String(v).trim() !== '';
    const safeInt = (v) => (hasVal(v) ? parseInt(v) : null);
    const makeSlug = (t) => (hasVal(t)
      ? String(t).toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
      : undefined);

    if (item) {
      const updateData = {};
      if (hasVal(values.title)) updateData.title = values.title;
      if (hasVal(values.description)) updateData.description = values.description;
      if (hasVal(values.episode_number)) updateData.episode_number = safeInt(values.episode_number);
      if (hasVal(values.duration)) updateData.duration = values.duration;
      if (hasVal(values.host_name)) updateData.host_name = values.host_name;
      if (hasVal(values.guest_name)) updateData.guest_name = values.guest_name;
      if (hasVal(values.season)) updateData.season = values.season;
      const slug = makeSlug(values.title);
      if (slug) updateData.page_slug = slug;
      
      if (audioUrl) updateData.audio_url = audioUrl;
      if (imageUrl) updateData.image_url = imageUrl;
      if (videoUrl) updateData.video_url = videoUrl;
      
      // Add program type fields if provided
      if (hasVal(values.program_type)) {
        updateData.program_type = values.program_type;
      }
      if (hasVal(values.custom_program_type) && values.program_type === 'other') {
        updateData.custom_program_type = values.custom_program_type;
      }
      
      const result = await supabase
        .from('podcasts')
        .update(updateData)
        .eq('id', item.id);
      
      error = result.error;
    } else {
      // Try with all fields first, then fallback without new fields if they don't exist
      const baseData = {
        author_id: user.id,
        author_name: user.email.split('@')[0],
        audio_url: audioUrl,
        image_url: imageUrl,
        publish_date: new Date().toISOString().slice(0, 10),
        status: 'published',
      };

      if (hasVal(values.title)) baseData.title = values.title;
      if (hasVal(values.description)) baseData.description = values.description;
      if (hasVal(values.episode_number)) baseData.episode_number = safeInt(values.episode_number);
      if (hasVal(values.duration)) baseData.duration = values.duration;
      if (hasVal(values.host_name)) baseData.host_name = values.host_name;
      if (hasVal(values.guest_name)) baseData.guest_name = values.guest_name;
      if (hasVal(values.season)) baseData.season = values.season;
      const slugCreate = makeSlug(values.title);
      if (slugCreate) baseData.page_slug = slugCreate;
      
      // Add new fields if provided
      if (videoUrl) baseData.video_url = videoUrl;
      if (hasVal(values.program_type)) baseData.program_type = values.program_type;
      if (hasVal(values.custom_program_type) && values.program_type === 'other') {
        baseData.custom_program_type = values.custom_program_type;
      }
      
      let result = await supabase.from('podcasts').insert(baseData);
      
      // If insertion failed due to missing columns, retry with basic fields only
      if (result.error && result.error.message.includes('column')) {
        console.log('Retrying insert without new fields...');
        const fallbackData = {
          author_id: user.id,
          author_name: user.email.split('@')[0],
          audio_url: audioUrl,
          image_url: imageUrl,
          publish_date: new Date().toISOString().slice(0, 10),
          status: 'published',
        };
        if (hasVal(values.title)) fallbackData.title = values.title;
        if (hasVal(values.description)) fallbackData.description = values.description;
        if (hasVal(values.episode_number)) fallbackData.episode_number = safeInt(values.episode_number);
        if (hasVal(values.duration)) fallbackData.duration = values.duration;
        if (hasVal(values.host_name)) fallbackData.host_name = values.host_name;
        if (hasVal(values.guest_name)) fallbackData.guest_name = values.guest_name;
        if (hasVal(values.season)) fallbackData.season = values.season;
        const slugFallback = makeSlug(values.title);
        if (slugFallback) fallbackData.page_slug = slugFallback;
        result = await supabase.from('podcasts').insert(fallbackData);
      }
      
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
        setVideoFile(null);
        setUploadAsVideo(false);
        setProgramType('khutwa');
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
            
            <FormField
              control={form.control}
              name="program_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="arabic-font">نوع البرنامج</FormLabel>
                  <Select onValueChange={(value) => { field.onChange(value); setProgramType(value); }} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="arabic-body">
                        <SelectValue placeholder="اختر نوع البرنامج" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="khutwa">برنامج خطوة</SelectItem>
                      <SelectItem value="maqal">برنامج المقال</SelectItem>
                      <SelectItem value="ayan">برنامج أعيان</SelectItem>
                      <SelectItem value="other">أخرى</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {programType === 'other' && (
              <FormField
                control={form.control}
                name="custom_program_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="arabic-font">نوع البرنامج المخصص</FormLabel>
                    <FormControl>
                      <Input placeholder="أدخل نوع البرنامج" {...field} className="arabic-body" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Switch
                  id="upload-as-video"
                  checked={uploadAsVideo}
                  onCheckedChange={setUploadAsVideo}
                />
                <FormLabel htmlFor="upload-as-video" className="arabic-font">
                  رفع كفيديو أيضًا
                </FormLabel>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormItem>
                  <FormLabel className="arabic-font">الملف الصوتي</FormLabel>
                  <FormControl>
                    <LocalizedFileInput accept="audio/*" onChange={(files) => setAudioFile(files && files[0])} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
                
                <FormItem>
                  <FormLabel className="arabic-font">صورة الحلقة</FormLabel>
                  <FormControl>
                    <LocalizedFileInput accept="image/*" onChange={(files) => setImageFile(files && files[0])} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </div>
              
              {uploadAsVideo && (
                <FormItem>
                  <FormLabel className="arabic-font">ملف الفيديو (اختياري)</FormLabel>
                  <FormControl>
                    <LocalizedFileInput
                      accept="video/*"
                      onChange={(files) => {
                        const f = files && files[0];
                        if (!f) return;
                        if (!f.type || !f.type.startsWith('video/')) {
                          toast({
                            variant: 'destructive',
                            title: 'ملف غير صالح',
                            description: 'يرجى اختيار ملف فيديو صالح (video/*)'
                          });
                          return;
                        }
                        setVideoFile(f);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-sm text-gray-600 arabic-body mt-1">
                    سيتم رفع الفيديو إلى مكتبة Bunny Stream للعرض المباشر
                  </p>
                </FormItem>
              )}
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
