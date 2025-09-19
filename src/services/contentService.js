/**
 * Content Service for fetching detailed content by slug or ID
 */

import { supabase } from '@/lib/customSupabaseClient';

export const contentService = {
  async getArticleBySlug(slug) {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          category:categories(name, slug)
        `)
        .eq('page_slug', slug)
        .eq('status', 'published')
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Get article by slug error:', error);
      return null;
    }
  },

  async getNewsBySlug(slug) {
    try {
      const { data, error } = await supabase
        .from('news')
        .select(`
          *,
          category:categories(name, slug)
        `)
        .eq('page_slug', slug)
        .eq('status', 'published')
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Get news by slug error:', error);
      return null;
    }
  },

  async getProgramBySlug(slug) {
    try {
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .eq('page_slug', slug)
        .eq('status', 'published')
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Get program by slug error:', error);
      return null;
    }
  },

  async getPodcastBySlug(slug) {
    try {
      const { data, error } = await supabase
        .from('podcasts')
        .select('*')
        .eq('page_slug', slug)
        .eq('status', 'published')
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Get podcast by slug error:', error);
      return null;
    }
  },

  async getCoverageBySlug(slug) {
    try {
      const { data, error } = await supabase
        .from('coverage')
        .select('*')
        .eq('page_slug', slug)
        .eq('status', 'published')
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Get coverage by slug error:', error);
      return null;
    }
  },

  async getRelatedContent(contentType, categoryId, currentId, limit = 4) {
    try {
      let query;
      
      switch (contentType) {
        case 'article':
          query = supabase
            .from('articles')
            .select('id, title, excerpt, image_url, page_slug, publish_date')
            .eq('status', 'published')
            .neq('id', currentId);
          
          if (categoryId) {
            query = query.eq('category_id', categoryId);
          }
          break;
          
        case 'news':
          query = supabase
            .from('news')
            .select('id, title, excerpt, image_url, page_slug, publish_date')
            .eq('status', 'published')
            .neq('id', currentId);
          
          if (categoryId) {
            query = query.eq('category_id', categoryId);
          }
          break;
          
        case 'program':
          query = supabase
            .from('programs')
            .select('id, title, description, image_url, page_slug, publish_date, program_type')
            .eq('status', 'published')
            .neq('id', currentId);
          break;
          
        case 'podcast':
          query = supabase
            .from('podcasts')
            .select('id, title, description, image_url, page_slug, publish_date, episode_number')
            .eq('status', 'published')
            .neq('id', currentId);
          break;
          
        case 'coverage':
          query = supabase
            .from('coverage')
            .select('id, title, excerpt, image_url, page_slug, publish_date, coverage_type')
            .eq('status', 'published')
            .neq('id', currentId);
          break;
          
        default:
          return [];
      }
      
      const { data, error } = await query
        .order('publish_date', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get related content error:', error);
      return [];
    }
  },

  async searchContent(query, contentTypes = ['article', 'news', 'program', 'podcast', 'coverage'], limit = 20) {
    try {
      const results = [];
      
      for (const type of contentTypes) {
        let tableName;
        let selectFields = 'id, title, page_slug, publish_date, image_url';
        
        switch (type) {
          case 'article':
            tableName = 'articles';
            selectFields += ', excerpt, category_id';
            break;
          case 'news':
            tableName = 'news';
            selectFields += ', excerpt, category_id';
            break;
          case 'program':
            tableName = 'programs';
            selectFields += ', description, program_type';
            break;
          case 'podcast':
            tableName = 'podcasts';
            selectFields += ', description, episode_number';
            break;
          case 'coverage':
            tableName = 'coverage';
            selectFields += ', excerpt, coverage_type';
            break;
          default:
            continue;
        }
        
        const { data, error } = await supabase
          .from(tableName)
          .select(selectFields)
          .eq('status', 'published')
          .or(`title.ilike.%${query}%,content.ilike.%${query}%,description.ilike.%${query}%,excerpt.ilike.%${query}%`)
          .order('publish_date', { ascending: false })
          .limit(Math.ceil(limit / contentTypes.length));
        
        if (!error && data) {
          results.push(...data.map(item => ({ ...item, content_type: type })));
        }
      }
      
      // Sort all results by publish_date
      return results
        .sort((a, b) => new Date(b.publish_date) - new Date(a.publish_date))
        .slice(0, limit);
    } catch (error) {
      console.error('Search content error:', error);
      return [];
    }
  }
};

export default contentService;
