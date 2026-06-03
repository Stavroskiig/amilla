import React, { useState, useEffect } from 'react';
import { Award, Check, AlertTriangle, Lock, HelpCircle } from 'lucide-react';

const countryToFlagCode = {
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
  'Ηνωμένες Πολιτείες Αμερικής': 'us',
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
  'Τυνησία': 'tn'
};

const renderFlag = (teamName) => {
  const code = countryToFlagCode[teamName];
  if (!code) return null;
  return (
    <img
      src={`https://flagcdn.com/w40/${code}.png`}
      srcSet={`https://flagcdn.com/w80/${code}.png 2x`}
      alt={teamName}
      style={{
        width: '28px',
        height: '18px',
        objectFit: 'cover',
        borderRadius: '3px',
        border: '1px solid rgba(255,255,255,0.15)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        verticalAlign: 'middle',
        flexShrink: 0
      }}
    />
  );
};

const COUNTRIES = [
  'Αγγλία',
  'Αίγυπτος',
  'Αϊτή',
  'Ακτή Ελεφαντοστού',
  'Αλγερία',
  'Αργεντινή',
  'Αυστραλία',
  'Αυστρία',
  'Βέλγιο',
  'Βοσνία και Ερζεγοβίνη',
  'Βραζιλία',
  'Γαλλία',
  'Γερμανία',
  'Γκάνα',
  'Ελβετία',
  'Ηνωμένες Πολιτείες Αμερικής',
  'Ιαπωνία',
  'Ιορδανία',
  'Ιράκ',
  'Ιράν',
  'Ισημερινός',
  'Ισπανία',
  'Καναδάς',
  'Κατάρ',
  'Κολομβία',
  'Κουρασάο',
  'Κροατία',
  'Λαϊκή Δημοκρατία του Κονγκό',
  'Μαρόκο',
  'Μεξικό',
  'Νέα Ζηλανδία',
  'Νορβηγία',
  'Νότια Αφρική',
  'Νότια Κορέα',
  'Ολλανδία',
  'Ουζμπεκιστάν',
  'Ουρουγουάη',
  'Παναμάς',
  'Παραγουάη',
  'Πορτογαλία',
  'Πράσινο Ακρωτήριο',
  'Σαουδική Αραβία',
  'Σενεγάλη',
  'Σκωτία',
  'Σουηδία',
  'Τουρκία',
  'Τσεχία',
  'Τυνησία'
];

