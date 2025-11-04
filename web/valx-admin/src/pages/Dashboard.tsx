import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useEffect } from 'react';

export default function Dashboard() {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/login');
    }
  }, [isAuthenticated, isAdmin, navigate]);

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Val-X Originals Admin</h1>
        <nav style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>Dashboard</Link>
          <Link to="/upload" style={{ color: '#fff', textDecoration: 'none' }}>Upload</Link>
          <Link to="/users" style={{ color: '#fff', textDecoration: 'none' }}>Users</Link>
          <Link to="/plans" style={{ color: '#fff', textDecoration: 'none' }}>Plans</Link>
          <button
            onClick={logout}
            style={{ background: '#ff4444', border: 'none', borderRadius: '4px', color: '#fff', padding: '0.5rem 1rem', cursor: 'pointer' }}
          >
            Logout
          </button>
        </nav>
      </header>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
        <Link to="/upload" style={{ textDecoration: 'none' }}>
          <div style={{ padding: '2rem', background: '#1a1a1a', borderRadius: '8px', textAlign: 'center' }}>
            <h2>Upload Media</h2>
            <p style={{ color: '#ccc', marginTop: '0.5rem' }}>Upload new videos, audio, or courses</p>
          </div>
        </Link>
        
        <Link to="/users" style={{ textDecoration: 'none' }}>
          <div style={{ padding: '2rem', background: '#1a1a1a', borderRadius: '8px', textAlign: 'center' }}>
            <h2>Manage Users</h2>
            <p style={{ color: '#ccc', marginTop: '0.5rem' }}>View and manage user accounts</p>
          </div>
        </Link>
        
        <Link to="/plans" style={{ textDecoration: 'none' }}>
          <div style={{ padding: '2rem', background: '#1a1a1a', borderRadius: '8px', textAlign: 'center' }}>
            <h2>Subscription Plans</h2>
            <p style={{ color: '#ccc', marginTop: '0.5rem' }}>Configure subscription plans</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

