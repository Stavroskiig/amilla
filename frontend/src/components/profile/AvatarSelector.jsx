import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Avatar, AVATARS } from '../Avatars';
import { useUpdateAvatar } from '../../hooks/useApi';

export default function AvatarSelector({ user, setUser, showAvatarGrid, setShowAvatarGrid, setSuccessMessage, setError }) {
  const [hoveredAvatar, setHoveredAvatar] = useState(null);
  const { mutate: updateAvatar, isPending: savingAvatar } = useUpdateAvatar();

  if (!showAvatarGrid) return null;

  const handleAvatarChange = (avatarId) => {
    const avatarDef = AVATARS.find(a => a.id === avatarId);
    if (avatarDef && avatarDef.unlockThreshold > user.totalPoints) {
      setError(`Αυτό το avatar ξεκλειδώνει στους ${avatarDef.unlockThreshold} πόντους!`);
      return;
    }

    setError('');
    updateAvatar({ avatar: avatarId }, {
      onSuccess: (updatedUser) => {
        setUser(updatedUser);
        setSuccessMessage('Το avatar ενημερώθηκε επιτυχώς!');
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      },
      onError: (err) => {
        setError(err.message);
      }
    });
  };

  return (
    <div className="glass" style={{
      marginTop: '24px',
      padding: '20px',
      borderRadius: 'var(--radius-md)',
      width: '100%',
      maxWidth: '520px',
      border: '1px solid var(--border-color)',
      background: 'rgba(15, 16, 26, 0.95)',
      boxShadow: 'var(--shadow-lg)',
      position: 'relative'
    }}>
      <button
        onClick={() => setShowAvatarGrid(false)}
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          background: 'transparent',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
      >
        <X size={20} />
      </button>

      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px', textAlign: 'center' }}>
        Επιλέξτε το Avatar σας
      </h3>

      <div className="avatar-grid">
        {AVATARS.map((avatar) => {
          const isSelected = user.avatar === avatar.id;
          const isLocked = avatar.unlockThreshold > user.totalPoints;
          return (
            <button
              key={avatar.id}
              disabled={savingAvatar}
              onClick={() => handleAvatarChange(avatar.id)}
              onMouseEnter={() => setHoveredAvatar(avatar)}
              onMouseLeave={() => setHoveredAvatar(null)}
              className={`avatar-item ${isSelected ? 'selected' : ''}`}
              style={{ border: 'none', opacity: isLocked ? 0.7 : 1, cursor: isLocked ? 'not-allowed' : 'pointer' }}
            >
              <Avatar id={avatar.id} size={56} isLocked={isLocked} />
            </button>
          );
        })}
      </div>

      {/* Selected / Hovered Avatar Info Section */}
      {(() => {
        const activeAvatar = hoveredAvatar || AVATARS.find(a => a.id === user.avatar) || AVATARS[0];
        const isLocked = activeAvatar.unlockThreshold > user.totalPoints;
        return (
          <div style={{
            marginTop: '20px',
            padding: '12px 16px',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            textAlign: 'center',
            minHeight: '74px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}>
            <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.95rem', marginBottom: '4px' }}>
              {activeAvatar.name}
              {isLocked && <span style={{ color: 'var(--warning)', marginLeft: '8px', fontSize: '0.8rem' }}>(Ξεκλειδώνει: {activeAvatar.unlockThreshold} pts)</span>}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {activeAvatar.description}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
