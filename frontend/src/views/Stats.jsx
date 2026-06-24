import React, { useState, useEffect } from 'react';
import { Avatar } from '../components/Avatars';
import { Flag, getTeamShortName, getTeamColor } from '../components/Countries';
import { TrendingUp, Award, BarChart2, Zap, Target, Flame, Skull, ChevronLeft, ChevronRight, Trash, Coins } from 'lucide-react';
import './Stats.css';

const API_URL = import.meta.env.VITE_API_URL || '';


export default function Stats({ user }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [zeroMatchIndex, setZeroMatchIndex] = useState(0);
  const [goldenMatchIndex, setGoldenMatchIndex] = useState(0);

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
    { name: 'Μόνο Σημείο', value: correctSignCount },
    { name: 'Λάθος', value: missCount }
  ];
  const ACCURACY_COLORS = ['var(--success)', 'var(--primary)', 'var(--danger)'];
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
          <Zap size={32} className="stat-icon" color="var(--warning)" />
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
            <p className="stat-value" style={{ color: 'var(--primary)' }}>{stats.totalCorrectResults}</p>
          </div>
          <TrendingUp size={32} className="stat-icon" color="var(--primary)" />
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
            <div className="custom-bars-container">
              {championData.map((entry, index) => (
                <div key={entry.name} className="custom-bar-item" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Flag teamName={entry.name} width={24} height={16} />
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{entry.name}</span>
                    </div>
                    <span className="chart-team-pct" style={{ fontWeight: 700, color: getTeamColor(entry.name) }}>{entry.value}%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'var(--bar-bg, rgba(255,255,255,0.05))', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      className="chart-team-bar"
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
          <div className="accuracy-container" style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', flex: 1, justifyContent: 'center' }}>
            {totalAccuracy > 0 ? (
              <>
                {accuracyData.map((entry, index) => {
                  const pct = totalAccuracy > 0 ? ((entry.value / totalAccuracy) * 100).toFixed(1) : 0;
                  const color = ACCURACY_COLORS[index % ACCURACY_COLORS.length];
                  return (
                    <div key={entry.name} className="custom-bar-item" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                          {entry.name} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: '4px' }}>({entry.value})</span>
                        </span>
                        <span className="chart-team-pct" style={{ fontWeight: 700, color: color }}>{pct}%</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: 'var(--bar-bg, rgba(255,255,255,0.05))', borderRadius: '4px', overflow: 'hidden' }}>
                        <div
                          className="chart-team-bar"
                          style={{
                            height: '100%',
                            width: `${pct}%`,
                            background: color,
                            borderRadius: '4px',
                            transition: 'width 1s ease-out'
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', minHeight: '200px' }}>Δεν υπάρχουν δεδομένα</div>
            )}
          </div>
        </div>

      </div>

      {/* Superlatives Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        <div className="stats-grid-2">
          {/* Match Superlatives */}
          <div className="glass superlative-card" style={{ height: '100%' }}>
            <h2 className="superlative-title" style={{ color: 'var(--secondary)' }}>
              <Target size={20} /> Πιο Εύκολη Πρόβλεψη
            </h2>
            {stats.mostPredictableMatch ? (
              <div className="superlative-box" style={{ border: '1px solid var(--secondary-glow)' }}>
                <div className="superlative-match">
                  <span className="superlative-team" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Flag teamName={stats.mostPredictableMatch.homeTeam} width={24} height={18} />
                    <span className="superlative-team-name">{getTeamShortName(stats.mostPredictableMatch.homeTeam)}</span>
                  </span>
                  <span className="superlative-score">{stats.mostPredictableMatch.homeScore} - {stats.mostPredictableMatch.awayScore}</span>
                  <span className="superlative-team" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="superlative-team-name">{getTeamShortName(stats.mostPredictableMatch.awayTeam)}</span>
                    <Flag teamName={stats.mostPredictableMatch.awayTeam} width={24} height={18} />
                  </span>
                </div>
                <div className="superlative-avg">
                  Σωστές Προβλέψεις: <span style={{ color: 'var(--secondary)', fontWeight: 700 }}>{stats.mostPredictableMatch.exactPredictions + stats.mostPredictableMatch.correctResultPredictions} / {stats.mostPredictableMatch.totalPredictions}</span>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    ({stats.mostPredictableMatch.exactPredictions} {stats.mostPredictableMatch.exactPredictions === 1 ? 'Ακριβές' : 'Ακριβή'}, {stats.mostPredictableMatch.correctResultPredictions} {stats.mostPredictableMatch.correctResultPredictions === 1 ? 'Σημείο' : 'Σημεία'})
                  </div>
                </div>
              </div>
            ) : <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Δεν υπάρχουν ολοκληρωμένοι αγώνες.</p>}
          </div>

          <div className="glass superlative-card" style={{ height: '100%' }}>
            <h2 className="superlative-title" style={{ color: 'var(--danger)' }}>
              <Flame size={20} /> Πιο Δύσκολη Πρόβλεψη
            </h2>
            {stats.biggestUpset ? (
              <div className="superlative-box" style={{ border: '1px solid var(--danger-glow)' }}>
                <div className="superlative-match">
                  <span className="superlative-team" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Flag teamName={stats.biggestUpset.homeTeam} width={24} height={18} />
                    <span className="superlative-team-name">{getTeamShortName(stats.biggestUpset.homeTeam)}</span>
                  </span>
                  <span className="superlative-score">{stats.biggestUpset.homeScore} - {stats.biggestUpset.awayScore}</span>
                  <span className="superlative-team" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="superlative-team-name">{getTeamShortName(stats.biggestUpset.awayTeam)}</span>
                    <Flag teamName={stats.biggestUpset.awayTeam} width={24} height={18} />
                  </span>
                </div>
                <div className="superlative-avg">
                  Σωστές Προβλέψεις: <span style={{ color: 'var(--danger)', fontWeight: 700 }}>{stats.biggestUpset.exactPredictions + stats.biggestUpset.correctResultPredictions} / {stats.biggestUpset.totalPredictions}</span>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    ({stats.biggestUpset.exactPredictions} {stats.biggestUpset.exactPredictions === 1 ? 'Ακριβές' : 'Ακριβή'}, {stats.biggestUpset.correctResultPredictions} {stats.biggestUpset.correctResultPredictions === 1 ? 'Σημείο' : 'Σημεία'})
                  </div>
                </div>
              </div>
            ) : <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Δεν υπάρχουν ολοκληρωμένοι αγώνες.</p>}
          </div>
        </div>

        {/* Combined Carousels */}
        {(stats.zeroSuccessMatches?.length > 0 || stats.goldenPredictions?.length > 0) && (
          <div className="stats-grid-2" style={{ marginTop: '-8px' }}>
            {/* Zero Successes Carousel */}
            {stats.zeroSuccessMatches?.length > 0 && (
              <div className="glass superlative-card" style={{ height: '100%' }}>
                <h2 className="superlative-title" style={{ color: 'var(--text-muted)' }}>
                  <Trash size={20} /> Ο Απόλυτος Κουβάς
                </h2>
                <div className="superlative-box" style={{ border: '1px solid var(--border-color)', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', zIndex: 2 }}>
                    <button
                      onClick={() => setZeroMatchIndex((prev) => (prev - 1 + stats.zeroSuccessMatches.length) % stats.zeroSuccessMatches.length)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                    >
                      <ChevronLeft size={24} />
                    </button>
                  </div>

                  <div className="superlative-match" style={{ padding: '0 24px' }}>
                    <span className="superlative-team" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Flag teamName={stats.zeroSuccessMatches[zeroMatchIndex].homeTeam} width={24} height={18} />
                      <span className="superlative-team-name">{getTeamShortName(stats.zeroSuccessMatches[zeroMatchIndex].homeTeam)}</span>
                    </span>
                    <span className="superlative-score">{stats.zeroSuccessMatches[zeroMatchIndex].homeScore} - {stats.zeroSuccessMatches[zeroMatchIndex].awayScore}</span>
                    <span className="superlative-team" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="superlative-team-name">{getTeamShortName(stats.zeroSuccessMatches[zeroMatchIndex].awayTeam)}</span>
                      <Flag teamName={stats.zeroSuccessMatches[zeroMatchIndex].awayTeam} width={24} height={18} />
                    </span>
                  </div>

                  <div style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', zIndex: 2 }}>
                    <button
                      onClick={() => setZeroMatchIndex((prev) => (prev + 1) % stats.zeroSuccessMatches.length)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                    >
                      <ChevronRight size={24} />
                    </button>
                  </div>

                  <div className="superlative-avg">
                    Κανείς δεν πήρε πόντο από {stats.zeroSuccessMatches[zeroMatchIndex].totalPredictions} προβλέψεις!
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 'auto' }}>
                      {zeroMatchIndex + 1} από {stats.zeroSuccessMatches.length}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Golden Predictions Carousel */}
            {stats.goldenPredictions?.length > 0 && (
              <div className="glass superlative-card" style={{ height: '100%', border: '1px solid var(--warning-glow)' }}>
                <h2 className="superlative-title" style={{ color: 'var(--warning)' }}>
                  <Coins size={20} /> Το Χρυσό Ακριβές Σκορ
                </h2>
                <div className="superlative-box" style={{ border: '1px solid var(--warning-glow)', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', zIndex: 2 }}>
                    <button
                      onClick={() => setGoldenMatchIndex((prev) => (prev - 1 + stats.goldenPredictions.length) % stats.goldenPredictions.length)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--warning)', cursor: 'pointer', padding: '4px' }}
                    >
                      <ChevronLeft size={24} />
                    </button>
                  </div>

                  <div className="superlative-match" style={{ padding: '0 24px' }}>
                    <span className="superlative-team" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Flag teamName={stats.goldenPredictions[goldenMatchIndex].homeTeam} width={24} height={18} />
                      <span className="superlative-team-name">{getTeamShortName(stats.goldenPredictions[goldenMatchIndex].homeTeam)}</span>
                    </span>
                    <span className="superlative-score" style={{ color: 'var(--warning)' }}>{stats.goldenPredictions[goldenMatchIndex].homeScore} - {stats.goldenPredictions[goldenMatchIndex].awayScore}</span>
                    <span className="superlative-team" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="superlative-team-name">{getTeamShortName(stats.goldenPredictions[goldenMatchIndex].awayTeam)}</span>
                      <Flag teamName={stats.goldenPredictions[goldenMatchIndex].awayTeam} width={24} height={18} />
                    </span>
                  </div>

                  <div style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', zIndex: 2 }}>
                    <button
                      onClick={() => setGoldenMatchIndex((prev) => (prev + 1) % stats.goldenPredictions.length)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--warning)', cursor: 'pointer', padding: '4px' }}
                    >
                      <ChevronRight size={24} />
                    </button>
                  </div>

                  <div className="superlative-avg">
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px' }}>
                      {stats.goldenPredictions[goldenMatchIndex].users.map((u, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Avatar id={u.avatar} size={24} />
                          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{u.username}</span>
                        </div>
                      ))}
                    </div>
                    <span>
                      {stats.goldenPredictions[goldenMatchIndex].users.length === 1 ? 'Κέρδισε ' : 'Κέρδισαν '}
                      <span style={{ color: 'var(--warning)', fontWeight: 700, fontSize: '1.1rem' }}>+{stats.goldenPredictions[goldenMatchIndex].pointsEarned} pts</span> από αυτήν την πρόβλεψη!
                    </span>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 'auto' }}>
                      {goldenMatchIndex + 1} από {stats.goldenPredictions.length}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Hall of Fame */}
        <div className="glass superlative-card">
          <h2 className="superlative-title" style={{ color: 'var(--warning)' }}>
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
                <div className="hof-stat" style={{ color: 'var(--primary)', background: 'var(--primary-glow)' }}>
                  {stats.mrConsistent.statValue}
                </div>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: '1.2', whiteSpace: 'nowrap' }}>Το μεγαλύτερο σερί σημείων</p>
              </div>
            )}

            {stats.underdogHunter && (
              <div className="hof-item">
                <Avatar id={stats.underdogHunter.avatar} size={40} />
                <div className="hof-info">
                  <p className="hof-role">ΚΥΝΗΓΟΣ ΑΟΥΤΣΑΙΝΤΕΡ</p>
                  <p className="hof-name">{stats.underdogHunter.username}</p>
                </div>
                <div className="hof-stat" style={{ color: 'var(--success)', background: 'var(--success-glow)' }}>
                  {stats.underdogHunter.statValue}
                </div>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: '1.2', whiteSpace: 'nowrap' }}>Πήρε πόντους όταν το 90% πήγε κουβά</p>
              </div>
            )}

            {stats.theFlash && (
              <div className="hof-item">
                <Avatar id={stats.theFlash.avatar} size={40} />
                <div className="hof-info">
                  <p className="hof-role">Ο ΓΡΗΓΟΡΟΣ</p>
                  <p className="hof-name">{stats.theFlash.username}</p>
                </div>
                <div className="hof-stat" style={{ color: 'var(--warning)', background: 'var(--warning-glow)' }}>
                  {stats.theFlash.statValue}
                </div>
              </div>
            )}

            {!stats.theOracle && !stats.mrConsistent && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Η κατάταξη μορφοποιείται...</p>
            )}
          </div>
        </div>

        {/* Hall of Shame */}
        <div className="glass superlative-card">
          <h2 className="superlative-title" style={{ color: 'var(--danger)' }}>
            <Skull size={20} /> Hall of Shame
          </h2>

          <div className="shame-list">
            {stats.kingOfBucket && (
              <div className="shame-item">
                <Avatar id={stats.kingOfBucket.avatar} size={40} />
                <div className="hof-info">
                  <p className="hof-role" style={{ color: 'var(--danger)' }}>Ο ΒΑΣΙΛΙΑΣ ΤΟΥ ΚΟΥΒΑ</p>
                  <p className="hof-name">{stats.kingOfBucket.username}</p>
                </div>
                <div className="hof-stat" style={{ color: 'var(--danger)', background: 'var(--danger-glow)' }}>
                  {stats.kingOfBucket.statValue}
                </div>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: '1.2', whiteSpace: 'nowrap' }}>Δεν πήρε πόντο</p>
              </div>
            )}

            {stats.icarus && (
              <div className="shame-item">
                <Avatar id={stats.icarus.avatar} size={40} />
                <div className="hof-info">
                  <p className="hof-role" style={{ color: 'var(--danger)' }}>Ο ΑΛΕΞΙΠΤΩΤΙΣΤΗΣ</p>
                  <p className="hof-name">{stats.icarus.username}</p>
                </div>
                <div className="hof-stat" style={{ color: 'var(--danger)', background: 'var(--danger-glow)' }}>
                  Ελεύθερη πτώση {stats.icarus.statValue}
                </div>
              </div>
            )}

            {stats.nearMiss && (
              <div className="shame-item">
                <Avatar id={stats.nearMiss.avatar} size={40} />
                <div className="hof-info">
                  <p className="hof-role" style={{ color: 'var(--danger)' }}>ΔΟΚΑΡΙ ΚΙ' ΕΞΩ</p>
                  <p className="hof-name">{stats.nearMiss.username}</p>
                </div>
                <div className="hof-stat" style={{ color: 'var(--danger)', background: 'var(--danger-glow)' }}>
                  {stats.nearMiss.statValue}
                </div>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: '1.2', whiteSpace: 'nowrap' }}>Χάθηκε το ακριβές για 1 γκολ</p>
              </div>
            )}

            {stats.antiProphet && (
              <div className="shame-item">
                <Avatar id={stats.antiProphet.avatar} size={40} />
                <div className="hof-info">
                  <p className="hof-role" style={{ color: 'var(--danger)' }}>Ο ΑΝΤΙ-ΠΡΟΦΗΤΗΣ</p>
                  <p className="hof-name">{stats.antiProphet.username}</p>
                </div>
                <div className="hof-stat" style={{ color: 'var(--danger)', background: 'var(--danger-glow)' }}>
                  {stats.antiProphet.statValue}
                </div>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: '1.2', whiteSpace: 'nowrap' }}>Πέτυχε ανάποδα τον νικητή</p>
              </div>
            )}

            {stats.soulmates && (
              <div className="shame-item">
                <div style={{ display: 'flex' }}>
                  <div style={{ zIndex: 2, position: 'relative' }}>
                    <Avatar id={stats.soulmates.avatar1} size={40} />
                  </div>
                  <div style={{ marginLeft: '-12px', zIndex: 1, position: 'relative' }}>
                    <Avatar id={stats.soulmates.avatar2} size={40} />
                  </div>
                </div>
                <div className="hof-info" style={{ gap: '2px' }}>
                  <p className="hof-role" style={{ color: 'var(--danger)' }}>ΟΙ ΑΝΤΙΓΡΑΦΕΙΣ</p>
                  <p className="hof-name">{stats.soulmates.username1}</p>
                  <p className="hof-name">& {stats.soulmates.username2}</p>
                </div>
                <div className="hof-stat" style={{ color: 'var(--danger)', background: 'var(--danger-glow)' }}>
                  {stats.soulmates.statValue}
                </div>
              </div>
            )}

            {!stats.icarus && !stats.kingOfBucket && !stats.nearMiss && !stats.antiProphet && !stats.soulmates && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Όλοι παίζουν τέλεια...</p>
            )}
          </div>
        </div>

      </div>

      {/* Player Comparison Chart */}
      {stats.playerAveragePoints && stats.playerAveragePoints.length > 0 && (
        <div className="stats-grid-1" style={{ marginTop: '24px' }}>
          <div className="glass chart-card">
            <h2 className="chart-title">Μέσοι Όροι Πόντων / Αγώνα</h2>
            <div className="custom-bars-container" style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {stats.playerAveragePoints.map((player, index) => {
                const maxAvg = stats.playerAveragePoints[0].averagePoints || 1;
                const pct = (player.averagePoints / maxAvg) * 100;
                return (
                  <div key={player.username} className="custom-bar-item" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Avatar id={player.avatar} size={24} />
                        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{player.username}</span>
                      </div>
                      <span className="chart-team-pct" style={{ fontWeight: 700, color: 'var(--primary)' }}>{player.averagePoints} pts</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'var(--bar-bg, rgba(255,255,255,0.05))', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        className="chart-team-bar"
                        style={{
                          height: '100%',
                          width: `${pct}%`,
                          background: 'var(--primary)',
                          borderRadius: '4px',
                          transition: 'width 1s ease-out'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

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
