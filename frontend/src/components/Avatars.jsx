import React from 'react';
import { 
  Trophy, 
  Zap, 
  Shield, 
  Crown, 
  Target, 
  Star, 
  Flame, 
  Award, 
  Heart, 
  Activity,
  User
} from 'lucide-react';

export const AVATARS = [
  {
    id: 'avatar_1',
    name: 'Χρυσό Κύπελλο',
    gradient: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
    icon: Trophy,
    color: '#ffffff'
  },
  {
    id: 'avatar_2',
    name: 'Κεραυνός',
    gradient: 'linear-gradient(135deg, #fbbf24 0%, #f97316 100%)',
    icon: Zap,
    color: '#ffffff'
  },
  {
    id: 'avatar_3',
    name: 'Ασπίδα',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
    icon: Shield,
    color: '#ffffff'
  },
  {
    id: 'avatar_4',
    name: 'Στέμμα',
    gradient: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
    icon: Crown,
    color: '#ffffff'
  },
  {
    id: 'avatar_5',
    name: 'Στόχος',
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    icon: Target,
    color: '#ffffff'
  },
  {
    id: 'avatar_6',
    name: 'Αστέρι',
    gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
    icon: Star,
    color: '#ffffff'
  },
  {
    id: 'avatar_7',
    name: 'Φλόγα',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #ef4444 100%)',
    icon: Flame,
    color: '#ffffff'
  },
  {
    id: 'avatar_8',
    name: 'Μετάλλιο',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
    icon: Award,
    color: '#ffffff'
  },
  {
    id: 'avatar_9',
    name: 'Καρδιά',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
    icon: Heart,
    color: '#ffffff'
  },
  {
    id: 'avatar_10',
    name: 'Παλμός',
    gradient: 'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)',
    icon: Activity,
    color: '#ffffff'
  }
];

export function Avatar({ id, size = 24, style = {}, className = '' }) {
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
          background: 'rgba(255, 255, 255, 0.1)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          ...style
        }}
      >
        <User size={size * 0.6} color="var(--text-muted)" />
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
        background: avatar.gradient,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
        ...style
      }}
      title={avatar.name}
    >
      <IconComponent size={size * 0.55} color={avatar.color} />
    </div>
  );
}
