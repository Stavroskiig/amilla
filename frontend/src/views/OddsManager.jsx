import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useQueryClient } from '@tanstack/react-query';
import { TrendingUp, RefreshCw, Save, Check, X, Plus, List } from 'lucide-react';
import { Flag, getStageLabel } from '../components/Countries';

const API_URL = import.meta.env.VITE_API_URL || '';

function ExactScoreModal({ match, currentOddsJson, onSave, onClose, isEditable = true }) {
  const [scores, setScores] = useState([]);
  const [newScore, setNewScore] = useState('');
  const [newOdds, setNewOdds] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const parsed = currentOddsJson ? JSON.parse(currentOddsJson) : {};
      const arr = Object.entries(parsed).map(([k, v]) => ({ score: k, odds: v }));
      setScores(arr);
    } catch (e) {
      setScores([]);
    }
  }, [currentOddsJson]);

  const handleAdd = () => {
    setError('');
    const scoreVal = newScore.trim();
    if (!scoreVal || !newOdds) {
      setError('Παρακαλώ συμπληρώστε και τα δύο πεδία.');
      return;
    }

    if (!/^\d+-\d+$/.test(scoreVal)) {
      setError('Το σκορ πρέπει να είναι στη μορφή X-Y (π.χ. 1-0).');
      return;
    }

    if (scores.some(s => s.score === scoreVal)) {
      setError('Αυτό το σκορ υπάρχει ήδη.');
      return;
    }

    const oddsVal = parseFloat(newOdds);
    if (isNaN(oddsVal) || oddsVal <= 1) {
      setError('Η απόδοση πρέπει να είναι μεγαλύτερη από 1.');
      return;
    }

    setScores([...scores, { score: scoreVal, odds: oddsVal }]);
    setNewScore('');
    setNewOdds('');
  };

  const handleRemove = (idx) => {
    setScores(scores.filter((_, i) => i !== idx));
    setError('');
  };

  const handleOddsChange = (idx, val) => {
    const updated = [...scores];
    updated[idx].odds = val;
    setScores(updated);
    setError('');
  };

  const handleSave = async () => {
    setError('');
    const obj = {};
    for (let s of scores) {
      const parsedOdds = parseFloat(s.odds);
      if (isNaN(parsedOdds) || parsedOdds <= 1) {
        setError(`Η απόδοση για το σκορ ${s.score} είναι άκυρη (πρέπει να είναι > 1).`);
        return;
      }
      obj[s.score] = parsedOdds;
    }
    setIsSaving(true);
    await onSave(JSON.stringify(obj));
    setIsSaving(false);
  };

  const modalContent = (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '12px' }}>
      <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '16px', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <X size={24} />
        </button>

        <h2 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <List size={20} />
          Ακριβές Σκορ
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
          {match.homeTeam} - {match.awayTeam}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto', marginBottom: '20px', paddingRight: '8px' }}>
          {scores.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Δεν έχουν προστεθεί ακριβή σκορ.</p>}
          {scores.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="text" value={item.score} disabled style={{ width: '80px', minWidth: '60px', padding: '8px', borderRadius: '4px', background: 'var(--input-bg, rgba(255,255,255,0.05))', border: '1px solid var(--border-color)', color: 'var(--text-main)', textAlign: 'center' }} />
              <input type="text" inputMode="decimal" value={item.odds} onChange={(e) => handleOddsChange(idx, e.target.value.replace(/,/g, '.'))} disabled={!isEditable} style={{ flex: 1, minWidth: 0, padding: '8px', borderRadius: '4px', background: 'var(--input-bg, rgba(255,255,255,0.1))', border: '1px solid var(--border-color)', color: 'var(--text-main)', opacity: isEditable ? 1 : 0.7 }} />
              {isEditable && (
                <button className="btn btn-secondary" onClick={() => handleRemove(idx)} style={{ padding: '8px', background: 'var(--danger-bg, rgba(239,68,68,0.2))', color: 'var(--danger-text, #ef4444)', border: 'none' }}>
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
        </div>

        {isEditable && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', background: 'var(--table-header-bg, rgba(255,255,255,0.03))', padding: '12px', borderRadius: '8px' }}>
            <input type="text" placeholder="Σκορ" value={newScore} onChange={e => setNewScore(e.target.value)} style={{ width: '80px', minWidth: '60px', padding: '8px', borderRadius: '4px', background: 'var(--input-bg, rgba(255,255,255,0.1))', border: '1px solid var(--border-color)', color: 'var(--text-main)', textAlign: 'center' }} />
            <input type="text" inputMode="decimal" placeholder="Απόδοση" value={newOdds} onChange={e => setNewOdds(e.target.value.replace(/,/g, '.'))} style={{ flex: 1, minWidth: 0, padding: '8px', borderRadius: '4px', background: 'var(--input-bg, rgba(255,255,255,0.1))', border: '1px solid var(--border-color)', color: 'var(--text-main)' }} />
            <button className="btn btn-primary" onClick={handleAdd} style={{ padding: '8px' }}>
              <Plus size={16} />
            </button>
          </div>
        )}

        {error && (
          <div style={{ color: 'var(--danger-text, #ef4444)', fontSize: '0.85rem', marginBottom: '16px', padding: '8px', background: 'var(--danger-bg, rgba(239,68,68,0.1))', borderRadius: '4px', border: '1px solid var(--danger-border, rgba(239,68,68,0.2))' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={onClose} disabled={isSaving}>
            {isEditable ? 'Ακύρωση' : 'Κλείσιμο'}
          </button>
          {isEditable && (
            <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
              {isSaving ? <RefreshCw size={16} className="animate-spin" /> : 'Αποθήκευση'}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

export default function OddsManager() {
  const queryClient = useQueryClient();
  const [matches, setMatches] = useState([]);
  const [matchOdds, setMatchOdds] = useState({});
  const [savingMatchId, setSavingMatchId] = useState(null);
  const [savedMatchId, setSavedMatchId] = useState(null);
  const [filterStage, setFilterStage] = useState('ALL');
  const [editingExactScoreMatch, setEditingExactScoreMatch] = useState(null);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const token = localStorage.getItem('token');
      const matchRes = await fetch(API_URL + '/api/matches', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const matchesData = await matchRes.json();
      if (matchRes.ok) {
        setMatches(matchesData);
        const oddsMap = {};
        matchesData.forEach(m => {
          oddsMap[m.id] = {
            homeOdds: m.homeOdds || '',
            drawOdds: m.drawOdds || '',
            awayOdds: m.awayOdds || '',
            homeAdvanceOdds: m.homeAdvanceOdds || '',
            awayAdvanceOdds: m.awayAdvanceOdds || '',
            exactScoreOddsJson: m.exactScoreOddsJson || ''
          };
        });
        setMatchOdds(oddsMap);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleOddsChange = (matchId, field, val) => {
    setMatchOdds(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [field]: val
      }
    }));
  };

  const saveOdds = async (matchId, overrideExactScoreOddsJson = undefined) => {
    setSavingMatchId(matchId);
    const odds = matchOdds[matchId];
    const exactScoresJsonToSave = overrideExactScoreOddsJson !== undefined ? overrideExactScoreOddsJson : odds.exactScoreOddsJson;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/odds-manager/matches/${matchId}/odds`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          homeOdds: odds.homeOdds === '' ? null : parseFloat(odds.homeOdds),
          drawOdds: odds.drawOdds === '' ? null : parseFloat(odds.drawOdds),
          awayOdds: odds.awayOdds === '' ? null : parseFloat(odds.awayOdds),
          homeAdvanceOdds: odds.homeAdvanceOdds === '' ? null : parseFloat(odds.homeAdvanceOdds),
          awayAdvanceOdds: odds.awayAdvanceOdds === '' ? null : parseFloat(odds.awayAdvanceOdds),
          exactScoreOddsJson: exactScoresJsonToSave === '' ? null : exactScoresJsonToSave
        })
      });

      if (res.ok) {
        fetchMatches();
        queryClient.invalidateQueries();
        setSavedMatchId(matchId);
        setTimeout(() => setSavedMatchId(null), 2000);
      } else {
        alert('Σφάλμα αποθήκευσης αποδόσεων');
      }
    } catch (e) {
      console.error(e);
      alert('Προέκυψε σφάλμα επικοινωνίας');
    } finally {
      setSavingMatchId(null);
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <TrendingUp size={32} className="text-indigo-400" />
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: 0 }}>Odds Manager</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, marginTop: '4px' }}>Διαχείριση αποδόσεων αγώνων.</p>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
          <h2 style={{ fontSize: '1.4rem', margin: 0 }}>Αποδόσεις</h2>
          <select
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value)}
            style={{
              background: 'var(--input-bg, rgba(10, 11, 16, 0.7))',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            <option value="ALL">Όλες οι Φάσεις</option>
            <option value="GROUP">Φάση Ομίλων</option>
            <option value="ROUND_OF_32">Φάση των 32</option>
            <option value="ROUND_OF_16">Φάση των 16</option>
            <option value="QUARTER_FINAL">Προημιτελικά</option>
            <option value="SEMI_FINAL">Ημιτελικά</option>
            <option value="THIRD_PLACE">Μικρός Τελικός</option>
            <option value="FINAL">Τελικός</option>
          </select>
        </div>

        {matches.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>Φόρτωση...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {(() => {
              const filteredMatches = matches.filter(m => m.status === 'SCHEDULED' && (filterStage === 'ALL' || m.matchStage === filterStage));

              if (filteredMatches.length === 0) {
                return <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>Δεν βρέθηκαν αγώνες.</p>;
              }

              return filteredMatches.map(match => {
                const odds = matchOdds[match.id] || { homeOdds: '', drawOdds: '', awayOdds: '', homeAdvanceOdds: '', awayAdvanceOdds: '', exactScoreOddsJson: '' };
                const isKnockout = match.matchStage !== 'GROUP';
                const isEditable = match.status === 'SCHEDULED';

                return (
                  <div key={match.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', opacity: isEditable ? 1 : 0.6 }}>
                    <div style={{ flex: '1', minWidth: '200px' }}>
                      <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <Flag teamName={match.homeTeam} />
                        <span>{match.homeTeam}</span>
                        <span style={{ color: 'var(--text-muted)', fontWeight: 'normal' }}>vs</span>
                        <Flag teamName={match.awayTeam} />
                        <span>{match.awayTeam}</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {getStageLabel(match.matchStage)} • {new Date(match.kickoffTime).toLocaleString('el-GR', { timeZone: 'Europe/Athens', hour12: false })}
                      </div>
                      {match.oddsLastUpdatedAt && (
                        <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Check size={14} />
                          Ενημερώθηκε: {new Date(match.oddsLastUpdatedAt).toLocaleString('el-GR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>1</span>
                        <input type="text" inputMode="decimal" disabled={!isEditable} style={{ width: '60px', padding: '6px', borderRadius: '4px', background: 'var(--input-bg, rgba(255,255,255,0.1))', border: '1px solid var(--border-color)', color: 'var(--text-main)', textAlign: 'center', cursor: isEditable ? 'text' : 'not-allowed' }} value={odds.homeOdds} onChange={(e) => handleOddsChange(match.id, 'homeOdds', e.target.value.replace(/,/g, '.'))} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>X</span>
                        <input type="text" inputMode="decimal" disabled={!isEditable} style={{ width: '60px', padding: '6px', borderRadius: '4px', background: 'var(--input-bg, rgba(255,255,255,0.1))', border: '1px solid var(--border-color)', color: 'var(--text-main)', textAlign: 'center', cursor: isEditable ? 'text' : 'not-allowed' }} value={odds.drawOdds} onChange={(e) => handleOddsChange(match.id, 'drawOdds', e.target.value.replace(/,/g, '.'))} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>2</span>
                        <input type="text" inputMode="decimal" disabled={!isEditable} style={{ width: '60px', padding: '6px', borderRadius: '4px', background: 'var(--input-bg, rgba(255,255,255,0.1))', border: '1px solid var(--border-color)', color: 'var(--text-main)', textAlign: 'center', cursor: isEditable ? 'text' : 'not-allowed' }} value={odds.awayOdds} onChange={(e) => handleOddsChange(match.id, 'awayOdds', e.target.value.replace(/,/g, '.'))} />
                      </div>

                      {isKnockout && (
                        <>
                          <div style={{ width: '1px', height: '30px', background: 'var(--border-color)', margin: '0 8px', marginBottom: '2px' }} />
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Πρόκρ 1</span>
                            <input type="text" inputMode="decimal" disabled={!isEditable} style={{ width: '60px', padding: '6px', borderRadius: '4px', background: 'var(--input-bg, rgba(255,255,255,0.1))', border: '1px solid var(--border-color)', color: 'var(--text-main)', textAlign: 'center', cursor: isEditable ? 'text' : 'not-allowed' }} value={odds.homeAdvanceOdds} onChange={(e) => handleOddsChange(match.id, 'homeAdvanceOdds', e.target.value.replace(/,/g, '.'))} />
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Πρόκρ 2</span>
                            <input type="text" inputMode="decimal" disabled={!isEditable} style={{ width: '60px', padding: '6px', borderRadius: '4px', background: 'var(--input-bg, rgba(255,255,255,0.1))', border: '1px solid var(--border-color)', color: 'var(--text-main)', textAlign: 'center', cursor: isEditable ? 'text' : 'not-allowed' }} value={odds.awayAdvanceOdds} onChange={(e) => handleOddsChange(match.id, 'awayAdvanceOdds', e.target.value.replace(/,/g, '.'))} />
                          </div>
                        </>
                      )}

                      <button className="btn btn-secondary" onClick={() => setEditingExactScoreMatch(match)} style={{ padding: '0', width: '132px', justifyContent: 'center', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', height: '36px' }}>
                        <List size={16} />
                        Ακριβές Σκορ
                      </button>

                      <button className={`btn ${savedMatchId === match.id ? 'btn-success' : 'btn-primary'}`} disabled={!isEditable || savingMatchId === match.id} onClick={() => saveOdds(match.id)} style={{ padding: '0', width: '60px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: savedMatchId === match.id ? '#10b981' : undefined, cursor: isEditable ? 'pointer' : 'not-allowed' }} title="Αποθήκευση Αποδόσεων">
                        {savingMatchId === match.id ? <RefreshCw size={16} className="animate-spin" /> : savedMatchId === match.id ? <Check size={16} /> : <Save size={16} />}
                      </button>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        )}
      </div>

      {editingExactScoreMatch && (
        <ExactScoreModal
          match={editingExactScoreMatch}
          currentOddsJson={matchOdds[editingExactScoreMatch.id]?.exactScoreOddsJson || ''}
          onSave={async (jsonStr) => {
            handleOddsChange(editingExactScoreMatch.id, 'exactScoreOddsJson', jsonStr);
            await saveOdds(editingExactScoreMatch.id, jsonStr);
            setEditingExactScoreMatch(null);
          }}
          onClose={() => setEditingExactScoreMatch(null)}
          isEditable={editingExactScoreMatch.status === 'SCHEDULED'}
        />
      )}
    </div>
  );
}
