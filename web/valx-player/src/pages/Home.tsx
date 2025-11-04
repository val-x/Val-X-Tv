import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Home() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Val-X Originals</h1>
        <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>Home</Link>
          <Link to="/browse" style={{ color: '#fff', textDecoration: 'none' }}>Browse</Link>
          {isAuthenticated ? (
            <>
              <Link to="/profile" style={{ color: '#fff', textDecoration: 'none' }}>
                {user?.email}
              </Link>
            </>
          ) : (
            <Link to="/login" style={{ color: '#fff', textDecoration: 'none' }}>Login</Link>
          )}
        </nav>
      </header>
      
      <main>
        <h2 style={{ marginBottom: '1rem' }}>Welcome to Val-X Originals</h2>
        <p style={{ marginBottom: '2rem', color: '#ccc' }}>
          Your self-hosted streaming platform for movies, TV, music, FM, and courses.
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <Link to="/browse?type=movie" style={{ textDecoration: 'none', color: '#fff' }}>
            <div style={{ padding: '2rem', background: '#1a1a1a', borderRadius: '8px', textAlign: 'center' }}>
              <h3>Movies</h3>
            </div>
          </Link>
          <Link to="/browse?type=audio" style={{ textDecoration: 'none', color: '#fff' }}>
            <div style={{ padding: '2rem', background: '#1a1a1a', borderRadius: '8px', textAlign: 'center' }}>
              <h3>Music</h3>
            </div>
          </Link>
          <Link to="/browse?type=course" style={{ textDecoration: 'none', color: '#fff' }}>
            <div style={{ padding: '2rem', background: '#1a1a1a', borderRadius: '8px', textAlign: 'center' }}>
              <h3>Courses</h3>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}

