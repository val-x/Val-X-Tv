import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Users from './pages/Users';
import Plans from './pages/Plans';
import Login from './pages/Login';
import { AuthProvider } from './hooks/useAuth';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/users" element={<Users />} />
          <Route path="/plans" element={<Plans />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

