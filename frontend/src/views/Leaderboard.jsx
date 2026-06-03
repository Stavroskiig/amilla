import React, { useState, useEffect } from 'react';
import { Trophy, Award, Search, Sparkles } from 'lucide-react';

export default function Leaderboard({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/leaderboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error('Σφάλμα φόρτωσης κατάταξης');
      setUsers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getRankStyle = (index) => {
    if (index === 0) return { color: '#fbbf24', icon: <Trophy size={20} /> }; // Gold
    if (index === 1) return { color: '#9ca3af', icon: <Trophy size={20} /> }; // Silver
    if (index === 2) return { color: '#b45309', icon: <Trophy size={20} /> }; // Bronze
    return { color: 'var(--text-muted)', icon: <Award size={18} /> };
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Πίνακας Κατάταξης</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Δείτε τη συνολική βαθμολογία και την εξέλιξη της οικογένειας σε πραγματικό χρόνο!
          </p>
        </div>

        {/* Search box */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
          <Search size={18} style={{
            position: 'absolute',
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)'
          }} />
          <input
            type="text"
            placeholder="Αναζήτηση παίκτη..."
            className="form-input"
            style={{ width: '100%', paddingLeft: '48px', paddingRight: '16px', height: '42px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Φόρτωση κατάταξης...
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '0px', overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left'
          }}>
            <thead>
              <tr style={{
                borderBottom: '1px solid var(--border-color)',
                background: 'rgba(255, 255, 255, 0.01)'
              }}>
                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>ΘΕΣΗ</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>ΠΑΙΚΤΗΣ</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>ΡΟΛΟΣ</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', textAlign: 'right' }}>ΣΥΝΟΛΙΚΟΙ ΠΟΝΤΟΙ</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user, idx) => {
                  const rank = getRankStyle(idx);
                  const isSelf = currentUser && user.id === currentUser.id;

                  return (
                    <tr
                      key={user.id}
                      style={{
                        borderBottom: '1px solid var(--border-color)',
                        background: isSelf ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                        transition: 'background 0.2s',
                        fontWeight: isSelf ? '600' : '400'
                      }}
                      className="leaderboard-row"
                    >
                      {/* Rank Position */}
                      <td style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: idx < 3 ? 'rgba(255,255,255,0.03)' : 'transparent',
                          color: rank.color,
                          fontWeight: 700
                        }}>
                          {idx + 1}
                        </span>
                        <span style={{ color: rank.color }}>
                          {rank.icon}
                        </span>
                      </td>

                      {/* Username */}
                      <td style={{ padding: '18px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '1rem', color: isSelf ? '#ffffff' : 'var(--text-main)' }}>
                            {user.username}
                          </span>
                          {isSelf && (
                            <span className="badge" style={{
                              background: 'rgba(99,102,241,0.2)',
                              color: '#a5b4fc',
                              fontSize: '0.7rem',
                              padding: '2px 6px',
                              borderRadius: '10px'
                            }}>
                              ΕΣΥ
                            </span>
                          )}
                          {idx === 0 && (
                            <Sparkles size={14} style={{ color: '#fbbf24' }} title="Πρωτοπόρος!" />
                          )}
                        </div>
                      </td>

                      {/* Role */}
                      <td style={{ padding: '18px 24px' }}>
                        <span style={{
                          fontSize: '0.8rem',
                          color: user.role === 'ROLE_ADMIN' ? 'var(--secondary)' : 'var(--text-muted)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          {user.role === 'ROLE_ADMIN' ? 'Admin' : 'ΠΑΙΚΤΗΣ'}
                        </span>
                      </td>

                      {/* Points */}
                      <td style={{ padding: '18px 24px', textAlign: 'right', fontSize: '1.1rem', fontWeight: 700, color: isSelf ? '#818cf8' : '#ffffff' }}>
                        {user.totalPoints}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Δεν βρέθηκαν παίκτες.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
