import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Hls from 'hls.js';
import { useAuth } from '../hooks/useAuth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function Player() {
  const { id } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { token, user } = useAuth();

  useEffect(() => {
    if (!id) return;
    
    fetchMetadata();
    fetchStreamUrl();
  }, [id, token]);

  useEffect(() => {
    if (streamUrl && videoRef.current && Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(streamUrl);
      hls.attachMedia(videoRef.current);
      
      return () => {
        hls.destroy();
      };
    } else if (streamUrl && videoRef.current && videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      videoRef.current.src = streamUrl;
    }
  }, [streamUrl]);

  const fetchMetadata = async () => {
    try {
      const response = await axios.get(`${API_URL}/media/metadata/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setMetadata(response.data);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('Premium subscription required');
      } else {
        setError('Failed to load media');
      }
    }
  };

  const fetchStreamUrl = async () => {
    try {
      const response = await axios.get(`${API_URL}/media/stream/${id}?quality=720p`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setStreamUrl(response.data.manifestUrl);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('Premium subscription required');
      } else {
        setError('Failed to load stream');
      }
    }
  };

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ color: '#ff4444', marginBottom: '1rem' }}>{error}</div>
        <button onClick={() => navigate('/')} style={{ padding: '0.5rem 1rem', background: '#007bff', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <button
        onClick={() => navigate('/')}
        style={{ marginBottom: '1rem', padding: '0.5rem 1rem', background: '#333', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}
      >
        ← Back
      </button>
      
      {metadata && (
        <h1 style={{ marginBottom: '1rem' }}>{metadata.title}</h1>
      )}
      
      {streamUrl ? (
        <video
          ref={videoRef}
          controls
          style={{ width: '100%', maxHeight: '80vh' }}
        />
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Loading player...</div>
      )}
    </div>
  );
}

