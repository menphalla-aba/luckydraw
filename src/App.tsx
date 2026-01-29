import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import AdminPage from './pages/AdminPage';
import DrawPage from './pages/DrawPage';


const App: React.FC = () => {
  const navStyle: React.CSSProperties = {
    display: 'flex',
    gap: '2em',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '1.5em 0',
    fontSize: '1.3em',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  };

  const baseName = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

  return (
    <BrowserRouter basename={baseName}>
      <nav style={navStyle}>
      <Link to="/" style={{
        color: '#fff',
        textDecoration: 'none',
        padding: '0.5em 1.5em',
        borderRadius: '8px',
        background: 'rgba(255,255,255,0.2)',
        transition: 'all 0.3s',
        fontWeight: 'bold'
      }}>🎲 Draw</Link>
      <Link to="/admin" style={{
        color: '#fff',
        textDecoration: 'none',
        padding: '0.5em 1.5em',
        borderRadius: '8px',
        background: 'rgba(255,255,255,0.2)',
        transition: 'all 0.3s',
        fontWeight: 'bold'
      }}>🗂️ Admin</Link>
    </nav>
    <Routes>
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/" element={<DrawPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
  );
};

export default App;
