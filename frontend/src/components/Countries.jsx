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
  'Ιράκ': 'iq',
  'Ιράν': 'ir',
  'Ισημερινός': 'ec',
  'Ισπανία': 'es',
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
  'Ιράκ': 'ΙΡΚ',
  'Ιράν': 'ΙΡΑ',
  'Ισημερινός': 'ΙΣΗ',
  'Ισπανία': 'ΙΣΠ',
  'Καναδάς': 'ΚΑΝ',
  'Κατάρ': 'ΚΑΤ',
  'Κολομβία': 'ΚΟΛ',
  'Κουρασάο': 'ΚΟΥ',
  'Κροατία': 'ΚΡΟ',
  'Λαϊκή Δημοκρατία του Κονγκό': 'ΛΔΚ',
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

export const countryToColor = {
  'Αίγυπτος': '#ce1126',
  'Αγγλία': '#e5e5e5',
  'Ακτή Ελεφαντοστού': '#f77f00',
  'Αλγερία': '#006233',
  'Αργεντινή': '#75aadb',
  'Αυστρία': '#ed2939',
  'Αυστραλία': '#ffcd00',
  'Αϊτή': '#00205b',
  'Βέλγιο': '#e30613',
  'Βοσνία και Ερζεγοβίνη': '#002395',
  'Βραζιλία': '#fedc01',
  'Γαλλία': '#002395',
  'Γερμανία': '#e5e5e5',
  'Γκάνα': '#006b3f',
  'Ελβετία': '#ff0000',
  'Ιαπωνία': '#000555',
  'Ιορδανία': '#ce1126',
  'Ιράκ': '#007a3d',
  'Ιράν': '#239f40',
  'Ισημερινός': '#ffdd00',
  'Ισπανία': '#c60b1e',
  'Καναδάς': '#ff0000',
  'Κατάρ': '#8a1538',
  'Κολομβία': '#fcd116',
  'Κουρασάο': '#002b7f',
  'Κροατία': '#ff0000',
  'Λαϊκή Δημοκρατία του Κονγκό': '#007fff',
  'Μαρόκο': '#c1272d',
  'Μεξικό': '#006847',
  'Νέα Ζηλανδία': '#e5e5e5',
  'Νορβηγία': '#ba0c2f',
  'Νότια Αφρική': '#007749',
  'Νότια Κορέα': '#0047a0',
  'Ολλανδία': '#f36c21',
  'Ουζμπεκιστάν': '#0099b5',
  'Ουρουγουάη': '#75aadb',
  'Παναμάς': '#c8102e',
  'Παραγουάη': '#d52b1e',
  'Πορτογαλία': '#e42518',
  'Πράσινο Ακρωτήριο': '#003893',
  'Σαουδική Αραβία': '#006c35',
  'Σενεγάλη': '#00853f',
  'Σκωτία': '#005eb8',
  'Σουηδία': '#fecc00',
  'Τουρκία': '#e30a17',
  'Τσεχία': '#11457e',
  'Τυνησία': '#e70013',
  'ΗΠΑ': '#3c3b6e'
};

export const getTeamColor = (teamName) => {
  if (countryToColor[teamName]) {
    return countryToColor[teamName];
  }
  let hash = 0;
  for (let i = 0; i < teamName.length; i++) {
    hash = teamName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 60%)`;
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
    case 'GROUP': return 'ΟΜΙΛΟΙ';
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


