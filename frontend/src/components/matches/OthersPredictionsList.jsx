import React from 'react';
import { Flag } from '../Countries';

export default function OthersPredictionsList({ match, othersPredictions, currentUserId, isKnockout }) {
  if (!othersPredictions || othersPredictions.length === 0) {
    return (
      <div style={{
        background: 'var(--others-bg, rgba(10,11,16,0.4))',
        borderTop: '1px solid var(--border-color)',
        padding: '20px 24px'
      }}>
        <h4 style={{ fontSize: '0.9rem', marginBottom: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
          ΠΡΟΒΛΕΨΕΙΣ ΑΛΛΩΝ ΧΡΗΣΤΩΝ
        </h4>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Δεν έχουν υποβληθεί άλλες προβλέψεις για αυτόν τον αγώνα.
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: 'var(--others-bg, rgba(10,11,16,0.4))',
      borderTop: '1px solid var(--border-color)',
      padding: '20px 24px'
    }}>
      <h4 style={{ fontSize: '0.9rem', marginBottom: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
        ΠΡΟΒΛΕΨΕΙΣ ΑΛΛΩΝ ΧΡΗΣΤΩΝ
      </h4>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '12px'
      }}>
        {othersPredictions
          .filter(p => p.userId !== currentUserId)
          .map((p, idx) => {
            let colors = {
              color: 'var(--others-score-color, #a5b4fc)',
              background: 'var(--others-score-bg, rgba(99,102,241,0.1))',
              border: '1px solid transparent'
            };

            if (match.status === 'FINISHED' && match.homeScore90 != null && match.awayScore90 != null) {
              const actualHome = match.homeScore90;
              const actualAway = match.awayScore90;
              const predHome = p.predictedHomeScore;
              const predAway = p.predictedAwayScore;

              if (actualHome === predHome && actualAway === predAway) {
                // Exact score
                colors = {
                  color: '#10b981',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)'
                };
              } else if (Math.sign(actualHome - actualAway) === Math.sign(predHome - predAway)) {
                // Correct sign
                colors = {
                  color: '#3b82f6',
                  background: 'rgba(59, 130, 246, 0.15)',
                  border: '1px solid rgba(59, 130, 246, 0.3)'
                };
              } else {
                // Wrong
                colors = {
                  color: '#ef4444',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)'
                };
              }
            }

            return (
              <div key={idx} style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: '1px solid var(--others-border, rgba(255,255,255,0.03))',
                background: 'var(--others-card-bg, rgba(255, 255, 255, 0.05))',
                boxShadow: 'var(--others-shadow, none)'
              }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{p.username || 'Χρήστης'}</span>
                
                <span style={{
                  fontWeight: 700,
                  color: colors.color,
                  background: colors.background,
                  border: colors.border,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span>{p.predictedHomeScore} - {p.predictedAwayScore}</span>
                  {isKnockout && p.predictedQualifier && (
                    <span style={{ display: 'flex', alignItems: 'center', marginLeft: '2px' }} title={p.predictedQualifier}>
                      (<Flag teamName={p.predictedQualifier} width={18} height={12} />)
                    </span>
                  )}
                </span>
              </div>
            );
          })}
      </div>
    </div>
  );
}
