import React from 'react';

export const countryToFlagCode = {
  'Αίγυπτος': 'eg',
  'Αγγλία': 'gb-eng',
  'Ακτή Ελεφαντοστού': 'ci',
  'Αλγερία': 'dz',
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
  'Ελβετία': 'ch',
  'Ιαπωνία': 'jp',
  'Ιορδανία': 'jo',
  'Ιράν': 'ir',
  'Ισπανία': 'es',
  'Καναδάς': 'ca',
  'Κατάρ': 'qa',
  'Κολομβία': 'co',
  'Κουρασάο': 'cw',
  'Κροατία': 'hr',
  'Μαρόκο': 'ma',
  'Μεξικό': 'mx',
  'Νέα Ζηλανδία': 'nz',
  'Νορβηγία': 'no',
  'Νότια Αφρική': 'za',
  'Νότια Κορέα': 'kr',
  'Ολλανδία': 'nl',
  'Ουζμπεκιστάν': 'uz',
  'Ουρουγουάη': 'uy',
  'Παναμάς': 'pa',
  'Παραγουάη': 'py',
  'Πορτογαλία': 'pt',
  'Πράσινο Ακρωτήριο': 'cv',
  'Σαουδική Αραβία': 'sa',
  'Σενεγάλη': 'sn',
  'Σκωτία': 'gb-sct',
  'Σουηδία': 'se',
  'Τουρκία': 'tr',
  'Τσεχία': 'cz',
  'Τυνησία': 'tn',
  'ΗΠΑ': 'us'
};

// Dynamically generate sorted array of country names for selection lists
export const COUNTRIES = Object.keys(countryToFlagCode).sort((a, b) => a.localeCompare(b, 'el'));

export const countryToThreeLetter = {
  'Αίγυπτος': 'ΑΙΓ',
  'Αγγλία': 'ΑΓΓ',
  'Ακτή Ελεφαντοστού': 'ΑΚΤ',
  'Αλγερία': 'ΑΛΓ',
  'Αργεντινή': 'ΑΡΓ',
  'Αυστρία': 'ΑΥΣ',
  'Αυστραλία': 'ΑΥΛ',
  'Αϊτή': 'ΑΙΤ',
  'Βέλγιο': 'ΒΕΛ',
  'Βοσνία και Ερζεγοβίνη': 'ΒΟΣ',
  'Βραζιλία': 'ΒΡΑ',
  'Γαλλία': 'ΓΑΛ',
  'Γερμανία': 'ΓΕΡ',
  'Γκάνα': 'ΓΚΑ',
  'Ελβετία': 'ΕΛΒ',
  'Ιαπωνία': 'ΙΑΠ',
  'Ιορδανία': 'ΙΟΡ',
  'Ιράν': 'ΙΡΑ',
  'Ισπανία': 'ΙΣΠ',
  'Καναδάς': 'ΚΑΝ',
  'Κατάρ': 'ΚΑΤ',
  'Κολομβία': 'ΚΟΛ',
  'Κουρασάο': 'ΚΟΥ',
  'Κροατία': 'ΚΡΟ',
  'Μαρόκο': 'ΜΑΡ',
  'Μεξικό': 'ΜΕΞ',
  'Νέα Ζηλανδία': 'Ν.Ζ',
  'Νορβηγία': 'ΝΟΡ',
  'Νότια Αφρική': 'Ν.Α',
  'Νότια Κορέα': 'Ν.Κ',
  'Ολλανδία': 'ΟΛΛ',
  'Ουζμπεκιστάν': 'ΟΥΖ',
  'Ουρουγουάη': 'ΟΥΡ',
  'Παναμάς': 'ΠΑΝ',
  'Παραγουάη': 'ΠΑΡ',
  'Πορτογαλία': 'ΠΟΡ',
  'Πράσινο Ακρωτήριο': 'Π.Α',
  'Σαουδική Αραβία': 'Σ.Α',
  'Σενεγάλη': 'ΣΕΝ',
  'Σκωτία': 'ΣΚΩ',
  'Σουηδία': 'ΣΟΥ',
  'Τουρκία': 'ΤΟΥ',
  'Τσεχία': 'ΤΣΕ',
  'Τυνησία': 'ΤΥΝ',
  'ΗΠΑ': 'ΗΠΑ'
};

// Greek uppercase without accents utility (retaining diaeresis)
export const uppercaseNoAccents = (text) => {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u0307\u0309-\u036f]/g, '')
    .toUpperCase()
    .normalize('NFC');
};

export const getTeamShortName = (teamName) => {
  return countryToThreeLetter[teamName] || uppercaseNoAccents(teamName).substring(0, 3);
};

export function Flag({ teamName, width = 24, height = 16, style = {}, className = '' }) {
  const code = countryToFlagCode[teamName];
  if (!code) return null;

  return (
    <img
      src={`https://flagcdn.com/w40/${code}.png`}
      srcSet={`https://flagcdn.com/w80/${code}.png 2x`}
      alt={teamName}
      loading="lazy"
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


