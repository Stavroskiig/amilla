import React from 'react';

export default function PredictionInput({
  match,
  matchPred,
  handleScoreChange,
  handleQualifierChange,
  isLocked,
  isPredictionTooFar,
  isKnockout
}) {
  const disabled = isLocked || isPredictionTooFar;

  return (
    <div className="score-inputs-container" style={{
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
            disabled={disabled}
            placeholder="-"
          />
          <span style={{ color: 'var(--text-muted)' }}>-</span>
          <input
            type="number"
            className="score-box"
            value={matchPred.away}
            onChange={(e) => handleScoreChange(match.id, 'away', e.target.value)}
            disabled={disabled}
            placeholder="-"
          />
        </div>
      </div>

      {isKnockout && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>ΠΡΟΚΡΙΣΗ</span>
          <select
            value={matchPred.qualifier}
            onChange={(e) => handleQualifierChange(match.id, e.target.value)}
            disabled={disabled}
            style={{
              background: 'rgba(10, 11, 16, 0.7)',
              border: '1px solid var(--border-color)',
              color: '#ffffff',
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: disabled ? 'not-allowed' : 'pointer'
            }}
          >
            <option value="">Επιλογή...</option>
            <option value={match.homeTeam}>{match.homeTeam}</option>
            <option value={match.awayTeam}>{match.awayTeam}</option>
          </select>
        </div>
      )}
    </div>
  );
}
