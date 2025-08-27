import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Clock, Calendar, Users } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export default function Programs() {
  const { t, isArabic, isRTL } = useLanguage();
  const [programs, setPrograms] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for programs
  const mockPrograms = [
    {
      id: 1,
      name: "صوت الصحراء",
      nameFr: "Voix du Désert",
      description: "بودكاست يستكشف تاريخ وثقافة الصحراء الغربية",
      descriptionFr: "Un podcast explorant l'histoire et la culture du Sahara occidental",
      type: "podcast",
      color: "#DC2626"
    },
    {
      id: 2,
      name: "حكايات الحسانية",
      nameFr: "Contes Hassanis",
      description: "برنامج تلفزيوني يروي قصص وحكايات التراث الحساني",
      descriptionFr: "Émission télévisée racontant les histoires du patrimoine hassani",
      type: "tv_show",
      color: "#2563EB"
    },
    {
      id: 3,
      name: "لقاء الأجيال",
      nameFr: "Rencontre des Générations",
      description: "مقابلات مع كبار السن لحفظ التراث الشفهي",
      descriptionFr: "Interviews avec les anciens pour préserver le patrimoine oral",
      type: "interview",
      color: "#059669"
    },
    {
      id: 4,
      name: "معارف الصحراء",
      nameFr: "Savoirs du Désert",
      description: "برنامج معرفي يعلم اللهجة والتقاليد الحسانية",
      descriptionFr: "Programme éducatif enseignant le dialecte et les traditions hassanis",
      type: "knowledge",
      color: "#7C3AED"
    }
  ];

  // Mock data for episodes
  const mockEpisodes = [
    {
      id: 1,
      title: "تاريخ القبائل الحسانية",
      titleFr: "Histoire des tribus hassanies",
      description: "استكشاف عميق لتاريخ وأصول القبائل الحسانية في الصحراء الغربية",
      descriptionFr: "Exploration approfondie de l'histoire et des origines des tribus hassanies",
      duration: "45 دقيقة",
      episodeNumber: 1,
      publishedAt: "2024-01-15",
      audioUrl: "audio.mp3"
    },
    {
      id: 2,
      title: "الشعر الحساني المعاصر",
      titleFr: "Poésie hassanie contemporaine",
      description: "لقاء مع شعراء حسانيين معاصرين ومناقشة أعمالهم الأدبية",
      descriptionFr: "Rencontre avec des poètes hassanis contemporains",
      duration: "38 دقيقة",
      episodeNumber: 2,
      publishedAt: "2024-01-22",
      videoUrl: "video.mp4"
    },
    {
      id: 3,
      title: "التراث الموسيقي الحساني",
      titleFr: "Patrimoine musical hassani",
      description: "رحلة في عالم الموسيقى التقليدية الحسانية وآلاتها الموسيقية",
      descriptionFr: "Voyage dans le monde de la musique traditionnelle hassanie",
      duration: "52 دقيقة",
      episodeNumber: 3,
      publishedAt: "2024-01-29",
      audioUrl: "audio.mp3"
    },
    {
      id: 4,
      title: "المرأة في المجتمع الحساني",
      titleFr: "La femme dans la société hassanie",
      description: "دور المرأة في المجتمع الحساني التقليدي والمعاصر",
      descriptionFr: "Le rôle de la femme dans la société hassanie traditionnelle et contemporaine",
      duration: "41 دقيقة",
      episodeNumber: 4,
      publishedAt: "2024-02-05",
      videoUrl: "video.mp4"
    },
    {
      id: 5,
      title: "الحرف التقليدية الحسانية",
      titleFr: "Artisanat traditionnel hassani",
      description: "استكشاف الحرف والصناعات التقليدية في الثقافة الحسانية",
      descriptionFr: "Exploration de l'artisanat et des industries traditionnelles",
      duration: "35 دقيقة",
      episodeNumber: 5,
      publishedAt: "2024-02-12",
      audioUrl: "audio.mp3"
    },
    {
      id: 6,
      title: "اللغة الحسانية ومستقبلها",
      titleFr: "La langue hassanie et son avenir",
      description: "مناقشة حول مستقبل اللغة الحسانية في العصر الرقمي",
      descriptionFr: "Discussion sur l'avenir de la langue hassanie à l'ère numérique",
      duration: "47 دقيقة",
      episodeNumber: 6,
      publishedAt: "2024-02-19",
      videoUrl: "video.mp4"
    }
  ];

  // Simulate loading data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPrograms(mockPrograms);
      setEpisodes(mockEpisodes);
      setIsLoading(false);
    };

    loadData();
  }, []);

  const getIcon = (type) => {
    const icons = {
      podcast: "fas fa-microphone",
      tv_show: "fas fa-tv",
      interview: "fas fa-users",
      knowledge: "fas fa-book",
    };
    return icons[type] || "fas fa-play";
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'podcast':
        return t('typePodcast');
      case 'tv_show':
        return t('typeTvShow');
      case 'interview':
        return t('typeInterview');
      case 'knowledge':
        return t('typeKnowledge');
      default:
        return type;
    }
  };

  const getButtonAction = (type) => {
    switch (type) {
      case 'podcast':
        return t('ctaListenNow');
      case 'tv_show':
        return t('ctaWatchNow');
      case 'interview':
        return t('ctaSeeInterviews');
      case 'knowledge':
        return t('ctaExploreKnowledge');
      default:
        return t('ctaWatchNow');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse">
          <div className="h-10 bg-sand-200 rounded w-48 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-sand-200 rounded-xl h-64"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg p-6">
                <div className="h-4 bg-sand-200 rounded mb-3"></div>
                <div className="h-6 bg-sand-200 rounded mb-3"></div>
                <div className="h-16 bg-sand-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <div className="relative h-64 rounded-2xl overflow-hidden mb-8 bg-white">
          <img 
            src="https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=1200&h=400" 
            alt="برامج الحسانية" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 to-white flex items-center justify-center">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-black font-arabic mb-4">
                {t('programsTitle')}
              </h1>
              <p className="text-xl text-black max-w-2xl">
                {t('programsSubtitle')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Programs Grid */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-sand-900 font-arabic mb-8 text-center">
          {t('featuredPrograms')}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {programs?.map((program) => (
            <Card 
              key={program.id} 
              className="rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-white border-2"
              style={{ borderColor: program.color || '#DC2626' }}
            >
              <CardContent className="p-6 text-black text-center">
                <i className={`${getIcon(program.type)} text-4xl mb-4`} style={{ color: program.color || '#DC2626' }}></i>
                <Badge className="bg-white text-black border mb-3" style={{ borderColor: program.color || '#DC2626' }} data-testid={`program-type-${program.id}`}>
                  {getTypeLabel(program.type)}
                </Badge>
                <h3 className="text-xl font-bold mb-3 font-arabic text-black">
                  {isArabic ? program.name : (program.nameFr || program.name)}
                </h3>
                <p className="text-sand-700 text-sm mb-6 leading-relaxed">
                  {isArabic ? program.description : (program.descriptionFr || program.description)}
                </p>
                <Button 
                  className="bg-white text-black hover:bg-sand-50 transition-colors w-full border"
                  style={{ borderColor: program.color || '#DC2626' }}
                  data-testid={`program-cta-${program.id}`}
                >
                  {getButtonAction(program.type)}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Latest Episodes */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-sand-900 font-arabic">
            {t('latestEpisodes')}
          </h2>
          <Button variant="outline" data-testid="view-all-episodes">
            {t('viewAllEpisodes')}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {episodes?.map((episode) => (
            <Card key={episode.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="secondary" className="bg-desert-100 text-desert-600">
                    {`${t('episode')} #${episode.episodeNumber || ''}`.trim()}
                  </Badge>
                  <div className={`flex items-center text-sand-500 text-sm ${isRTL ? 'space-x-reverse space-x-1' : 'space-x-1'}`}>
                    <Clock className="w-4 h-4" />
                    <span>{episode.duration || t('unspecified')}</span>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-sand-900 mb-3 leading-tight font-arabic">
                  {isArabic ? episode.title : (episode.titleFr || episode.title)}
                </h3>
                
                {episode.description && (
                  <p className="text-sand-600 text-sm mb-4 leading-relaxed line-clamp-3">
                    {isArabic ? episode.description : (episode.descriptionFr || episode.description)}
                  </p>
                )}
                
                <div className="flex items-center justify-between">
                  <Button 
                    className="bg-desert-500 hover:bg-desert-600 text-white"
                    size="sm"
                    data-testid={`play-episode-${episode.id}`}
                  >
                    <Play className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {episode.audioUrl 
                      ? t('listen') 
                      : episode.videoUrl 
                      ? t('watch') 
                      : t('play')}
                  </Button>
                  
                  {episode.publishedAt && (
                    <div className={`flex items-center text-sand-500 text-xs ${isRTL ? 'space-x-reverse space-x-1' : 'space-x-1'}`}>
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(episode.publishedAt).toLocaleDateString(isArabic ? 'ar-AE' : 'fr-FR')}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Program Categories */}
      <div className="bg-gradient-to-br from-sand-100 to-sand-200 rounded-xl p-8">
        <h2 className="text-3xl font-bold text-sand-900 font-arabic mb-8 text-center">
          {t('programTypes')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
              <i className="fas fa-microphone"></i>
            </div>
            <h4 className="font-bold text-lg text-sand-900 mb-2">
              {t('podcasts')}
            </h4>
            <p className="text-sand-700 text-sm">
              {t('podcastsDescription')}
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
              <i className="fas fa-tv"></i>
            </div>
            <h4 className="font-bold text-lg text-sand-900 mb-2">
              {t('tvShows')}
            </h4>
            <p className="text-sand-700 text-sm">
              {t('tvShowsDescription')}
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
              <i className="fas fa-users"></i>
            </div>
            <h4 className="font-bold text-lg text-sand-900 mb-2">
              {t('interviews')}
            </h4>
            <p className="text-sand-700 text-sm">
              {t('interviewsDescription')}
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-500 text-white rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
              <i className="fas fa-book"></i>
            </div>
            <h4 className="font-bold text-lg text-sand-900 mb-2">
              {t('educationalPrograms')}
            </h4>
            <p className="text-sand-700 text-sm">
              {t('educationalProgramsDescription')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
