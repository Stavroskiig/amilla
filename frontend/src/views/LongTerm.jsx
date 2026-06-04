import React, { useState, useEffect } from 'react';
import { Award, Check, AlertTriangle, Lock, HelpCircle, ChevronDown, Search, Zap } from 'lucide-react';

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
  const [othersPredictions, setOthersPredictions] = useState([]);

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = React.useRef(null);
  const searchInputRef = React.useRef(null);

  // Greek normalization utility for accent-insensitive search
  const normalizeGreek = (text) => {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  };

  // Greek uppercase without accents utility
  const uppercaseNoAccents = (text) => {
    if (!text) return '';
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase();
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelectCountry = (country) => {
    if (locked) return;
    setChampionTeam(country);
    setIsOpen(false);
    setSearchQuery('');
  };

  const filteredCountries = COUNTRIES.filter((country) => {
    const normalizedCountry = normalizeGreek(country);
    const normalizedQuery = normalizeGreek(searchQuery);
    return normalizedCountry.includes(normalizedQuery);
  });

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
        const validMatchTimes = matches
          .map(m => m.kickoffTime ? new Date(m.kickoffTime).getTime() : null)
          .filter(t => t !== null && !isNaN(t));

        if (validMatchTimes.length > 0) {
          const opening = new Date(Math.min(...validMatchTimes));
          setOpeningMatchTime(opening);
        }

        // Group stage end is the kickoff of the first ROUND_OF_16/Knockout match
        const knockouts = matches.filter(m => m.matchStage !== 'GROUP');
        const validKoTimes = knockouts
          .map(m => m.kickoffTime ? new Date(m.kickoffTime).getTime() : null)
          .filter(t => t !== null && !isNaN(t));

        if (validKoTimes.length > 0) {
          const groupEnd = new Date(Math.min(...validKoTimes));
          setGroupStageEndTime(groupEnd);

          // Lock if current time is past groupEnd
          if (new Date() > groupEnd) {
            setLocked(true);
            try {
              const othersRes = await fetch('/api/predictions/longterm/all', {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              if (othersRes.ok) {
                const othersData = await othersRes.json();
                setOthersPredictions(othersData);
              }
            } catch (err) {
              console.error("Failed to fetch all champion predictions:", err);
            }
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
    // The list of matches is still loading or could not be retrieved from the server.
    if (!openingMatchTime) {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#ffffff' }}>
          <HelpCircle size={16} style={{ color: '#ffffff' }} />
          <span>10 πόντοι (Πρώιμη πρόβλεψη) / 5 πόντοι (Κατά τη διάρκεια των ομίλων)</span>
        </span>
      );
    }

    const now = new Date();

    // The current time is before the kickoff of the very first match of the tournament.
    if (now < openingMatchTime) {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#ffffff' }}>
          <Zap size={16} style={{ color: '#ffffff' }} />
          <span>Αν βρείτε τον πρωταθλητή από την αρχή, κερδίζετε και τους 10 πόντους!</span>
        </span>
      );
    }

    // The current time is after the kickoff of the first match but before the kickoff of the first knockout match.
    if (groupStageEndTime && now < groupStageEndTime) {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#ffffff' }}>
          <AlertTriangle size={16} style={{ color: '#ffffff' }} />
          <span>Επιτρέπεται αλλαγή, αλλά με κόστος 5 πόντους.</span>
        </span>
      );
    }

    // The current time is after the kickoff of the first knockout match.
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#ffffff' }}>
        <Lock size={16} style={{ color: '#ffffff' }} />
        <span>Κλειδωμένο: Οι προβλέψεις έχουν κλείσει.</span>
      </span>
    );
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

      <div className="glass-card responsive-card-padding" style={{ padding: '32px', overflow: 'visible' }}>

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
            <div className="form-group" style={{ position: 'relative' }} ref={dropdownRef}>
              <label className="form-label">Η Πρόβλεψή σας</label>

              <div
                onClick={() => !locked && setIsOpen(!isOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(15, 16, 26, 0.8)',
                  border: isOpen ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                  color: '#ffffff',
                  cursor: locked ? 'not-allowed' : 'pointer',
                  boxShadow: isOpen ? '0 0 0 3px rgba(99, 102, 241, 0.2)' : 'none',
                  transition: 'all 0.2s ease',
                  opacity: locked ? 0.7 : 1
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {championTeam ? (
                    <>
                      {renderFlag(championTeam)}
                      <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                        {uppercaseNoAccents(championTeam)}
                      </span>
                    </>
                  ) : (
                    <>
                      <div style={{ width: '28px', height: '18px', background: 'rgba(255,255,255,0.03)', borderRadius: '3px', border: '1px dotted rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <HelpCircle size={12} style={{ color: 'var(--text-muted)' }} />
                      </div>
                      <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>
                        Επιλέξτε ομάδα...
                      </span>
                    </>
                  )}
                </div>
                {!locked && (
                  <ChevronDown
                    size={20}
                    style={{
                      color: 'var(--text-muted)',
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease'
                    }}
                  />
                )}
              </div>

              {isOpen && !locked && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    left: 0,
                    right: 0,
                    zIndex: 50,
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-lg)',
                    background: '#161825',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  {/* Search Input Box */}
                  <div style={{
                    padding: '8px',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(10, 11, 16, 0.4)'
                  }}>
                    <Search size={16} style={{ color: 'var(--text-muted)', marginLeft: '8px' }} />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Αναζήτηση χώρας..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        color: '#ffffff',
                        fontSize: '0.95rem',
                        width: '100%',
                        padding: '6px 4px'
                      }}
                    />
                  </div>

                  {/* Countries Scrollable List */}
                  <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                    {filteredCountries.length > 0 ? (
                      filteredCountries.map((country) => {
                        const isSelected = championTeam === country;
                        return (
                          <div
                            key={country}
                            onClick={() => handleSelectCountry(country)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '10px 16px',
                              cursor: 'pointer',
                              background: isSelected
                                ? 'rgba(99, 102, 241, 0.15)'
                                : 'transparent',
                              transition: 'background 0.15s ease'
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected) {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected) {
                                e.currentTarget.style.background = 'transparent';
                              }
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              {renderFlag(country)}
                              <span style={{
                                fontSize: '0.95rem',
                                fontWeight: isSelected ? 700 : 500,
                                color: isSelected ? '#ffffff' : 'var(--text-main)'
                              }}>
                                {uppercaseNoAccents(country)}
                              </span>
                            </div>
                            {isSelected && (
                              <Check size={16} style={{ color: 'var(--primary)' }} />
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div style={{
                        padding: '20px',
                        textAlign: 'center',
                        color: 'var(--text-muted)',
                        fontSize: '0.9rem'
                      }}>
                        Δεν βρέθηκαν αποτελέσματα
                      </div>
                    )}
                  </div>
                </div>
              )}
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
                getBonusText()
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
                  <strong style={{ color: '#ffffff' }}>{uppercaseNoAccents(savedChampionTeam)}</strong>
                </div>
                {submittedAt && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Υποβλήθηκε στις: {new Date(submittedAt).toLocaleString('el-GR', { timeZone: 'Europe/Athens', hour12: false })}
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

      {/* Other Users' Long Term Predictions Reveal */}
      {locked && othersPredictions && othersPredictions.length > 0 && (
        <div className="glass-card responsive-card-padding animate-fade-in" style={{ padding: '32px', marginTop: '32px' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={20} className="text-indigo-400" />
            <span>Προβλέψεις Πρωταθλητή Σογιού</span>
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
            Οι προβλέψεις κλείδωσαν! Δείτε ποιον υποστήριξε ο καθένας για την κατάκτηση του κυπέλλου:
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '16px'
          }}>
            {othersPredictions
              .filter(p => p.userId !== user.id) // Exclude current user since it's already shown above
              .map((p, idx) => (
                <div key={idx} className="glass" style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  border: '1px solid rgba(255,255,255,0.03)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>{p.username || 'Παίκτης'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '4px' }}>
                    {renderFlag(p.predictedChampionTeam)}
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>
                      {uppercaseNoAccents(p.predictedChampionTeam)}
                    </span>
                  </div>
                  {p.submittedAt && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px' }}>
                      Υποβλήθηκε: {new Date(p.submittedAt).toLocaleDateString('el-GR', { day: '2-digit', month: '2-digit' })} {new Date(p.submittedAt).toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit', hour12: false })}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