export default function LongTerm({ user }) {
  const [championTeam, setChampionTeam] = useState('');
  const [savedChampionTeam, setSavedChampionTeam] = useState('');
  const [submittedAt, setSubmittedAt] = useState(null);
  const [locked, setLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [openingMatchTime, setOpeningMatchTime] = useState(null);
  const [groupStageEndTime, setGroupStageEndTime] = useState(null);

  useEffect(() => {
    fetchLongTermInfo();
  }, []);

  const fetchLongTermInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // 1. Fetch current user's long term prediction
      const predRes = await fetch('/api/predictions/longterm', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (predRes.ok) {
        const pred = await predRes.json();
        if (pred) {
          setChampionTeam(pred.predictedChampionTeam);
          setSavedChampionTeam(pred.predictedChampionTeam);
          setSubmittedAt(pred.submittedAt);
        }
      }

      // 2. Fetch matches to determine cutoffs and lock status
      const matchRes = await fetch('/api/matches', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const matches = await matchRes.json();
      if (matchRes.ok && matches.length > 0) {
        // Opening kickoff is the minimum kickoff time
        const opening = new Date(Math.min(...matches.map(m => new Date(m.kickoffTime))));
        setOpeningMatchTime(opening);

        // Group stage end is the kickoff of the first ROUND_OF_16/Knockout match
        const knockouts = matches.filter(m => m.matchStage !== 'GROUP');
        if (knockouts.length > 0) {
          const groupEnd = new Date(Math.min(...knockouts.map(m => new Date(m.kickoffTime))));
          setGroupStageEndTime(groupEnd);
          
          // Lock if current time is past groupEnd
          if (new Date() > groupEnd) {
            setLocked(true);
          }
        } else {
          // If no knockouts scheduled yet, lock after 30 days from now as backup
          setGroupStageEndTime(new Date(Date.now() + 30 * 24 * 3600 * 1000));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!championTeam.trim()) return;

    setSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/predictions/longterm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ championTeam: championTeam.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Σφάλμα υποβολής');

      setSavedChampionTeam(data.predictedChampionTeam);
      setSubmittedAt(data.submittedAt);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Determine current bonus level info
  const getBonusText = () => {
    if (!openingMatchTime) return '10 πόντοι (Early Bird) / 5 πόντοι (Κατά τη διάρκεια των ομίλων)';
    const now = new Date();
    if (now < openingMatchTime) {
      return '🔥 Early Bird: Αν βρείτε τον πρωταθλητή τώρα, κερδίζετε 10 πόντους bonus!';
    }
    if (groupStageEndTime && now < groupStageEndTime) {
      return '⚠️ Group Stage Mode: Επιτρέπεται αλλαγή, αλλά με bonus 5 πόντους.';
    }
    return '🔒 Κλειδωμένο: Οι προβλέψεις έχουν κλείσει.';
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'rgba(99,102,241,0.1)',
          border: '1px solid rgba(99,102,241,0.2)',
          color: '#818cf8',
          marginBottom: '16px'
        }}>
          <Award size={28} />
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Μακροχρόνια Πρόβλεψη</h1>
        <p style={{ color: 'var(--text-muted)' }}>Ποια ομάδα θα σηκώσει το Παγκόσμιο Κύπελλο;</p>
      </div>

      <div className="glass-card" style={{ padding: '32px' }}>
        
        {/* Rules info */}
        <div className="glass" style={{
          padding: '16px 20px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '28px',
          background: 'rgba(255,255,255,0.01)',
          fontSize: '0.9rem',
          lineHeight: '1.5'
        }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#ffffff' }}>
            <HelpCircle size={16} className="text-indigo-400" />
            <span>Κανόνες Βαθμολογίας Πρωταθλητή</span>
          </h4>
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', color: 'var(--text-muted)' }}>
            <li>Υποβολή <strong>πριν τη σέντρα του 1ου αγώνα</strong>: <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>+10 Πόντοι</span></li>
            <li>Υποβολή/Αλλαγή <strong>κατά τη φάση των ομίλων</strong>: <span style={{ color: 'var(--warning)', fontWeight: 'bold' }}>+5 Πόντοι</span></li>
            <li>Μετά το τέλος των ομίλων, η πρόβλεψη κλειδώνει οριστικά.</li>
          </ul>
        </div>

        {error && (
          <div className="glass" style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            borderLeft: '4px solid var(--danger)',
            background: 'rgba(239, 68, 68, 0.08)',
            color: '#fca5a5',
            fontSize: '0.85rem',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div className="glass" style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            borderLeft: '4px solid var(--success)',
            background: 'rgba(16, 185, 129, 0.08)',
            color: '#a7f3d0',
            fontSize: '0.85rem',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Check size={16} />
            <span>Η πρόβλεψη αποθηκεύτηκε επιτυχώς!</span>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Φόρτωση στοιχείων...</div>
        ) : (
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">Η Πρόβλεψή σας</label>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.1)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.03)' }}>
                {renderFlag(championTeam) ? (
                  <div style={{ transform: 'scale(1.5)', display: 'inline-block', padding: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {renderFlag(championTeam)}
                  </div>
                ) : (
                  <div style={{ width: '42px', height: '28px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', border: '1px dotted rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <HelpCircle size={16} style={{ color: 'var(--text-muted)' }} />
                  </div>
                )}
                <select
                  disabled={locked}
                  className="form-input"
                  style={{
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    textAlign: 'center',
                    background: 'rgba(10, 11, 16, 0.7)',
                    color: '#ffffff',
                    border: '1px solid var(--border-color)',
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    cursor: locked ? 'not-allowed' : 'pointer',
                    flex: '1'
                  }}
                  value={championTeam}
                  onChange={(e) => setChampionTeam(e.target.value)}
                >
                  <option value="">Επιλέξτε ομάδα...</option>
                  {COUNTRIES.map(country => (
                    <option key={country} value={country}>{country.toUpperCase()}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Status indicators */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '0.85rem',
              color: locked ? 'var(--danger)' : 'var(--text-muted)',
              textAlign: 'center',
              fontWeight: 500
            }}>
              {locked ? (
                <>
                  <Lock size={16} />
                  <span>Οι προβλέψεις κλείδωσαν οριστικά.</span>
                </>
              ) : (
                <span>{getBonusText()}</span>
              )}
            </div>

            {savedChampionTeam && (
              <div style={{
                textAlign: 'center',
                fontSize: '0.9rem',
                color: 'var(--text-muted)',
                marginTop: '8px',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(99,102,241,0.05)',
                border: '1px solid rgba(99,102,241,0.1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                  <span>Τρέχουσα αποθηκευμένη πρόβλεψη: </span>
                  {renderFlag(savedChampionTeam)}
                  <strong style={{ color: '#ffffff', textTransform: 'uppercase' }}>{savedChampionTeam}</strong>
                </div>
                {submittedAt && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Υποβλήθηκε στις: {new Date(submittedAt).toLocaleString('el-GR', { timeZone: 'Europe/Athens' })}
                  </div>
                )}
              </div>
            )}

            {!locked && (
              <button
                type="submit"
                disabled={submitting || !championTeam.trim() || championTeam.trim().toUpperCase() === savedChampionTeam.toUpperCase()}
                className="btn btn-primary"
                style={{ width: '100%', padding: '14px', marginTop: '10px' }}
              >
                {submitting ? 'Υποβολή...' : 'Αποθήκευση Πρόβλεψης'}
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
