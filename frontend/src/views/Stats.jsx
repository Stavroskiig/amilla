import React, { useState, useEffect } from 'react';
import { Avatar } from '../components/Avatars';
import { Flag, getTeamShortName, getTeamColor } from '../components/Countries';
import { TrendingUp, Award, BarChart2, Zap, Target, Flame } from 'lucide-react';
import './Stats.css';

const API_URL = import.meta.env.VITE_API_URL || '';


export default function Stats({ user }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch(API_URL + '/api/stats/global', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else {
        console.error('Failed to fetch stats');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)' }}>Φόρτωση στατιστικών...</div>;
  }

  if (!stats) {
    return <div style={{ padding: '16px', textAlign: 'center', color: 'var(--danger)' }}>Σφάλμα κατά τη φόρτωση στατιστικών.</div>;
  }

  // Prepare chart data
  const championData = Object.keys(stats.championDistribution || {}).map(team => ({
    name: team,
    value: stats.championDistribution[team]
  }));

  const COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6'];

  const exactCount = stats.totalExactScores || 0;
  const correctSignCount = Math.max(0, (stats.totalCorrectResults || 0) - exactCount);
  const missCount = stats.totalMisses || 0;

  const accuracyData = [
    { name: 'Ακριβές Σκορ', value: exactCount },
    { name: 'Σωστό Αποτέλεσμα', value: correctSignCount },
    { name: 'Λάθος', value: missCount }
  ];
  const ACCURACY_COLORS = ['#10b981', '#3b82f6', '#ef4444'];
  const totalAccuracy = accuracyData.reduce((acc, cur) => acc + cur.value, 0);

  return (
    <div className="stats-container animate-fade-in">
      <div className="stats-header">
        <div className="stats-header-icon">
          <BarChart2 size={28} />
        </div>
        <h1 className="stats-title">Συνολικά Στατιστικά</h1>
      </div>

      {/* Global Averages Section */}
      <div className="stats-grid-4">
        <div className="glass stat-card">
          <div>
            <p className="stat-label">Μ.Ο. Πόντων / Πρόβλεψη</p>
            <p className="stat-value">{stats.averagePointsPerPrediction}</p>
          </div>
          <Zap size={32} className="stat-icon" color="#f59e0b" />
        </div>
        <div className="glass stat-card">
          <div>
            <p className="stat-label">Σύνολο Ακριβών Σκορ</p>
            <p className="stat-value" style={{ color: 'var(--success)' }}>{stats.totalExactScores}</p>
          </div>
          <Target size={32} className="stat-icon" color="var(--success)" />
        </div>
        <div className="glass stat-card">
          <div>
            <p className="stat-label">Σύνολο Σωστών Σημείων</p>
            <p className="stat-value" style={{ color: '#3b82f6' }}>{stats.totalCorrectResults}</p>
          </div>
          <TrendingUp size={32} className="stat-icon" color="#3b82f6" />
        </div>
        <div className="glass stat-card">
          <div>
            <p className="stat-label">Πιο Κοινό Σκορ</p>
            <p className="stat-value">{stats.mostCommonScoreline}</p>
          </div>
          <BarChart2 size={32} className="stat-icon" color="var(--text-muted)" />
        </div>
      </div>

      <div className="stats-grid-2">

        {/* Charts Section */}
        <div className="glass chart-card">
          <h2 className="chart-title">Πρόβλεψη Νικητή</h2>
          {championData.length > 0 ? (
            <div className="custom-bars-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              {championData.map((entry, index) => (
                <div key={entry.name} className="custom-bar-item" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Flag teamName={entry.name} width={24} height={16} />
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{entry.name}</span>
                    </div>
                    <span style={{ fontWeight: 700, color: getTeamColor(entry.name) }}>{entry.value}%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${entry.value}%`,
                        background: getTeamColor(entry.name),
                        borderRadius: '4px',
                        transition: 'width 1s ease-out'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', minHeight: '200px' }}>Δεν υπάρχουν δεδομένα</div>
          )}
        </div>

        <div className="glass chart-card">
          <h2 className="chart-title">Συνολικό Ποσοστό Επιτυχίας</h2>
          <div className="accuracy-container" style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
            {totalAccuracy > 0 ? (
              <>
                <div style={{ display: 'flex', width: '100%', height: '16px', borderRadius: '8px', overflow: 'hidden', marginBottom: '24px' }}>
                  {accuracyData.map((entry, index) => {
                    if (entry.value === 0) return null;
                    const pct = (entry.value / totalAccuracy) * 100;
                    return (
                      <div
                        key={entry.name}
                        style={{
                          width: `${pct}%`,
                          height: '100%',
                          backgroundColor: ACCURACY_COLORS[index % ACCURACY_COLORS.length],
                          transition: 'width 1s ease-out'
                        }}
                        title={`${entry.name}: ${entry.value}`}
                      />
                    );
                  })}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                  {accuracyData.map((entry, index) => {
                    const pct = totalAccuracy > 0 ? ((entry.value / totalAccuracy) * 100).toFixed(1) : 0;
                    return (
                      <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: ACCURACY_COLORS[index % ACCURACY_COLORS.length] }}></div>
                        <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                          {entry.name} <strong style={{ color: 'var(--text-primary)', marginLeft: '4px' }}>{entry.value}</strong> <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>({pct}%)</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', minHeight: '200px' }}>Δεν υπάρχουν δεδομένα</div>
            )}
          </div>
        </div>

      </div>

      {/* Superlatives Section */}
      <div className="stats-grid-3">

        {/* Match Superlatives */}
        <div className="glass superlative-card">
          <h2 className="superlative-title" style={{ color: '#818cf8' }}>
            <Target size={20} /> Πιο Εύκολη Πρόβλεψη
          </h2>
          {stats.mostPredictableMatch ? (
            <div className="superlative-box" style={{ border: '1px solid rgba(99,102,241,0.2)' }}>
              <div className="superlative-match">
                <span className="superlative-team">{stats.mostPredictableMatch.homeTeam}</span>
                <span className="superlative-score">{stats.mostPredictableMatch.homeScore} - {stats.mostPredictableMatch.awayScore}</span>
                <span className="superlative-team">{stats.mostPredictableMatch.awayTeam}</span>
              </div>
              <div className="superlative-avg">
                Μ.Ο. Πόντων: <span style={{ color: '#818cf8', fontWeight: 700 }}>{stats.mostPredictableMatch.averagePoints}</span>
              </div>
            </div>
          ) : <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Δεν υπάρχουν ολοκληρωμένοι αγώνες.</p>}
        </div>

        <div className="glass superlative-card">
          <h2 className="superlative-title" style={{ color: '#f472b6' }}>
            <Flame size={20} /> Πιο Δύσκολη Πρόβλεψη
          </h2>
          {stats.biggestUpset ? (
            <div className="superlative-box" style={{ border: '1px solid rgba(244,114,182,0.2)' }}>
              <div className="superlative-match">
                <span className="superlative-team">{stats.biggestUpset.homeTeam}</span>
                <span className="superlative-score">{stats.biggestUpset.homeScore} - {stats.biggestUpset.awayScore}</span>
                <span className="superlative-team">{stats.biggestUpset.awayTeam}</span>
              </div>
              <div className="superlative-avg">
                Μ.Ο. Πόντων: <span style={{ color: '#f472b6', fontWeight: 700 }}>{stats.biggestUpset.averagePoints}</span>
              </div>
            </div>
          ) : <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Δεν υπάρχουν ολοκληρωμένοι αγώνες.</p>}
        </div>

        {/* Hall of Fame */}
        <div className="glass superlative-card">
          <h2 className="superlative-title" style={{ color: '#fbbf24' }}>
            <Award size={20} /> Hall of Fame
          </h2>

          <div className="hof-list">
            {stats.theOracle && (
              <div className="hof-item">
                <Avatar id={stats.theOracle.avatar} size={40} />
                <div className="hof-info">
                  <p className="hof-role">Ο ΠΡΟΦΗΤΗΣ</p>
                  <p className="hof-name">{stats.theOracle.username}</p>
                </div>
                <div className="hof-stat" style={{ color: 'var(--success)', background: 'var(--success-glow)' }}>
                  {stats.theOracle.statValue}
                </div>
              </div>
            )}

            {stats.mrConsistent && (
              <div className="hof-item">
                <Avatar id={stats.mrConsistent.avatar} size={40} />
                <div className="hof-info">
                  <p className="hof-role">Ο ΣΤΑΘΕΡΟΣ</p>
                  <p className="hof-name">{stats.mrConsistent.username}</p>
                </div>
                <div className="hof-stat" style={{ color: '#60a5fa', background: 'rgba(59, 130, 246, 0.1)' }}>
                  {stats.mrConsistent.statValue}
                </div>
              </div>
            )}

            {!stats.theOracle && !stats.mrConsistent && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Η κατάταξη μορφοποιείται...</p>
            )}
          </div>
        </div>

      </div>

      {/* Prediction Matrix Table */}
      {stats.predictionMatrix && stats.predictionMatrix.matches.length > 0 && (
        <div className="matrix-card">
          <h2 className="matrix-title">
            <Target size={24} color="var(--primary)" /> Πίνακας Προβλέψεων
          </h2>
          <div className="matrix-table-wrapper">
            <table className="matrix-table">
              <thead>
                <tr>
                  <th style={{ minWidth: '220px', textAlign: 'left' }}>Αγώνας</th>
                  {stats.predictionMatrix.players.map(player => (
                    <th key={player.id}>
                      <div className="matrix-player-header">
                        <Avatar id={player.avatar} size={32} />
                        <span className="matrix-player-name" title={player.username}>{player.username}</span>
                        <span style={{ color: 'var(--primary)', fontSize: '0.75rem' }}>{player.totalPoints} pts</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.predictionMatrix.matches.map(match => (
                  <tr key={match.matchId}>
                    <td>
                      <div className="matrix-match-cell">
                        <div className="matrix-match-teams">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} title={match.homeTeam}>
                            <span>{getTeamShortName(match.homeTeam)}</span>
                            <Flag teamName={match.homeTeam} width={18} height={13.5} />
                          </div>
                          <span className="matrix-match-score">
                            {match.homeScore != null ? `${match.homeScore} - ${match.awayScore}` : 'vs'}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} title={match.awayTeam}>
                            <Flag teamName={match.awayTeam} width={18} height={13.5} />
                            <span>{getTeamShortName(match.awayTeam)}</span>
                          </div>
                        </div>
                        <div className="matrix-match-meta">
                          {new Date(match.kickoffTime).toLocaleDateString('el-GR', { day: '2-digit', month: '2-digit' })} •
                          <span style={{ color: match.status === 'FINISHED' ? 'var(--success)' : 'var(--warning)' }}>
                            {match.status === 'FINISHED' ? 'Τελικό' : 'Σε εξέλιξη'}
                          </span>
                        </div>
                      </div>
                    </td>
                    {stats.predictionMatrix.players.map(player => {
                      const pred = match.predictions[player.id];

                      if (!pred) {
                        return <td key={player.id}><span style={{ color: 'var(--text-muted)' }}>-</span></td>;
                      }

                      let ptsClass = 'pts-pending';
                      let isExact = false;
                      if (pred.pointsEarned != null && match.status === 'FINISHED') {
                        let isCorrectSign = false;
                        if (match.homeScore != null && match.awayScore != null) {
                          if (pred.homeScore === match.homeScore && pred.awayScore === match.awayScore) {
                            isExact = true;
                          }
                          isCorrectSign = Math.sign(match.homeScore - match.awayScore) === Math.sign(pred.homeScore - pred.awayScore);
                        }

                        if (isExact) {
                          ptsClass = 'pts-exact';
                        } else if (isCorrectSign) {
                          ptsClass = 'pts-correct';
                        } else {
                          ptsClass = 'pts-miss';
                        }
                      }

                      return (
                        <td key={player.id} style={{ padding: '8px' }}>
                          <div className={isExact ? 'cell-exact-hit' : ''} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <span className="matrix-pred-cell">{pred.homeScore} - {pred.awayScore}</span>
                            {pred.pointsEarned != null && (
                              <span className={`matrix-pred-pts ${ptsClass}`}>+{pred.pointsEarned} pts</span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
