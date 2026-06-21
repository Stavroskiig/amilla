import React, { useState, useEffect } from 'react';

export default function MatchCountdown({ match }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const getCountdownContent = () => {
    const kickoff = new Date(match.kickoffTime).getTime();
    const diffMs = kickoff - now;
    
    if (match.status === 'LIVE' || diffMs < 0) {
      return (
        <span className="badge badge-live" style={{ fontSize: '0.85rem', fontWeight: 700, padding: '4px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor', animation: 'pulse 1.5s infinite' }}></div>
          LIVE
        </span>
      );
    }

    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 5) return (
      <span style={{ fontWeight: '600', animation: 'pulse 2s infinite', textAlign: 'right', lineHeight: '1.2' }}>
        <span className="hide-on-mobile">Σέντρα σε &lt; 5 λεπτά!</span>
        <span className="show-on-mobile">
          Σέντρα σε <br /> &lt; 5 λεπτά!
        </span>
      </span>
    );

    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    const days = Math.floor(hours / 24);

    const TimeBlock = ({ value, label }) => (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: '1.2' }}>
        <span style={{ fontWeight: '700', fontSize: '1rem' }}>{String(value).padStart(2, '0')}</span>
        <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', opacity: 0.8 }}>{label}</span>
      </div>
    );

    const Separator = () => (
      <span style={{ fontWeight: '700', opacity: 0.5, margin: '0 2px', paddingBottom: '8px' }}>:</span>
    );

    if (days > 0) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <TimeBlock value={days} label="Ημ" />
          <Separator />
          <TimeBlock value={hours % 24} label="Ωρ" />
          <Separator />
          <TimeBlock value={mins} label="Λεπ" />
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <TimeBlock value={hours} label="Ωρ" />
        <Separator />
        <TimeBlock value={mins} label="Λεπ" />
      </div>
    );
  };

  const finished = match.status === 'FINISHED';
  const isLocked = (() => {
    const kickoff = new Date(match.kickoffTime).getTime();
    const lockTime = kickoff - 5 * 60000;
    return now > lockTime;
  })();

  return (
    <div className="match-status-wrapper" style={{
      color: finished ? 'var(--success)' : isLocked ? 'var(--danger)' : 'var(--countdown-color, #a5b4fc)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end'
    }}>
      {finished ? <span>ΟΛΟΚΛΗΡΩΘΗΚΕ</span> : getCountdownContent()}
    </div>
  );
}
