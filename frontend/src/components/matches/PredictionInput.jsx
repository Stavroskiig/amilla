import React from 'react';
import { Flag, uppercaseNoAccents } from '../Countries';
import { Clock, Target } from 'lucide-react';
export default function PredictionInput({
  match,
  matchPred,
  handleScoreChange,
  handleQualifierChange,
  handleQualificationMethodChange,
  isLocked,
  isPredictionTooFar,
  isKnockout
}) {
  const disabled = isLocked || isPredictionTooFar;

  const hScore = matchPred.home !== undefined && matchPred.home !== '' ? parseInt(matchPred.home, 10) : null;
  const aScore = matchPred.away !== undefined && matchPred.away !== '' ? parseInt(matchPred.away, 10) : null;
  const hasWinningScore = hScore !== null && aScore !== null && hScore !== aScore;
  const qualifierDisabled = disabled || hasWinningScore;

  return (
    <div className="score-inputs-container" style={{
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      justifyContent: 'center',
      background: 'var(--input-container-bg, rgba(0,0,0,0.2))',
      padding: '12px 20px',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--input-container-border, rgba(255,255,255,0.03))'
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
          <div className="qualifier-container" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--qualifier-bg, rgba(10, 11, 16, 0.7))',
            padding: '4px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)',
            marginBottom: (hScore === aScore && hScore !== null) ? '8px' : '0'
          }}>
            {[match.homeTeam, match.awayTeam].map(team => {
              const isSelected = matchPred.qualifier === team;
              return (
                <button
                  key={team}
                  type="button"
                  disabled={qualifierDisabled}
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
                    cursor: qualifierDisabled ? 'not-allowed' : 'pointer',
                    opacity: qualifierDisabled && !isSelected ? 0.4 : 1,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Flag teamName={team} width={28} height={18} />
                </button>
              );
            })}
          </div>

          {(hScore === aScore && hScore !== null) && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'var(--input-bg, rgba(10, 11, 16, 0.7))',
              border: '1px solid var(--border-color)',
              padding: '4px',
              borderRadius: 'var(--radius-sm)',
              width: '100%',
              opacity: disabled ? 0.6 : 1
            }}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => handleQualificationMethodChange(match.id, 'EXTRA_TIME')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '6px 8px',
                  borderRadius: '4px',
                  border: matchPred.predictedQualificationMethod === 'EXTRA_TIME' ? '1px solid var(--primary)' : '1px solid transparent',
                  background: matchPred.predictedQualificationMethod === 'EXTRA_TIME' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                  color: matchPred.predictedQualificationMethod === 'EXTRA_TIME' ? 'var(--text-main)' : 'var(--text-muted)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <Clock size={14} />
                ΠΑΡ
              </button>
              <button
                type="button"
                disabled={disabled}
                onClick={() => handleQualificationMethodChange(match.id, 'PENALTIES')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '6px 8px',
                  borderRadius: '4px',
                  border: matchPred.predictedQualificationMethod === 'PENALTIES' ? '1px solid var(--primary)' : '1px solid transparent',
                  background: matchPred.predictedQualificationMethod === 'PENALTIES' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                  color: matchPred.predictedQualificationMethod === 'PENALTIES' ? 'var(--text-main)' : 'var(--text-muted)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <Target size={14} />
                ΠΕΝ
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
