import React, { useState } from 'react';
import { Lock, Check, Clock, AlertTriangle, Eye, Award } from 'lucide-react';
import { Flag, getStageLabel } from '../Countries';
import MatchCountdown from './MatchCountdown';
import PredictionInput from './PredictionInput';
import OthersPredictionsList from './OthersPredictionsList';
// import removed
import { useSubmitMatchPrediction } from '../../hooks/useApi';

const API_URL = import.meta.env.VITE_API_URL || '';

// Toggle this to true to allow players to see others' predictions before the match is locked.
export const ALWAYS_SHOW_PREDICTIONS = true;

export default function MatchCard({
  match,
  predictionData,
  currentUserId,
  setPredictions
}) {
  const [expanded, setExpanded] = useState(false);
  const [expandedPoints, setExpandedPoints] = useState(false);
  const [othersPredictions, setOthersPredictions] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  const { mutate: submitPrediction, isPending: submitting } = useSubmitMatchPrediction();

  const finished = match.status === 'FINISHED';
  const isLive = match.status === 'LIVE';
  const isKnockout = match.matchStage !== 'GROUP';

  const isMatchLocked = (() => {
    const kickoff = new Date(match.kickoffTime).getTime();
    const lockTime = kickoff - 5 * 60000;
    return Date.now() > lockTime;
  })();

  const isPredictionTooFar = (() => {
    const kickoff = new Date(match.kickoffTime).getTime();
    const openTime = kickoff - 24 * 60 * 60 * 1000;
    return Date.now() < openTime;
  })();

  const matchPred = predictionData || { home: '', away: '', qualifier: '', predictedQualificationMethod: '', savedHome: null, savedAway: null, savedQualifier: null, savedPredictedQualificationMethod: null, pointsEarned: 0 };
  const hasChanges =
    matchPred.home !== matchPred.savedHome ||
    matchPred.away !== matchPred.savedAway ||
    matchPred.qualifier !== matchPred.savedQualifier ||
    matchPred.predictedQualificationMethod !== matchPred.savedPredictedQualificationMethod;

  const isValidPrediction = matchPred.home !== '' && matchPred.away !== '';

  const handleScoreChange = (matchId, team, val) => {
    const cleanVal = val === '' ? '' : Math.max(0, parseInt(val) || 0);

    setPredictions(prev => {
      const currentPred = prev[matchId] || {};
      const newHome = team === 'home' ? cleanVal : currentPred.home;
      const newAway = team === 'away' ? cleanVal : currentPred.away;

      let newQualifier = currentPred.qualifier;
      let newPredictedQualificationMethod = currentPred.predictedQualificationMethod;

      if (isKnockout) {
        if (newHome !== '' && newAway !== '' && newHome !== newAway) {
          // Winning score, auto-select winner
          newQualifier = newHome > newAway ? match.homeTeam : match.awayTeam;
          newPredictedQualificationMethod = 'REGULAR_TIME';
        }
      }

      return {
        ...prev,
        [matchId]: {
          ...currentPred,
          [team]: cleanVal,
          qualifier: newQualifier,
          predictedQualificationMethod: newPredictedQualificationMethod
        }
      };
    });
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

  const handleQualificationMethodChange = (matchId, val) => {
    setPredictions(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        predictedQualificationMethod: val
      }
    }));
  };

  const handleSubmit = () => {
    if (finished) return;
    setErrorMsg('');
    setSuccess(false);

    const cleanHome = matchPred.home === '' ? 0 : matchPred.home;
    const cleanAway = matchPred.away === '' ? 0 : matchPred.away;

    if (isKnockout && cleanHome === cleanAway) {
      if (!matchPred.qualifier) {
        setErrorMsg('Πρέπει να επιλέξετε την ομάδα που θα προκριθεί!');
        return;
      }
      if (!matchPred.predictedQualificationMethod) {
        setErrorMsg('Πρέπει να επιλέξετε τον τρόπο πρόκρισης (Παράταση ή Πέναλτι)!');
        return;
      }
    }

    submitPrediction({
      matchId: match.id,
      home: cleanHome,
      away: cleanAway,
      qualifier: matchPred.qualifier,
      predictedQualificationMethod: matchPred.predictedQualificationMethod
    }, {
      onSuccess: (data) => {
        setPredictions(prev => ({
          ...prev,
          [match.id]: {
            ...prev[match.id],
            home: cleanHome,
            away: cleanAway,
            savedHome: cleanHome,
            savedAway: cleanAway,
            savedQualifier: matchPred.qualifier || '',
            savedPredictedQualificationMethod: matchPred.predictedQualificationMethod || '',
            pointsEarned: data.pointsEarned
          }
        }));
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      },
      onError: (err) => {
        setErrorMsg(err.message);
      }
    });
  };

  const toggleExpandPoints = () => {
    if (expandedPoints) {
      setExpandedPoints(false);
    } else {
      setExpanded(false);
      setExpandedPoints(true);
    }
  };

  const toggleExpandMatchOthers = async () => {
    if (expanded) {
      setExpanded(false);
      return;
    }
    setExpandedPoints(false);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/predictions/match/${match.id}/others`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setOthersPredictions(data);
        setExpanded(true);
      } else {
        alert(data.error || 'Δεν είναι δυνατή η προβολή των προβλέψεων ακόμη!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={`glass-card ${success ? 'submit-success-glow' : ''}`} style={{ padding: '0px', overflow: 'visible' }}>
      {/* Match Card Header Banner */}
      <div className="match-card-header" style={{ borderTopLeftRadius: 'calc(var(--radius-lg) - 1px)', borderTopRightRadius: 'calc(var(--radius-lg) - 1px)' }}>
        <div className="match-stage-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-scheduled match-stage-badge" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {getStageLabel(match.matchStage)}
          </span>
          {match.tvChannel && (
            <span className="badge" style={{ background: 'var(--channel-badge-bg, rgba(255, 255, 255, 0.05))', border: '1px solid var(--channel-badge-border, rgba(255, 255, 255, 0.1))', padding: '4px 8px', display: 'flex', alignItems: 'center' }}>
              <img
                src={`/assets/channels/${match.tvChannel}.png`}
                alt={match.tvChannel}
                style={{ height: '14px', width: 'auto', objectFit: 'contain' }}
                onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.style.display = 'none'; }}
              />
            </span>
          )}
        </div>

        <div className="match-datetime-wrapper">
          <Clock size={16} style={{ flexShrink: 0, color: 'var(--text-muted)' }} />
          <div className="match-datetime-text">
            <span className="match-date">
              {new Date(match.kickoffTime).toLocaleDateString('el-GR', {
                day: '2-digit', month: '2-digit', timeZone: 'Europe/Athens'
              })}
            </span>
            <span className="match-time">
              {new Date(match.kickoffTime).toLocaleTimeString('el-GR', {
                hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Athens', hour12: false
              })}
            </span>
          </div>
        </div>

        <MatchCountdown match={match} />
      </div>

      {/* Match Card Body */}
      <div className="match-card-body" style={{ padding: '24px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>

        {/* Team Details */}
        <div className="team-details-container" style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: '1', minWidth: '280px', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'flex-end', flex: '1', textAlign: 'right' }}>
            <h3 className="team-name" style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>{match.homeTeam}</h3>
            <Flag teamName={match.homeTeam} width={28} height={18} />
          </div>

          {/* Score Display (Actual vs Predicted) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            {finished ? (
              <div className="glass" style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '1.5rem',
                fontWeight: 800,
                background: 'var(--finished-score-bg, rgba(0, 0, 0, 0.4))',
                border: 'var(--finished-score-border, 1px solid rgba(255,255,255,0.1))',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}>
                {match.homeScore90} - {match.awayScore90}
              </div>
            ) : (
              <>
                <div className="mobile-only-flex" style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>VS</div>
                <div className="desktop-only-flex">
                  <PredictionInput
                    match={match}
                    matchPred={matchPred}
                    handleScoreChange={handleScoreChange}
                    handleQualifierChange={handleQualifierChange}
                    handleQualificationMethodChange={handleQualificationMethodChange}
                    isLocked={isMatchLocked}
                    isPredictionTooFar={isPredictionTooFar}
                    isKnockout={isKnockout}
                  />
                </div>
              </>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'flex-start', flex: '1', textAlign: 'left' }}>
            <Flag teamName={match.awayTeam} width={28} height={18} />
            <h3 className="team-name" style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>{match.awayTeam}</h3>
          </div>
        </div>

        {/* Score Input Box / Prediction Status */}
        {!finished && (
          <div className="mobile-only-flex" style={{ width: '100%', justifyContent: 'center' }}>
            <PredictionInput
              match={match}
              matchPred={matchPred}
              handleScoreChange={handleScoreChange}
              handleQualifierChange={handleQualifierChange}
              handleQualificationMethodChange={handleQualificationMethodChange}
              isLocked={isMatchLocked}
              isPredictionTooFar={isPredictionTooFar}
              isKnockout={isKnockout}
            />
          </div>
        )}

        {/* Match Action Buttons */}
        <div className="match-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '150px', justifyContent: 'flex-end' }}>
          <button
            className={`btn btn-secondary ${expandedPoints ? 'btn-active' : ''}`}
            onClick={toggleExpandPoints}
            style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}
            title="Δείτε τους πόντους κάθε σκορ"
          >
            <Award size={16} />
            <span style={{ fontSize: '0.8rem', marginLeft: '6px' }}>Πόντοι</span>
          </button>

          {finished ? (
            <button
              className={`btn btn-secondary ${expanded ? 'btn-active' : ''}`}
              onClick={toggleExpandMatchOthers}
              style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}
              title="Δείτε τι έπαιξαν οι άλλοι"
            >
              <Eye size={16} />
              <span style={{ fontSize: '0.8rem', marginLeft: '6px' }}>Προβλέψεις</span>
            </button>
          ) : isPredictionTooFar ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 12px',
              gap: '6px',
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              background: 'var(--locked-box-bg, rgba(255, 255, 255, 0.02))',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--locked-box-border, rgba(255, 255, 255, 0.05))',
              boxSizing: 'border-box'
            }}>
              <Clock size={15} style={{ color: 'var(--text-muted)' }} />
              <span>Κλειδωμένο (24ω)</span>
            </div>
          ) : !isMatchLocked ? (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn btn-primary"
                disabled={!hasChanges || !isValidPrediction || submitting}
                onClick={handleSubmit}
                style={{ padding: '10px 16px', fontSize: '0.85rem' }}
              >
                {submitting ? '...' : success ? <Check size={16} /> : 'Υποβολή'}
              </button>
              {ALWAYS_SHOW_PREDICTIONS && (
                <button
                  className={`btn btn-secondary ${expanded ? 'btn-active' : ''}`}
                  onClick={toggleExpandMatchOthers}
                  style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}
                  title="Δείτε τι έπαιξαν οι άλλοι"
                >
                  <Eye size={16} />
                  <span style={{ fontSize: '0.8rem', marginLeft: '6px' }}>Προβλέψεις</span>
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className={`btn btn-secondary ${expanded ? 'btn-active' : ''}`}
                onClick={toggleExpandMatchOthers}
                style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}
                title="Δείτε τι έπαιξαν οι άλλοι"
              >
                <Eye size={16} />
                <span style={{ fontSize: '0.8rem', marginLeft: '6px' }}>Προβλέψεις</span>
              </button>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--danger)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                background: 'rgba(239, 68, 68, 0.05)',
                boxShadow: 'none'
              }}>
                <Lock size={16} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error messages banner per card */}
      {errorMsg && (
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
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Points banner for finished matches */}
      {finished && (
        matchPred.savedHome !== null && matchPred.savedHome !== undefined ? (
          <div className="match-card-header" style={{
            background: matchPred.pointsEarned > 0 ? 'rgba(16,185,129,0.05)' : 'rgba(239, 68, 68, 0.04)',
            borderTop: matchPred.pointsEarned > 0 ? '1px solid rgba(16,185,129,0.15)' : '1px solid rgba(239, 68, 68, 0.12)',
            padding: '10px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottomLeftRadius: 'calc(var(--radius-lg) - 1px)',
            borderBottomRightRadius: 'calc(var(--radius-lg) - 1px)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span>Η πρόβλεψή σας: </span>
              <strong style={{ color: 'var(--text-main, #ffffff)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>{matchPred.savedHome} - {matchPred.savedAway}</span>
                {isKnockout && matchPred.savedQualifier && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '2px' }} title={matchPred.savedQualifier}>
                    (<Flag teamName={matchPred.savedQualifier} width={18} height={12} style={{ marginLeft: '4px', marginRight: '4px' }} />
                    {matchPred.savedPredictedQualificationMethod === 'EXTRA_TIME' ? 'ΠΑΡ' : matchPred.savedPredictedQualificationMethod === 'PENALTIES' ? 'ΠΕΝ' : ''})
                  </span>
                )}
              </strong>
            </div>

            <div
              className="badge"
              style={{
                fontSize: '0.8rem',
                padding: '4px 10px',
                gap: '6px',
                background: matchPred.pointsEarned > 0 ? 'var(--success-glow)' : 'rgba(239, 68, 68, 0.08)',
                color: matchPred.pointsEarned > 0 ? 'var(--success)' : 'var(--danger)',
                border: matchPred.pointsEarned > 0 ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.2)'
              }}
            >
              <Award size={14} />
              <span>+{matchPred.pointsEarned} ΠΟΝΤΟΙ</span>
            </div>
          </div>
        ) : (
          <div className="match-card-header" style={{
            background: 'rgba(255, 255, 255, 0.02)',
            borderTop: '1px solid var(--border-color)',
            padding: '10px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottomLeftRadius: 'calc(var(--radius-lg) - 1px)',
            borderBottomRightRadius: 'calc(var(--radius-lg) - 1px)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span>Δεν υποβλήθηκε πρόβλεψη</span>
            </div>

            <div className="badge badge-scheduled" style={{ fontSize: '0.8rem', padding: '4px 10px' }}>
              <span>+0 ΠΟΝΤΟΙ</span>
            </div>
          </div>
        )
      )}

      {/* Expanded Area: What others predicted */}
      <div style={{
        display: 'grid',
        gridTemplateRows: expanded ? '1fr' : '0fr',
        transition: 'grid-template-rows 0.3s ease-out, opacity 0.3s ease',
        opacity: expanded ? 1 : 0
      }}>
        <div style={{ overflow: 'hidden' }}>
          <OthersPredictionsList
            match={match}
            othersPredictions={othersPredictions}
            currentUserId={currentUserId}
            isKnockout={isKnockout}
          />
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateRows: expandedPoints ? '1fr' : '0fr',
        transition: 'grid-template-rows 0.3s ease-out, opacity 0.3s ease',
        opacity: expandedPoints ? 1 : 0
      }}>
        <div style={{ overflow: 'hidden' }}>
          <ScorePointsList match={match} />
        </div>
      </div>
    </div>
  );
}

function ScorePointsList({ match }) {
  let homeWins = [];
  let draws = [];
  let awayWins = [];

  try {
    if (match.exactScoreOddsJson) {
      const parsed = JSON.parse(match.exactScoreOddsJson);
      Object.entries(parsed).forEach(([score, odds]) => {
        const points = Math.round(10 * parseFloat(odds));
        if (!isNaN(points)) {
          const ah = parseInt(score.split('-')[0]) || 0;
          const aa = parseInt(score.split('-')[1]) || 0;
          if (ah > aa) homeWins.push({ score, points });
          else if (ah === aa) draws.push({ score, points });
          else awayWins.push({ score, points });
        }
      });

      const sortByPoints = (a, b) => a.points - b.points;
      homeWins.sort(sortByPoints);
      draws.sort(sortByPoints);
      awayWins.sort(sortByPoints);
    }
  } catch (err) { }

  const renderScoreCol = (title, items) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={title}>
        {title}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
        {items.map(s => (
          <div key={s.score} style={{
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            border: '1px solid var(--others-border, rgba(255,255,255,0.03))',
            background: 'var(--others-card-bg, rgba(255, 255, 255, 0.05))',
            boxShadow: 'var(--others-shadow, none)'
          }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)', whiteSpace: 'nowrap' }}>{s.score}</span>
            <span style={{
              color: 'var(--success)',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '0.8rem',
              fontWeight: 700,
              whiteSpace: 'nowrap'
            }}>
              {s.points} pts
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const signHomePoints = match.homeOdds ? Math.round(10 * parseFloat(match.homeOdds)) : null;
  const signDrawPoints = match.drawOdds ? Math.round(10 * parseFloat(match.drawOdds)) : null;
  const signAwayPoints = match.awayOdds ? Math.round(10 * parseFloat(match.awayOdds)) : null;
  const hasSignOdds = signHomePoints !== null && !isNaN(signHomePoints);

  return (
    <div style={{
      padding: '20px 24px',
      borderTop: '1px solid var(--border-color)',
      background: 'var(--others-bg, rgba(10,11,16,0.4))',
      borderBottomLeftRadius: 'calc(var(--radius-lg) - 1px)',
      borderBottomRightRadius: 'calc(var(--radius-lg) - 1px)'
    }}>
      {hasSignOdds && (
        <div style={{ marginBottom: '28px' }}>
          <h4 style={{ fontSize: '0.9rem', marginBottom: '16px', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Award size={16} />
            ΠΟΝΤΟΙ ΣΗΜΕΙΟΥ (1X2)
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            {[
              { label: `1 (${match.homeTeam})`, points: signHomePoints },
              { label: 'X (ΙΣΟΠΑΛΙΑ)', points: signDrawPoints },
              { label: `2 (${match.awayTeam})`, points: signAwayPoints }
            ].map((item, i) => (
              <div key={i} style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--others-border, rgba(255,255,255,0.03))',
                background: 'var(--others-card-bg, rgba(255, 255, 255, 0.05))',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: 'var(--others-shadow, none)'
              }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.label}>
                  {item.label}
                </div>
                <span style={{
                  color: 'var(--success)',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  marginLeft: '8px'
                }}>
                  {item.points} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <h4 style={{ fontSize: '0.9rem', marginBottom: '16px', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Award size={16} />
        ΠΟΝΤΟΙ ΑΚΡΙΒΟΥΣ ΣΚΟΡ
      </h4>
      {homeWins.length > 0 || draws.length > 0 || awayWins.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          {renderScoreCol(`1 (${match.homeTeam})`, homeWins)}
          {renderScoreCol('X (ΙΣΟΠΑΛΙΑ)', draws)}
          {renderScoreCol(`2 (${match.awayTeam})`, awayWins)}
        </div>
      ) : (
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Δεν υπάρχουν διαθέσιμα σκορ για αυτόν τον αγώνα.</div>
      )}

      {match.matchStage !== 'GROUP' && match.qualifierOddsJson && (
        <div style={{ marginTop: '28px' }}>
          <h4 style={{ fontSize: '0.9rem', marginBottom: '16px', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Award size={16} />
            ΠΟΝΤΟΙ ΠΡΟΚΡΙΣΗΣ
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            {(() => {
              try {
                const parsed = JSON.parse(match.qualifierOddsJson);
                const items = [];
                for (const [key, value] of Object.entries(parsed)) {
                  const pts = Math.round(10 * parseFloat(value));
                  if (!isNaN(pts)) {
                    // key format: "HOME_REGULAR_TIME"
                    const parts = key.split('_');
                    const method = parts.slice(1).join('_');
                    const teamKey = parts[0];
                    const teamName = teamKey === 'HOME' ? match.homeTeam : (teamKey === 'AWAY' ? match.awayTeam : teamKey);

                    let methodLabel = '';
                    if (method === 'REGULAR_TIME') methodLabel = 'Καν. Διάρκεια';
                    else if (method === 'EXTRA_TIME') methodLabel = 'Παράταση';
                    else if (method === 'PENALTIES') methodLabel = 'Πέναλτι';
                    else methodLabel = method;

                    items.push({
                      titleStr: `${teamName}  ${methodLabel}`,
                      label: (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Flag teamName={teamName} width={20} height={14} />
                          <span>{methodLabel}</span>
                        </div>
                      ),
                      points: pts
                    });
                  }
                }
                return items.map((item, i) => (
                  <div key={i} style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--others-border, rgba(255,255,255,0.03))',
                    background: 'var(--others-card-bg, rgba(255, 255, 255, 0.05))',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: 'var(--others-shadow, none)'
                  }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.titleStr}>
                      {item.label}
                    </div>
                    <span style={{
                      color: 'var(--success)',
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      marginLeft: '8px'
                    }}>
                      {item.points} pts
                    </span>
                  </div>
                ));
              } catch (e) {
                return null;
              }
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
