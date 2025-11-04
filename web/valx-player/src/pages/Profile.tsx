import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function Profile() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchProfile();
  }, [token, navigate]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(response.data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  const handleUpgrade = async () => {
    try {
      await axios.post(
        `${API_URL}/user/subscription`,
        { subscription: 'premium' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchProfile();
    } catch (error) {
      console.error('Failed to upgrade:', error);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>Profile</h1>
      
      <div style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '8px', marginBottom: '1rem' }}>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role}</p>
        <p><strong>Subscription:</strong> {user.subscription}</p>
      </div>
      
      {user.subscription === 'free' && (
        <button
          onClick={handleUpgrade}
          style={{ padding: '0.75rem 1.5rem', background: '#ffaa00', border: 'none', borderRadius: '4px', color: '#000', cursor: 'pointer', marginBottom: '1rem', marginRight: '1rem' }}
        >
          Upgrade to Premium
        </button>
      )}
      
      <button
        onClick={() => {
          logout();
          navigate('/');
        }}
        style={{ padding: '0.75rem 1.5rem', background: '#ff4444', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}
      >
        Logout
      </button>
    </div>
  );
}

