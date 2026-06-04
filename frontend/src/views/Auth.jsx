import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, LogIn, UserPlus, Mail, Lock, User as UserIcon, Key } from 'lucide-react';


export default function Auth({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [groupCode, setGroupCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side empty field validation
    if (isLogin) {
      if (!email.trim() || !password.trim()) {
        setError('Παρακαλώ συμπληρώστε όλα τα πεδία.');
        return;
      }
    } else {
      if (!username.trim() || !email.trim() || !password.trim() || !groupCode.trim()) {
        setError('Παρακαλώ συμπληρώστε όλα τα πεδία.');
        return;
      }
      if (password.length < 6) {
        setError('Ο κωδικός πρόσβασης πρέπει να έχει τουλάχιστον 6 χαρακτήρες!');
        return;
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        // Login flow
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Σφάλμα σύνδεσης');

        localStorage.setItem('token', data.token);
        onLoginSuccess(data);
        navigate('/matches');
      } else {
        // Register flow
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password, groupCode }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Σφάλμα εγγραφής');

        // Automatically log in after registration
        const loginRes = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const loginData = await loginRes.json();
        if (!loginRes.ok) throw new Error(loginData.error || 'Σφάλμα αυτόματης σύνδεσης');

        localStorage.setItem('token', loginData.token);
        onLoginSuccess(loginData);
        navigate('/matches');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      padding: '20px'
    }}>
      <div className="glass-card animate-fade-in responsive-card-padding" style={{
        width: '100%',
        maxWidth: '420px',
        padding: '40px 32px',
        position: 'relative'
      }}>
        {/* Decorative elements */}
        <div style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '80px',
          height: '80px',
          background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)',
          zIndex: -1,
          opacity: 0.5
        }} />

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(6,182,212,0.2) 100%)',
            border: '1px solid rgba(99,102,241,0.3)',
            marginBottom: '16px',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <Compass size={32} style={{ color: '#818cf8' }} />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '6px' }}>Amilla</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {isLogin ? 'Σύνδεση στο παιχνίδι προβλέψεων' : 'Δημιουργία λογαριασμού παίκτη'}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="glass" style={{
          display: 'flex',
          padding: '4px',
          borderRadius: '10px',
          marginBottom: '24px',
          border: '1px solid var(--border-color)'
        }}>
          <button
            onClick={() => { setIsLogin(true); setError(''); }}
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              background: isLogin ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              color: isLogin ? '#ffffff' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.85rem',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Σύνδεση
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(''); }}
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              background: !isLogin ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              color: !isLogin ? '#ffffff' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.85rem',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Εγγραφή
          </button>
        </div>

        {error && (
          <div className="glass" style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            borderLeft: '4px solid var(--danger)',
            background: 'rgba(239, 68, 68, 0.08)',
            color: '#fca5a5',
            fontSize: '0.85rem',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!isLogin && (
            <>
              <div className="form-group">
                <label className="form-label">Όνομα Χρήστη</label>
                <div style={{ position: 'relative' }}>
                  <UserIcon size={18} style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)'
                  }} />
                  <input
                    type="text"
                    required
                    placeholder="π.χ. Σταύρος"
                    className="form-input"
                    style={{ width: '100%', paddingLeft: '48px' }}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Κωδικός Ομάδας</label>
                <div style={{ position: 'relative' }}>
                  <Key size={18} style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)'
                  }} />
                  <input
                    type="text"
                    required
                    placeholder="π.χ. EURO2024"
                    className="form-input"
                    style={{ width: '100%', paddingLeft: '48px' }}
                    value={groupCode}
                    onChange={(e) => setGroupCode(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
              <input
                type="email"
                required
                placeholder="email@example.com"
                className="form-input"
                style={{ width: '100%', paddingLeft: '48px' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '8px' }}>
            <label className="form-label">Κωδικός πρόσβασης</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
              <input
                type="password"
                required
                placeholder="••••••••"
                className="form-input"
                style={{ width: '100%', paddingLeft: '48px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '16px' }}
          >
            {loading ? 'Παρακαλώ περιμένετε...' : (isLogin ? (
              <>
                <LogIn size={18} />
                <span>Είσοδος</span>
              </>
            ) : (
              <>
                <UserPlus size={18} />
                <span>Δημιουργία Λογαριασμού</span>
              </>
            ))}
          </button>
        </form>
      </div>
    </div>
  );
}
