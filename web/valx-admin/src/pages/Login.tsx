import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Authentication failed');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: '50px auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>Admin Login</h1>
      
      {error && (
        <div style={{ padding: '1rem', background: '#ff4444', borderRadius: '4px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '4px' }}
          />
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '4px' }}
          />
        </div>
        
        <button
          type="submit"
          style={{ width: '100%', padding: '0.75rem', background: '#007bff', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}
        >
          Login
        </button>
      </form>
    </div>
  );
}

