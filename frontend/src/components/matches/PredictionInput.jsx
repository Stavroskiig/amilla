import React from 'react';
import { Flag, uppercaseNoAccents } from '../Countries';
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
            value={matchPred.home ?? ''}
            onChange={(e) => handleScoreChange(match.id, 'home', e.target.value)}
            disabled={disabled}
            placeholder="-"
          />
          <span style={{ color: 'var(--text-muted)' }}>-</span>
          <input
            type="number"
            className="score-box"
            value={matchPred.away ?? ''}
            onChange={(e) => handleScoreChange(match.id, 'away', e.target.value)}
            disabled={disabled}
            placeholder="-"
          />
        </div>
      </div>

      {isKnockout && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>ΠΡΟΚΡΙΣΗ</span>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            background: 'rgba(10, 11, 16, 0.7)', 
            padding: '4px', 
            borderRadius: 'var(--radius-sm)', 
            border: '1px solid var(--border-color)' 
          }}>
            {[match.homeTeam, match.awayTeam].map(team => {
              const isSelected = matchPred.qualifier === team;
              return (
                <button
                  key={team}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleQualifierChange(match.id, isSelected ? '' : team)}
                  title={uppercaseNoAccents(team)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    border: isSelected ? '1px solid var(--primary)' : '1px solid transparent',
                    background: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled && !isSelected ? 0.4 : 1,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Flag teamName={team} width={28} height={18} />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
