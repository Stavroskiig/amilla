import React from 'react';

export const countryToFlagCode = {
  'Αίγυπτος': 'eg',
  'Αγγλία': 'gb-eng',
  'Ακτή Ελεφαντοστού': 'ci',
  'Αλγερία': 'dz',
  'Αλβανία': 'al',
  'Αργεντινή': 'ar',
  'Αυστρία': 'at',
  'Αυστραλία': 'au',
  'Αϊτή': 'ht',
  'Βέλγιο': 'be',
  'Βοσνία και Ερζεγοβίνη': 'ba',
  'Βραζιλία': 'br',
  'Γαλλία': 'fr',
  'Γερμανία': 'de',
  'Γκάνα': 'gh',
  'Γεωργία': 'ge',
  'Δανία': 'dk',
  'Ελβετία': 'ch',
  'Ελλάδα': 'gr',
  'Ηνωμένες Πολιτείες Αμερικής': 'us',
  'Ιαπωνία': 'jp',
  'Ιορδανία': 'jo',
  'Ιράκ': 'iq',
  'Ιράν': 'ir',
  'Ισημερινός': 'ec',
  'Ισπανία': 'es',
  'Ιταλία': 'it',
  'Καναδάς': 'ca',
  'Κατάρ': 'qa',
  'Κολομβία': 'co',
  'Κουρασάο': 'cw',
  'Κροατία': 'hr',
  'Λαϊκή Δημοκρατία του Κονγκό': 'cd',
  'Μαρόκο': 'ma',
  'Μεξικό': 'mx',
  'Νέα Ζηλανδία': 'nz',
  'Νορβηγία': 'no',
  'Νότια Αφρική': 'za',
  'Νότια Κορέα': 'kr',
  'Ολλανδία': 'nl',
  'Ουγγαρία': 'hu',
  'Ουζμπεκιστάν': 'uz',
  'Ουρουγουάη': 'uy',
  'Παναμάς': 'pa',
  'Παραγουάη': 'py',
  'Πορτογαλία': 'pt',
  'Πολωνία': 'pl',
  'Πράσινο Ακρωτήριο': 'cv',
  'Ρουμανία': 'ro',
  'Σαουδική Αραβία': 'sa',
  'Σενεγάλη': 'sn',
  'Σερβία': 'rs',
  'Σλοβακία': 'sk',
  'Σλοβενία': 'si',
  'Σκωτία': 'gb-sct',
  'Σουηδία': 'se',
  'Τουρκία': 'tr',
  'Τσεχία': 'cz',
  'Τυνησία': 'tn',
  'Ουκρανία': 'ua',
  'Φινλανδία': 'fi'
};

// Dynamically generate sorted array of country names for selection lists
export const COUNTRIES = Object.keys(countryToFlagCode).sort((a, b) => a.localeCompare(b, 'el'));

export function Flag({ teamName, width = 24, height = 16, style = {}, className = '' }) {
  const code = countryToFlagCode[teamName];
  if (!code) return null;

  return (
    <img
      src={`https://flagcdn.com/w40/${code}.png`}
      srcSet={`https://flagcdn.com/w80/${code}.png 2x`}
      alt={teamName}
      className={className}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        objectFit: 'cover',
        borderRadius: width > 24 ? '3px' : '2px',
        border: '1px solid rgba(255,255,255,0.15)',
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: 0,
        ...style
      }}
    />
  );
}

export const getStageLabel = (stage) => {
  switch (stage) {
    case 'GROUP': return 'ΦΑΣΗ ΟΜΙΛΩΝ';
    case 'ROUND_OF_32': return 'ΦΑΣΗ ΤΩΝ 32';
    case 'ROUND_OF_16': return 'ΦΑΣΗ ΤΩΝ 16';
    case 'QUARTER_FINAL':
    case 'QUARTERS':
      return 'ΠΡΟΗΜΙΤΕΛΙΚΟΣ';
    case 'SEMI_FINAL':
    case 'SEMIS':
      return 'ΗΜΙΤΕΛΙΚΟΣ';
    case 'THIRD_PLACE': return 'ΜΙΚΡΟΣ ΤΕΛΙΚΟΣ';
    case 'FINAL': return 'ΤΕΛΙΚΟΣ';
    default: return stage || '';
  }
};
