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
  User
} from 'lucide-react';

export const AVATARS = [
  {
    id: 'avatar_1',
    name: 'Σήκωσέ το',
    description: 'Για αυτούς που ονειρεύονται το χρυσό κύπελλο.',
    gradient: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
    icon: Trophy,
    color: '#ffffff'
  },
  {
    id: 'avatar_2',
    name: 'Μπαλαδόρος',
    description: 'Μάγος της μπάλας, παίζει μόνο με εξωτερικό φάλτσο.',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
    icon: Sparkles,
    color: '#ffffff'
  },
  {
    id: 'avatar_3',
    name: 'Άρχοντας του VAR',
    description: 'Βλέπει και την παραμικρή λεπτομέρεια, ακόμα και στο ριπλέι.',
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
    icon: Glasses,
    color: '#ffffff'
  },
  {
    id: 'avatar_4',
    name: 'Το Πούλμαν',
    description: 'Άμυνα μπετόν αρμέ, 11 παίκτες πίσω από τη σέντρα.',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #ef4444 100%)',
    icon: Siren,
    color: '#ffffff'
  },
  {
    id: 'avatar_5',
    name: 'Κωλόφαρδος',
    description: 'Κερδίζει με αυτογκόλ στο 95\' και κόντρα της κόντρας.',
    gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
    icon: Clover,
    color: '#ffffff'
  },
  {
    id: 'avatar_6',
    name: 'Μπανανόφλουδα',
    description: 'Ειδικός στις γκέλες και στα απρόβλεπτα στραβοπατήματα.',
    gradient: 'linear-gradient(135deg, #facc15 0%, #ca8a04 100%)',
    icon: Banana,
    color: '#ffffff'
  },
  {
    id: 'avatar_7',
    name: 'Ξυλοκόπος',
    description: 'Περνάει η μπάλα ή ο παίκτης, ποτέ και τα δύο μαζί.',
    gradient: 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)',
    icon: Hammer,
    color: '#ffffff'
  },
  {
    id: 'avatar_8',
    name: 'Καφετζής',
    description: 'Χαλαρός στον πάγκο με φραπέ, βλέπει το ματς σαν προπόνηση.',
    gradient: 'linear-gradient(135deg, #78350f 0%, #451a03 100%)',
    icon: Coffee,
    color: '#ffffff'
  },
  {
    id: 'avatar_9',
    name: 'Στον Κουβά',
    description: 'Μόνιμος κάτοικος του κουβά των προβλέψεων.',
    gradient: 'linear-gradient(135deg, #6b7280 0%, #374151 100%)',
    icon: Trash,
    color: '#ffffff'
  },
  {
    id: 'avatar_10',
    name: 'Τρίτο Ημίχρονο',
    description: 'Παίζει μπάλα μόνο στο μπαρ με μπύρες μετά τον αγώνα.',
    gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
    icon: Beer,
    color: '#ffffff'
  },
  {
    id: 'avatar_11',
    name: 'Γάτα στα Δοκάρια',
    description: 'Αιλουροειδές κάτω από τα δοκάρια, δεν περνάει τίποτα.',
    gradient: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
    icon: Cat,
    color: '#ffffff'
  },
  {
    id: 'avatar_12',
    name: 'Φάντασμα',
    description: 'Έπαιξε 90 λεπτά αλλά κανείς δεν κατάλαβε ότι ήταν εκεί.',
    gradient: 'linear-gradient(135deg, #94a3b8 0%, #475569 100%)',
    icon: Ghost,
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
