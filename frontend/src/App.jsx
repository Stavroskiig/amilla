import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Auth from './views/Auth';
import Matches from './views/Matches';
import Leaderboard from './views/Leaderboard';
import LongTerm from './views/LongTerm';
import Admin from './views/Admin';
import Profile from './views/Profile';
import Stats from './views/Stats';

function AppContent({ user, setUser, onLogout }) {
  const location = useLocation();
  const showNavbar = location.pathname !== '/auth';

  return (
    <div className="app-container">
      {showNavbar && <Navbar user={user} onLogout={onLogout} />}
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
            path="/admin" 
            element={
              user && user.role === 'ROLE_ADMIN' 
                ? <Admin /> 
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
      const res = await fetch('/api/auth/me', {
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
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#0b0c10',
        color: '#f3f4f6',
        fontFamily: 'sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ marginBottom: '10px' }}>Amilla Loading...</h2>
          <div style={{ fontSize: '0.9rem', color: '#9ca3af' }}>Verify credentials</div>
        </div>
      </div>
    );
  }

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppContent user={user} setUser={setUser} onLogout={handleLogout} />
    </Router>
  );
}
