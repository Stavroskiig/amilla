import React, { useState } from 'react';
import {
  Star,
  Check,
  Sparkles
} from 'lucide-react';
import { Avatar } from '../components/Avatars';
import HistoryChart from '../components/profile/HistoryChart';
import StatsDashboard from '../components/profile/StatsDashboard';
import AvatarSelector from '../components/profile/AvatarSelector';
import { useProfileStats, useLeaderboardUsers, useUserHistory } from '../hooks/useApi';

export default function Profile({ user, setUser }) {
  const [showAvatarGrid, setShowAvatarGrid] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  const [compareUserId, setCompareUserId] = useState('');

  const { data, isLoading, isError } = useProfileStats(user?.id);
  const { data: usersData } = useLeaderboardUsers();
  const { data: compareHistory } = useUserHistory(compareUserId);

  const compareUser = usersData?.find(u => u.id === compareUserId);

  if (isLoading || !data) {
    return (
      <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Φόρτωση στατιστικών...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--danger)' }}>
        Σφάλμα κατά τη φόρτωση των στατιστικών.
      </div>
    );
  }

  const { predictions, matches, rankHistory, longTermPred } = data;

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

  finishedPredictions.forEach(pred => {
    matchPointsEarned += pred.pointsEarned || 0;

    const match = matches.find(m => m.id === pred.matchId);
    if (!match || match.homeScore90 == null || match.awayScore90 == null) return;

    const actualHome = match.homeScore90;
    const actualAway = match.awayScore90;
    const predHome = pred.predictedHomeScore;
    const predAway = pred.predictedAwayScore;

    const gotExactScore = actualHome === predHome && actualAway === predAway;
    const gotSign = Math.sign(actualHome - actualAway) === Math.sign(predHome - predAway);
    
    const isKnockout = match.matchStage !== 'GROUP';
    const correctlyPredictedQualifier = isKnockout && match.qualifiedTeam && match.qualifiedTeam.toLowerCase() === (pred.predictedQualifier || '').toLowerCase();

    if (gotExactScore) {
      exactScoresCount++;
    } else if (gotSign) {
      correctOutcomesCount++;
    } else if (correctlyPredictedQualifier) {
      qualifierOnlyCount++;
    } else {
      missesCount++;
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

  // Longterm points
  const longtermPointsEarned = longTermPred?.pointsEarned || 0;
  const hasLongtermWin = longtermPointsEarned > 0;

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
            background: 'var(--danger-bg, rgba(239, 68, 68, 0.12))',
            color: 'var(--danger-text, #fca5a5)',
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
              background: 'var(--info-bg, rgba(99, 102, 241, 0.15))',
              color: 'var(--info-color, #a5b4fc)',
              marginTop: '10px',
              padding: '4px 10px',
              borderRadius: '12px',
              border: '1px solid var(--info-border, rgba(99, 102, 241, 0.3))'
            }}>
              {user.role === 'ROLE_ADMIN' ? 'ΔΙΑΧΕΙΡΙΣΤΗΣ' : 'ΠΑΙΚΤΗΣ'}
            </span>
          </div>
        </div>

        <AvatarSelector 
          user={user} 
          setUser={setUser} 
          showAvatarGrid={showAvatarGrid} 
          setShowAvatarGrid={setShowAvatarGrid} 
          setSuccessMessage={setSuccessMessage} 
          setError={setError} 
        />
      </div>

      <StatsDashboard 
        user={user} 
        accuracyRate={accuracyRate} 
        avgPoints={avgPoints} 
        totalPredicted={totalPredicted} 
        successCount={successCount} 
        completedPredictedCount={completedPredictedCount} 
      />

      {/* Detailed Success Breakdown Visualization */}
      <div className="glass-card responsive-card-padding" style={{ padding: '28px', marginBottom: '32px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Star size={18} className="text-indigo-400" />
          <span>Ανάλυση Αποτελεσμάτων</span>
        </h3>

        {completedPredictedCount === 0 && !hasLongtermWin ? (
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
              background: 'var(--table-header-bg, rgba(255,255,255,0.05))',
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
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>
                    {exactScoresCount} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>({Math.round(pctExact)}%)</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Ακριβές Σκορ</div>
                </div>
              </div>

              {/* Match Outcome */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--warning)', marginTop: '4px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>
                    {correctOutcomesCount} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>({Math.round(pctOutcome)}%)</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Σημείο (1X2)</div>
                </div>
              </div>

              {/* Qualifier Only */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--secondary)', marginTop: '4px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>
                    {qualifierOnlyCount} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>({Math.round(pctQualifier)}%)</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Μόνο Πρόκριση</div>
                </div>
              </div>

              {/* Misses */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--danger)', marginTop: '4px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>
                    {missesCount} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>({Math.round(pctMiss)}%)</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Αστοχίες</div>
                </div>
              </div>
              
              {/* Longterm Winner */}
              {hasLongtermWin && (
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#eab308', marginTop: '4px', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>
                      1 <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}></span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Νικητής Διοργάνωσης</div>
                    <div style={{ fontSize: '0.75rem', color: '#eab308', fontWeight: 600 }}>+{longtermPointsEarned} Πόντοι</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <HistoryChart 
        history={rankHistory} 
        compareHistory={compareHistory}
        compareUserName={compareUser?.username}
        usersList={usersData?.filter(u => u.id !== user.id) || []}
        onCompareSelect={setCompareUserId}
        compareUserId={compareUserId}
        userAvatar={user.avatar}
        compareUserAvatar={compareUser?.avatar}
      />

    </div>
  );
}
