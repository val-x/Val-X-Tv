import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

interface MediaItem {
  id: string;
  title: string;
  type: string;
  premium: boolean;
  thumbnail?: string;
  thumbnailUrl?: string;
}

export default function Browse() {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'movie';
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { token, user } = useAuth();

  useEffect(() => {
    fetchMedia();
  }, [type, token]);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/media/list?type=${type}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setMedia(response.data.media || []);
    } catch (error) {
      console.error('Failed to fetch media:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>Browse {type}</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        {media.map((item) => (
          <Link
            key={item.id}
            to={`/player/${item.id}`}
            style={{ textDecoration: 'none', color: '#fff' }}
          >
            <div style={{ background: '#1a1a1a', borderRadius: '8px', overflow: 'hidden' }}>
              {item.thumbnailUrl ? (
                <img
                  src={item.thumbnailUrl}
                  alt={item.title}
                  style={{ width: '100%', height: '300px', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ width: '100%', height: '300px', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  No Thumbnail
                </div>
              )}
              <div style={{ padding: '1rem' }}>
                <h3 style={{ marginBottom: '0.5rem' }}>{item.title}</h3>
                {item.premium && (user?.subscription !== 'premium' && user?.role !== 'admin') && (
                  <span style={{ color: '#ffaa00' }}>🔒 Premium</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {media.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#ccc' }}>
          No media found
        </div>
      )}
    </div>
  );
}

