import React, { useState, useEffect } from 'react';

export default function MatchCountdown({ match }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const getCountdownText = () => {
    const kickoff = new Date(match.kickoffTime).getTime();
    const diffMs = kickoff - now;
    if (diffMs < 0) return 'Σε εξέλιξη / Live';

    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 5) return 'Σέντρα σε λιγότερο από 5 λεπτά!';

    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `Σε ${days} ημ. ${hours % 24} ώρες ${mins} λεπτά`;
    }
    return `Σε ${hours} ώρες ${mins} λεπτά`;
  };

  const finished = match.status === 'FINISHED';
  const isLocked = (() => {
    const kickoff = new Date(match.kickoffTime).getTime();
    const lockTime = kickoff - 5 * 60000;
    return now > lockTime;
  })();

  return (
    <div className="match-status-wrapper" style={{
      color: finished ? 'var(--success)' : isLocked ? 'var(--danger)' : '#a5b4fc'
    }}>
      <span>{finished ? 'ΟΛΟΚΛΗΡΩΘΗΚΕ' : getCountdownText()}</span>
    </div>
  );
}
