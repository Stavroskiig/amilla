import React from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { X, Check } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function SharpApiEventPickerModal({ matchId, onClose, onSelect }) {
  const token = localStorage.getItem('token');

  const { data: eventsData, isLoading, error } = useQuery({
    queryKey: ['sharpApiEvents'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/odds-manager/sharpapi/events`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch events');
      const data = await res.json();
      return typeof data === 'string' ? JSON.parse(data) : data;
    },
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  });

  const allEvents = Array.isArray(eventsData?.data) ? eventsData.data : [];
  const events = allEvents.filter(evt => evt.id && evt.id.startsWith('fifa_-_world_cup_'));
  
  console.log('EventsData:', eventsData);
  console.log('Filtered Events Array:', events);

  const modalContent = (
    <>
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 9998
      }} onClick={onClose} />
      
      <div className="glass-card" style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '90%', maxWidth: '600px', maxHeight: '80vh',
        display: 'flex', flexDirection: 'column',
        padding: '32px',
        color: 'var(--text-main)',
        zIndex: 9999
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '16px', right: '16px',
            background: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: 'var(--text-main)',
            cursor: 'pointer', borderRadius: '50%', padding: '6px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-main)'}
        >
          <X size={24} />
        </button>

        <h2 style={{ marginBottom: '16px', fontSize: '1.25rem' }}>Link API Event</h2>
        
        <p style={{ color: '#f59e0b', fontSize: '0.85rem', marginBottom: '16px', padding: '8px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '6px' }}>
          ⚠️ <b>ΠΡΟΣΟΧΗ:</b> Βεβαιωθείτε ότι η σειρά των ομάδων (Γηπεδούχος vs Φιλοξενούμενος) στο API ταιριάζει με τη βάση σας, αλλιώς οι αποδόσεις θα περαστούν ανάποδα!
        </p>

        <button 
          onClick={() => onSelect(null)}
          style={{
            padding: '10px', marginBottom: '16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'transparent',
            border: '1px solid var(--danger)',
            color: 'var(--danger)',
            cursor: 'pointer', transition: 'all 0.2s',
            fontWeight: 'bold', width: '100%'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          Αποσύνδεση Αγώνα (Unlink)
        </button>
        
        {isLoading && <p>Loading events...</p>}
        {error && <p>Error: {error.message}</p>}

        <div style={{ overflowY: 'auto', flex: 1, paddingRight: '8px' }}>
          {events.map((evt) => (
            <div
              key={evt.id}
              onClick={() => onSelect(evt.id)}
              style={{
                padding: '12px', marginBottom: '8px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'transparent',
                border: '1px solid var(--border-color)',
                cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                e.currentTarget.style.borderColor = 'var(--primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }}
            >
              <div>
                <div style={{ fontWeight: '500', marginBottom: '4px', fontSize: '1.1rem' }}>
                  {evt.home_team} vs {evt.away_team}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  ID: {evt.id} | Start: {new Date(evt.start_time).toLocaleString()}
                </div>
              </div>
              <Check size={18} style={{ color: 'var(--primary)', opacity: 0.5 }} />
            </div>
          ))}
          {!isLoading && events.length === 0 && (
            <p>No events found.</p>
          )}
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
