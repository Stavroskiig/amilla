import React, { useState, useEffect } from 'react';
import { Award, Check, AlertTriangle, Lock, HelpCircle, ChevronDown, ChevronUp, Search, Zap, Target, Users } from 'lucide-react';
import { Combobox, ComboboxInput, ComboboxButton, ComboboxOptions, ComboboxOption } from '@headlessui/react';
import { COUNTRIES, Flag, uppercaseNoAccents } from '../components/Countries';
import { PLAYERS } from '../components/Players';
// import removed
import { useLongTermInfo, useAllLongTermPredictions, useSubmitLongTermPrediction, useTopScorerGoals } from '../hooks/useApi';

export default function LongTerm({ user }) {
  const [championTeam, setChampionTeam] = useState('');
  const [savedChampionTeam, setSavedChampionTeam] = useState('');
  const [submittedAt, setSubmittedAt] = useState(null);
  const [championOdds, setChampionOdds] = useState(null);
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('amilla_longterm_tab') || 'champion';
  }); // 'champion' | 'topscorer'
  const [locked, setLocked] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [tsSuccess, setTsSuccess] = useState(false);
  const [tsErrorMsg, setTsErrorMsg] = useState('');
  const [openingMatchTime, setOpeningMatchTime] = useState(null);
  const [groupStageEndTime, setGroupStageEndTime] = useState(null);

  const [topScorer, setTopScorer] = useState('');
  const [savedTopScorer, setSavedTopScorer] = useState('');
  const [topScorerOdds, setTopScorerOdds] = useState(null);
  const [topScorerSubmittedAt, setTopScorerSubmittedAt] = useState(null);
  const [tsSearchQuery, setTsSearchQuery] = useState('');
  const [expandedScorer, setExpandedScorer] = useState(null);
  const [showChampionRules, setShowChampionRules] = useState(false);
  const [showScorerRules, setShowScorerRules] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');

  const { data: infoData, isLoading: infoLoading } = useLongTermInfo();
  const { data: othersPredictions } = useAllLongTermPredictions(true);
  const { data: topScorerGoals } = useTopScorerGoals();
  const { mutate: submitPrediction, isPending: submitting } = useSubmitLongTermPrediction();

  // Greek normalization utility for accent-insensitive search
  const normalizeGreek = (text) => {
    if (!text) return '';
    return String(text)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  };

  const filteredCountries = !searchQuery
    ? COUNTRIES
    : COUNTRIES.filter((country) => {
      const normalizedCountry = normalizeGreek(country);
      const normalizedQuery = normalizeGreek(searchQuery);
      return normalizedCountry.includes(normalizedQuery);
    });

  const filteredPlayers = !tsSearchQuery
    ? PLAYERS
    : PLAYERS.filter((player) => {
      const normalizedPlayer = normalizeGreek(player.name);
      const normalizedQuery = normalizeGreek(tsSearchQuery);
      return normalizedPlayer.includes(normalizedQuery);
    });

  useEffect(() => {
    if (infoData) {
      if (infoData.pred) {
        setChampionTeam(infoData.pred.predictedChampionTeam || '');
        setSavedChampionTeam(infoData.pred.predictedChampionTeam || '');
        setSubmittedAt(infoData.pred.submittedAt);
        setChampionOdds(infoData.pred.championOdds);

        setTopScorer(infoData.pred.predictedTopScorer || '');
        setSavedTopScorer(infoData.pred.predictedTopScorer || '');
        setTopScorerSubmittedAt(infoData.pred.topScorerSubmittedAt);
        setTopScorerOdds(infoData.pred.topScorerOdds);
      }

      const matches = infoData.matches;
      if (matches && matches.length > 0) {
        const validMatchTimes = matches
          .map(m => m.kickoffTime ? new Date(m.kickoffTime).getTime() : null)
          .filter(t => t !== null && !isNaN(t));

        if (validMatchTimes.length > 0) {
          const opening = new Date(Math.min(...validMatchTimes));
          setOpeningMatchTime(opening);
        }

        const knockouts = matches.filter(m => m.matchStage !== 'GROUP');
        const validKoTimes = knockouts
          .map(m => m.kickoffTime ? new Date(m.kickoffTime).getTime() : null)
          .filter(t => t !== null && !isNaN(t));

        let groupEnd;
        if (validKoTimes.length > 0) {
          groupEnd = new Date(Math.min(...validKoTimes));
        } else {
          groupEnd = new Date(Date.now() + 30 * 24 * 3600 * 1000);
        }
        setGroupStageEndTime(groupEnd);

        if (Date.now() > groupEnd.getTime()) {
          setLocked(true);
        }
      }
    }
  }, [infoData]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!(championTeam || '').trim()) return;

    setErrorMsg('');
    setSuccess(false);

    submitPrediction({ championTeam: (championTeam || '').trim() }, {
      onSuccess: (data) => {
        setSavedChampionTeam(data.predictedChampionTeam || '');
        setSubmittedAt(data.submittedAt);
        setChampionOdds(data.championOdds);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      },
      onError: (err) => {
        setErrorMsg(err.message);
      }
    });
  };

  const handleSaveTopScorer = async (e) => {
    e.preventDefault();
    if (!(topScorer || '').trim()) return;

    setTsErrorMsg('');
    setTsSuccess(false);

    submitPrediction({ predictedTopScorer: (topScorer || '').trim() }, {
      onSuccess: (data) => {
        setSavedTopScorer(data.predictedTopScorer || '');
        setTopScorerSubmittedAt(data.topScorerSubmittedAt);
        setTopScorerOdds(data.topScorerOdds);
        setTsSuccess(true);
        setTimeout(() => setTsSuccess(false), 3000);
      },
      onError: (err) => {
        setTsErrorMsg(err.message);
      }
    });
  };

  const getBonusText = () => {
    if (!openingMatchTime) {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
          <HelpCircle size={16} style={{ color: 'var(--text-main)' }} />
          <span>Απόδοση × 20 (Πρώιμη) / Απόδοση × 10 (Κατά τη διάρκεια ομίλων)</span>
        </span>
      );
    }

    const now = Date.now();
    const opening = openingMatchTime.getTime();
    const groupEnd = groupStageEndTime.getTime();

    if (opening && now < opening) {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
          <Zap size={16} style={{ color: 'var(--text-main)' }} />
          <span>Βρείτε τον πρωταθλητή τώρα, κερδίζετε Απόδοση × 20 πόντους!</span>
        </span>
      );
    }

    if (groupEnd && now < groupEnd) {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
          <AlertTriangle size={16} style={{ color: 'var(--text-main)' }} />
          <span>Επιτρέπεται αλλαγή, αλλά με κέρδος Απόδοση × 10 πόντους.</span>
        </span>
      );
    }

    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
        <Lock size={16} style={{ color: 'var(--text-main)' }} />
        <span>Κλειδωμένο: Οι προβλέψεις έχουν κλείσει.</span>
      </span>
    );
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'rgba(99,102,241,0.1)',
          border: '1px solid rgba(99,102,241,0.2)',
          color: '#818cf8',
          marginBottom: '16px'
        }}>
          {activeTab === 'champion' ? <Award size={28} /> : <Target size={28} />}
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Μακροχρόνια Πρόβλεψη</h1>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', margin: '20px 0' }}>
          <button
            type="button"
            className={`btn ${activeTab === 'champion' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => {
              setActiveTab('champion');
              localStorage.setItem('amilla_longterm_tab', 'champion');
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Award size={16} /> Πρωταθλητής
          </button>
          <button
            type="button"
            className={`btn ${activeTab === 'topscorer' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => {
              setActiveTab('topscorer');
              localStorage.setItem('amilla_longterm_tab', 'topscorer');
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Target size={16} /> Πρώτος Σκόρερ
          </button>
        </div>
      </div>

      {activeTab === 'champion' && (
        <div className="glass-card responsive-card-padding" style={{ padding: '32px', overflow: 'visible' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Πρωταθλητής</h2>
            <p style={{ color: 'var(--text-muted)' }}>Ποια ομάδα θα σηκώσει το Παγκόσμιο Κύπελλο;</p>
          </div>

          <div className="glass" style={{
            padding: '16px 20px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '28px',
            background: 'var(--rules-bg, rgba(255,255,255,0.01))',
            fontSize: '0.9rem',
            lineHeight: '1.5'
          }}>
            <button
              type="button"
              onClick={() => setShowChampionRules(!showChampionRules)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-main)',
                padding: 0
              }}
            >
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, color: 'var(--text-main)' }}>
                <HelpCircle size={16} className="text-indigo-400" />
                <span>Κανόνες Βαθμολογίας Πρωταθλητή</span>
              </h4>
              {showChampionRules ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showChampionRules && (
              <div style={{ marginTop: '16px', animation: 'fadeIn 0.3s' }}>
                <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', color: 'var(--text-muted)' }}>
                  <li>Υποβολή <strong>πριν τη σέντρα του 1ου αγώνα</strong>: <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>Απόδοση × 20 Πόντοι</span></li>
                  <li>Υποβολή/Αλλαγή <strong>κατά τη φάση των ομίλων</strong>: <span style={{ color: 'var(--warning)', fontWeight: 'bold' }}>Απόδοση × 10 Πόντοι</span></li>
                  <li>Μετά το τέλος των ομίλων, η πρόβλεψη κλειδώνει.</li>
                </ul>
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="glass" style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              borderLeft: '4px solid var(--danger)',
              background: 'var(--danger-bg, rgba(239, 68, 68, 0.08))',
              color: 'var(--danger-text, #fca5a5)',
              fontSize: '0.85rem',
              marginBottom: '20px'
            }}>
              {errorMsg}
            </div>
          )}

          {success && (
            <div className="glass" style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              borderLeft: '4px solid var(--success)',
              background: 'var(--success-bg, rgba(16, 185, 129, 0.08))',
              color: 'var(--success-text, #a7f3d0)',
              fontSize: '0.85rem',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Check size={16} />
              <span>Η πρόβλεψη αποθηκεύτηκε επιτυχώς!</span>
            </div>
          )}

          {infoLoading ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Φόρτωση στοιχείων...</div>
          ) : (
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="form-group" style={{ position: 'relative' }}>
                <label className="form-label">Η Πρόβλεψή σας</label>

                <Combobox value={championTeam} onChange={setChampionTeam} disabled={locked}>
                  <div style={{ position: 'relative' }}>
                    <ComboboxInput
                      className="combobox-input"
                      displayValue={(country) => uppercaseNoAccents(country || '')}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Αναζήτηση χώρας..."
                      style={{
                        width: '100%',
                        background: 'var(--combo-input-bg, rgba(15, 16, 26, 0.8))',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        padding: '12px 40px 12px 40px',
                        color: 'var(--text-main)',
                        fontSize: '1rem',
                        outline: 'none',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    />
                    {championTeam && (
                      <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                        <Flag teamName={championTeam} width={22} height={14} />
                      </div>
                    )}
                    {!championTeam && (
                      <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                        <Search size={16} color="var(--text-muted)" />
                      </div>
                    )}
                    <ComboboxButton style={{ position: 'absolute', inset: '0 0 0 auto', padding: '0 12px', display: 'flex', alignItems: 'center', background: 'transparent', border: 'none', cursor: locked ? 'not-allowed' : 'pointer' }}>
                      <ChevronDown size={20} color="var(--text-muted)" />
                    </ComboboxButton>

                    <ComboboxOptions
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 4px)',
                        left: 0,
                        right: 0,
                        zIndex: 50,
                        maxHeight: '240px',
                        overflowY: 'auto',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--combo-menu-bg, #161825)',
                        border: '1px solid var(--border-color)',
                        boxShadow: 'var(--shadow-lg)'
                      }}
                    >
                      {filteredCountries.length === 0 && searchQuery !== '' ? (
                        <div style={{ padding: '10px', color: 'var(--text-muted)', textAlign: 'center' }}>Δεν βρέθηκε χώρα.</div>
                      ) : (
                        filteredCountries.map((country) => (
                          <ComboboxOption
                            key={country}
                            value={country}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '10px 16px',
                              cursor: 'pointer',
                              color: 'var(--text-main)'
                            }}
                            className={({ focus }) => `combobox-option ${focus ? 'bg-indigo-900/40 text-white' : ''}`}
                          >
                            {({ selected, active }) => (
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                width: '100%',
                                background: active ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                                padding: '8px',
                                borderRadius: '4px'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <Flag teamName={country} width={28} height={18} />
                                  <span style={{ fontWeight: selected ? 700 : 500 }}>
                                    {uppercaseNoAccents(country)}
                                  </span>
                                </div>
                                {selected && <Check size={16} style={{ color: 'var(--primary)' }} />}
                              </div>
                            )}
                          </ComboboxOption>
                        ))
                      )}
                    </ComboboxOptions>
                  </div>
                </Combobox>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '0.85rem',
                color: locked ? 'var(--danger)' : 'var(--text-muted)',
                textAlign: 'center',
                fontWeight: 500
              }}>
                {locked ? (
                  <>
                    <Lock size={16} />
                    <span>Οι προβλέψεις κλείδωσαν οριστικά.</span>
                  </>
                ) : (
                  getBonusText()
                )}
              </div>

              {savedChampionTeam && (
                <div style={{
                  textAlign: 'center',
                  fontSize: '0.9rem',
                  color: 'var(--text-muted)',
                  marginTop: '8px',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--saved-pred-bg, rgba(99,102,241,0.05))',
                  border: '1px solid var(--saved-pred-border, rgba(99,102,241,0.1))',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                    <span>Τρέχουσα αποθηκευμένη πρόβλεψη: </span>
                    <Flag teamName={savedChampionTeam} width={28} height={18} />
                    <strong style={{ color: 'var(--text-main)' }}>{uppercaseNoAccents(savedChampionTeam)}</strong>
                  </div>
                  {submittedAt && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Υποβλήθηκε: {new Date(submittedAt).toLocaleString('el-GR', { timeZone: 'Europe/Athens', hour12: false })}
                      {championOdds && (
                        <span style={{ marginLeft: '10px', color: 'var(--success)', fontWeight: 'bold' }}>
                          (Απόδοση: {championOdds.toFixed(2)})
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {!locked && (
                <button
                  type="submit"
                  disabled={submitting || !(championTeam || '').trim() || uppercaseNoAccents((championTeam || '').trim()) === uppercaseNoAccents(savedChampionTeam || '')}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '14px', marginTop: '10px' }}
                >
                  {submitting ? 'Υποβολή...' : 'Αποθήκευση Πρόβλεψης'}
                </button>
              )}
            </form>
          )}
        </div>
      )}

      {activeTab === 'topscorer' && (
        <div className="glass-card responsive-card-padding animate-fade-in" style={{ padding: '32px', overflow: 'visible' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Πρώτος Σκόρερ</h2>
            <p style={{ color: 'var(--text-muted)' }}>Ποιος παίκτης θα βάλει τα περισσότερα γκολ;</p>
          </div>

          <div className="glass" style={{
            padding: '16px 20px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '28px',
            background: 'var(--rules-bg, rgba(255,255,255,0.01))',
            fontSize: '0.9rem',
            lineHeight: '1.5'
          }}>
            <button
              type="button"
              onClick={() => setShowScorerRules(!showScorerRules)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-main)',
                padding: 0
              }}
            >
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, color: 'var(--text-main)' }}>
                <HelpCircle size={16} className="text-indigo-400" />
                <span>Κανόνες Πρώτου Σκόρερ</span>
              </h4>
              {showScorerRules ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showScorerRules && (
              <div style={{ marginTop: '16px', animation: 'fadeIn 0.3s' }}>
                <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', color: 'var(--text-muted)' }}>
                  <li>Υποβολή/Αλλαγή <strong>πριν την έναρξη της 2ης αγωνιστικής</strong>. Αλλαγή δεν θα έχει μετά από αυτό.</li>
                  <li><span style={{ color: 'var(--warning)', fontWeight: 'bold' }}>Ανεξάρτητη Μάχη:</span> Ο πρώτος σκόρερ είναι ένα ξεχωριστό παιχνίδι και <strong>δεν</strong> δίνει πόντους στη γενική βαθμολογία!</li>
                </ul>
              </div>
            )}
          </div>

          {tsErrorMsg && (
            <div className="glass" style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              borderLeft: '4px solid var(--danger)',
              background: 'var(--danger-bg, rgba(239, 68, 68, 0.08))',
              color: 'var(--danger-text, #fca5a5)',
              fontSize: '0.85rem',
              marginBottom: '20px'
            }}>
              {tsErrorMsg}
            </div>
          )}

          {tsSuccess && (
            <div className="glass" style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              borderLeft: '4px solid var(--success)',
              background: 'var(--success-bg, rgba(16, 185, 129, 0.08))',
              color: 'var(--success-text, #a7f3d0)',
              fontSize: '0.85rem',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Check size={16} />
              <span>Η πρόβλεψη αποθηκεύτηκε επιτυχώς!</span>
            </div>
          )}

          {infoLoading ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Φόρτωση στοιχείων...</div>
          ) : (
            <form onSubmit={handleSaveTopScorer} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="form-group" style={{ position: 'relative' }}>
                <label className="form-label">Η Πρόβλεψή σας</label>

                <Combobox value={topScorer} onChange={setTopScorer} disabled={locked}>
                  <div style={{ position: 'relative' }}>
                    <ComboboxInput
                      className="combobox-input"
                      displayValue={(player) => player ? uppercaseNoAccents(player) : ''}
                      onChange={(event) => setTsSearchQuery(event.target.value)}
                      placeholder="Αναζήτηση παίκτη..."
                      style={{
                        width: '100%',
                        background: 'var(--combo-input-bg, rgba(15, 16, 26, 0.8))',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        padding: '12px 40px 12px 40px',
                        color: 'var(--text-main)',
                        fontSize: '1rem',
                        outline: 'none',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    />
                    {topScorer && PLAYERS.find(p => p.name === topScorer) && (
                      <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                        <Flag teamName={PLAYERS.find(p => p.name === topScorer).country} width={22} height={14} />
                      </div>
                    )}
                    {!topScorer && (
                      <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                        <Search size={16} color="var(--text-muted)" />
                      </div>
                    )}
                    <ComboboxButton style={{ position: 'absolute', inset: '0 0 0 auto', padding: '0 12px', display: 'flex', alignItems: 'center', background: 'transparent', border: 'none', cursor: locked ? 'not-allowed' : 'pointer' }}>
                      <ChevronDown size={20} color="var(--text-muted)" />
                    </ComboboxButton>

                    <ComboboxOptions
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 4px)',
                        left: 0,
                        right: 0,
                        zIndex: 50,
                        maxHeight: '240px',
                        overflowY: 'auto',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--combo-menu-bg, #161825)',
                        border: '1px solid var(--border-color)',
                        boxShadow: 'var(--shadow-lg)'
                      }}
                    >
                      {filteredPlayers.length === 0 && tsSearchQuery !== '' ? (
                        <div style={{ padding: '10px', color: 'var(--text-muted)', textAlign: 'center' }}>Δεν βρέθηκε παίκτης.</div>
                      ) : (
                        filteredPlayers.map((player) => (
                          <ComboboxOption
                            key={player.name}
                            value={player.name}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '10px 16px',
                              cursor: 'pointer',
                              color: 'var(--text-main)'
                            }}
                            className={({ focus }) => `combobox-option ${focus ? 'bg-indigo-900/40 text-white' : ''}`}
                          >
                            {({ selected, active }) => (
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                width: '100%',
                                background: active ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                                padding: '8px',
                                borderRadius: '4px'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <Flag teamName={player.country} width={28} height={18} />
                                  <span style={{ fontWeight: selected ? 700 : 500 }}>
                                    {uppercaseNoAccents(player.name)}
                                  </span>
                                </div>
                                {selected && <Check size={16} style={{ color: 'var(--primary)' }} />}
                              </div>
                            )}
                          </ComboboxOption>
                        ))
                      )}
                    </ComboboxOptions>
                  </div>
                </Combobox>
              </div>



              {!locked && (
                <button
                  type="submit"
                  disabled={submitting || !(topScorer || '').trim() || uppercaseNoAccents((topScorer || '').trim()) === uppercaseNoAccents(savedTopScorer || '')}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '14px', marginTop: '10px' }}
                >
                  {submitting ? 'Υποβολή...' : 'Αποθήκευση Πρόβλεψης'}
                </button>
              )}
            </form>
          )}

          {/* Standings Table for Top Scorers */}
          {topScorerGoals && Object.keys(topScorerGoals).length > 0 && (
            <div style={{ marginTop: '40px' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Target size={20} className="text-indigo-400" />
                <span>Πρώτοι Σκόρερ</span>
              </h3>
              <div style={{
                background: 'var(--card-bg, rgba(255,255,255,0.05))',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                overflowX: 'auto',
                WebkitOverflowScrolling: 'touch'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255, 255, 255, 0.08)', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)' }}>
                      <th style={{ padding: '12px 8px', fontWeight: 600 }}>Παίκτης</th>
                      <th style={{ padding: '12px 8px', fontWeight: 600, textAlign: 'center' }}>Γκολ</th>
                      {othersPredictions && (
                        <th style={{ padding: '12px 8px', fontWeight: 600, textAlign: 'center' }}>Παίκτες</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(topScorerGoals)
                      .sort(([, goalsA], [, goalsB]) => goalsB - goalsA)
                      .map(([player, goals], idx) => {
                        const playerData = PLAYERS.find(p => p.name === player);
                        const isMyVote = player === savedTopScorer;
                        const isExpanded = expandedScorer === player;
                        const voters = othersPredictions?.filter(p => p.predictedTopScorer === player) || [];

                        return (
                          <React.Fragment key={player}>
                            <tr style={{
                              borderTop: '1px solid var(--border-color)',
                              background: isMyVote ? 'rgba(99, 102, 241, 0.15)' : (idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)'),
                              borderLeft: isMyVote ? '3px solid var(--primary)' : '3px solid transparent'
                            }}>
                              <td style={{ padding: '12px 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <img
                                  src={`/assets/players/${player}.png`}
                                  alt={player}
                                  style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: isMyVote ? '2px solid var(--primary)' : '2px solid var(--border-color)', background: 'var(--card-bg)' }}
                                  onError={(e) => { e.target.style.display = 'none'; }}
                                />
                                {playerData ? (
                                  <Flag teamName={playerData.country} width={28} height={18} />
                                ) : (
                                  <Target size={18} className="text-indigo-400" />
                                )}
                                <span style={{ fontWeight: isMyVote ? 700 : 600, color: isMyVote ? 'var(--primary-light)' : 'var(--text-main)' }}>
                                  {uppercaseNoAccents(player)}
                                  {isMyVote && (
                                    <span className="badge self-badge" style={{
                                      marginLeft: '8px',
                                      background: 'rgba(99,102,241,0.2)',
                                      color: 'var(--self-badge-color, #a5b4fc)',
                                      fontSize: '0.7rem',
                                      padding: '2px 6px',
                                      borderRadius: '10px'
                                    }}>
                                      ΕΣΥ
                                    </span>
                                  )}
                                </span>
                              </td>
                              <td style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 800, color: 'var(--success)', fontSize: '1.1rem' }}>
                                {goals}
                              </td>
                              {othersPredictions && (
                                <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                                  <button
                                    onClick={() => setExpandedScorer(isExpanded ? null : player)}
                                    style={{
                                      background: isExpanded ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.05)',
                                      border: isExpanded ? '1px solid rgba(99,102,241,0.3)' : '1px solid var(--border-color)',
                                      borderRadius: '6px',
                                      padding: '4px 8px',
                                      color: isExpanded ? 'var(--primary-light)' : 'var(--text-muted)',
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      fontSize: '0.85rem',
                                      transition: 'all 0.2s'
                                    }}
                                  >
                                    <Users size={14} />
                                    <span style={{ fontWeight: 600 }}>{voters.length}</span>
                                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                  </button>
                                </td>
                              )}
                            </tr>
                            {isExpanded && (
                              <tr style={{ background: isMyVote ? 'rgba(99, 102, 241, 0.08)' : 'rgba(128,128,128,0.05)', borderBottom: '1px solid var(--border-color)', borderLeft: isMyVote ? '3px solid var(--primary)' : '3px solid transparent' }}>
                                <td colSpan={othersPredictions ? 3 : 2} style={{ padding: '12px 8px' }}>
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Επιλέχθηκε από:</span>
                                    {voters.length > 0 ? voters.map(v => (
                                      <span key={v.userId} style={{
                                        background: v.userId === user.id ? 'rgba(99, 102, 241, 0.2)' : 'var(--card-bg, rgba(128,128,128,0.1))',
                                        color: v.userId === user.id ? 'var(--primary-light)' : 'var(--text-main)',
                                        padding: '2px 8px',
                                        borderRadius: '12px',
                                        fontSize: '0.8rem',
                                        fontWeight: v.userId === user.id ? 700 : 500,
                                        border: v.userId === user.id ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid var(--border-color)'
                                      }}>
                                        {v.username || 'Παίκτης'}
                                      </span>
                                    )) : (
                                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Κανέναν</span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Other Users' Long Term Predictions Reveal */}
      {activeTab === 'champion' && othersPredictions && othersPredictions.length > 0 && (
        <div className="glass-card responsive-card-padding animate-fade-in" style={{ padding: '32px', marginTop: '32px' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={20} className="text-indigo-400" />
            <span>Προβλέψεις Πρωταθλητή Αντιπάλων</span>
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
            Δείτε ποιον υποστήριξε ο καθένας για την κατάκτηση του κυπέλλου:
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '16px'
          }}>
            {othersPredictions
              .filter(p => p.userId !== user.id) // Exclude current user since it's already shown above
              .map((p, idx) => (
                <div key={idx} style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  border: '1px solid var(--others-border, rgba(255,255,255,0.03))',
                  background: 'var(--others-card-bg, rgba(255, 255, 255, 0.05))',
                  boxShadow: 'var(--others-shadow, none)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>{p.username || 'Παίκτης'}</span>
                  </div>

                  {/* Champion Prediction */}
                  {p.predictedChampionTeam && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '4px' }}>
                      <Flag teamName={p.predictedChampionTeam} width={28} height={18} />
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>
                        {uppercaseNoAccents(p.predictedChampionTeam)}
                      </span>
                      {p.championOdds && (
                        <span style={{ fontSize: '0.9rem', color: 'var(--warning)', fontWeight: 700, marginLeft: 'auto' }}>
                          @{p.championOdds.toFixed(2)}
                        </span>
                      )}
                    </div>
                  )}



                  {p.submittedAt && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '6px' }}>
                      Υποβλήθηκε: {new Date(p.submittedAt).toLocaleDateString('el-GR', { day: '2-digit', month: '2-digit' })} {new Date(p.submittedAt).toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit', hour12: false })}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
