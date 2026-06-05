import React, { useState, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { Avatar } from '../components/Avatars';
import { TrendingUp, Award, BarChart2, Zap, Target, Flame } from 'lucide-react';
import './Stats.css';

export default function Stats({ user }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats/global', {
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

  const accuracyData = [
    { name: 'Ακριβές Σκορ', value: stats.totalExactScores || 0 },
    { name: 'Σωστό Αποτέλεσμα', value: stats.totalCorrectResults || 0 },
    { name: 'Λάθος', value: stats.totalMisses || 0 }
  ];
  const ACCURACY_COLORS = ['#10b981', '#3b82f6', '#ef4444'];

  return (
    <div className="stats-container animate-fade-in">
      <div className="stats-header">
        <div className="stats-header-icon">
          <BarChart2 size={28} />
        </div>
        <h1 className="stats-title">Στατιστικά Κοινότητας</h1>
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
          <h2 className="chart-title">Πρόβλεψη Νικητή (Κοινότητα)</h2>
          {championData.length > 0 ? (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300} minWidth={0} minHeight={0}>
                <PieChart>
                  <Pie
                    data={championData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {championData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value) => `${value}%`} contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)', color: '#fff' }} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Δεν υπάρχουν δεδομένα</div>
          )}
        </div>

        <div className="glass chart-card">
          <h2 className="chart-title">Συνολικό Ποσοστό Επιτυχίας</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300} minWidth={0} minHeight={0}>
              <PieChart>
                <Pie
                  data={accuracyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {accuracyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={ACCURACY_COLORS[index % ACCURACY_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value) => `${value} προβλέψεις`} contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)', color: '#fff' }} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Superlatives Section */}
      <div className="stats-grid-3">
        
        {/* Match Superlatives */}
        <div className="glass superlative-card">
          <h2 className="superlative-title" style={{ color: '#818cf8' }}>
            <Target size={20} /> Πιο Προβλέψιμος Αγώνας
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
            <Flame size={20} /> Η Μεγαλύτερη Έκπληξη
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
                  <p className="hof-role">The Oracle</p>
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
                  <p className="hof-role">Mr. Consistent</p>
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
                          <span>{match.homeTeam}</span>
                          <span className="matrix-match-score">
                            {match.homeScore != null ? `${match.homeScore} - ${match.awayScore}` : 'vs'}
                          </span>
                          <span>{match.awayTeam}</span>
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
                      if (pred.pointsEarned != null) {
                        if (pred.pointsEarned >= 5) {
                          ptsClass = 'pts-exact';
                          isExact = true;
                        }
                        else if (pred.pointsEarned > 0) ptsClass = 'pts-correct';
                        else ptsClass = 'pts-miss';
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
