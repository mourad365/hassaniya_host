import React, { useState, useEffect } from 'react';

const FacebookFeed = ({ 
  pageUrl = "https://www.facebook.com/profile.php?id=100069866329907",
  pageId = "100069866329907"
}) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Facebook App configuration - You'll need to replace these with your actual values
  const FACEBOOK_APP_ID = 'your-app-id'; // Replace with your Facebook App ID
  const FACEBOOK_ACCESS_TOKEN = 'your-access-token'; // Replace with your Page Access Token

  useEffect(() => {
    const fetchFacebookPosts = async () => {
      try {
        setLoading(true);
        
        // Facebook Graph API endpoint to fetch page posts
        const response = await fetch(
          `https://graph.facebook.com/v19.0/${pageId}/posts?fields=id,message,created_time,full_picture,permalink_url,likes.summary(true),comments.summary(true)&access_token=${FACEBOOK_ACCESS_TOKEN}&limit=10`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch Facebook posts');
        }

        const data = await response.json();
        setPosts(data.data || []);
      } catch (err) {
        console.error('Error fetching Facebook posts:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we have valid credentials
    if (FACEBOOK_ACCESS_TOKEN && FACEBOOK_ACCESS_TOKEN !== 'your-access-token') {
      fetchFacebookPosts();
    } else {
      setLoading(false);
      setError('Facebook API credentials not configured');
    }
  }, [pageId]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text, maxLength = 200) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  if (loading) {
    return (
      <div className="facebook-feed-container">
        <div className="facebook-feed-wrapper">
          <div className="facebook-loading">
            <div className="loading-spinner"></div>
            <p>Loading Facebook posts...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || posts.length === 0) {
    return (
      <div className="facebook-feed-container">
        <div className="facebook-feed-wrapper">
          <div className="facebook-error">
            <h3>📱 Facebook Posts</h3>
            <p>To display live Facebook posts, you need to configure Facebook API credentials.</p>
            
            <div className="setup-instructions">
              <h4>Setup Instructions:</h4>
              <ol>
                <li>Create a Facebook App at <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer">developers.facebook.com</a></li>
                <li>Get your App ID and Page Access Token</li>
                <li>Replace the credentials in the FacebookFeed component</li>
                <li>Add your domain to Facebook App settings</li>
              </ol>
            </div>
            
            <a
              href={pageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="facebook-direct-link"
            >
              Visit Facebook Page
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="facebook-feed-container">
      <div className="facebook-feed-wrapper">
        <div className="facebook-posts-header">
          <h3>📱 Latest Facebook Posts</h3>
          <a href={pageUrl} target="_blank" rel="noopener noreferrer" className="view-all-link">
            View All Posts →
          </a>
        </div>

        <div className="facebook-posts-grid">
          {posts.map((post) => (
            <div key={post.id} className="facebook-post">
              {post.full_picture && (
                <div className="post-image">
                  <img src={post.full_picture} alt="Post" />
                </div>
              )}
              
              <div className="post-content">
                <div className="post-text">
                  {post.message && (
                    <p>{truncateText(post.message)}</p>
                  )}
                </div>
                
                <div className="post-meta">
                  <span className="post-date">
                    {formatDate(post.created_time)}
                  </span>
                  
                  <div className="post-stats">
                    {post.likes && (
                      <span className="stat">
                        👍 {post.likes.summary.total_count}
                      </span>
                    )}
                    {post.comments && (
                      <span className="stat">
                        💬 {post.comments.summary.total_count}
                      </span>
                    )}
                  </div>
                </div>
                
                <a
                  href={post.permalink_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="post-link"
                >
                  View on Facebook
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="facebook-cta">
          <a
            href={pageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="facebook-cta-button"
          >
            Follow Us on Facebook
          </a>
        </div>
      </div>
    </div>
  );
};

export default FacebookFeed;
