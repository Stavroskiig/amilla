import React from 'react';
import {
  Trophy,
  Sparkles,
  Glasses,
  Siren,
  Clover,
  Banana,
  Hammer,
  Coffee,
  Trash,
  Beer,
  Cat,
  Ghost,
  User,
  Lock
} from 'lucide-react';

export const AVATARS = [
  {
    id: 'avatar_1',
    name: 'Πρωταθλητής',
    description: 'Για αυτούς που ονειρεύονται το βαρύτιμο τρόπαιο.',
    gradient: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
    icon: Trophy,
    color: '#ffffff',
    unlockThreshold: 500
  },
  {
    id: 'avatar_2',
    name: 'Μπαλαδόρος',
    description: 'Μάγος της μπάλας, παίζει μόνο με εξωτερικό φάλτσο.',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
    icon: Sparkles,
    color: '#ffffff',
    unlockThreshold: 200
  },
  {
    id: 'avatar_3',
    name: 'VARίστας',
    description: 'Βλέπει και την παραμικρή λεπτομέρεια, ακόμα και στο ριπλέι.',
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
    icon: Glasses,
    color: '#ffffff',
    unlockThreshold: 100
  },
  {
    id: 'avatar_4',
    name: 'Το Πούλμαν',
    description: 'Άμυνα μπετόν αρμέ, 11 παίκτες πίσω από τη σέντρα.',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #ef4444 100%)',
    icon: Siren,
    color: '#ffffff',
    unlockThreshold: 50
  },
  {
    id: 'avatar_5',
    name: 'Κωλόφαρδος',
    description: 'Κερδίζει με αυτογκόλ στο 95\' και κόντρα της κόντρας.',
    gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
    icon: Clover,
    color: '#ffffff',
    unlockThreshold: 0
  },
  {
    id: 'avatar_6',
    name: 'Γκαφατζής',
    description: 'Ειδικός στις γκέλες και στα απρόβλεπτα στραβοπατήματα.',
    gradient: 'linear-gradient(135deg, #facc15 0%, #ca8a04 100%)',
    icon: Banana,
    color: '#ffffff',
    unlockThreshold: 0
  },
  {
    id: 'avatar_7',
    name: 'Ξυλοκόπος',
    description: 'Περνάει ή μπάλα ή ο παίκτης, ποτέ και τα δύο μαζί.',
    gradient: 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)',
    icon: Hammer,
    color: '#ffffff',
    unlockThreshold: 0
  },
  {
    id: 'avatar_8',
    name: 'Καφετζής',
    description: 'Χαλαρός στον πάγκο με φραπέ, βλέπει το ματς σαν προπόνηση.',
    gradient: 'linear-gradient(135deg, #78350f 0%, #451a03 100%)',
    icon: Coffee,
    color: '#ffffff',
    unlockThreshold: 0
  },
  {
    id: 'avatar_9',
    name: 'Κουβάς',
    description: 'Μόνιμος κάτοικος του κουβά των προβλέψεων.',
    gradient: 'linear-gradient(135deg, #6b7280 0%, #374151 100%)',
    icon: Trash,
    color: '#ffffff',
    unlockThreshold: 0
  },
  {
    id: 'avatar_10',
    name: 'Τουρίστας',
    description: 'Παίζει μπάλα μόνο στο μπαρ με μπύρες μετά τον αγώνα.',
    gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
    icon: Beer,
    color: '#ffffff',
    unlockThreshold: 0
  },
  {
    id: 'avatar_11',
    name: 'Γάτα στα Δοκάρια',
    description: 'Αιλουροειδές κάτω από τα δοκάρια, δεν περνάει τίποτα.',
    gradient: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
    icon: Cat,
    color: '#ffffff',
    unlockThreshold: 300
  },
  {
    id: 'avatar_12',
    name: 'Φάντασμα',
    description: 'Έπαιξε 90 λεπτά αλλά κανείς δεν κατάλαβε ότι ήταν εκεί.',
    gradient: 'linear-gradient(135deg, #94a3b8 0%, #475569 100%)',
    icon: Ghost,
    color: '#ffffff',
    unlockThreshold: 0
  }
].sort((a, b) => a.unlockThreshold - b.unlockThreshold);

export function Avatar({ id, size = 24, style = {}, className = '', isLocked = false }) {
  const avatar = AVATARS.find(a => a.id === id);

  if (!avatar) {
    // Fallback avatar
    return (
      <div
        className={`avatar-fallback ${className}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          background: 'var(--fallback-avatar-bg, linear-gradient(135deg, #475569 0%, #334155 100%))',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid var(--fallback-avatar-border, rgba(255, 255, 255, 0.1))',
          boxShadow: 'var(--fallback-avatar-shadow, 0 2px 8px rgba(0, 0, 0, 0.2))',
          ...style
        }}
      >
        <User size={size * 0.6} color="var(--fallback-avatar-icon, #cbd5e1)" />
      </div>
    );
  }

  const IconComponent = avatar.icon;

  return (
    <div
      className={`avatar-badge-wrapper ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        background: isLocked ? 'rgba(255, 255, 255, 0.05)' : avatar.gradient,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: isLocked ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.2)',
        position: 'relative',
        filter: isLocked ? 'grayscale(100%) opacity(50%)' : 'none',
        ...style
      }}
      title={isLocked ? `${avatar.name} (Ξεκλειδώνει στους ${avatar.unlockThreshold} πόντους)` : avatar.name}
    >
      <IconComponent size={size * 0.55} color={isLocked ? '#9ca3af' : avatar.color} />
      {isLocked && (
        <div style={{
          position: 'absolute',
          bottom: '-2px',
          right: '-2px',
          background: 'var(--bg-main)',
          borderRadius: '50%',
          padding: '2px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Lock size={size * 0.25} color="var(--text-muted)" />
        </div>
      )}
    </div>
  );
}
