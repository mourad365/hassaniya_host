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

const formSchema = z.object({
  title: z.string().min(5, { message: 'العنوان يجب أن يكون 5 أحرف على الأقل' }),
  content: z.string().min(20, { message: 'المحتوى يجب أن يكون 20 حرفًا على الأقل' }),
  excerpt: z.string().min(10, { message: 'المقتطف يجب أن يكون 10 أحرف على الأقل' }),
  category_id: z.string().nonempty({ message: 'الرجاء اختيار فئة' }),
  image: z.any().optional(),
});

const ArticleForm = ({ onSuccess, onCancel }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [imageFile, setImageFile] = useState(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      content: '',
      excerpt: '',
      category_id: '',
    },
  });

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from('categories').select('id, name');
      if (!error) {
        setCategories(data);
      }
    };
    fetchCategories();
  }, []);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const onSubmit = async (values) => {
    setLoading(true);
    let imageUrl = null;

    if (imageFile) {
      try {
        const fileName = `${Date.now()}_${imageFile.name}`;
        
        // Direct upload to Bunny CDN Storage API
        const uploadResponse = await fetch(`https://storage.bunnycdn.com/${import.meta.env.VITE_BUNNY_STORAGE_ZONE || 'hassaniya'}/${fileName}`, {
          method: 'PUT',
          headers: {
            'AccessKey': import.meta.env.VITE_BUNNY_STORAGE_API_KEY || 'your-bunny-storage-api-key',
            'Content-Type': imageFile.type,
          },
          body: imageFile,
        });

        if (!uploadResponse.ok) {
          throw new Error(`Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
        }
        
        imageUrl = `${import.meta.env.VITE_BUNNY_CDN_URL || 'https://hassaniya.b-cdn.net'}/${fileName}`;
        
      } catch (error) {
        console.warn('Image upload error:', error);
        toast({ 
          variant: "default", 
          title: "تحذير", 
          description: "تم حفظ المقال بدون صورة. مشكلة في رفع الصورة." 
        });
        imageUrl = null;
      }
    }

    const { error } = await supabase.from('articles').insert({
      title: values.title,
      content: values.content,
      excerpt: values.excerpt,
      category_id: parseInt(values.category_id),
      author_id: user.id,
      author_name: user.email.split('@')[0],
      image_url: imageUrl,
      publish_date: new Date().toISOString().slice(0, 10),
      status: 'published',
      page_slug: values.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
    });

    if (error) {
      toast({ variant: "destructive", title: "فشل إنشاء المقال", description: error.message });
    } else {
      toast({ title: "✅ نجاح", description: "تم إنشاء المقال بنجاح!" });
      form.reset();
      setImageFile(null);
      if (onSuccess) onSuccess();
    }
    setLoading(false);
  };

  return (
    <Card className="heritage-card my-6">
      <CardHeader>
        <CardTitle className="arabic-title text-2xl">مقال جديد</CardTitle>
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
                    <Input placeholder="عنوان المقال" {...field} className="arabic-body" />
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
                    <Textarea placeholder="مقتطف قصير عن المقال" {...field} className="arabic-body" />
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
                    <Textarea placeholder="محتوى المقال الكامل" rows={10} {...field} className="arabic-body" />
                  </FormControl>
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
                      <FormControl>
                        <SelectTrigger className="arabic-body">
                          <SelectValue placeholder="اختر فئة" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={String(cat.id)} className="arabic-body">{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem>
                <FormLabel className="arabic-font">صورة المقال</FormLabel>
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
                {loading ? 'جاري الحفظ...' : 'حفظ المقال'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ArticleForm;