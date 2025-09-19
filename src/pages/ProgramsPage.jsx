import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Play, X } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { supabase } from "@/lib/customSupabaseClient";
import { Link } from "react-router-dom";
import BunnyVideoPlayer from "@/components/BunnyVideoPlayer";
import { getBunnyImageUrl } from "@/utils/bunnyImageUtils";

export default function Programs() {
  const { t, isArabic, isRTL } = useLanguage();
  const [programs, setPrograms] = useState([]);
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeEpisode, setActiveEpisode] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const [{ data: programsData, error: programsError }, { data: podcastsData, error: podcastsError }] = await Promise.all([
          supabase
            .from('programs')
            .select('*')
            .eq('status', 'published')
            .order('created_at', { ascending: false })
            .limit(12),
          supabase
            .from('podcasts')
            .select('*')
            .eq('status', 'published')
            .order('created_at', { ascending: false })
            .limit(12)
        ]);

        if (programsError) throw programsError;
        if (podcastsError) throw podcastsError;

        setPrograms(programsData || []);
        setPodcasts(podcastsData || []);
      } catch (e) {
        console.error('Failed to load programs/podcasts:', e);
        setError(e.message);
        setPrograms([]);
        setPodcasts([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const EmptyState = ({ text }) => (
    <div className="bg-[var(--sand-light)] border border-[var(--sand-dark)] rounded-xl p-8 text-center shadow-sm">
      <h3 className="text-xl font-semibold text-[var(--tent-black)] mb-2 modern-font">{text}</h3>
      <p className="text-[var(--deep-brown)]">لا توجد عناصر متاحة حالياً</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-4xl lg:text-5xl font-bold text-black font-arabic mb-3">{t('programsTitle')}</h1>
        <p className="text-lg text-black">{t('programsSubtitle')}</p>
      </div>

      {/* Programs Section */}
      <section className="mb-14">
        <h2 className="text-3xl font-bold text-sand-900 font-arabic mb-8 text-center">{t('featuredPrograms')}</h2>

        {loading ? (
          <div className="text-center py-8">جاري التحميل...</div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : programs.length === 0 ? (
          <EmptyState text="لا توجد برامج منشورة" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {programs.map((p) => (
              <Card key={p.id} className="rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 bg-white border">
                <CardContent className="p-6 text-black">
                  <Badge className="bg-white text-black border mb-3">{p.program_type || 'برنامج'}</Badge>
                  <h3 className="text-xl font-bold mb-2 font-arabic text-black">{p.title}</h3>
                  {p.description && (
                    <p className="text-sand-700 text-sm mb-4 leading-relaxed line-clamp-3">{p.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <Link to={`/programs/${p.page_slug || p.id}`} className="underline text-[var(--desert-brown)]">
                      تفاصيل البرنامج
                    </Link>
                    {p.episode_number && (
                      <span className="text-xs text-sand-600">حلقة #{p.episode_number}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Podcasts Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-sand-900 font-arabic">البودكاست</h2>
        </div>

        {loading ? (
          <div className="text-center py-8">جاري التحميل...</div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : podcasts.length === 0 ? (
          <EmptyState text="لا توجد حلقات بودكاست منشورة" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {podcasts.map((ep) => (
              <Card key={ep.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="secondary" className="bg-desert-100 text-desert-600">
                      {`حلقة #${ep.episode_number || ''}`.trim()}
                    </Badge>
                    <div className={`flex items-center text-sand-500 text-xs ${isRTL ? 'space-x-reverse space-x-1' : 'space-x-1'}`}>
                      <Calendar className="w-4 h-4" />
                      <span>{ep.created_at ? new Date(ep.created_at).toLocaleDateString(isArabic ? 'ar-AE' : 'fr-FR') : ''}</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-sand-900 mb-2 leading-tight font-arabic">{ep.title}</h3>
                  {ep.description && (
                    <p className="text-sand-600 text-sm mb-4 leading-relaxed line-clamp-3">{ep.description}</p>
                  )}

                  <div className="flex items-center justify-between">
                    <Link to={`/podcasts/${ep.page_slug || ep.id}`} className="text-[var(--desert-brown)] underline">
                      تفاصيل الحلقة
                    </Link>
                    <Button
                      className="bg-desert-500 hover:bg-desert-600 text-white"
                      size="sm"
                      onClick={() => setActiveEpisode(ep)}
                    >
                      <Play className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {ep.audio_url ? 'استمع' : ep.video_url ? 'شاهد' : 'شغل'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Lightweight Modal Player */}
      {activeEpisode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setActiveEpisode(null)}
          />
          {/* Modal content */}
          <div className="relative z-50 w-[95vw] max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="font-arabic text-lg font-semibold text-black truncate pr-2">
                {activeEpisode.title || 'تشغيل البودكاست'}
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setActiveEpisode(null)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            {/* Body */}
            <div className="p-0 bg-black">
              {/* Decide which player to render */}
              {activeEpisode.video_url ? (
                // Check if it's a Bunny CDN video
                (() => {
                  const videoUrl = activeEpisode.video_url;
                  const isBunnyVideo = videoUrl.includes('bunnycdn.com') || videoUrl.includes('b-cdn.net') || /^[a-f0-9-]{36}$/i.test(videoUrl);
                  
                  console.log('Video analysis:', {
                    videoUrl,
                    isBunnyVideo,
                    cdnHostname: import.meta.env.VITE_BUNNY_VIDEO_CDN_HOSTNAME,
                    libraryId: import.meta.env.VITE_BUNNY_VIDEO_LIBRARY_ID
                  });
                  
                  if (isBunnyVideo) {
                    const videoId = videoUrl.includes('http') ? 
                      videoUrl.split('/').pop().replace(/\.(mp4|webm|ogg)$/, '') : 
                      videoUrl;
                    
                    return (
                      <BunnyVideoPlayer
                        videoId={videoId}
                        title={activeEpisode.title}
                        poster={activeEpisode.image_url ? getBunnyImageUrl(activeEpisode.image_url) : undefined}
                        className="w-full aspect-video"
                        autoplay
                      />
                    );
                  } else {
                    return (
                      <video
                        controls
                        autoPlay
                        className="w-full aspect-video"
                        poster={activeEpisode.image_url ? getBunnyImageUrl(activeEpisode.image_url) : undefined}
                        onError={(e) => console.error('Video error:', e)}
                        onLoadStart={() => console.log('Video load started')}
                        onLoadedData={() => console.log('Video loaded successfully')}
                      >
                        <source src={videoUrl} type="video/mp4" />
                        <source src={videoUrl} type="video/webm" />
                        متصفحك لا يدعم تشغيل الفيديو
                      </video>
                    );
                  }
                })()
              ) : activeEpisode.audio_url ? (
                <div className="p-4">
                  <audio
                    controls
                    autoPlay
                    className="w-full"
                    onError={(e) => console.error('Audio error:', e)}
                    onLoadStart={() => console.log('Audio load started')}
                    onLoadedData={() => console.log('Audio loaded successfully')}
                  >
                    <source src={activeEpisode.audio_url} type="audio/mpeg" />
                    <source src={activeEpisode.audio_url} type="audio/mp4" />
                    <source src={activeEpisode.audio_url} type="audio/wav" />
                    متصفحك لا يدعم تشغيل الصوت
                  </audio>
                </div>
              ) : (
                <div className="p-6 text-center text-white">
                  <p className="mb-2">لا توجد وسائط للتشغيل.</p>
                  <p className="text-sm text-gray-400">
                    تأكد من أن الحلقة تحتوي على رابط فيديو أو صوت صحيح.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
