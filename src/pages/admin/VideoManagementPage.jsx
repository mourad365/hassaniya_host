import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import LocalizedFileInput from '@/components/ui/LocalizedFileInput';
import { 
  PlusCircle, 
  Upload, 
  Play, 
  Trash2, 
  Edit, 
  Eye, 
  Clock, 
  Calendar,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const VideoManagementPage = () => {
  const { toast } = useToast();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Bunny CDN configuration from memory
  const libraryId = import.meta.env.VITE_BUNNY_VIDEO_LIBRARY_ID || '493708';
  const apiKey = import.meta.env.VITE_BUNNY_VIDEO_API_KEY || '4e19874d-4ee6-4f16-a29864485e6d-7a39-481e';
  const cdnHostname = import.meta.env.VITE_BUNNY_VIDEO_CDN_HOSTNAME || 'vz-a9578edc-805.b-cdn.net';

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file: null
  });

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://video.bunnycdn.com/library/${libraryId}/videos`,
        {
          headers: {
            'AccessKey': apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }

      const data = await response.json();
      setVideos(data.items || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast({
        variant: "destructive",
        title: "خطأ في تحميل الفيديوهات",
        description: error.message
      });
      
      // Fallback to mock data for development
      setVideos([
        {
          guid: 'mock-1',
          title: 'مقدمة في التراث الحساني',
          description: 'فيديو تعريفي بالتراث الحساني وأهميته الثقافية',
          dateUploaded: '2024-01-15T10:00:00Z',
          views: 1250,
          length: 1800,
          status: 4,
          thumbnailFileName: 'thumb1.jpg'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!formData.file || !formData.title) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة"
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
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
            title: formData.title
          })
        }
      );

      if (!createResponse.ok) {
        throw new Error('فشل في إنشاء الفيديو');
      }

      const videoData = await createResponse.json();
      setUploadProgress(25);

      // Step 2: Upload video file
      const uploadResponse = await fetch(
        `https://video.bunnycdn.com/library/${libraryId}/videos/${videoData.guid}`,
        {
          method: 'PUT',
          headers: {
            'AccessKey': apiKey,
            'Content-Type': 'application/octet-stream'
          },
          body: formData.file
        }
      );

      if (!uploadResponse.ok) {
        throw new Error('فشل في رفع الفيديو');
      }

      setUploadProgress(75);

      // Step 3: Update video metadata
      const updateResponse = await fetch(
        `https://video.bunnycdn.com/library/${libraryId}/videos/${videoData.guid}`,
        {
          method: 'POST',
          headers: {
            'AccessKey': apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: formData.title,
            description: formData.description
          })
        }
      );

      if (!updateResponse.ok) {
        console.warn('فشل في تحديث البيانات التوصيفية');
      }

      setUploadProgress(100);

      toast({
        title: "✅ نجح الرفع",
        description: "تم رفع الفيديو بنجاح!"
      });

      // Reset form and refresh videos
      setFormData({ title: '', description: '', file: null });
      setShowUploadForm(false);
      fetchVideos();

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        variant: "destructive",
        title: "فشل الرفع",
        description: error.message
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const deleteVideo = async (videoId) => {
    try {
      const response = await fetch(
        `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`,
        {
          method: 'DELETE',
          headers: {
            'AccessKey': apiKey
          }
        }
      );

      if (!response.ok) {
        throw new Error('فشل في حذف الفيديو');
      }

      toast({
        title: "✅ تم الحذف",
        description: "تم حذف الفيديو بنجاح"
      });

      fetchVideos();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "فشل الحذف",
        description: error.message
      });
    }
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 0: return { label: 'في الانتظار', color: 'bg-yellow-100 text-yellow-800' };
      case 1: return { label: 'قيد المعالجة', color: 'bg-blue-100 text-blue-800' };
      case 2: return { label: 'يتم التشفير', color: 'bg-purple-100 text-purple-800' };
      case 3: return { label: 'انتهى', color: 'bg-red-100 text-red-800' };
      case 4: return { label: 'جاهز', color: 'bg-green-100 text-green-800' };
      case 5: return { label: 'فشل', color: 'bg-red-100 text-red-800' };
      default: return { label: 'غير معروف', color: 'bg-gray-100 text-gray-800' };
    }
  };

  return (
    <>
      <Helmet>
        <title>إدارة الفيديوهات - الحسانية</title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold arabic-title text-[var(--tent-black)]">
              إدارة الفيديوهات
            </h1>
            <p className="text-[var(--deep-brown)] arabic-body mt-1">
              رفع وإدارة مكتبة الفيديوهات عبر Bunny CDN
            </p>
          </div>
          <Button 
            onClick={() => setShowUploadForm(!showUploadForm)} 
            className="btn-heritage modern-font flex items-center space-x-2 space-x-reverse"
          >
            <PlusCircle size={20} />
            <span>رفع فيديو جديد</span>
          </Button>
        </div>

        {/* Upload Form */}
        {showUploadForm && (
          <Card className="heritage-card">
            <CardHeader>
              <CardTitle className="arabic-title text-xl flex items-center gap-2">
                <Upload size={20} />
                رفع فيديو جديد
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFileUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium arabic-body mb-2">
                    عنوان الفيديو *
                  </label>
                  <Input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="أدخل عنوان الفيديو"
                    className="arabic-body"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium arabic-body mb-2">
                    وصف الفيديو
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="وصف مختصر للفيديو"
                    className="arabic-body"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium arabic-body mb-2">
                    ملف الفيديو *
                  </label>
                  <LocalizedFileInput
                    accept="video/*"
                    onChange={(files) => setFormData({...formData, file: files && files[0]})}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    صيغ مدعومة: MP4, AVI, MOV, WMV (الحد الأقصى: 500MB)
                  </p>
                </div>

                {uploading && (
                  <div className="space-y-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-[var(--heritage-gold)] h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-center text-sm arabic-body">
                      جاري الرفع... {uploadProgress}%
                    </p>
                  </div>
                )}

                <div className="flex justify-end space-x-4 space-x-reverse">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowUploadForm(false)}
                    disabled={uploading}
                  >
                    إلغاء
                  </Button>
                  <Button 
                    type="submit" 
                    className="btn-heritage" 
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        جاري الرفع...
                      </>
                    ) : (
                      <>
                        <Upload className="ml-2 h-4 w-4" />
                        رفع الفيديو
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Videos List */}
        <Card>
          <CardHeader>
            <CardTitle className="arabic-title">قائمة الفيديوهات</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-[var(--deep-brown)] modern-font">جاري تحميل الفيديوهات...</p>
              </div>
            ) : videos.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-[var(--deep-brown)] modern-font">لا توجد فيديوهات</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {videos.map((video) => {
                  const status = getStatusLabel(video.status);
                  return (
                    <div key={video.guid} className="border border-[var(--sand-dark)] rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-[var(--tent-black)] arabic-title mb-1">
                            {video.title}
                          </h3>
                          {video.description && (
                            <p className="text-sm text-[var(--deep-brown)] arabic-body line-clamp-2">
                              {video.description}
                            </p>
                          )}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 ml-1" />
                          {formatDate(video.dateUploaded)}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 ml-1" />
                          {formatDuration(video.length || 0)}
                        </div>
                        <div className="flex items-center">
                          <Eye className="h-4 w-4 ml-1" />
                          {video.views || 0} مشاهدة
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 ml-1" />
                          ID: {video.guid.substring(0, 8)}...
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2 space-x-reverse">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`https://${cdnHostname}/${video.guid}/play_720p.mp4`, '_blank')}
                          className="text-green-600 hover:text-green-800"
                          disabled={video.status !== 4}
                        >
                          <Play size={16} className="ml-1" />
                          تشغيل
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteVideo(video.guid)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={16} className="ml-1" />
                          حذف
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default VideoManagementPage;
