import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Flame, Target } from 'lucide-react';
import { Avatar } from './Avatars';

export default function Podium({ topUsers, currentUser }) {
  if (!topUsers || topUsers.length < 3) return null;

  // topUsers[0] is 1st, topUsers[1] is 2nd, topUsers[2] is 3rd
  const first = topUsers[0];
  const second = topUsers[1];
  const third = topUsers[2];

  const renderPodiumStep = (user, rank) => {
    const isSelf = currentUser && user.id === currentUser.id;
    let height = '160px';
    let color = '#fbbf24'; // Gold
    let gradient = 'linear-gradient(to top, rgba(251, 191, 36, 0.2), rgba(251, 191, 36, 0.05))';
    let border = '1px solid rgba(251, 191, 36, 0.5)';
    let order = 2;

    if (rank === 2) {
      height = '120px';
      color = '#9ca3af'; // Silver
      gradient = 'linear-gradient(to top, rgba(156, 163, 175, 0.2), rgba(156, 163, 175, 0.05))';
      border = '1px solid rgba(156, 163, 175, 0.5)';
      order = 1;
    } else if (rank === 3) {
      height = '100px';
      color = '#b45309'; // Bronze
      gradient = 'linear-gradient(to top, rgba(180, 83, 9, 0.2), rgba(180, 83, 9, 0.05))';
      border = '1px solid rgba(180, 83, 9, 0.5)';
      order = 3;
    }

    return (
      <div
        key={user.id}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          order,
          flex: 1,
          maxWidth: '140px',
          margin: '0 10px',
          position: 'relative'
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: rank * 0.15 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '10px'
          }}
        >
          {rank === 1 && (
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              style={{ marginBottom: '5px' }}
            >
              <Trophy size={28} color={color} />
            </motion.div>
          )}
          <div style={{ position: 'relative' }}>
            <div style={{
              border: `3px solid ${color}`,
              borderRadius: '50%',
              padding: '2px',
              background: 'var(--bg-main)',
              boxShadow: `0 0 15px ${color}40`
            }}>
              <Avatar id={user.avatar} size={rank === 1 ? 64 : 52} />
            </div>
            {rank !== 1 && (
              <div style={{
                position: 'absolute',
                bottom: '-10px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: color,
                color: '#fff',
                fontSize: '0.75rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '12px',
                border: '2px solid var(--bg-main)'
              }}>
                {rank}
              </div>
            )}
            {rank === 1 && (
              <div style={{
                position: 'absolute',
                bottom: '-12px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: color,
                color: '#000',
                fontSize: '0.85rem',
                fontWeight: 800,
                padding: '2px 10px',
                borderRadius: '12px',
                border: '2px solid var(--bg-main)',
                boxShadow: '0 2px 5px rgba(0,0,0,0.5)'
              }}>
                1ST
              </div>
            )}
          </div>

          <div style={{
            marginTop: '16px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px'
          }}>
            <span style={{
              fontWeight: 700,
              fontSize: rank === 1 ? '1.1rem' : '0.95rem',
              color: isSelf ? 'var(--self-text-color, #818cf8)' : 'var(--text-main)',
              textShadow: rank === 1 ? `0 0 10px ${color}40` : 'none',
              maxWidth: '120px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {user.username}
            </span>
            <span style={{
              fontWeight: 800,
              color: color,
              fontSize: rank === 1 ? '1.2rem' : '1.05rem',
              marginTop: '4px'
            }}>
              {user.totalPoints} <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>pts</span>
            </span>
          </div>
        </motion.div>

        {/* The Podium Base */}
        <motion.div
          initial={{ height: 0 }}
          animate={{ height }}
          transition={{ duration: 0.6, type: 'spring', bounce: 0.2, delay: rank * 0.1 }}
          style={{
            width: '100%',
            background: gradient,
            borderTop: border,
            borderLeft: border,
            borderRight: border,
            borderRadius: '8px 8px 0 0',
            position: 'relative',
            overflow: 'hidden',
            backdropFilter: 'blur(10px)',
            boxShadow: `0 -5px 20px ${color}20`
          }}
        >
          {/* Glass shine effect */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
            opacity: 0.5
          }} />
        </motion.div>
      </div>
    );
  };

  return (
    <div className="podium-container" style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-end',
      marginTop: '90px',
      marginBottom: '40px',
      height: '280px',
      borderBottom: '1px solid var(--border-color)'
    }}>
      {renderPodiumStep(second, 2)}
      {renderPodiumStep(first, 1)}
      {renderPodiumStep(third, 3)}
    </div>
  );
}
