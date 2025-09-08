/**
 * Interaction Service for likes, comments, bookmarks, and social features
 */

import { supabase } from '@/lib/customSupabaseClient';

// Likes functionality
export const likeService = {
  async toggleLike(targetType, targetId, userId) {
    try {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from('likes')
        .select('id')
        .eq('target_type', targetType)
        .eq('target_id', targetId)
        .eq('user_id', userId)
        .single();

      if (existingLike) {
        // Unlike
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('id', existingLike.id);
        
        if (error) throw error;
        return { liked: false, action: 'unliked' };
      } else {
        // Like
        const { error } = await supabase
          .from('likes')
          .insert({
            target_type: targetType,
            target_id: targetId,
            user_id: userId
          });
        
        if (error) throw error;
        return { liked: true, action: 'liked' };
      }
    } catch (error) {
      console.error('Toggle like error:', error);
      throw new Error('Failed to update like status');
    }
  },

  async getLikeCount(targetType, targetId) {
    try {
      const { count, error } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('target_type', targetType)
        .eq('target_id', targetId);
      
      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Get like count error:', error);
      return 0;
    }
  },

  async isLikedByUser(targetType, targetId, userId) {
    if (!userId) return false;
    
    try {
      const { data, error } = await supabase
        .from('likes')
        .select('id')
        .eq('target_type', targetType)
        .eq('target_id', targetId)
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    } catch (error) {
      console.error('Check like status error:', error);
      return false;
    }
  }
};

// Comments functionality
export const commentService = {
  async addComment(targetType, targetId, content, userId, parentId = null) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          target_type: targetType,
          target_id: targetId,
          content: content.trim(),
          user_id: userId,
          parent_id: parentId,
          status: 'published'
        })
        .select(`
          *,
          user:auth.users(email)
        `)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Add comment error:', error);
      throw new Error('Failed to add comment');
    }
  },

  async getComments(targetType, targetId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user:auth.users(email)
        `)
        .eq('target_type', targetType)
        .eq('target_id', targetId)
        .eq('status', 'published')
        .order('created_at', { ascending: true })
        .limit(limit);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get comments error:', error);
      return [];
    }
  },

  async getCommentCount(targetType, targetId) {
    try {
      const { count, error } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('target_type', targetType)
        .eq('target_id', targetId)
        .eq('status', 'published');
      
      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Get comment count error:', error);
      return 0;
    }
  },

  async deleteComment(commentId, userId) {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', userId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Delete comment error:', error);
      throw new Error('Failed to delete comment');
    }
  }
};

// Newsletter functionality
export const newsletterService = {
  async subscribe(email, locale = 'ar') {
    try {
      const { data, error } = await supabase
        .from('newsletter_subscriptions')
        .insert({
          email: email.toLowerCase().trim(),
          locale,
          verified: true // For now, skip email verification
        })
        .select()
        .single();
      
      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          throw new Error('Email already subscribed');
        }
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Newsletter subscribe error:', error);
      throw error;
    }
  },

  async unsubscribe(email) {
    try {
      const { error } = await supabase
        .from('newsletter_subscriptions')
        .delete()
        .eq('email', email.toLowerCase().trim());
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Newsletter unsubscribe error:', error);
      throw new Error('Failed to unsubscribe');
    }
  },

  async isSubscribed(email) {
    try {
      const { data, error } = await supabase
        .from('newsletter_subscriptions')
        .select('id')
        .eq('email', email.toLowerCase().trim())
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    } catch (error) {
      console.error('Check subscription error:', error);
      return false;
    }
  }
};

// Bookmark functionality
export const bookmarkService = {
  async toggleBookmark(targetType, targetId, userId) {
    try {
      const { data: existingBookmark } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('target_type', targetType)
        .eq('target_id', targetId)
        .eq('user_id', userId)
        .single();

      if (existingBookmark) {
        // Remove bookmark
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('id', existingBookmark.id);
        
        if (error) throw error;
        return { bookmarked: false, action: 'removed' };
      } else {
        // Add bookmark
        const { error } = await supabase
          .from('bookmarks')
          .insert({
            target_type: targetType,
            target_id: targetId,
            user_id: userId
          });
        
        if (error) throw error;
        return { bookmarked: true, action: 'added' };
      }
    } catch (error) {
      console.error('Toggle bookmark error:', error);
      throw new Error('Failed to update bookmark status');
    }
  },

  async isBookmarkedByUser(targetType, targetId, userId) {
    if (!userId) return false;
    
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('target_type', targetType)
        .eq('target_id', targetId)
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    } catch (error) {
      console.error('Check bookmark status error:', error);
      return false;
    }
  },

  async getUserBookmarks(userId, targetType = null) {
    try {
      let query = supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (targetType) {
        query = query.eq('target_type', targetType);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get user bookmarks error:', error);
      return [];
    }
  }
};

// Share tracking
export const shareService = {
  async trackShare(targetType, targetId, platform, userId = null) {
    try {
      const { error } = await supabase
        .from('shares')
        .insert({
          target_type: targetType,
          target_id: targetId,
          platform,
          user_id: userId
        });
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Track share error:', error);
      // Don't throw error for analytics tracking
      return false;
    }
  },

  generateShareUrl(targetType, targetId, title) {
    const baseUrl = window.location.origin;
    const slug = title?.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '') || targetId;
    
    switch (targetType) {
      case 'article':
        return `${baseUrl}/articles/${slug}`;
      case 'news':
        return `${baseUrl}/news/${slug}`;
      case 'program':
        return `${baseUrl}/programs/${slug}`;
      case 'podcast':
        return `${baseUrl}/podcasts/${slug}`;
      case 'coverage':
        return `${baseUrl}/coverage/${slug}`;
      default:
        return baseUrl;
    }
  },

  async shareToSocial(targetType, targetId, title, platform, userId = null) {
    const url = this.generateShareUrl(targetType, targetId, title);
    const text = encodeURIComponent(title || 'Check this out!');
    
    // Track the share
    await this.trackShare(targetType, targetId, platform, userId);
    
    let shareUrl;
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${text}%20${encodeURIComponent(url)}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${text}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${text}&body=${encodeURIComponent(url)}`;
        break;
      default:
        return url;
    }
    
    // Open share dialog
    if (platform === 'email') {
      window.location.href = shareUrl;
    } else {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
    
    return shareUrl;
  }
};

// View tracking
export const viewService = {
  async incrementViewCount(targetType, targetId) {
    try {
      let tableName;
      switch (targetType) {
        case 'article':
          tableName = 'articles';
          break;
        case 'news':
          tableName = 'news';
          break;
        case 'program':
          tableName = 'programs';
          break;
        case 'podcast':
          tableName = 'podcasts';
          break;
        case 'coverage':
          tableName = 'coverage';
          break;
        default:
          return false;
      }
      
      const { error } = await supabase.rpc('increment_view_count', {
        table_name: tableName,
        row_id: targetId
      });
      
      if (error) {
        // Fallback to manual increment if RPC doesn't exist
        const { error: updateError } = await supabase
          .from(tableName)
          .update({ view_count: supabase.raw('COALESCE(view_count, 0) + 1') })
          .eq('id', targetId);
        
        if (updateError) throw updateError;
      }
      
      return true;
    } catch (error) {
      console.error('Increment view count error:', error);
      return false;
    }
  }
};

export default {
  likeService,
  commentService,
  newsletterService,
  bookmarkService,
  shareService,
  viewService
};
