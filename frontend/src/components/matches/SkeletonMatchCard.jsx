import React from 'react';

export default function SkeletonMatchCard() {
  return (
    <div 
      className="glass-card skeleton-card animate-pulse" 
      style={{ padding: '0px', overflow: 'hidden', opacity: 0.7 }}
    >
      {/* Header Banner */}
      <div 
        style={{ 
          height: '40px', 
          background: 'var(--tab-container-bg, rgba(255, 255, 255, 0.02))', 
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          gap: '15px'
        }}
      >
        <div style={{ width: '60px', height: '16px', background: 'var(--border-color)', borderRadius: '4px' }}></div>
        <div style={{ width: '80px', height: '16px', background: 'var(--border-color)', borderRadius: '4px' }}></div>
      </div>

      {/* Body */}
      <div style={{ padding: '24px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: '1', minWidth: '280px', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'flex-end', flex: '1' }}>
            <div style={{ width: '100px', height: '20px', background: 'var(--border-color)', borderRadius: '4px' }}></div>
            <div style={{ width: '28px', height: '18px', background: 'var(--border-color)', borderRadius: '2px' }}></div>
          </div>

          <div style={{ width: '80px', height: '36px', background: 'var(--border-color)', borderRadius: '6px' }}></div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'flex-start', flex: '1' }}>
            <div style={{ width: '28px', height: '18px', background: 'var(--border-color)', borderRadius: '2px' }}></div>
            <div style={{ width: '100px', height: '20px', background: 'var(--border-color)', borderRadius: '4px' }}></div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', minWidth: '150px', justifyContent: 'flex-end' }}>
          <div style={{ width: '80px', height: '36px', background: 'var(--border-color)', borderRadius: '6px' }}></div>
          <div style={{ width: '80px', height: '36px', background: 'var(--border-color)', borderRadius: '6px' }}></div>
        </div>
      </div>
    </div>
  );
}
