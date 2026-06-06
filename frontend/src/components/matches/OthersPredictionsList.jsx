import React from 'react';
import { Flag } from '../Countries';

export default function OthersPredictionsList({ match, othersPredictions, currentUserId, isKnockout }) {
  if (!othersPredictions || othersPredictions.length === 0) {
    return (
      <div style={{
        background: 'rgba(10,11,16,0.4)',
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
      background: 'rgba(10,11,16,0.4)',
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
          ))}
      </div>
    </div>
  );
}
