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

function JokePopup() {
  const [show, setShow] = useState(false);
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem('hasSeenJokePopup');
    if (!hasSeen) {
      // Show it after a small delay to make it feel natural
      const timer = setTimeout(() => {
        setShow(true);
        localStorage.setItem('hasSeenJokePopup', 'true');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(4px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'var(--bg-card, #1a1c29)',
        padding: '32px',
        borderRadius: '16px',
        textAlign: 'center',
        maxWidth: '400px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
        border: '1px solid var(--border-color, #2d3748)',
        animation: 'fade-in 0.3s ease-out'
      }}>
        {!clicked ? (
          <>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '16px', color: '#10b981' }}>🎁 Δωρεάν Πόντοι!</h2>
            <p style={{ fontSize: '1rem', color: 'var(--text-main, #f3f4f6)', marginBottom: '24px', lineHeight: '1.5' }}>
              Συγχαρητήρια! Κληρώθηκες για ένα μπόνους έκπληξη. Πάτα το κουμπί παρακάτω για να λάβεις <b>+500 πόντους</b> στο τουρνουά!
            </p>
            <button 
              onClick={() => setClicked(true)}
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#ffffff',
                border: 'none',
                padding: '14px 28px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '1.1rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                transition: 'transform 0.1s'
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Λήψη +500 Πόντων
            </button>
          </>
        ) : (
          <>
            <div style={{ fontSize: '4rem', marginBottom: '10px' }}>🤡</div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '16px', color: '#ef4444' }}>Χαχαχαχα!</h2>
            <p style={{ fontSize: '1rem', color: 'var(--text-main, #f3f4f6)', marginBottom: '24px', lineHeight: '1.5' }}>
              Σιγά μην σου δίναμε 500 πόντους έτσι εύκολα! Πήγαινε διάβασε κάνα στατιστικό και παίξε τίμια!
            </p>
            <button 
              onClick={() => setShow(false)}
              style={{
                background: 'var(--bg-main, #0b0c10)',
                color: 'var(--text-main, #f3f4f6)',
                border: '1px solid var(--border-color, #2d3748)',
                padding: '12px 24px',
                borderRadius: '10px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Κλείσιμο
            </button>
          </>
        )}
      </div>
    </div>
  );
}


function AppContent({ user, setUser, onLogout, theme, toggleTheme }) {
  const location = useLocation();
  const showNavbar = location.pathname !== '/auth';

  return (
    <div className="app-container">
      {showNavbar && <Navbar user={user} onLogout={onLogout} theme={theme} toggleTheme={toggleTheme} />}
      {user && <JokePopup />}
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
