// src/components/PagePosts.jsx
import React, { useEffect, useState } from 'react';
import { getPagePosts, extractMediaFromPost } from '../services/facebookService';

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
}

export default function PagePosts() {
  const [posts, setPosts] = useState([]);
  const [nextUrl, setNextUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPosts = async (opts = {}) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getPagePosts(opts);
      const newPosts = Array.isArray(res?.data) ? res.data : [];
      setPosts((prev) => (opts.nextUrl ? [...prev, ...newPosts] : newPosts));
      setNextUrl(res?.paging?.next || null);
    } catch (e) {
      setError(e?.message || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLoadMore = () => {
    if (nextUrl) {
      loadPosts({ nextUrl });
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Latest Facebook Posts</h2>

      {loading && posts.length === 0 && (
        <div className="text-center text-gray-600">Loading posts...</div>
      )}

      {error && (
        <div className="mb-4 p-4 rounded-md bg-red-50 text-red-700 border border-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => {
          const { imageUrl, videoUrl } = extractMediaFromPost(post);
          return (
            <article key={post.id} className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden flex flex-col">
              {videoUrl ? (
                <div className="w-full bg-black">
                  <video
                    className="w-full h-auto"
                    src={videoUrl}
                    controls
                    playsInline
                  />
                </div>
              ) : imageUrl ? (
                <img src={imageUrl} alt="Post media" className="w-full h-56 object-cover" />
              ) : null}

              <div className="p-4 flex flex-col gap-3">
                <div className="text-sm text-gray-500">
                  {post.from?.name ? (
                    <span className="font-medium text-gray-700">{post.from.name}</span>
                  ) : null}
                  {post.created_time ? (
                    <span className="ml-2">• {formatDate(post.created_time)}</span>
                  ) : null}
                </div>

                {post.message ? (
                  <p className="text-gray-800 whitespace-pre-line">
                    {post.message}
                  </p>
                ) : (
                  <p className="text-gray-500 italic">No message</p>
                )}

                <div className="mt-2">
                  {post.permalink_url && (
                    <a
                      href={post.permalink_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View on Facebook
                      <svg className="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path d="M12.293 2.293a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L14 5.414V13a1 1 0 11-2 0V5.414L9.707 7.707A1 1 0 018.293 6.293l4-4z" />
                        <path d="M3 9a1 1 0 011-1h3a1 1 0 110 2H5v6h10v-2a1 1 0 112 0v3a1 1 0 01-1 1H4a1 1 0 01-1-1V9z" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-8 flex justify-center">
        {nextUrl && (
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="px-5 py-2 rounded-md bg-blue-600 text-white shadow hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        )}
      </div>
    </div>
  );
}
