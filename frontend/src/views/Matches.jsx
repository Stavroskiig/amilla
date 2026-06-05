import React, { useState, useEffect } from 'react';
import { useMatches, useMyPredictions } from '../hooks/useApi';
import MatchCard from '../components/matches/MatchCard';

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

  if (matchesLoading || predsLoading) {
    return <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>Φόρτωση αγώνων...</div>;
  }

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
        <div style={{
          display: 'flex',
          background: 'rgba(255, 255, 255, 0.02)',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          gap: '4px'
        }}>
          {[
            { id: 'upcoming', label: 'Προσεχείς' },
            { id: 'past', label: 'Ολοκληρωμένοι' },
            { id: 'all', label: 'Όλοι' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setFilterTab(tab.id);
                setVisibleCount(15);
              }}
              style={{
                background: filterTab === tab.id ? 'var(--primary)' : 'transparent',
                color: filterTab === tab.id ? '#ffffff' : 'var(--text-muted)',
                border: 'none',
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: filterTab === tab.id ? '0 2px 8px var(--primary-glow)' : 'none'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {filteredMatches.slice(0, visibleCount).map(match => (
          <MatchCard 
            key={match.id} 
            match={match} 
            predictionData={predictions[match.id]} 
            currentUserId={user?.id}
            setPredictions={setPredictions}
          />
        ))}
      </div>

      {visibleCount < filteredMatches.length && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '28px', marginBottom: '16px' }}>
          <button
            className="btn btn-secondary"
            onClick={() => setVisibleCount(prev => prev + 15)}
            style={{
              padding: '12px 32px',
              fontSize: '0.95rem',
              background: 'rgba(255, 255, 255, 0.02)',
              borderColor: 'rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            Φόρτωση Περισσότερων Αγώνων
          </button>
        </div>
      )}
    </div>
  );
}
