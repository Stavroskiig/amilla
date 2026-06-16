import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Award, Search, TrendingUp, TrendingDown, Flame, Target, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar } from '../components/Avatars';
import Podium from '../components/Podium';
import html2canvas from 'html2canvas';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function Leaderboard({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const leaderboardRef = useRef(null);

  const handleShare = async () => {
    if (!leaderboardRef.current) return;
    try {
      const scrollableDiv = leaderboardRef.current.querySelector('.hide-scrollbar');
      let originalOverflow = '';
      if (scrollableDiv) {
         originalOverflow = scrollableDiv.style.overflowX;
         scrollableDiv.style.overflowX = 'visible';
      }

      const canvas = await html2canvas(leaderboardRef.current, {
        useCORS: true,
        scale: 2,
        backgroundColor: document.documentElement.getAttribute('data-theme') === 'wc26' ? '#f1f5f9' : '#0f111a'
      });
      
      if (scrollableDiv) {
         scrollableDiv.style.overflowX = originalOverflow;
      }

      const imageBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      const file = new File([imageBlob], 'amilla-leaderboard.png', { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Amilla Leaderboard',
          text: 'Δες την κατάταξη στο Amilla!',
        });
      } else {
        const url = URL.createObjectURL(imageBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'amilla-leaderboard.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Error sharing image', err);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_URL + '/api/leaderboard', {
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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Πίνακας Κατάταξης</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Δείτε τη συνολική βαθμολογία και την εξέλιξη του τουρνουά live!
          </p>
        </div>

        {/* Actions Container */}
        <div className="leaderboard-actions-container" style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', maxWidth: '340px' }}>
          {/* Search box */}
          <div className="leaderboard-search-container" style={{ position: 'relative', flex: 1 }}>
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
          
          {/* Share Button */}
          <button 
            onClick={handleShare}
            title="Μοιράσου την Κατάταξη"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '42px',
              height: '42px',
              background: 'var(--primary)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(44, 60, 230, 0.2)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              flexShrink: 0
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'none'}
          >
            <Share2 size={18} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }}>
            Φόρτωση κατάταξης...
          </motion.div>
        </div>
      ) : (
        <>
          {/* PODIUM COMPONENT */}
          {searchTerm === '' && <Podium topUsers={users.slice(0, 3)} currentUser={currentUser} />}

          <div ref={leaderboardRef} className="glass-card hide-scrollbar" style={{ padding: '0px', overflowX: 'auto', position: 'relative', zIndex: 10 }}>
              <table className="leaderboard-table" style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left'
            }}>
              <thead>
                <tr style={{
                  borderBottom: '1px solid var(--border-color)',
                  background: 'var(--table-header-bg, rgba(255, 255, 255, 0.01))'
                }}>
                  <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>ΘΕΣΗ</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>ΠΑΙΚΤΗΣ</th>
                  <th className="hide-on-mobile" style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', textAlign: 'center' }}>
                    ΑΚΡΙΒΗ ΣΚΟΡ
                  </th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', textAlign: 'center' }}>
                    <span className="hide-on-mobile">ΣΥΝΟΛΙΚΟΙ ΠΟΝΤΟΙ</span>
                    <span className="show-on-mobile">ΠΟΝΤΟΙ</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user, idx) => {
                      const rank = getRankStyle(idx);
                      const isSelf = currentUser && user.id === currentUser.id;
                      
                      const currentRank = idx + 1;
                      const prevRank = user.previousRank;
                      const change = prevRank > 0 ? prevRank - currentRank : 0;
                      
                      const baseBg = isSelf ? 'var(--self-row-bg, rgba(99, 102, 241, 0.08))' : 'transparent';

                      return (
                        <tr
                          key={user.id}
                          style={{
                            borderBottom: '1px solid var(--border-color)',
                            background: baseBg,
                            fontWeight: isSelf ? '600' : '400'
                          }}
                          className="leaderboard-row"
                        >
                          {/* Rank Position */}
                          <td style={{ padding: '18px 24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="leaderboard-rank-cell">
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                background: idx < 3 ? 'var(--rank-bg, rgba(255,255,255,0.03))' : 'transparent',
                                color: rank.color,
                                fontWeight: 700,
                                flexShrink: 0
                              }}>
                                {idx + 1}
                              </span>
                              <span className="hide-on-mobile" style={{ color: rank.color, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                                {rank.icon}
                              </span>

                              {/* Trend Indicator */}
                              {(() => {
                                if (prevRank === 0 || change === 0) {
                                  return (
                                    <span className="trend-badge trend-neutral" title="Σταθερή θέση">
                                      <span style={{ fontSize: '10px' }}>—</span>
                                    </span>
                                  );
                                }

                                if (change > 0) {
                                  return (
                                    <span className="trend-badge trend-up" title={`Ανέβηκε ${change} ${change === 1 ? 'θέση' : 'θέσεις'}`}>
                                      <TrendingUp size={12} style={{ marginRight: '2px' }} />
                                      {change}
                                    </span>
                                  );
                                } else {
                                  return (
                                    <span className="trend-badge trend-down" title={`Έπεσε ${Math.abs(change)} ${Math.abs(change) === 1 ? 'θέση' : 'θέσεις'}`}>
                                      <TrendingDown size={12} style={{ marginRight: '2px' }} />
                                      {Math.abs(change)}
                                    </span>
                                  );
                                }
                              })()}
                            </div>
                          </td>

                          {/* Username */}
                          <td style={{ padding: '18px 24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} className="leaderboard-player-cell">
                              <Avatar id={user.avatar} size={28} />
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', justifyContent: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span style={{ fontSize: '1rem', color: isSelf ? 'var(--self-text-color, #ffffff)' : 'var(--text-main)' }} className="leaderboard-username">
                                    {user.username}
                                  </span>
                                  {user.currentStreak >= 3 && (
                                    <span
                                      title={`Καυτός! ${user.currentStreak} συνεχόμενες σωστές προβλέψεις`}
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '3px',
                                        background: 'rgba(249, 115, 22, 0.15)',
                                        color: '#f97316',
                                        border: '1px solid rgba(249, 115, 22, 0.3)',
                                        padding: '2px 8px',
                                        borderRadius: '12px',
                                        fontSize: '0.75rem',
                                        fontWeight: 800,
                                        boxShadow: '0 0 10px rgba(249, 115, 22, 0.25)',
                                        animation: 'pulse 1.5s infinite',
                                        fontFamily: 'var(--font-heading)'
                                      }}
                                      className="streak-badge"
                                    >
                                      <Flame size={12} fill="#f97316" />
                                      <span>{user.currentStreak}</span>
                                    </span>
                                  )}
                                  {isSelf && (
                                    <span className="badge self-badge" style={{
                                      background: 'rgba(99,102,241,0.2)',
                                      color: 'var(--self-badge-color, #a5b4fc)',
                                      fontSize: '0.7rem',
                                      padding: '2px 6px',
                                      borderRadius: '10px'
                                    }}>
                                      ΕΣΥ
                                    </span>
                                  )}
                                </div>
                                <div className="show-on-mobile" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    <Target size={12} color="#06b6d4" />
                                    Ακριβή: <span style={{ color: 'var(--text-main)', fontWeight: '700' }}>{user.exactHits || 0}</span>
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Exact Hits */}
                          <td className="hide-on-mobile" style={{ padding: '18px 24px', textAlign: 'center' }}>
                            <div style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: 'var(--exact-hits-bg, rgba(255, 255, 255, 0.05))',
                              color: 'var(--text-main)',
                              fontWeight: '600',
                              fontSize: '0.9rem'
                            }} title="Ακριβή σκορ">
                              {user.exactHits || 0}
                            </div>
                          </td>

                          {/* Points */}
                          <td style={{ padding: '18px 24px', textAlign: 'center', fontSize: '1.1rem', fontWeight: 700, color: isSelf ? 'var(--self-points-color, #818cf8)' : 'var(--points-color, #ffffff)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                  {user.recentPoints > 0 && (
                                    <span 
                                      title={`Κέρδισε ${user.recentPoints} πόντους στον τελευταίο αγώνα`}
                                      style={{ 
                                        position: 'absolute',
                                        right: '100%',
                                        marginRight: '8px',
                                        fontSize: '0.75rem', 
                                        color: '#10b981', 
                                        background: 'rgba(16, 185, 129, 0.15)', 
                                        padding: '2px 6px', 
                                        borderRadius: '10px',
                                        fontWeight: 800
                                      }}
                                      className="animate-fade-in"
                                    >
                                      +{user.recentPoints}
                                    </span>
                                  )}
                                <span>{user.totalPoints}</span>
                              </div>
                            </div>
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
          {/* Bottom padding for mobile scrolling */}
          <div style={{ height: '32px' }}></div>
        </>
      )}
    </motion.div>
  );
}
