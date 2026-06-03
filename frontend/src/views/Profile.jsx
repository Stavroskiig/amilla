import React, { useState, useEffect } from 'react';
import {
  Award,
  Trophy,
  TrendingUp,
  Percent,
  Star,
  Flame,
  Check,
  Lock,
  Activity,
  Calendar,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { Avatar, AVATARS } from '../components/Avatars';

const countryToFlagCode = {
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

const renderFlag = (teamName) => {
  const code = countryToFlagCode[teamName];
  if (!code) return null;
  return (
    <img
      src={`https://flagcdn.com/w40/${code}.png`}
      srcSet={`https://flagcdn.com/w80/${code}.png 2x`}
      alt={teamName}
      style={{
        width: '24px',
        height: '16px',
        objectFit: 'cover',
        borderRadius: '2px',
        border: '1px solid rgba(255,255,255,0.12)',
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: 0
      }}
    />
  );
};

export default function Profile({ user, setUser }) {
  const [predictions, setPredictions] = useState([]);
  const [matches, setMatches] = useState([]);
  const [longTermPred, setLongTermPred] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [showAvatarGrid, setShowAvatarGrid] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // 1. Fetch user predictions
      const predRes = await fetch('/api/predictions/my', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const predData = await predRes.json();

      // 2. Fetch matches
      const matchRes = await fetch('/api/matches', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const matchData = await matchRes.json();

      // 3. Fetch long-term prediction
      const ltRes = await fetch('/api/predictions/longterm', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      let ltData = null;
      if (ltRes.ok) {
        ltData = await ltRes.json();
      }

      setPredictions(predRes.ok ? predData : []);
      setMatches(matchRes.ok ? matchData : []);
      setLongTermPred(ltData);
    } catch (e) {
      console.error('Error fetching profile stats', e);
      setError('Σφάλμα κατά τη φόρτωση των στατιστικών.');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (avatarId) => {
    setSavingAvatar(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auth/avatar', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ avatar: avatarId })
      });
      const updatedUser = await res.json();

      if (!res.ok) throw new Error(updatedUser.error || 'Σφάλμα ενημέρωσης avatar');

      // Update parent user state
      setUser(updatedUser);
      setSuccessMessage('Το avatar ενημερώθηκε επιτυχώς!');
      setShowAvatarGrid(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingAvatar(false);
    }
  };

  // Stats Calculations
  const totalPredicted = predictions.length;

  // Find predictions that correspond to finished matches
  const finishedMatchIds = new Set(
    matches.filter(m => m.status === 'FINISHED').map(m => m.id)
  );

  const finishedPredictions = predictions.filter(p => finishedMatchIds.has(p.matchId));
  const completedPredictedCount = finishedPredictions.length;

  let exactScoresCount = 0;
  let correctOutcomesCount = 0;
  let qualifierOnlyCount = 0;
  let missesCount = 0;
  let matchPointsEarned = 0;

  // Track stages
  let groupPredictedFinished = 0;
  let groupCorrect = 0;
  let koPredictedFinished = 0;
  let koCorrect = 0;

  finishedPredictions.forEach(pred => {
    const points = pred.pointsEarned;
    matchPointsEarned += points;

    // Check points logic from PointCalculatorService
    if (points === 5 || points === 6) {
      exactScoresCount++;
    } else if (points === 2 || points === 3) {
      correctOutcomesCount++;
    } else if (points === 1) {
      qualifierOnlyCount++;
    } else {
      missesCount++;
    }

    // Stage breakdown
    const match = matches.find(m => m.id === pred.matchId);
    if (match) {
      const isGroup = match.matchStage === 'GROUP';
      const isCorrect = points > 0;

      if (isGroup) {
        groupPredictedFinished++;
        if (isCorrect) groupCorrect++;
      } else {
        koPredictedFinished++;
        if (isCorrect) koCorrect++;
      }
    }
  });

  const successCount = exactScoresCount + correctOutcomesCount + qualifierOnlyCount;
  const accuracyRate = completedPredictedCount > 0
    ? Math.round((successCount / completedPredictedCount) * 100)
    : 0;

  const avgPoints = completedPredictedCount > 0
    ? (matchPointsEarned / completedPredictedCount).toFixed(1)
    : '0.0';

  // Percentages for breakdown bar
  const pctExact = completedPredictedCount > 0 ? (exactScoresCount / completedPredictedCount) * 100 : 0;
  const pctOutcome = completedPredictedCount > 0 ? (correctOutcomesCount / completedPredictedCount) * 100 : 0;
  const pctQualifier = completedPredictedCount > 0 ? (qualifierOnlyCount / completedPredictedCount) * 100 : 0;
  const pctMiss = completedPredictedCount > 0 ? (missesCount / completedPredictedCount) * 100 : 0;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '40px' }}>

      {/* Upper Profile Section */}
      <div className="glass-card responsive-card-padding" style={{ padding: '32px', marginBottom: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>

        {successMessage && (
          <div className="glass" style={{
            position: 'absolute',
            top: '20px',
            background: 'rgba(16, 185, 129, 0.12)',
            color: '#a7f3d0',
            borderLeft: '4px solid var(--success)',
            padding: '10px 20px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            zIndex: 10
          }}>
            <Check size={16} />
            <span>{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="glass" style={{
            position: 'absolute',
            top: '20px',
            background: 'rgba(239, 68, 68, 0.12)',
            color: '#fca5a5',
            borderLeft: '4px solid var(--danger)',
            padding: '10px 20px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            zIndex: 10
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div
            onClick={() => setShowAvatarGrid(!showAvatarGrid)}
            style={{ position: 'relative', cursor: 'pointer', group: 'true' }}
            title="Αλλαγή Avatar"
          >
            <div className="avatar-preview-lg">
              <Avatar id={user.avatar} size={104} />
            </div>
            <div style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              background: 'var(--primary)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #1c1e2e',
              boxShadow: '0 2px 6px rgba(0,0,0,0.4)'
            }}>
              <Sparkles size={14} color="#ffffff" />
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '4px' }}>{user.username}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{user.email}</p>
            <span className="badge" style={{
              background: 'rgba(99, 102, 241, 0.15)',
              color: '#a5b4fc',
              marginTop: '10px',
              padding: '4px 10px',
              borderRadius: '12px',
              border: '1px solid rgba(99, 102, 241, 0.3)'
            }}>
              {user.role === 'ROLE_ADMIN' ? 'ΔΙΑΧΕΙΡΙΣΤΗΣ' : 'ΠΑΙΚΤΗΣ'}
            </span>
          </div>
        </div>

        {/* Expandable Avatar Selection Grid */}
        {showAvatarGrid && (
          <div className="glass" style={{
            marginTop: '24px',
            padding: '20px',
            borderRadius: 'var(--radius-md)',
            width: '100%',
            maxWidth: '520px',
            border: '1px solid var(--border-color)',
            background: 'rgba(15, 16, 26, 0.95)',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px', textAlign: 'center' }}>
              Επιλέξτε το Avatar σας
            </h3>

            <div className="avatar-grid">
              {AVATARS.map((avatar) => {
                const isSelected = user.avatar === avatar.id;
                return (
                  <button
                    key={avatar.id}
                    disabled={savingAvatar}
                    onClick={() => handleAvatarChange(avatar.id)}
                    className={`avatar-item ${isSelected ? 'selected' : ''}`}
                    style={{ border: 'none' }}
                  >
                    <Avatar id={avatar.id} size={56} />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Φόρτωση στατιστικών...
        </div>
      ) : (
        <>
          {/* Stats Summary Dashboard */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
            marginBottom: '32px'
          }}>

            {/* Points Card */}
            <div className="glass-card responsive-card-padding" style={{
              padding: '24px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(28, 30, 46, 0.6) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              boxShadow: 'var(--shadow-glow)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ color: '#a5b4fc', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  ΣΥΝΟΛΙΚΟΙ ΠΟΝΤΟΙ
                </span>
                <Trophy size={20} style={{ color: '#fbbf24' }} />
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#ffffff' }}>
                {user.totalPoints}
                <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '8px' }}>pts</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                Συνολική βαθμολογία στο τουρνουά
              </p>
            </div>

            {/* Accuracy Card */}
            <div className="glass-card responsive-card-padding" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  ΠΟΣΟΣΤΟ ΕΠΙΤΥΧΙΑΣ
                </span>
                <Percent size={20} style={{ color: 'var(--secondary)' }} />
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#ffffff' }}>
                {accuracyRate}%
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                {successCount} σωστές σε {completedPredictedCount} αγώνες
              </p>
            </div>

            {/* Avg Score Card */}
            <div className="glass-card responsive-card-padding" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  ΜΕΣΟΣ ΟΡΟΣ
                </span>
                <TrendingUp size={20} style={{ color: 'var(--success)' }} />
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#ffffff' }}>
                {avgPoints}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                Πόντοι ανά συμπληρωμένη πρόβλεψη
              </p>
            </div>

            {/* Predictions Made Card */}
            <div className="glass-card responsive-card-padding" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  ΠΡΟΒΛΕΨΕΙΣ
                </span>
                <Activity size={20} style={{ color: '#a855f7' }} />
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#ffffff' }}>
                {totalPredicted}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                Συνολικές προβλέψεις που έχουν καταχωρηθεί
              </p>
            </div>

          </div>

          {/* Detailed Success Breakdown Visualization */}
          <div className="glass-card responsive-card-padding" style={{ padding: '28px', marginBottom: '32px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Star size={18} className="text-indigo-400" />
              <span>Ανάλυση Αποτελεσμάτων</span>
            </h3>

            {completedPredictedCount === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
                Δεν υπάρχουν ακόμα δεδομένα από ολοκληρωμένους αγώνες.
              </p>
            ) : (
              <div>
                {/* Horizontal Segmented Bar */}
                <div style={{
                  height: '24px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  display: 'flex',
                  background: 'rgba(255,255,255,0.05)',
                  marginBottom: '28px',
                  border: '1px solid var(--border-color)'
                }}>
                  {exactScoresCount > 0 && (
                    <div
                      style={{ width: `${pctExact}%`, background: 'var(--success)', transition: 'width 0.5s' }}
                      title={`Ακριβές Σκορ: ${exactScoresCount}`}
                    />
                  )}
                  {correctOutcomesCount > 0 && (
                    <div
                      style={{ width: `${pctOutcome}%`, background: 'var(--warning)', transition: 'width 0.5s' }}
                      title={`Σημείο Αγώνα (1Χ2): ${correctOutcomesCount}`}
                    />
                  )}
                  {qualifierOnlyCount > 0 && (
                    <div
                      style={{ width: `${pctQualifier}%`, background: 'var(--secondary)', transition: 'width 0.5s' }}
                      title={`Μόνο Πρόκριση: ${qualifierOnlyCount}`}
                    />
                  )}
                  {missesCount > 0 && (
                    <div
                      style={{ width: `${pctMiss}%`, background: 'var(--danger)', transition: 'width 0.5s' }}
                      title={`Αστοχία: ${missesCount}`}
                    />
                  )}
                </div>

                {/* Grid legend details */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '20px'
                }}>
                  {/* Exact Score */}
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--success)', marginTop: '4px', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: '#ffffff' }}>
                        {exactScoresCount} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>({Math.round(pctExact)}%)</span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Ακριβές Σκορ</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>+5 ή +6 Πόντοι</div>
                    </div>
                  </div>

                  {/* Outcome Sign */}
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--warning)', marginTop: '4px', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: '#ffffff' }}>
                        {correctOutcomesCount} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>({Math.round(pctOutcome)}%)</span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Σημείο Αγώνα (1Χ2)</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--warning)', fontWeight: 600 }}>+2 ή +3 Πόντοι</div>
                    </div>
                  </div>

                  {/* Qualifier only */}
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--secondary)', marginTop: '4px', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: '#ffffff' }}>
                        {qualifierOnlyCount} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>({Math.round(pctQualifier)}%)</span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Μόνο Πρόκριση</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: 600 }}>+1 Πόντος</div>
                    </div>
                  </div>

                  {/* Missed */}
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--danger)', marginTop: '4px', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: '#ffffff' }}>
                        {missesCount} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>({Math.round(pctMiss)}%)</span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Αστοχία</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 600 }}>0 Πόντοι</div>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>

          {/* Phase statistics and Long-term prediction grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px'
          }}>

            {/* Phase stats */}
            <div className="glass-card responsive-card-padding" style={{ padding: '28px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={18} className="text-indigo-400" />
                <span>Ανάλυση ανά Φάση</span>
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* Group Phase */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.9rem' }}>
                    <span style={{ fontWeight: 600 }}>Φάση Ομίλων</span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      {groupCorrect} / {groupPredictedFinished} ({groupPredictedFinished > 0 ? Math.round((groupCorrect / groupPredictedFinished) * 100) : 0}%)
                    </span>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      background: 'var(--primary)',
                      width: `${groupPredictedFinished > 0 ? (groupCorrect / groupPredictedFinished) * 100 : 0}%`,
                      borderRadius: '4px'
                    }} />
                  </div>
                </div>

                {/* KO Phase */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.9rem' }}>
                    <span style={{ fontWeight: 600 }}>Νοκ-άουτ Αγώνες</span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      {koCorrect} / {koPredictedFinished} ({koPredictedFinished > 0 ? Math.round((koCorrect / koPredictedFinished) * 100) : 0}%)
                    </span>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      background: 'var(--secondary)',
                      width: `${koPredictedFinished > 0 ? (koCorrect / koPredictedFinished) * 100 : 0}%`,
                      borderRadius: '4px'
                    }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Long-term predictions overview */}
            <div className="glass-card responsive-card-padding" style={{ padding: '28px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={18} className="text-indigo-400" />
                <span>Μακροχρόνιες Προβλέψεις</span>
              </h3>

              {longTermPred ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(99, 102, 241, 0.05)',
                  border: '1px solid rgba(99, 102, 241, 0.12)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Trophy size={20} style={{ color: '#fbbf24', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>Πρόβλεψη Πρωταθλητή:</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '30px' }}>
                    {renderFlag(longTermPred.predictedChampionTeam)}
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                      {longTermPred.predictedChampionTeam.toUpperCase()}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px', marginTop: '6px' }}>
                    Υποβλήθηκε: {new Date(longTermPred.submittedAt).toLocaleString('el-GR', { timeZone: 'Europe/Athens', hour12: false })}
                  </div>
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '24px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255,255,255,0.01)',
                  border: '1px dotted var(--border-color)',
                  color: 'var(--text-muted)',
                  fontSize: '0.9rem'
                }}>
                  <p style={{ marginBottom: '12px' }}>Δεν έχετε υποβάλει ακόμα πρόβλεψη πρωταθλητή.</p>
                  <a href="/longterm" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                    Υποβολή Τώρα
                  </a>
                </div>
              )}
            </div>

          </div>
        </>
      )}

    </div>
  );
}
