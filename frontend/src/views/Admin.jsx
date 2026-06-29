import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Shield, RefreshCw, Calculator, Save, User as UserIcon, Calendar, Check, AlertCircle, Trash2, Plus, Upload, FileJson, ChevronDown, ChevronUp, Link as LinkIcon } from 'lucide-react';
import { COUNTRIES, Flag, getStageLabel } from '../components/Countries';
import SharpApiEventPickerModal from '../components/SharpApiEventPickerModal';

const API_URL = import.meta.env.VITE_API_URL || '';


const KNOCKOUT_PLACEHOLDERS = [
  'Νικητής Ομίλου Α', 'Δεύτερος Ομίλου Α',
  'Νικητής Ομίλου Β', 'Δεύτερος Ομίλου Β',
  'Νικητής Ομίλου Γ', 'Δεύτερος Ομίλου Γ',
  'Νικητής Ομίλου Δ', 'Δεύτερος Ομίλου Δ',
  'Νικητής Ομίλου Ε', 'Δεύτερος Ομίλου Ε',
  'Νικητής Ομίλου ΣΤ', 'Δεύτερος Ομίλου ΣΤ',
  'Νικητής Ομίλου Ζ', 'Δεύτερος Ομίλου Ζ',
  'Νικητής Ομίλου Η', 'Δεύτερος Ομίλου Η',
  'Νικητής Match 1', 'Νικητής Match 2',
  'Νικητής Match 3', 'Νικητής Match 4',
  'Νικητής Match 5', 'Νικητής Match 6',
  'Νικητής Match 7', 'Νικητής Match 8',
  'Νικητής Προημιτελικού 1', 'Νικητής Προημιτελικού 2',
  'Νικητής Προημιτελικού 3', 'Νικητής Προημιτελικού 4',
  'Νικητής Ημιτελικού 1', 'Νικητής Ημιτελικού 2'
];

