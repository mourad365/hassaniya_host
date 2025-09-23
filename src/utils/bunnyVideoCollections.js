// Utility for Bunny Video Library collections and access configuration
// Reads mapping from environment variables and exposes helpers

export function getCollectionMapping() {
  return {
    // General
    coverages: (import.meta.env.VITE_BUNNY_COLLECTION_COVERAGES || '').trim(),
    news: (import.meta.env.VITE_BUNNY_COLLECTION_NEWS || '').trim(),
    adverts: (import.meta.env.VITE_BUNNY_COLLECTION_ADVERTS || '').trim(),

    // Podcasts / Programs
    podcast_akwabir: (import.meta.env.VITE_BUNNY_COLLECTION_PODCAST_AKWABIR || '').trim(),
    khutwa: (import.meta.env.VITE_BUNNY_COLLECTION_KHUTWA || '').trim(),
    elhoughoul: (import.meta.env.VITE_BUNNY_COLLECTION_ELHOUGHOUL || '').trim(),
    aayan: (import.meta.env.VITE_BUNNY_COLLECTION_AAYAN || '').trim(),

    // Legacy keys for backward-compatibility
    a3yan: (import.meta.env.VITE_BUNNY_COLLECTION_A3YAN || '').trim(),
    akwabir: (import.meta.env.VITE_BUNNY_COLLECTION_AKWABIR || '').trim(),
    programs: (import.meta.env.VITE_BUNNY_COLLECTION_PROGRAMS || '').trim(),
  };
}

// Friendly options for UI selects
export function getCollectionOptions() {
  const entries = listAvailableCollections();
  const labels = {
    coverages: 'التغطيات',
    news: 'الأخبار',
    adverts: 'الإعلانات',
    podcast_akwabir: 'بودكاست  آكوابير',
    khutwa: 'برنامج خطوة',
    elhoughoul: 'برنامج  الحقول',
    aayan: 'برنامج أعيان',
    programs: 'أخرى',
    // legacy
    a3yan: 'برنامج أعيان (قديم)',
    akwabir: ' آكوابير (قديم)',
  };
  return entries.map(({ key, id }) => ({ key, id, label: labels[key] || key }));
}

export function getCollectionIdByKey(key) {
  const map = getCollectionMapping();
  return map[key] || '';
}

export function listAvailableCollections() {
  const map = getCollectionMapping();
  return Object.entries(map)
    .filter(([, id]) => !!id)
    .map(([key, id]) => ({ key, id }));
}

export function getDefaultAccessMode() {
  const mode = (import.meta.env.VITE_BUNNY_VIDEO_DEFAULT_ACCESS || 'public').toLowerCase();
  return mode === 'token' ? 'token' : 'public';
}

export function getVideoToken() {
  // Playback tokens must be created explicitly for token-based access.
  // Never use the API key as a playback token.
  const token = (import.meta.env.VITE_BUNNY_VIDEO_TOKEN || '').trim();
  return token;
}

export function shouldUseAuthentication() {
  // Only use authentication when default mode is token and a playback token is provided
  const token = (import.meta.env.VITE_BUNNY_VIDEO_TOKEN || '').trim();
  return getDefaultAccessMode() === 'token' && !!token;
}

// Podcast program type -> Bunny collection mapping helper
export function getCollectionIdForPodcast(programType) {
  const type = (programType || '').toLowerCase();
  switch (type) {
    case 'khutwa':
      return getCollectionIdByKey('khutwa');
    case 'ayan':
      // Aayan program
      return getCollectionIdByKey('aayan') || getCollectionIdByKey('a3yan');
    case 'maqal':
      // If you intend Maqal to appear under News
      return getCollectionIdByKey('news') || getCollectionIdByKey('programs');
    default:
      return '';
  }
}
