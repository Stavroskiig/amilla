import React, { useRef } from 'react';
import { Flag } from '../Countries';
import { Share2 } from 'lucide-react';
import html2canvas from 'html2canvas';

export default function OthersPredictionsList({ match, othersPredictions, currentUserId, isKnockout }) {
  const containerRef = useRef(null);

  const handleShare = async () => {
    if (!containerRef.current) return;
    try {
      const canvas = await html2canvas(containerRef.current, {
        useCORS: true,
        scale: 2,
        backgroundColor: document.documentElement.getAttribute('data-theme') === 'wc26' ? '#f1f5f9' : '#0f111a'
      });
      const imageBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      const file = new File([imageBlob], `predictions-${match.homeTeam}-${match.awayTeam}.png`, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Προβλέψεις: ${match.homeTeam} - ${match.awayTeam}`,
          text: `Δες τι προβλέπουν οι άλλοι για το ${match.homeTeam} - ${match.awayTeam}!`,
        });
      } else {
        const url = URL.createObjectURL(imageBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `predictions-${match.homeTeam}-${match.awayTeam}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Error sharing image', err);
    }
  };
  if (!othersPredictions || othersPredictions.length === 0) {
    return (
      <div style={{
        background: 'var(--others-bg, rgba(10,11,16,0.4))',
        borderTop: '1px solid var(--border-color)',
        padding: '20px 24px'
      }}>
        <h4 style={{ fontSize: '0.9rem', marginBottom: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
          ΠΡΟΒΛΕΨΕΙΣ
        </h4>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Δεν έχουν υποβληθεί προβλέψεις για αυτόν τον αγώνα.
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{
      background: 'var(--others-bg, rgba(10,11,16,0.4))',
      borderTop: '1px solid var(--border-color)',
      padding: '20px 24px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h4 style={{ fontSize: '0.9rem', margin: 0, color: 'var(--text-muted)', fontWeight: 600 }}>
          ΠΡΟΒΛΕΨΕΙΣ
        </h4>
        <button
          onClick={handleShare}
          data-html2canvas-ignore="true"
          title="Μοιράσου τις προβλέψεις"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            background: 'var(--bg-surface, rgba(255,255,255,0.05))',
            color: 'var(--text-muted)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseOver={(e) => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
          onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
        >
          <Share2 size={14} />
        </button>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '12px'
      }}>
        {othersPredictions
          .sort((a, b) => new Date(a.updatedAt || a.createdAt || 0) - new Date(b.updatedAt || b.createdAt || 0))
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
                border: p.userId === currentUserId ? '1px solid var(--primary, #6366f1)' : '1px solid var(--others-border, rgba(255,255,255,0.03))',
                background: p.userId === currentUserId ? 'var(--primary-transparent, rgba(99, 102, 241, 0.1))' : 'var(--others-card-bg, rgba(255, 255, 255, 0.05))',
                boxShadow: 'var(--others-shadow, none)'
              }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {p.username || 'Χρήστης'}
                  {p.userId === currentUserId && (
                    <span className="badge self-badge" style={{
                      background: 'rgba(99,102,241,0.2)',
                      color: 'var(--self-badge-color, #a5b4fc)',
                      fontSize: '0.65rem',
                      padding: '2px 6px',
                      borderRadius: '10px',
                      lineHeight: 1
                    }}>
                      ΕΣΥ
                    </span>
                  )}
                </span>
                
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
