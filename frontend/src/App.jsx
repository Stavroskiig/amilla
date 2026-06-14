import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Auth from './views/Auth';
import Matches from './views/Matches';
import Leaderboard from './views/Leaderboard';
import LongTerm from './views/LongTerm';
import Admin from './views/Admin';
import OddsManager from './views/OddsManager';
import Profile from './views/Profile';
import Stats from './views/Stats';
import Rules from './views/Rules';
import wc26Logo from './assets/wc26-logo.svg';

const API_URL = import.meta.env.VITE_API_URL || '';


function AppContent({ user, setUser, onLogout, theme, toggleTheme }) {
  const location = useLocation();
  const showNavbar = location.pathname !== '/auth';

  return (
    <div className="app-container">
      {showNavbar && <Navbar user={user} onLogout={onLogout} theme={theme} toggleTheme={toggleTheme} />}
      <main className="main-content">
        <Routes>
          <Route 
            path="/auth" 
            element={user ? <Navigate to="/matches" /> : <Auth onLoginSuccess={(u) => setUser(u)} />} 
          />
          <Route 
            path="/matches" 
            element={user ? <Matches user={user} /> : <Navigate to="/auth" />} 
          />
          <Route 
            path="/leaderboard" 
            element={user ? <Leaderboard currentUser={user} /> : <Navigate to="/auth" />} 
          />
          <Route 
            path="/longterm" 
            element={user ? <LongTerm user={user} /> : <Navigate to="/auth" />} 
          />
          <Route 
            path="/profile" 
            element={user ? <Profile user={user} setUser={setUser} /> : <Navigate to="/auth" />} 
          />
          <Route 
            path="/stats" 
            element={user ? <Stats user={user} /> : <Navigate to="/auth" />} 
          />
          <Route 
            path="/rules" 
            element={user ? <Rules /> : <Navigate to="/auth" />} 
          />
          <Route 
            path="/admin" 
            element={
              user && user.role === 'ROLE_ADMIN' 
                ? <Admin /> 
                : <Navigate to="/matches" />
            } 
          />
          <Route 
            path="/odds-manager" 
            element={
              user && (user.role === 'ROLE_ADMIN' || user.role === 'ROLE_ODDS_MANAGER') 
                ? <OddsManager /> 
                : <Navigate to="/matches" />
            } 
          />
          <Route 
            path="*" 
            element={<Navigate to={user ? "/matches" : "/auth"} />} 
          />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'default');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'default' ? 'wc26' : 'default';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    checkLoggedInUser();
  }, []);

  const checkLoggedInUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(API_URL + '/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        localStorage.removeItem('token');
      }
    } catch (e) {
      console.error('Failed to verify token', e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    const isWc26 = theme === 'wc26';
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: isWc26 ? '#ffffff' : '#0b0c10',
        color: isWc26 ? '#0f172a' : '#f3f4f6',
        fontFamily: 'sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          {isWc26 && (
            <img src={wc26Logo} alt="WC 2026" style={{ height: '64px', marginBottom: '16px' }} />
          )}
          <h2 style={{ marginBottom: '10px', fontWeight: 800, letterSpacing: '-0.5px' }}>Amilla Loading...</h2>
          <div style={{ fontSize: '0.9rem', color: isWc26 ? '#64748b' : '#9ca3af' }}>Verify credentials</div>
        </div>
      </div>
    );
  }

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppContent user={user} setUser={setUser} onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} />
    </Router>
  );
}
