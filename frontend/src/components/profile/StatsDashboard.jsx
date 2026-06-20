import React from 'react';
import { Trophy, Percent, TrendingUp, Activity, Heart, Flame, Swords, Target } from 'lucide-react';
import { Flag, getTeamShortName } from '../Countries';

export default function StatsDashboard({
  user, accuracyRate, avgPoints, totalPredicted, successCount, completedPredictedCount,
  fanTeam, fanCount, haterTeam, haterCount,
  avgPredictedGoals, playStyle, styleColor, favScore, favScoreCount
}) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '20px',
      marginBottom: '32px'
    }}>
      {/* Points Card */}
      <div className="glass-card responsive-card-padding" style={{
        padding: '24px',
        background: 'var(--points-card-bg, linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(28, 30, 46, 0.6) 100%))',
        border: '1px solid var(--info-border, rgba(99, 102, 241, 0.25))',
        boxShadow: 'var(--shadow-glow)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ color: 'var(--info-color, #a5b4fc)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            ΣΥΝΟΛΙΚΟΙ ΠΟΝΤΟΙ
          </span>
          <Trophy size={20} style={{ color: '#fbbf24' }} />
        </div>
        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
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
        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
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
        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
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
        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
          {totalPredicted}
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>
          Συνολικές προβλέψεις που έχουν καταχωρηθεί
        </p>
      </div>

      {/* Fan Card */}
      <div className="glass-card responsive-card-padding" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            ΟΠΑΔΟΣ
          </span>
          <Heart size={20} style={{ color: '#ec4899' }} />
        </div>
        {fanTeam ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <Flag teamName={fanTeam} width={36} height={26} />
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {getTeamShortName(fanTeam)}
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '6px' }}>
              Προβλέφθηκε να νικήσει <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{fanCount}</span> φορές
            </p>
          </>
        ) : (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '16px' }}>Δεν υπάρχουν αρκετά δεδομένα.</p>
        )}
      </div>

      {/* Hater Card */}
      <div className="glass-card responsive-card-padding" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            HATER
          </span>
          <Flame size={20} style={{ color: '#ef4444' }} />
        </div>
        {haterTeam ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <Flag teamName={haterTeam} width={36} height={26} />
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {getTeamShortName(haterTeam)}
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '6px' }}>
              Προβλέφθηκε να χάσει <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{haterCount}</span> φορές
            </p>
          </>
        ) : (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '16px' }}>Δεν υπάρχουν αρκετά δεδομένα.</p>
        )}
      </div>

      {/* Play Style Card */}
      <div className="glass-card responsive-card-padding" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            ΤΑΚΤΙΚΗ
          </span>
          <Swords size={20} style={{ color: styleColor }} />
        </div>
        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: styleColor, marginBottom: '6px' }}>
          {playStyle}
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Μ.Ο. προβλεπόμενων γκολ: <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{avgPredictedGoals}</span>
        </p>
      </div>

      {/* Favorite Score Card */}
      <div className="glass-card responsive-card-padding" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            ΤΟ ΣΤΑΝΤΑΡ ΤΟΥ
          </span>
          <Target size={20} style={{ color: '#8b5cf6' }} />
        </div>
        {favScore ? (
          <>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '0.05em' }}>
              {favScore}
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Αγαπημένο σκορ (<span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{favScoreCount}</span> φορές)
            </p>
          </>
        ) : (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '16px' }}>Δεν υπάρχουν αρκετά δεδομένα.</p>
        )}
      </div>

    </div>
  );
}
