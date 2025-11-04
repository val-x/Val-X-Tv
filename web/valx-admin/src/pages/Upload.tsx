import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function Upload() {
  const { token } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'movie' | 'tv' | 'audio' | 'course'>('movie');
  const [premium, setPremium] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) {
      setMessage('Please select a file and enter a title');
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('type', type);
      formData.append('premium', String(premium));

      const response = await axios.post(`${API_URL}/media/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage(`Upload successful! Media ID: ${response.data.id}`);
      setFile(null);
      setTitle('');
      setPremium(false);
    } catch (error: any) {
      setMessage(`Upload failed: ${error.response?.data?.error || error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>Upload Media</h1>
      
      {message && (
        <div style={{ padding: '1rem', background: message.includes('successful') ? '#44ff44' : '#ff4444', borderRadius: '4px', marginBottom: '1rem', color: '#000' }}>
          {message}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>File</label>
          <input
            type="file"
            accept="video/*,audio/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            required
            style={{ width: '100%', padding: '0.5rem', background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '4px' }}
          />
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '4px' }}
          />
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            style={{ width: '100%', padding: '0.5rem', background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '4px' }}
          >
            <option value="movie">Movie</option>
            <option value="tv">TV Show</option>
            <option value="audio">Audio</option>
            <option value="course">Course</option>
          </select>
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={premium}
              onChange={(e) => setPremium(e.target.checked)}
            />
            Premium Content (requires premium subscription)
          </label>
        </div>
        
        <button
          type="submit"
          disabled={uploading}
          style={{ width: '100%', padding: '0.75rem', background: uploading ? '#666' : '#007bff', border: 'none', borderRadius: '4px', color: '#fff', cursor: uploading ? 'not-allowed' : 'pointer' }}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
    </div>
  );
}

