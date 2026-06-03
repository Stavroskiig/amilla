import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Check, Clock, AlertTriangle, Eye, Award } from 'lucide-react';

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
        flexShrink: 0
      }}
    />
  );
};

const getStageLabel = (stage) => {
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

export default function Matches({ user }) {
  const [matches, setMatches] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [othersPredictions, setOthersPredictions] = useState({});
  const [expandedMatchId, setExpandedMatchId] = useState(null);
  const [submittingId, setSubmittingId] = useState(null);
  const [successId, setSuccessId] = useState(null);
  const [errorId, setErrorId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [now, setNow] = useState(InstantNow());

  function InstantNow() {
    return new Date();
  }

  useEffect(() => {
    fetchMatches();
    const interval = setInterval(() => {
      setNow(new Date());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchMatches = async () => {
    try {
      const token = localStorage.getItem('token');
      // 1. Fetch matches
      const res = await fetch('/api/matches', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const matchesData = await res.json();
      if (!res.ok) throw new Error('Σφάλμα φόρτωσης αγώνων');
      setMatches(matchesData);

      // 2. Fetch current user's predictions for all matches
      const predsData = {};
      for (const m of matchesData) {
        try {
          const predRes = await fetch(`/api/predictions/match/${m.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (predRes.ok) {
            const pred = await predRes.json();
            if (pred) {
              predsData[m.id] = {
                home: pred.predictedHomeScore,
                away: pred.predictedAwayScore,
                qualifier: pred.predictedQualifier || '',
                savedHome: pred.predictedHomeScore,
                savedAway: pred.predictedAwayScore,
                savedQualifier: pred.predictedQualifier || '',
                pointsEarned: pred.pointsEarned
              };
            }
          }
        } catch (e) {
          console.error(e);
        }
      }
      setPredictions(predsData);
    } catch (err) {
      console.error(err);
    }
  };

  const handleScoreChange = (matchId, team, val) => {
    const cleanVal = val === '' ? '' : Math.max(0, parseInt(val) || 0);
    setPredictions(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [team]: cleanVal
      }
    }));
  };

  const handleQualifierChange = (matchId, val) => {
    setPredictions(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        qualifier: val
      }
    }));
  };

  const submitPrediction = async (matchId) => {
    setSubmittingId(matchId);
    setErrorId(null);
    setSuccessId(null);

    const pred = predictions[matchId] || { home: 0, away: 0, qualifier: '' };
    const cleanHome = pred.home === '' ? 0 : pred.home;
    const cleanAway = pred.away === '' ? 0 : pred.away;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/predictions/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          matchId,
          predictedHomeScore: cleanHome,
          predictedAwayScore: cleanAway,
          predictedQualifier: pred.qualifier || null
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Σφάλμα υποβολής');

      setPredictions(prev => ({
        ...prev,
        [matchId]: {
          ...prev[matchId],
          home: cleanHome,
          away: cleanAway,
          savedHome: cleanHome,
          savedAway: cleanAway,
          savedQualifier: pred.qualifier || '',
          pointsEarned: data.pointsEarned
        }
      }));

      setSuccessId(matchId);
      setTimeout(() => setSuccessId(null), 3000);
    } catch (err) {
      setErrorId(matchId);
      setErrorMessage(err.message);
    } finally {
      setSubmittingId(null);
    }
  };

  const toggleExpandMatchOthers = async (matchId) => {
    if (expandedMatchId === matchId) {
      setExpandedMatchId(null);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/predictions/match/${matchId}/others`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setOthersPredictions(prev => ({
          ...prev,
          [matchId]: data
        }));
        setExpandedMatchId(matchId);
      } else {
        alert(data.error || 'Δεν είναι δυνατή η προβολή των προβλέψεων ακόμη!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Helper to calculate lock status (Kickoff - 5 minutes)
  const isMatchLocked = (match) => {
    const kickoff = new Date(match.kickoffTime);
    const lockTime = new Date(kickoff.getTime() - 5 * 60000);
    return now > lockTime;
  };

  // Format countdown string
  const getCountdown = (match) => {
    const kickoff = new Date(match.kickoffTime);
    const diffMs = kickoff - now;
    if (diffMs < 0) return 'Σε εξέλιξη / Live';

    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 5) return 'Κλειδώνει σε λιγότερο από 5 λεπτά!';

    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `Σε ${days} ημ. ${hours % 24} ώρες`;
    }
    return `Σε ${hours} ώρες ${mins} λεπτά`;
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Αγώνες & Προβλέψεις</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Υποβάλετε τις προβλέψεις σας έως και 5 λεπτά (T-5) πριν από κάθε σέντρα.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {matches.map(match => {
          const locked = isMatchLocked(match);
          const finished = match.status === 'FINISHED';
          const matchPred = predictions[match.id] || { home: '', away: '', qualifier: '', savedHome: null, savedAway: null, savedQualifier: null, pointsEarned: 0 };
          
          const hasChanges = 
            matchPred.home !== matchPred.savedHome || 
            matchPred.away !== matchPred.savedAway ||
            matchPred.qualifier !== matchPred.savedQualifier;

          const isKnockout = match.matchStage !== 'GROUP';

          return (
            <div key={match.id} className="glass-card" style={{ padding: '0px' }}>
              
              {/* Match Card Header Banner */}
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                padding: '12px 24px',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span className="badge badge-scheduled" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {getStageLabel(match.matchStage)}
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <Clock size={14} />
                  <span>{new Date(match.kickoffTime).toLocaleString('el-GR', {
                    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Athens'
                  })}</span>
                  <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
                  <span style={{ 
                    color: finished ? 'var(--success)' : locked ? 'var(--danger)' : '#a5b4fc',
                    fontWeight: 600
                  }}>
                    {finished ? 'ΟΛΟΚΛΗΡΩΘΗΚΕ' : getCountdown(match)}
                  </span>
                </div>
              </div>

              {/* Match Card Body */}
              <div style={{ padding: '24px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
                
                {/* Team Details */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: '1', minWidth: '280px', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'flex-end', flex: '1', textAlign: 'right' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>{match.homeTeam}</h3>
                    {renderFlag(match.homeTeam)}
                  </div>

                  {/* Score Display (Actual vs Predicted) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {finished ? (
                      <div className="glass" style={{
                        padding: '8px 16px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '1.5rem',
                        fontWeight: 800,
                        background: 'rgba(0, 0, 0, 0.4)',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}>
                        {match.homeScore90} - {match.awayScore90}
                      </div>
                    ) : (
                      <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-muted)' }}>VS</div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'flex-start', flex: '1', textAlign: 'left' }}>
                    {renderFlag(match.awayTeam)}
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>{match.awayTeam}</h3>
                  </div>
                </div>

                {/* Score Input Box / Prediction Status */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  justifyContent: 'center',
                  background: 'rgba(0,0,0,0.2)',
                  padding: '12px 20px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(255,255,255,0.03)'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>ΠΡΟΒΛΕΨΗ</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="number"
                        className="score-box"
                        value={matchPred.home}
                        onChange={(e) => handleScoreChange(match.id, 'home', e.target.value)}
                        disabled={locked}
                        placeholder="-"
                      />
                      <span style={{ color: 'var(--text-muted)' }}>-</span>
                      <input
                        type="number"
                        className="score-box"
                        value={matchPred.away}
                        onChange={(e) => handleScoreChange(match.id, 'away', e.target.value)}
                        disabled={locked}
                        placeholder="-"
                      />
                    </div>
                  </div>

                  {/* Knockout Qualifier Picker */}
                  {isKnockout && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>ΠΡΟΚΡΙΣΗ</span>
                      <select
                        value={matchPred.qualifier}
                        onChange={(e) => handleQualifierChange(match.id, e.target.value)}
                        disabled={locked}
                        style={{
                          background: 'rgba(10, 11, 16, 0.7)',
                          border: '1px solid var(--border-color)',
                          color: '#ffffff',
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          cursor: locked ? 'not-allowed' : 'pointer'
                        }}
                      >
                        <option value="">Επιλογή...</option>
                        <option value={match.homeTeam}>{match.homeTeam}</option>
                        <option value={match.awayTeam}>{match.awayTeam}</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Match Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '150px', justifyContent: 'flex-end' }}>
                  {!locked ? (
                    <button
                      className="btn btn-primary"
                      disabled={!hasChanges || submittingId === match.id}
                      onClick={() => submitPrediction(match.id)}
                      style={{ padding: '10px 16px', fontSize: '0.85rem' }}
                    >
                      {submittingId === match.id ? '...' : 
                       successId === match.id ? <Check size={16} /> : 'Υποβολή'}
                    </button>
                  ) : (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn btn-secondary"
                        onClick={() => toggleExpandMatchOthers(match.id)}
                        style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                        title="Δείτε τι έπαιξαν οι άλλοι"
                      >
                        <Eye size={16} />
                        <span style={{ fontSize: '0.8rem', marginLeft: '4px' }}>Προβλέψεις</span>
                      </button>

                      <div className="glass" style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '36px',
                        height: '36px',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--danger)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        background: 'rgba(239, 68, 68, 0.05)'
                      }}>
                        <Lock size={16} />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Error messages banner per card */}
              {errorId === match.id && (
                <div style={{
                  background: 'rgba(239,68,68,0.06)',
                  borderTop: '1px solid rgba(239,68,68,0.15)',
                  padding: '10px 24px',
                  color: '#fca5a5',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertTriangle size={14} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Points banner for finished matches */}
              {finished && matchPred.savedHome !== null && (
                <div style={{
                  background: 'rgba(16,185,129,0.05)',
                  borderTop: '1px solid rgba(16,185,129,0.15)',
                  padding: '10px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <span>Η πρόβλεψή σας: </span>
                    <strong style={{ color: '#ffffff' }}>
                      {matchPred.savedHome} - {matchPred.savedAway}
                      {isKnockout && matchPred.savedQualifier && ` (Πρόκριση: ${matchPred.savedQualifier})`}
                    </strong>
                  </div>

                  <div className="badge badge-finished" style={{ fontSize: '0.8rem', padding: '4px 10px', gap: '6px' }}>
                    <Award size={14} />
                    <span>+{matchPred.pointsEarned} Πόντοι</span>
                  </div>
                </div>
              )}

              {/* Expanded Area: What others predicted */}
              {expandedMatchId === match.id && (
                <div style={{
                  background: 'rgba(10,11,16,0.4)',
                  borderTop: '1px solid var(--border-color)',
                  padding: '20px 24px'
                }}>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                    ΠΡΟΒΛΕΨΕΙΣ ΑΛΛΩΝ ΧΡΗΣΤΩΝ (T-5 LOCK)
                  </h4>
                  {othersPredictions[match.id] && othersPredictions[match.id].length > 0 ? (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                      gap: '12px'
                    }}>
                      {othersPredictions[match.id]
                        .filter(p => p.userId !== user.id) // Filter out current user's prediction
                        .map((p, idx) => (
                          <div key={idx} className="glass" style={{
                            padding: '10px 14px',
                            borderRadius: 'var(--radius-sm)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            border: '1px solid rgba(255,255,255,0.03)'
                          }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{p.username || 'Χρήστης'}</span>
                            <span style={{
                              fontWeight: 700,
                              color: '#a5b4fc',
                              background: 'rgba(99,102,241,0.1)',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.9rem'
                            }}>
                              {p.predictedHomeScore} - {p.predictedAwayScore}
                              {isKnockout && p.predictedQualifier && ` (${p.predictedQualifier.substring(0, 3)}.)`}
                            </span>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Δεν έχουν υποβληθεί άλλες προβλέψεις για αυτόν τον αγώνα.
                    </div>
                  )}
                </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
}