export default function Admin() {
  const queryClient = useQueryClient();
  const [matches, setMatches] = useState([]);
  const [users, setUsers] = useState([]);
  const [topScorerGoals, setTopScorerGoals] = useState({});
  const [longTermPredictions, setLongTermPredictions] = useState([]);

  // Scoring state
  const [matchScores, setMatchScores] = useState({});
  const [syncing, setSyncing] = useState(false);
  const [syncingOdds, setSyncingOdds] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [savingMatchId, setSavingMatchId] = useState(null);
  const [savingChannelId, setSavingChannelId] = useState(null);

  // Link Event State
  const [linkModalMatchId, setLinkModalMatchId] = useState(null);
  const [linkingEventId, setLinkingEventId] = useState(null);

  // Override state
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedMatchId, setSelectedMatchId] = useState('');
  const [overrideHome, setOverrideHome] = useState('');
  const [overrideAway, setOverrideAway] = useState('');
  const [overrideQualifier, setOverrideQualifier] = useState('');
  const [overrideQualificationMethod, setOverrideQualificationMethod] = useState('');
  const [overrideSubmitting, setOverrideSubmitting] = useState(false);
  const [overrideSuccess, setOverrideSuccess] = useState(false);
  const [overrideError, setOverrideError] = useState('');

  // Single manual match state
  const [singleHomeTeamSelect, setSingleHomeTeamSelect] = useState('');
  const [singleHomeTeamCustom, setSingleHomeTeamCustom] = useState('');
  const [singleAwayTeamSelect, setSingleAwayTeamSelect] = useState('');
  const [singleAwayTeamCustom, setSingleAwayTeamCustom] = useState('');
  const [singleStage, setSingleStage] = useState('GROUP');
  const [singleKickoff, setSingleKickoff] = useState('');
  const [singleMatchId, setSingleMatchId] = useState('');
  const [singleSubmitting, setSingleSubmitting] = useState(false);
  const [singleSuccess, setSingleSuccess] = useState(false);
  const [singleError, setSingleError] = useState('');

  // Bulk JSON state
  const [jsonText, setJsonText] = useState('');
  const [jsonSubmitting, setJsonSubmitting] = useState(false);
  const [jsonSuccess, setJsonSuccess] = useState(false);
  const [jsonError, setJsonError] = useState('');
  const [clearing, setClearing] = useState(false);

  // Filters
  const [filterStage, setFilterStage] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('SCHEDULED');

  // Collapsible sections state
  const [showResults, setShowResults] = useState(true);
  const [showCreateMatch, setShowCreateMatch] = useState(true);
  const [showBulkImport, setShowBulkImport] = useState(true);
  const [showOverride, setShowOverride] = useState(true);
  const [showLongTerm, setShowLongTerm] = useState(true);

  // Long Term Settings State
  const [resolveChampion, setResolveChampion] = useState('');
  const [resolving, setResolving] = useState(false);
  const [updatingGoals, setUpdatingGoals] = useState({});

  const handleLinkEventSelect = async (externalApiId) => {
    if (!linkModalMatchId) return;
    setLinkingEventId(linkModalMatchId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/odds-manager/matches/${linkModalMatchId}/external-id`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ externalApiId })
      });
      if (res.ok) {
        queryClient.invalidateQueries();
        fetchAdminData();
      } else {
        alert('Σφάλμα κατά τη σύνδεση του αγώνα');
      }
    } catch (e) {
      console.error(e);
      alert('Προέκυψε σφάλμα επικοινωνίας');
    } finally {
      setLinkingEventId(null);
      setLinkModalMatchId(null);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleClearAllMatches = async () => {
    if (!window.confirm('⚠️ ΠΡΟΣΟΧΗ! Αυτό θα διαγράψει ΟΛΟΥΣ τους αγώνες και ΟΛΕΣ τις προβλέψεις των παικτών. Θέλετε σίγουρα να συνεχίσετε;')) {
      return;
    }
    setClearing(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_URL + '/api/admin/matches', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Όλοι οι αγώνες και οι προβλέψεις διαγράφηκαν επιτυχώς!');
        fetchAdminData();
        queryClient.invalidateQueries();
      } else {
        alert('Σφάλμα κατά τη διαγραφή των αγώνων');
      }
    } catch (e) {
      console.error(e);
      alert('Προέκυψε σφάλμα επικοινωνίας');
    } finally {
      setClearing(false);
    }
  };

  const handleDeleteMatch = async (matchId) => {
    if (!window.confirm('Θέλετε σίγουρα να διαγράψετε αυτόν τον αγώνα και όλες τις προβλέψεις του;')) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/admin/matches/${matchId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Ο αγώνας διαγράφηκε επιτυχώς!');
        fetchAdminData();
        queryClient.invalidateQueries();
      } else {
        alert('Σφάλμα κατά τη διαγραφή του αγώνα');
      }
    } catch (e) {
      console.error(e);
      alert('Προέκυψε σφάλμα επικοινωνίας');
    }
  };

  const handleSingleMatchSubmit = async (e) => {
    e.preventDefault();
    const finalHomeTeam = singleHomeTeamSelect === 'CUSTOM' ? singleHomeTeamCustom.trim() : singleHomeTeamSelect;
    const finalAwayTeam = singleAwayTeamSelect === 'CUSTOM' ? singleAwayTeamCustom.trim() : singleAwayTeamSelect;

    if (!finalHomeTeam || !finalAwayTeam || !singleKickoff) {
      setSingleError('Παρακαλώ συμπληρώστε τα υποχρεωτικά πεδία (Γηπεδούχος, Φιλοξενούμενος, Ημερομηνία & Ώρα)');
      return;
    }

    setSingleSubmitting(true);
    setSingleError('');
    setSingleSuccess(false);

    try {
      const token = localStorage.getItem('token');
      let kickoffTimeStr = singleKickoff;
      if (!kickoffTimeStr.includes('Z') && !/[-+]\d{2}(:?\d{2})?$/.test(kickoffTimeStr)) {
        kickoffTimeStr += '+03:00';
      }
      const kickoffTime = new Date(kickoffTimeStr).toISOString();
      const res = await fetch(API_URL + '/api/admin/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: singleMatchId.trim() || null,
          homeTeam: finalHomeTeam,
          awayTeam: finalAwayTeam,
          matchStage: singleStage,
          kickoffTime: kickoffTime
        })
      });

      if (res.ok) {
        setSingleSuccess(true);
        setSingleHomeTeamSelect('');
        setSingleHomeTeamCustom('');
        setSingleAwayTeamSelect('');
        setSingleAwayTeamCustom('');
        setSingleMatchId('');
        setSingleKickoff('');
        fetchAdminData();
        queryClient.invalidateQueries();
        setTimeout(() => setSingleSuccess(false), 3000);
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Σφάλμα κατά τη δημιουργία αγώνα');
      }
    } catch (err) {
      setSingleError(err.message);
    } finally {
      setSingleSubmitting(false);
    }
  };

  const handleJsonImportSubmit = async (e) => {
    e.preventDefault();
    if (!jsonText.trim()) return;

    setJsonSubmitting(true);
    setJsonError('');
    setJsonSuccess(false);

    try {
      let parsed;
      try {
        parsed = JSON.parse(jsonText);
      } catch (err) {
        throw new Error('Μη έγκυρη μορφή JSON: ' + err.message);
      }

      if (!Array.isArray(parsed)) {
        throw new Error('Το JSON πρέπει να είναι ένας πίνακας (array) από αγώνες.');
      }

      const matchesData = parsed.map((m, idx) => {
        if (!m.homeTeam || !m.awayTeam || !m.matchStage || !m.kickoffTime) {
          throw new Error(`Το αντικείμενο στη θέση ${idx} δεν έχει όλα τα απαραίτητα πεδία (homeTeam, awayTeam, matchStage, kickoffTime)`);
        }
        return {
          id: m.id ? String(m.id).trim() : null,
          homeTeam: String(m.homeTeam).trim(),
          awayTeam: String(m.awayTeam).trim(),
          matchStage: String(m.matchStage).trim(),
          kickoffTime: (() => {
            let kt = String(m.kickoffTime).trim();
            if (!kt.endsWith('Z') && !/[-+]\d{2}(:?\d{2})?$/.test(kt)) {
              kt += '+03:00';
            }
            return new Date(kt).toISOString();
          })()
        };
      });

      const token = localStorage.getItem('token');
      const res = await fetch(API_URL + '/api/admin/matches/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(matchesData)
      });

      if (res.ok) {
        setJsonSuccess(true);
        setJsonText('');
        fetchAdminData();
        queryClient.invalidateQueries();
        setTimeout(() => setJsonSuccess(false), 3000);
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Σφάλμα κατά την bulk εισαγωγή');
      }
    } catch (err) {
      setJsonError(err.message);
    } finally {
      setJsonSubmitting(false);
    }
  };

  const handleJsonFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setJsonText(event.target.result);
    };
    reader.onerror = () => {
      setJsonError('Σφάλμα κατά την ανάγνωση του αρχείου.');
    };
    reader.readAsText(file);
    // Clear input so same file can be uploaded again
    e.target.value = null;
  };

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('token');

      // 1. Fetch matches
      const matchRes = await fetch(API_URL + '/api/matches', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const matchesData = await matchRes.json();
      if (matchRes.ok) {
        setMatches(matchesData);
        // Pre-fill score states
        const scores = {};
        matchesData.forEach(m => {
          scores[m.id] = {
            home: m.homeScore90 !== null ? m.homeScore90 : '',
            away: m.awayScore90 !== null ? m.awayScore90 : '',
            qualifier: m.qualifiedTeam || '',
            qualificationMethod: m.qualificationMethod || '',
            status: m.status,
            tvChannel: m.tvChannel || ''
          };
        });
        setMatchScores(scores);
      }

      // 2. Fetch users for override dropdown
      const userRes = await fetch(API_URL + '/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const usersData = await userRes.json();
      if (userRes.ok) {
        setUsers(usersData);
      }

      // 3. Fetch Long Term data
      const goalsRes = await fetch(API_URL + '/api/predictions/longterm/topscorer-goals', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (goalsRes.ok) setTopScorerGoals(await goalsRes.json());

      const ltRes = await fetch(API_URL + '/api/admin/longterm/predictions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (ltRes.ok) setLongTermPredictions(await ltRes.json());
    } catch (e) {
      console.error(e);
    }
  };

  const handleSeed = async () => {
    setSyncing(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_URL + '/api/admin/matches/seed', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Η εισαγωγή από matches-seed.json ολοκληρώθηκε επιτυχώς!');
        fetchAdminData();
        queryClient.invalidateQueries();
      } else {
        alert('Σφάλμα κατά την εισαγωγή (σημείωση: η εισαγωγή γίνεται μόνο αν η βάση είναι άδεια)');
      }
    } catch (e) {
      console.error(e);
      alert('Προέκυψε σφάλμα επικοινωνίας');
    } finally {
      setSyncing(false);
    }
  };

  const handleSyncOdds = async () => {
    setSyncingOdds(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_URL + '/api/admin/odds/sync', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Η συγχρονισμός αποδόσεων ολοκληρώθηκε επιτυχώς!');
        fetchAdminData();
        queryClient.invalidateQueries();
      } else {
        alert('Σφάλμα κατά τον συγχρονισμό αποδόσεων');
      }
    } catch (e) {
      console.error(e);
      alert('Προέκυψε σφάλμα επικοινωνίας');
    } finally {
      setSyncingOdds(false);
    }
  };

  const [syncingMatchOddsId, setSyncingMatchOddsId] = useState(null);

  const handleSyncSingleMatchOdds = async (matchId) => {
    setSyncingMatchOddsId(matchId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/odds-manager/matches/${matchId}/sync-odds`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Η συγχρονισμός αποδόσεων για τον αγώνα ολοκληρώθηκε!');
        fetchAdminData();
        queryClient.invalidateQueries();
      } else {
        alert('Σφάλμα (πιθανώς δεν έχει βρεθεί αντίστοιχο γεγονός στο SharpAPI ή rate limit)');
      }
    } catch (e) {
      console.error(e);
      alert('Προέκυψε σφάλμα επικοινωνίας');
    } finally {
      setSyncingMatchOddsId(null);
    }
  };

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_URL + '/api/admin/points/recalculate', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Υπολογισμός πόντων ολοκληρώθηκε!');
        queryClient.invalidateQueries();
      } else {
        alert('Σφάλμα υπολογισμού');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRecalculating(false);
    }
  };

  const handleScoreChange = (matchId, field, val) => {
    setMatchScores(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [field]: val
      }
    }));
  };

  const saveScore = async (matchId) => {
    setSavingMatchId(matchId);
    const score = matchScores[matchId];
    const cleanHome = score.home === '' ? null : parseInt(score.home);
    const cleanAway = score.away === '' ? null : parseInt(score.away);
    const cleanQual = score.qualifier || null;
    const cleanQualMethod = score.qualificationMethod || null;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/admin/matches/${matchId}/score`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          homeScore: cleanHome,
          awayScore: cleanAway,
          qualifiedTeam: cleanQual,
          qualificationMethod: cleanQualMethod,
          status: score.status
        })
      });

      if (res.ok) {
        alert('Το σκορ αποθηκεύτηκε και οι πόντοι υπολογίστηκαν!');
        fetchAdminData();
        queryClient.invalidateQueries();
      } else {
        const err = await res.json();
        alert(err.error || 'Σφάλμα αποθήκευσης');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingMatchId(null);
    }
  };

  const updateTvChannel = async (matchId, newChannel) => {
    setSavingChannelId(matchId);
    handleScoreChange(matchId, 'tvChannel', newChannel);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/admin/matches/${matchId}/channel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ tvChannel: newChannel === '' ? null : newChannel })
      });

      if (res.ok) {
        fetchAdminData();
        queryClient.invalidateQueries();
      } else {
        alert('Σφάλμα αποθήκευσης τηλεοπτικού καναλιού');
      }
    } catch (e) {
      console.error(e);
      alert('Προέκυψε σφάλμα επικοινωνίας');
    } finally {
      setSavingChannelId(null);
    }
  };

  const handleOverrideSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserId || !selectedMatchId) return;

    setOverrideSubmitting(true);
    setOverrideError('');
    setOverrideSuccess(false);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_URL + '/api/admin/predictions/override', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: selectedUserId,
          matchId: selectedMatchId,
          homeScore: parseInt(overrideHome) || 0,
          awayScore: parseInt(overrideAway) || 0,
          qualifier: overrideQualifier || null,
          predictedQualificationMethod: overrideQualificationMethod || null
        })
      });

      if (res.ok) {
        setOverrideSuccess(true);
        // Clear fields
        setOverrideHome('');
        setOverrideAway('');
        setOverrideQualifier('');
        setOverrideQualificationMethod('');
        queryClient.invalidateQueries();
        setTimeout(() => setOverrideSuccess(false), 3000);
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Σφάλμα override');
      }
    } catch (err) {
      setOverrideError(err.message);
    } finally {
      setOverrideSubmitting(false);
    }
  };

  const handleUpdatePlayerGoals = async (playerName, goals) => {
    setUpdatingGoals(prev => ({ ...prev, [playerName]: true }));
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/admin/longterm/topscorer-goals?playerName=${encodeURIComponent(playerName)}&goals=${goals}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setTopScorerGoals(prev => ({ ...prev, [playerName]: goals }));
      } else {
        alert('Σφάλμα ενημέρωσης γκολ');
      }
    } catch (e) {
      console.error(e);
      alert('Σφάλμα επικοινωνίας');
    } finally {
      setUpdatingGoals(prev => ({ ...prev, [playerName]: false }));
    }
  };

  const handleResolveTournament = async () => {
    if (!window.confirm('Θέλετε σίγουρα να ολοκληρώσετε το τουρνουά; Αυτό θα υπολογίσει τους τελικούς πόντους μακροχρόνιων προβλέψεων.')) return;
    setResolving(true);
    try {
      const token = localStorage.getItem('token');
      let url = `${API_URL}/api/admin/longterm/resolve?`;
      const params = new URLSearchParams();
      if (resolveChampion) params.append('championTeam', resolveChampion);

      const res = await fetch(url + params.toString(), {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Το τουρνουά ολοκληρώθηκε και οι πόντοι υπολογίστηκαν!');
        queryClient.invalidateQueries();
      } else {
        alert('Σφάλμα ολοκλήρωσης τουρνουά');
      }
    } catch (e) {
      console.error(e);
      alert('Σφάλμα επικοινωνίας');
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {linkModalMatchId && (
        <SharpApiEventPickerModal
          matchId={linkModalMatchId}
          onClose={() => setLinkModalMatchId(null)}
          onSelect={handleLinkEventSelect}
        />
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <Shield size={32} className="text-indigo-400" />
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Admin Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>Διαχείριση αγώνων, αποτελεσμάτων και overrides.</p>
        </div>
      </div>

      {/* Global Actions */}
      <div className="glass-card admin-global-actions" style={{ padding: '24px', marginBottom: '32px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={handleSeed} disabled={syncing}>
          <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
          <span>{syncing ? 'Εισαγωγή...' : 'Εισαγωγή από matches-seed.json'}</span>
        </button>

        <button className="btn btn-primary" onClick={handleSyncOdds} disabled={syncingOdds} style={{ backgroundColor: 'var(--accent-color)' }}>
          <RefreshCw size={18} className={syncingOdds ? 'animate-spin' : ''} />
          <span>{syncingOdds ? 'Συγχρονισμός...' : 'Sync Odds'}</span>
        </button>

        <button className="btn btn-secondary" onClick={handleRecalculate} disabled={recalculating}>
          <Calculator size={18} />
          <span>{recalculating ? 'Υπολογισμός...' : 'Sync Points'}</span>
        </button>

        <button
          className="btn btn-secondary"
          onClick={handleClearAllMatches}
          disabled={clearing}
          style={{ borderColor: 'rgba(239, 68, 68, 0.3)', color: '#ef4444', marginLeft: 'auto' }}
        >
          <Trash2 size={18} />
          <span>{clearing ? 'Διαγραφή...' : 'Καθαρισμός Αγώνων'}</span>
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 450px), 1fr))',
        gap: '32px',
        alignItems: 'start'
      }}>
        {/* Left Column: Match Scoring Panel */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div
            onClick={() => setShowResults(!showResults)}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showResults ? '20px' : '0', borderBottom: showResults ? '1px solid var(--border-color)' : 'none', paddingBottom: showResults ? '10px' : '0', flexWrap: 'wrap', gap: '10px', cursor: 'pointer' }}
          >
            <h2 style={{ fontSize: '1.4rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              Αποτελέσματα Αγώνων
              {showResults ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </h2>
            <div style={{ display: 'flex', gap: '10px' }} onClick={(e) => e.stopPropagation()}>
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
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{
                  background: 'var(--input-bg, rgba(10, 11, 16, 0.7))',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                <option value="ALL">Όλα τα Status</option>
                <option value="SCHEDULED">Προγραμματισμένα</option>
                <option value="LIVE">Live</option>
                <option value="FINISHED">Ολοκληρωμένα</option>
              </select>
            </div>
          </div>
          {showResults && (
            <>
              {matches.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>Δεν υπάρχουν αγώνες. Προσθέστε αγώνες χειροκίνητα ή μέσω JSON.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {(() => {
                    const filteredMatches = matches.filter(m =>
                      (filterStage === 'ALL' || m.matchStage === filterStage) &&
                      (filterStatus === 'ALL' || m.status === filterStatus)
                    );

                    if (filteredMatches.length === 0) {
                      return <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>Δεν βρέθηκαν αγώνες με αυτά τα κριτήρια.</p>;
                    }

                    return filteredMatches.map(match => {
                      const score = matchScores[match.id] || { home: '', away: '', qualifier: '', qualificationMethod: '', status: 'SCHEDULED', tvChannel: '' };
                      const isKnockout = match.matchStage !== 'GROUP';

                      return (
                        <div key={match.id} style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '16px',
                          paddingBottom: '16px',
                          borderBottom: '1px solid var(--border-color)'
                        }}>
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
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {/* Score entry */}
                                <input
                                  type="number"
                                  className="score-box"
                                  value={score.home}
                                  onChange={(e) => handleScoreChange(match.id, 'home', e.target.value)}
                                />
                                <span>-</span>
                                <input
                                  type="number"
                                  className="score-box"
                                  value={score.away}
                                  onChange={(e) => handleScoreChange(match.id, 'away', e.target.value)}
                                />
                              </div>

                              {/* Qualifier dropdown for knockouts */}
                              {isKnockout && (
                                <select
                                  value={score.qualifier}
                                  onChange={(e) => handleScoreChange(match.id, 'qualifier', e.target.value)}
                                  style={{
                                    background: 'var(--input-bg, rgba(10, 11, 16, 0.7))',
                                    border: '1px solid var(--border-color)',
                                    color: 'var(--text-main)',
                                    padding: '10px',
                                    borderRadius: 'var(--radius-sm)'
                                  }}
                                >
                                  <option value="">Πρόκριση...</option>
                                  <option value={match.homeTeam}>{match.homeTeam}</option>
                                  <option value={match.awayTeam}>{match.awayTeam}</option>
                                </select>
                              )}

                              {/* Qualification Method dropdown for knockouts */}
                              {isKnockout && (
                                <select
                                  value={score.qualificationMethod}
                                  onChange={(e) => handleScoreChange(match.id, 'qualificationMethod', e.target.value)}
                                  style={{
                                    background: 'var(--input-bg, rgba(10, 11, 16, 0.7))',
                                    border: '1px solid var(--border-color)',
                                    color: 'var(--text-main)',
                                    padding: '10px',
                                    borderRadius: 'var(--radius-sm)'
                                  }}
                                >
                                  <option value="">Τρόπος Πρόκρισης...</option>
                                  <option value="REGULAR_TIME">Κανονική Διάρκεια</option>
                                  <option value="EXTRA_TIME">Παράταση</option>
                                  <option value="PENALTIES">Πέναλτι</option>
                                </select>
                              )}

                              {/* Status dropdown */}
                              <select
                                value={score.status}
                                onChange={(e) => handleScoreChange(match.id, 'status', e.target.value)}
                                style={{
                                  background: 'var(--input-bg, rgba(10, 11, 16, 0.7))',
                                  border: '1px solid var(--border-color)',
                                  color: 'var(--text-main)',
                                  padding: '10px',
                                  borderRadius: 'var(--radius-sm)'
                                }}
                              >
                                <option value="SCHEDULED">SCHEDULED</option>
                                <option value="LIVE">LIVE</option>
                                <option value="FINISHED">FINISHED</option>
                              </select>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                              {/* TV Channel Selection */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <button
                                  type="button"
                                  onClick={() => updateTvChannel(match.id, score.tvChannel === 'ert1' ? '' : 'ert1')}
                                  disabled={savingChannelId === match.id}
                                  style={{ 
                                    padding: '4px 12px', 
                                    height: '40px', 
                                    borderRadius: 'var(--radius-sm)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: '#ffffff',
                                    border: score.tvChannel === 'ert1' ? '2px solid var(--primary)' : '1px solid #e5e7eb',
                                    opacity: score.tvChannel && score.tvChannel !== 'ert1' ? 0.4 : 1,
                                    boxShadow: score.tvChannel === 'ert1' ? '0 0 0 3px var(--primary-glow)' : 'none',
                                    transition: 'all 0.2s'
                                  }}
                                  title="ΕΡΤ 1"
                                >
                                  <img 
                                    src="/assets/channels/ert1.png" 
                                    alt="ΕΡΤ 1"
                                    style={{ height: '20px', width: 'auto', objectFit: 'contain' }}
                                    onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerText = 'ΕΡΤ 1'; }}
                                  />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => updateTvChannel(match.id, score.tvChannel === 'ert2' ? '' : 'ert2')}
                                  disabled={savingChannelId === match.id}
                                  style={{ 
                                    padding: '4px 12px', 
                                    height: '40px', 
                                    borderRadius: 'var(--radius-sm)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: '#ffffff',
                                    border: score.tvChannel === 'ert2' ? '2px solid var(--primary)' : '1px solid #e5e7eb',
                                    opacity: score.tvChannel && score.tvChannel !== 'ert2' ? 0.4 : 1,
                                    boxShadow: score.tvChannel === 'ert2' ? '0 0 0 3px var(--primary-glow)' : 'none',
                                    transition: 'all 0.2s'
                                  }}
                                  title="ΕΡΤ 2"
                                >
                                  <img 
                                    src="/assets/channels/ert2.png" 
                                    alt="ΕΡΤ 2"
                                    style={{ height: '20px', width: 'auto', objectFit: 'contain' }}
                                    onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerText = 'ΕΡΤ 2'; }}
                                  />
                                </button>

                                {savingChannelId === match.id && (
                                  <RefreshCw size={18} className="animate-spin text-indigo-400" />
                                )}
                              </div>

                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  className="btn btn-primary"
                                  disabled={savingMatchId === match.id}
                                  onClick={() => saveScore(match.id)}
                                  style={{ padding: '10px', minWidth: '40px' }}
                                  title="Αποθήκευση Σκορ"
                                >
                                  <Save size={16} />
                                </button>

                                <button
                                  className="btn btn-secondary"
                                  disabled={syncingMatchOddsId === match.id || !match.externalApiId}
                                  onClick={() => handleSyncSingleMatchOdds(match.id)}
                                  style={{ padding: '10px', minWidth: '40px', borderColor: 'rgba(59, 130, 246, 0.5)', color: match.externalApiId ? '#3b82f6' : 'var(--text-muted)' }}
                                  title={match.externalApiId ? "Συγχρονισμός Αποδόσεων (SharpAPI)" : "Απαιτείται σύνδεση αγώνα πρώτα"}
                                >
                                  <RefreshCw size={16} className={syncingMatchOddsId === match.id ? 'animate-spin' : ''} />
                                </button>

                                <button
                                  className="btn btn-secondary"
                                  disabled={linkingEventId === match.id}
                                  onClick={() => setLinkModalMatchId(match.id)}
                                  style={{ padding: '10px', minWidth: '40px', borderColor: 'rgba(16, 185, 129, 0.5)', color: match.externalApiId ? '#10b981' : 'var(--text-muted)' }}
                                  title={match.externalApiId ? `Συνδεδεμένο: ${match.externalApiId}` : "Σύνδεση με SharpAPI Event"}
                                >
                                  <LinkIcon size={16} />
                                </button>

                                <button
                                  className="btn btn-secondary"
                                  onClick={() => handleDeleteMatch(match.id)}
                                  style={{ padding: '10px', minWidth: '40px', borderColor: 'rgba(239, 68, 68, 0.25)', color: '#ef4444' }}
                                  title="Διαγραφή Αγώνα"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </>
          )}
        </div>

        {/* Right Column: Creation & Override Tools */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

          {/* Section: Create Single Match */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h2
              onClick={() => setShowCreateMatch(!showCreateMatch)}
              style={{ fontSize: '1.4rem', marginBottom: showCreateMatch ? '20px' : '0', borderBottom: showCreateMatch ? '1px solid var(--border-color)' : 'none', paddingBottom: showCreateMatch ? '10px' : '0', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              Προσθήκη Νέου Αγώνα
              {showCreateMatch ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </h2>

            {showCreateMatch && (
              <>
                {singleSuccess && (
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
                    <span>Ο αγώνας προστέθηκε επιτυχώς!</span>
                  </div>
                )}

                {singleError && (
                  <div className="glass" style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-sm)',
                    borderLeft: '4px solid var(--danger)',
                    background: 'var(--danger-bg, rgba(239, 68, 68, 0.08))',
                    color: 'var(--danger-text, #fca5a5)',
                    fontSize: '0.85rem',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <AlertCircle size={16} />
                    <span>{singleError}</span>
                  </div>
                )}

                <form onSubmit={handleSingleMatchSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <div className="form-group" style={{ flex: '1', minWidth: '150px' }}>
                      <label className="form-label">Γηπεδούχος *</label>
                      <select
                        className="form-input"
                        value={singleHomeTeamSelect}
                        onChange={(e) => setSingleHomeTeamSelect(e.target.value)}
                        style={{ background: 'var(--input-bg, rgba(10, 11, 16, 0.7))' }}
                      >
                        <option value="">Επιλέξτε ομάδα...</option>
                        {COUNTRIES.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                        <optgroup label="Φάση Νοκ-Άουτ">
                          {KNOCKOUT_PLACEHOLDERS.map(p => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </optgroup>
                        <option value="CUSTOM">✍️ Άλλη ομάδα (Χειροκίνητα)...</option>
                      </select>
                      {singleHomeTeamSelect === 'CUSTOM' && (
                        <input
                          type="text"
                          required
                          placeholder="Όνομα ομάδας..."
                          className="form-input"
                          style={{ marginTop: '8px' }}
                          value={singleHomeTeamCustom}
                          onChange={(e) => setSingleHomeTeamCustom(e.target.value)}
                        />
                      )}
                    </div>
                    <div className="form-group" style={{ flex: '1', minWidth: '150px' }}>
                      <label className="form-label">Φιλοξενούμενος *</label>
                      <select
                        className="form-input"
                        value={singleAwayTeamSelect}
                        onChange={(e) => setSingleAwayTeamSelect(e.target.value)}
                        style={{ background: 'var(--input-bg, rgba(10, 11, 16, 0.7))' }}
                      >
                        <option value="">Επιλέξτε ομάδα...</option>
                        {COUNTRIES.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                        <optgroup label="Φάση Νοκ-Άουτ">
                          {KNOCKOUT_PLACEHOLDERS.map(p => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </optgroup>
                        <option value="CUSTOM">✍️ Άλλη ομάδα (Χειροκίνητα)...</option>
                      </select>
                      {singleAwayTeamSelect === 'CUSTOM' && (
                        <input
                          type="text"
                          required
                          placeholder="Όνομα ομάδας..."
                          className="form-input"
                          style={{ marginTop: '8px' }}
                          value={singleAwayTeamCustom}
                          onChange={(e) => setSingleAwayTeamCustom(e.target.value)}
                        />
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <div className="form-group" style={{ flex: '1', minWidth: '150px' }}>
                      <label className="form-label">Φάση Διοργάνωσης *</label>
                      <select
                        className="form-input"
                        value={singleStage}
                        onChange={(e) => setSingleStage(e.target.value)}
                        style={{ background: 'var(--input-bg, rgba(10, 11, 16, 0.7))' }}
                      >
                        <option value="GROUP">ΦΑΣΗ ΟΜΙΛΩΝ (GROUP)</option>
                        <option value="ROUND_OF_32">ΦΑΣΗ ΤΩΝ 32 (ROUND_OF_32)</option>
                        <option value="ROUND_OF_16">ΦΑΣΗ ΤΩΝ 16 (ROUND_OF_16)</option>
                        <option value="QUARTER_FINAL">ΠΡΟΗΜΙΤΕΛΙΚΟΣ (QUARTER_FINAL)</option>
                        <option value="SEMI_FINAL">ΗΜΙΤΕΛΙΚΟΣ (SEMI_FINAL)</option>
                        <option value="THIRD_PLACE">ΜΙΚΡΟΣ ΤΕΛΙΚΟΣ (THIRD_PLACE)</option>
                        <option value="FINAL">ΤΕΛΙΚΟΣ (FINAL)</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ flex: '1', minWidth: '150px' }}>
                      <label className="form-label">Κωδικός ID</label>
                      <input
                        type="text"
                        placeholder="π.χ. match-1"
                        className="form-input"
                        value={singleMatchId}
                        onChange={(e) => setSingleMatchId(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Ημερομηνία & Ώρα Σέντρας *</label>
                    <input
                      type="datetime-local"
                      required
                      className="form-input"
                      value={singleKickoff}
                      onChange={(e) => setSingleKickoff(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={singleSubmitting}
                    className="btn btn-primary"
                    style={{ alignSelf: 'flex-start', marginTop: '8px' }}
                  >
                    <Plus size={18} />
                    <span>{singleSubmitting ? 'Προσθήκη...' : 'Προσθήκη Αγώνα'}</span>
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Section: Bulk Import Matches JSON */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h2
              onClick={() => setShowBulkImport(!showBulkImport)}
              style={{ fontSize: '1.4rem', marginBottom: showBulkImport ? '10px' : '0', borderBottom: showBulkImport ? '1px solid var(--border-color)' : 'none', paddingBottom: showBulkImport ? '10px' : '0', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              Bulk Εισαγωγή Schedule (JSON)
              {showBulkImport ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </h2>

            {showBulkImport && (
              <>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  Ανεβάστε αρχείο JSON ή επικολλήστε το schedule της διοργανώσης.
                </p>

                {jsonSuccess && (
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
                    <span>Το schedule εισήχθη επιτυχώς!</span>
                  </div>
                )}

                {jsonError && (
                  <div className="glass" style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-sm)',
                    borderLeft: '4px solid var(--danger)',
                    background: 'var(--danger-bg, rgba(239, 68, 68, 0.08))',
                    color: 'var(--danger-text, #fca5a5)',
                    fontSize: '0.85rem',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <AlertCircle size={16} />
                    <span>{jsonError}</span>
                  </div>
                )}

                <form onSubmit={handleJsonImportSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="form-group" style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label className="form-label">Δεδομένα JSON</label>
                      <label className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', height: 'auto', gap: '4px' }}>
                        <Upload size={14} />
                        <span>Upload Αρχείου</span>
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleJsonFileUpload}
                          style={{ display: 'none' }}
                        />
                      </label>
                    </div>
                    <textarea
                      className="form-input"
                      rows="6"
                      placeholder='[
  {
    "id": "match-1",
    "homeTeam": "Γερμανία",
    "awayTeam": "Σκωτία",
    "matchStage": "GROUP",
    "kickoffTime": "2026-06-14T22:00:00+03:00"
  }
]'
                      value={jsonText}
                      onChange={(e) => setJsonText(e.target.value)}
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '0.85rem',
                        background: 'var(--input-bg, rgba(15, 16, 26, 0.8))',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={jsonSubmitting || !jsonText.trim()}
                    className="btn btn-primary"
                    style={{ alignSelf: 'flex-start' }}
                  >
                    <FileJson size={18} />
                    <span>{jsonSubmitting ? 'Εισαγωγή...' : 'Εισαγωγή Schedule'}</span>
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Section: Prediction Override Form */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h2
              onClick={() => setShowOverride(!showOverride)}
              style={{ fontSize: '1.4rem', marginBottom: showOverride ? '20px' : '0', borderBottom: showOverride ? '1px solid var(--border-color)' : 'none', paddingBottom: showOverride ? '10px' : '0', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              Force Override Πρόβλεψης Χρήστη
              {showOverride ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </h2>

            {showOverride && (
              <>

                {overrideSuccess && (
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
                    <span>Η πρόβλεψη παρακάμφθηκε και αποθηκεύτηκε επιτυχώς!</span>
                  </div>
                )}

                {overrideError && (
                  <div className="glass" style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-sm)',
                    borderLeft: '4px solid var(--danger)',
                    background: 'var(--danger-bg, rgba(239, 68, 68, 0.08))',
                    color: 'var(--danger-text, #fca5a5)',
                    fontSize: '0.85rem',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <AlertCircle size={16} />
                    <span>{overrideError}</span>
                  </div>
                )}

                <form onSubmit={handleOverrideSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>

                    {/* Select User */}
                    <div className="form-group" style={{ flex: '1', minWidth: '200px' }}>
                      <label className="form-label">Επιλογή Παίκτη</label>
                      <select
                        required
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        style={{
                          background: 'var(--input-bg, rgba(10, 11, 16, 0.7))',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-main)',
                          padding: '12px',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '0.95rem'
                        }}
                      >
                        <option value="">Επιλέξτε παίκτη...</option>
                        {users.map(u => (
                          <option key={u.id} value={u.id}>{u.username} ({u.email})</option>
                        ))}
                      </select>
                    </div>

                    {/* Select Match */}
                    <div className="form-group" style={{ flex: '1', minWidth: '200px' }}>
                      <label className="form-label">Επιλογή Αγώνα</label>
                      <select
                        required
                        value={selectedMatchId}
                        onChange={(e) => setSelectedMatchId(e.target.value)}
                        style={{
                          background: 'var(--input-bg, rgba(10, 11, 16, 0.7))',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-main)',
                          padding: '12px',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '0.95rem'
                        }}
                      >
                        <option value="">Επιλέξτε αγώνα...</option>
                        {matches.map(m => (
                          <option key={m.id} value={m.id}>{m.homeTeam} vs {m.awayTeam} ({getStageLabel(m.matchStage)})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Prediction Values */}
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div className="form-group" style={{ width: '100px' }}>
                      <label className="form-label">Home Score</label>
                      <input
                        type="number"
                        min="0"
                        required
                        className="form-input"
                        value={overrideHome}
                        onChange={(e) => setOverrideHome(e.target.value)}
                      />
                    </div>

                    <div className="form-group" style={{ width: '100px' }}>
                      <label className="form-label">Away Score</label>
                      <input
                        type="number"
                        min="0"
                        required
                        className="form-input"
                        value={overrideAway}
                        onChange={(e) => setOverrideAway(e.target.value)}
                      />
                    </div>

                    {/* Qualifier override */}
                    <div className="form-group" style={{ flex: '1', minWidth: '180px' }}>
                      <label className="form-label">Πρόκριση (Κολλάει μόνο στα knockouts)</label>
                      <input
                        type="text"
                        placeholder="Όνομα ομάδας πρόκρισης"
                        className="form-input"
                        value={overrideQualifier}
                        onChange={(e) => setOverrideQualifier(e.target.value)}
                      />
                    </div>

                    {/* Qualification Method override */}
                    <div className="form-group" style={{ flex: '1', minWidth: '180px' }}>
                      <label className="form-label">Τρόπος Πρόκρισης</label>
                      <select
                        className="form-input"
                        value={overrideQualificationMethod}
                        onChange={(e) => setOverrideQualificationMethod(e.target.value)}
                      >
                        <option value="">Επιλέξτε...</option>
                        <option value="REGULAR_TIME">Κανονική Διάρκεια</option>
                        <option value="EXTRA_TIME">Παράταση</option>
                        <option value="PENALTIES">Πέναλτι</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={overrideSubmitting || !selectedUserId || !selectedMatchId}
                      className="btn btn-primary"
                      style={{ height: '45px', padding: '0 24px', marginBottom: '4px' }}
                    >
                      {overrideSubmitting ? '...' : 'Επιβολή Πρόβλεψης'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>

          {/* Section: Long Term Settings */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h2
              onClick={() => setShowLongTerm(!showLongTerm)}
              style={{ fontSize: '1.4rem', marginBottom: showLongTerm ? '20px' : '0', borderBottom: showLongTerm ? '1px solid var(--border-color)' : 'none', paddingBottom: showLongTerm ? '10px' : '0', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              Μακροχρόνια & Πρώτοι Σκόρερ
              {showLongTerm ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </h2>

            {showLongTerm && (
              <>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '12px' }}>Βαθμολογία Παικτών (Ψηφισμένοι)</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px' }}>
                  {Array.from(new Set(longTermPredictions.map(p => p.predictedTopScorer).filter(Boolean))).map(player => (
                    <div key={player} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ minWidth: '150px' }}>{player}</span>
                      <input
                        type="number"
                        min="0"
                        className="form-input"
                        style={{ width: '80px' }}
                        value={topScorerGoals[player] !== undefined ? topScorerGoals[player] : 0}
                        onChange={(e) => setTopScorerGoals(prev => ({ ...prev, [player]: parseInt(e.target.value) || 0 }))}
                      />
                      <button
                        className="btn btn-primary"
                        disabled={updatingGoals[player]}
                        onClick={() => handleUpdatePlayerGoals(player, topScorerGoals[player] || 0)}
                        style={{ padding: '8px 12px' }}
                      >
                        {updatingGoals[player] ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                      </button>
                    </div>
                  ))}
                  {longTermPredictions.length === 0 && <p className="text-muted">Δεν υπάρχουν ακόμη προβλέψεις.</p>}
                </div>

                <h3 style={{ fontSize: '1.1rem', marginBottom: '12px' }}>Ολοκλήρωση Τουρνουά (Υπολογισμός Μακροχρόνιων Πόντων)</h3>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                  <div className="form-group" style={{ flex: '1', minWidth: '150px' }}>
                    <label className="form-label">Πρωταθλητής</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Χώρα"
                      value={resolveChampion}
                      onChange={e => setResolveChampion(e.target.value)}
                    />
                  </div>
                  <button
                    className="btn btn-primary"
                    disabled={resolving || !resolveChampion}
                    onClick={handleResolveTournament}
                    style={{ padding: '0 24px', height: '45px', marginBottom: '4px' }}
                  >
                    {resolving ? 'Ολοκλήρωση...' : 'Επίσημη Λήξη Πρωταθλητή'}
                  </button>
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
