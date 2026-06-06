import React, { useState } from 'react';
import { Lock, Check, Clock, AlertTriangle, Eye, Award } from 'lucide-react';
import { Flag, getStageLabel } from '../Countries';
import MatchCountdown from './MatchCountdown';
import PredictionInput from './PredictionInput';
import OthersPredictionsList from './OthersPredictionsList';
import { getAthensDate } from '../../utils/dateUtils';
import { useSubmitMatchPrediction } from '../../hooks/useApi';

export default function MatchCard({
  match,
  predictionData,
  currentUserId,
  setPredictions
}) {
  const [expanded, setExpanded] = useState(false);
  const [othersPredictions, setOthersPredictions] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { mutate: submitPrediction, isPending: submitting } = useSubmitMatchPrediction();

  const finished = match.status === 'FINISHED';
  const isKnockout = match.matchStage !== 'GROUP';

  const isMatchLocked = (() => {
    const kickoff = getAthensDate(new Date(match.kickoffTime));
    const lockTime = new Date(kickoff.getTime() - 5 * 60000);
    return getAthensDate(new Date()) > lockTime;
  })();

  const isPredictionTooFar = (() => {
    const kickoff = getAthensDate(new Date(match.kickoffTime));
    const openTime = new Date(kickoff.getTime() - 24 * 60 * 60 * 1000);
    return getAthensDate(new Date()) < openTime;
  })();

  const matchPred = predictionData || { home: '', away: '', qualifier: '', savedHome: null, savedAway: null, savedQualifier: null, pointsEarned: 0 };
  const hasChanges =
    matchPred.home !== matchPred.savedHome ||
    matchPred.away !== matchPred.savedAway ||
    matchPred.qualifier !== matchPred.savedQualifier;

  const isValidPrediction = matchPred.home !== '' && matchPred.away !== '';

  const handleScoreChange = (matchId, team, val) => {
    const cleanVal = val === '' ? '' : Math.max(0, parseInt(val) || 0);
    
    setPredictions(prev => {
      const currentPred = prev[matchId] || {};
      const newHome = team === 'home' ? cleanVal : currentPred.home;
      const newAway = team === 'away' ? cleanVal : currentPred.away;
      
      let newQualifier = currentPred.qualifier;
      
      if (isKnockout) {
        if (newHome !== '' && newAway !== '' && newHome !== newAway) {
          // Winning score, auto-select winner
          newQualifier = newHome > newAway ? match.homeTeam : match.awayTeam;
        }
      }

      return {
        ...prev,
        [matchId]: {
          ...currentPred,
          [team]: cleanVal,
          qualifier: newQualifier
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

  const handleSubmit = () => {
    if (finished) return;
    setErrorMsg('');
    setSuccess(false);

    const cleanHome = matchPred.home === '' ? 0 : matchPred.home;
    const cleanAway = matchPred.away === '' ? 0 : matchPred.away;

    submitPrediction({
      matchId: match.id,
      home: cleanHome,
      away: cleanAway,
      qualifier: matchPred.qualifier
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

  const toggleExpandMatchOthers = async () => {
    if (expanded) {
      setExpanded(false);
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/predictions/match/${match.id}/others`, {
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
    <div className="glass-card" style={{ padding: '0px', overflow: 'visible' }}>
      {/* Match Card Header Banner */}
      <div className="match-card-header" style={{ borderTopLeftRadius: 'calc(var(--radius-lg) - 1px)', borderTopRightRadius: 'calc(var(--radius-lg) - 1px)' }}>
        <div className="match-stage-wrapper">
          <span className="badge badge-scheduled match-stage-badge" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {getStageLabel(match.matchStage)}
          </span>
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
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255,255,255,0.1)',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}>
                {match.homeScore90} - {match.awayScore90}
              </div>
            ) : (
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>VS</div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'flex-start', flex: '1', textAlign: 'left' }}>
            <Flag teamName={match.awayTeam} width={28} height={18} />
            <h3 className="team-name" style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>{match.awayTeam}</h3>
          </div>
        </div>

        {/* Score Input Box / Prediction Status */}
        {!finished && (
          <PredictionInput
            match={match}
            matchPred={matchPred}
            handleScoreChange={handleScoreChange}
            handleQualifierChange={handleQualifierChange}
            isLocked={isMatchLocked}
            isPredictionTooFar={isPredictionTooFar}
            isKnockout={isKnockout}
          />
        )}

        {/* Match Action Buttons */}
        <div className="match-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '150px', justifyContent: 'flex-end' }}>
          {finished ? (
            <button
              className="btn btn-secondary"
              onClick={toggleExpandMatchOthers}
              style={{ padding: '8px 12px', fontSize: '0.85rem' }}
              title="Δείτε τι έπαιξαν οι άλλοι"
            >
              <Eye size={16} />
              <span style={{ fontSize: '0.8rem', marginLeft: '4px' }}>Προβλέψεις</span>
            </button>
          ) : isPredictionTooFar ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              background: 'rgba(255, 255, 255, 0.02)',
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              <Clock size={15} style={{ color: 'var(--text-muted)' }} />
              <span>Κλειδωμένο (24ω)</span>
            </div>
          ) : !isMatchLocked ? (
            <button
              className="btn btn-primary"
              disabled={!hasChanges || !isValidPrediction || submitting}
              onClick={handleSubmit}
              style={{ padding: '10px 16px', fontSize: '0.85rem' }}
            >
              {submitting ? '...' : success ? <Check size={16} /> : 'Υποβολή'}
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn btn-secondary"
                onClick={toggleExpandMatchOthers}
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
              <strong style={{ color: '#ffffff', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>{matchPred.savedHome} - {matchPred.savedAway}</span>
                {isKnockout && matchPred.savedQualifier && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '2px' }} title={matchPred.savedQualifier}>
                    (<Flag teamName={matchPred.savedQualifier} width={18} height={12} />)
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
      {expanded && (
        <OthersPredictionsList 
          match={match} 
          othersPredictions={othersPredictions} 
          currentUserId={currentUserId} 
          isKnockout={isKnockout} 
        />
      )}
    </div>
  );
}
