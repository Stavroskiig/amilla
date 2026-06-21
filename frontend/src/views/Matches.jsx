import React, { useState, useEffect } from 'react';
import { useMatches, useMyPredictions } from '../hooks/useApi';
import MatchCard from '../components/matches/MatchCard';
import SkeletonMatchCard from '../components/matches/SkeletonMatchCard';
import { Calendar, CheckCircle, List, CalendarX, ChevronDown } from 'lucide-react';

const formatDateLabel = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  const isTomorrow = date.getDate() === tomorrow.getDate() && date.getMonth() === tomorrow.getMonth() && date.getFullYear() === tomorrow.getFullYear();

  if (isToday) return 'Σήμερα';
  if (isTomorrow) return 'Αύριο';

  return date.toLocaleDateString('el-GR', {
    weekday: 'long',
    day: 'numeric',
    month: 'short'
  });
};

export default function Matches({ user }) {
  const [filterTab, setFilterTab] = useState('upcoming');
  const [visibleCount, setVisibleCount] = useState(15);

  const { data: matches, isLoading: matchesLoading } = useMatches();
  const { data: initialPredictions, isLoading: predsLoading } = useMyPredictions();

  const [predictions, setPredictions] = useState({});

  useEffect(() => {
    if (initialPredictions) {
      setPredictions(initialPredictions);
    }
  }, [initialPredictions]);

  useEffect(() => {
    if (matches && matches.length > 0) {
      const firstUnfinishedIdx = matches.findIndex(m => m.status !== 'FINISHED');
      if (firstUnfinishedIdx !== -1) {
        setVisibleCount(Math.max(15, firstUnfinishedIdx + 15));
      }
    }
  }, [matches]);

  const filteredMatches = matches?.filter(match => {
    if (filterTab === 'upcoming') {
      return match.status !== 'FINISHED';
    }
    if (filterTab === 'past') {
      return match.status === 'FINISHED';
    }
    return true; // 'all'
  }) || [];

  if (filterTab === 'past') {
    filteredMatches.sort((a, b) => {
      const timeA = a.kickoffTime ? new Date(a.kickoffTime).getTime() : 0;
      const timeB = b.kickoffTime ? new Date(b.kickoffTime).getTime() : 0;
      return timeB - timeA;
    });
  }

  // Grouping matches by Date
  const visibleMatches = filteredMatches.slice(0, visibleCount);
  const groupedMatches = visibleMatches.reduce((groups, match) => {
    const label = formatDateLabel(match.kickoffTime);
    if (!groups[label]) {
      groups[label] = [];
    }
    groups[label].push(match);
    return groups;
  }, {});

  return (
    <div className="animate-fade-in">
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Αγώνες & Προβλέψεις</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Υποβάλετε τις προβλέψεις σας έως και 5 λεπτά πριν από κάθε σέντρα.
          </p>
        </div>

        {/* Tab Filter Control */}
        <div className="hide-scrollbar" style={{ maxWidth: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', boxSizing: 'border-box' }}>
          <div style={{
            display: 'flex',
            width: 'max-content',
            background: 'var(--tab-container-bg, rgba(255, 255, 255, 0.02))',
            padding: '4px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            gap: '2px',
            position: 'relative',
            boxSizing: 'border-box'
          }}>
            {[
            { id: 'upcoming', label: 'Προσεχείς', icon: <Calendar size={16} /> },
            { id: 'past', label: 'Ολοκληρωμένοι', icon: <CheckCircle size={16} /> },
            { id: 'all', label: 'Όλοι', icon: <List size={16} /> }
          ].map(tab => {
            const isActive = filterTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setFilterTab(tab.id);
                  setVisibleCount(15);
                }}
                style={{
                  background: isActive ? 'var(--primary)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--text-muted)',
                  border: 'none',
                  padding: '6px 8px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: isActive ? '0 2px 8px var(--primary-glow)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  position: 'relative',
                  zIndex: 1,
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
          </div>
        </div>
      </div>

      {(matchesLoading || predsLoading) ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <SkeletonMatchCard />
          <SkeletonMatchCard />
          <SkeletonMatchCard />
          <SkeletonMatchCard />
        </div>
      ) : filteredMatches.length === 0 ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 20px',
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: 'var(--radius-lg)',
          border: '1px dashed var(--border-color)',
          color: 'var(--text-muted)',
          textAlign: 'center'
        }}>
          <CalendarX size={64} style={{ opacity: 0.2, marginBottom: '20px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
            Δεν βρέθηκαν αγώνες
          </h3>
          <p>
            {filterTab === 'upcoming' ? 'Δεν υπάρχουν προγραμματισμένοι αγώνες αυτή τη στιγμή.' :
             filterTab === 'past' ? 'Δεν υπάρχουν ολοκληρωμένοι αγώνες ακόμα.' :
             'Η λίστα αγώνων είναι άδεια.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {Object.entries(groupedMatches).map(([dateLabel, dayMatches]) => (
            <div key={dateLabel}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px'
              }}>
                <h3 style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  margin: 0,
                  textTransform: 'capitalize'
                }}>
                  {dateLabel}
                </h3>
                <div style={{
                  flex: 1,
                  height: '1px',
                  background: 'linear-gradient(to right, var(--border-color), transparent)'
                }} />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {dayMatches.map(match => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    predictionData={predictions[match.id]}
                    currentUserId={user?.id}
                    setPredictions={setPredictions}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {!matchesLoading && !predsLoading && visibleCount < filteredMatches.length && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '36px', marginBottom: '16px' }}>
          <button
            className="btn btn-secondary"
            onClick={() => setVisibleCount(prev => prev + 15)}
            style={{
              padding: '12px 32px',
              fontSize: '0.95rem',
              background: 'var(--bg-main)',
              borderColor: 'var(--border-color, #e5e7eb)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--text-main)',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'var(--load-more-border, rgba(255, 255, 255, 0.08))';
            }}
          >
            Φόρτωση Περισσότερων Αγώνων
            <ChevronDown size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
