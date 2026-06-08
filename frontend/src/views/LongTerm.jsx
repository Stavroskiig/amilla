import React, { useState, useEffect } from 'react';
import { Award, Check, AlertTriangle, Lock, HelpCircle, ChevronDown, Search, Zap } from 'lucide-react';
import { Combobox, ComboboxInput, ComboboxButton, ComboboxOptions, ComboboxOption } from '@headlessui/react';
import { COUNTRIES, Flag, uppercaseNoAccents } from '../components/Countries';
// import removed
import { useLongTermInfo, useAllLongTermPredictions, useSubmitLongTermPrediction } from '../hooks/useApi';

export default function LongTerm({ user }) {
  const [championTeam, setChampionTeam] = useState('');
  const [savedChampionTeam, setSavedChampionTeam] = useState('');
  const [submittedAt, setSubmittedAt] = useState(null);
  const [championOdds, setChampionOdds] = useState(null);
  const [locked, setLocked] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [openingMatchTime, setOpeningMatchTime] = useState(null);
  const [groupStageEndTime, setGroupStageEndTime] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');

  const { data: infoData, isLoading: infoLoading } = useLongTermInfo();
  const { data: othersPredictions } = useAllLongTermPredictions(locked);
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

  useEffect(() => {
    if (infoData) {
      if (infoData.pred) {
        setChampionTeam(infoData.pred.predictedChampionTeam);
        setSavedChampionTeam(infoData.pred.predictedChampionTeam);
        setSubmittedAt(infoData.pred.submittedAt);
        setChampionOdds(infoData.pred.championOdds);
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
        setSavedChampionTeam(data.predictedChampionTeam);
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

  const getBonusText = () => {
    if (!openingMatchTime) {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#ffffff' }}>
          <HelpCircle size={16} style={{ color: '#ffffff' }} />
          <span>Απόδοση × 20 (Πρώιμη) / Απόδοση × 10 (Κατά τη διάρκεια ομίλων)</span>
        </span>
      );
    }

    const now = Date.now();
    const opening = openingMatchTime.getTime();
    const groupEnd = groupStageEndTime.getTime();

    if (opening && now < opening) {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#ffffff' }}>
          <Zap size={16} style={{ color: '#ffffff' }} />
          <span>Βρείτε τον πρωταθλητή τώρα, κερδίζετε Απόδοση × 20 πόντους!</span>
        </span>
      );
    }

    if (groupEnd && now < groupEnd) {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#ffffff' }}>
          <AlertTriangle size={16} style={{ color: '#ffffff' }} />
          <span>Επιτρέπεται αλλαγή, αλλά με κέρδος Απόδοση × 10 πόντους.</span>
        </span>
      );
    }

    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#ffffff' }}>
        <Lock size={16} style={{ color: '#ffffff' }} />
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
          <Award size={28} />
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Μακροχρόνια Πρόβλεψη</h1>
        <p style={{ color: 'var(--text-muted)' }}>Ποια ομάδα θα σηκώσει το Παγκόσμιο Κύπελλο;</p>
      </div>

      <div className="glass-card responsive-card-padding" style={{ padding: '32px', overflow: 'visible' }}>

        <div className="glass" style={{
          padding: '16px 20px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '28px',
          background: 'rgba(255,255,255,0.01)',
          fontSize: '0.9rem',
          lineHeight: '1.5'
        }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#ffffff' }}>
            <HelpCircle size={16} className="text-indigo-400" />
            <span>Κανόνες Βαθμολογίας Πρωταθλητή</span>
          </h4>
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', color: 'var(--text-muted)' }}>
            <li>Υποβολή <strong>πριν τη σέντρα του 1ου αγώνα</strong>: <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>Απόδοση × 20 Πόντοι</span></li>
            <li>Υποβολή/Αλλαγή <strong>κατά τη φάση των ομίλων</strong>: <span style={{ color: 'var(--warning)', fontWeight: 'bold' }}>Απόδοση × 10 Πόντοι</span></li>
            <li>Μετά το τέλος των ομίλων, η πρόβλεψη κλειδώνει.</li>
          </ul>
        </div>

        {errorMsg && (
          <div className="glass" style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            borderLeft: '4px solid var(--danger)',
            background: 'rgba(239, 68, 68, 0.08)',
            color: '#fca5a5',
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
            background: 'rgba(16, 185, 129, 0.08)',
            color: '#a7f3d0',
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
                      background: 'rgba(15, 16, 26, 0.8)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px 40px 12px 40px',
                      color: '#ffffff',
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
                      background: '#161825',
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
                            color: '#ffffff'
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
                background: 'rgba(99,102,241,0.05)',
                border: '1px solid rgba(99,102,241,0.1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                  <span>Τρέχουσα αποθηκευμένη πρόβλεψη: </span>
                  <Flag teamName={savedChampionTeam} width={28} height={18} />
                  <strong style={{ color: '#ffffff' }}>{uppercaseNoAccents(savedChampionTeam)}</strong>
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

      {/* Other Users' Long Term Predictions Reveal */}
      {locked && othersPredictions && othersPredictions.length > 0 && (
        <div className="glass-card responsive-card-padding animate-fade-in" style={{ padding: '32px', marginTop: '32px' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={20} className="text-indigo-400" />
            <span>Προβλέψεις Πρωταθλητή Αντιπάλων</span>
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
            Οι προβλέψεις κλείδωσαν! Δείτε ποιον υποστήριξε ο καθένας για την κατάκτηση του κυπέλλου:
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '16px'
          }}>
            {othersPredictions
              .filter(p => p.userId !== user.id) // Exclude current user since it's already shown above
              .map((p, idx) => (
                <div key={idx} className="glass" style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  border: '1px solid rgba(255,255,255,0.03)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>{p.username || 'Παίκτης'}</span>
                  </div>
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
                  {p.submittedAt && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px' }}>
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
