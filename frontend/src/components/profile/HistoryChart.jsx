import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { Flag, getTeamShortName } from '../Countries';

export default function HistoryChart({ history }) {
  const [chartType, setChartType] = useState('rank'); // 'rank' or 'points'
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!history || history.length === 0) {
    return (
      <div className="glass-card" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', marginBottom: '32px' }}>
        <p>Η γραφική παράσταση θα εμφανιστεί μόλις ολοκληρωθεί ο πρώτος αγώνας!</p>
      </div>
    );
  }

  const N = history.length;
  const paddingLeft = 52;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 35;
  const viewBoxWidth = 600;
  const viewBoxHeight = 255;

  const chartWidth = viewBoxWidth - paddingLeft - paddingRight;
  const chartHeight = viewBoxHeight - paddingTop - paddingBottom;

  // Calculate points min/max
  const pointsValues = history.map(h => h.points);
  const maxPoints = Math.max(...pointsValues, 10);
  const minPoints = 0;

  // Calculate rank min/max
  const rankValues = history.map(h => h.rank);
  const maxRank = Math.max(...rankValues, 10);
  const minRank = 1;

  // Generate coordinates
  const points = history.map((item, idx) => {
    const x = paddingLeft + (idx * chartWidth) / Math.max(1, N - 1);
    let y = 0;
    if (chartType === 'points') {
      y = (paddingTop + chartHeight) - ((item.points - minPoints) * chartHeight) / Math.max(1, maxPoints - minPoints);
    } else {
      // Inverted Y axis for ranks (1 is at top)
      y = paddingTop + ((item.rank - 1) * chartHeight) / Math.max(1, maxRank - 1);
    }
    return { x, y, data: item, index: idx };
  });

  // SVG Path description
  let pathD = '';
  if (points.length > 0) {
    pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      pathD += ` L ${points[i].x} ${points[i].y}`;
    }
  }

  // Area path description for fill gradient
  let areaD = '';
  if (points.length > 0) {
    areaD = `${pathD} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;
  }

  return (
    <div className="glass-card responsive-card-padding" style={{ padding: '28px', marginBottom: '32px', position: 'relative', overflow: 'visible' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={18} style={{ color: 'var(--primary)' }} />
          <span>Πορεία στο Τουρνουά</span>
        </h3>

        {/* Tab Selector */}
        <div style={{
          display: 'flex',
          background: 'var(--table-header-bg, rgba(255,255,255,0.03))',
          padding: '4px',
          borderRadius: '8px',
          border: '1px solid var(--border-color)'
        }}>
          <button
            onClick={() => { setChartType('rank'); setHoveredPoint(null); }}
            style={{
              padding: '6px 12px',
              fontSize: '0.8rem',
              fontWeight: 600,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              background: chartType === 'rank' ? 'var(--primary)' : 'transparent',
              color: chartType === 'rank' ? '#ffffff' : 'var(--text-muted)',
              transition: 'all 0.2s'
            }}
          >
            Κατάταξη
          </button>
          <button
            onClick={() => { setChartType('points'); setHoveredPoint(null); }}
            style={{
              padding: '6px 12px',
              fontSize: '0.8rem',
              fontWeight: 600,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              background: chartType === 'points' ? 'var(--primary)' : 'transparent',
              color: chartType === 'points' ? '#ffffff' : 'var(--text-muted)',
              transition: 'all 0.2s'
            }}
          >
            Πόντοι
          </button>
        </div>
      </div>

      <div style={{ position: 'relative', width: '100%', overflow: 'visible' }}>
        <svg viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
          <style>{`
            .chart-axis-text {
              font-size: 10px;
            }
            .chart-axis-text-x {
              font-size: 9px;
              font-weight: 500;
            }
            @media (max-width: 767px) {
              .chart-axis-text {
                font-size: 18px;
                font-weight: 700;
              }
              .chart-axis-text-x {
                font-size: 14px;
                font-weight: 600;
              }
            }
          `}</style>

          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="chartLineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--primary)" />
              <stop offset="100%" stopColor="var(--secondary)" />
            </linearGradient>
          </defs>

          {/* Grid lines (Y axis ticks) */}
          {(() => {
            const ticks = 4;
            const lines = [];
            for (let i = 0; i <= ticks; i++) {
              const y = paddingTop + (i * chartHeight) / ticks;
              let val = 0;
              if (chartType === 'points') {
                val = Math.round(maxPoints - (i * (maxPoints - minPoints)) / ticks);
              } else {
                val = Math.round(minRank + (i * (maxRank - minRank)) / ticks);
              }
              lines.push(
                <g key={i}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={viewBoxWidth - paddingRight}
                    y2={y}
                    stroke="var(--border-color, rgba(255,255,255,0.04))"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={paddingLeft - 10}
                    y={y + 4}
                    textAnchor="end"
                    fill="var(--text-muted)"
                    fontFamily="var(--font-body)"
                    className="chart-axis-text"
                  >
                    {chartType === 'rank' ? `#${val}` : val}
                  </text>
                </g>
              );
            }
            return lines;
          })()}

          {/* X axis line */}
          <line
            x1={paddingLeft}
            y1={paddingTop + chartHeight}
            x2={viewBoxWidth - paddingRight}
            y2={paddingTop + chartHeight}
            stroke="var(--border-color, rgba(255,255,255,0.1))"
          />

          {/* Filled Area */}
          {areaD && (
            <path
              d={areaD}
              fill="url(#chartGradient)"
            />
          )}

          {/* Glowing Line Path */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke="url(#chartLineGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                filter: 'drop-shadow(0px 0px 4px rgba(99, 102, 241, 0.4))'
              }}
            />
          )}

          {/* Interactive circles and hover targets */}
          {points.map((pt, idx) => {
            const isHovered = hoveredPoint && hoveredPoint.index === idx;
            return (
              <g key={idx}>
                {/* Data point circle */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 6 : 4}
                  fill={isHovered ? 'var(--text-main)' : 'var(--primary)'}
                  stroke="var(--bg-main)"
                  strokeWidth="2"
                  style={{ transition: 'r 0.15s, fill 0.15s' }}
                />

                {/* Vertical marker line on hover */}
                {isHovered && (
                  <line
                    x1={pt.x}
                    y1={paddingTop}
                    x2={pt.x}
                    y2={paddingTop + chartHeight}
                    stroke="rgba(99, 102, 241, 0.25)"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                )}

                {/* X axis labels (Match tags) */}
                {/* We only show a few labels to prevent overlap on small screens */}
                {(N <= 8 || idx === 0 || idx === N - 1 || idx === Math.floor(N / 2)) && (
                  <text
                    x={pt.x}
                    y={paddingTop + chartHeight + 20}
                    textAnchor="middle"
                    fill="var(--text-muted)"
                    fontFamily="var(--font-body)"
                    className="chart-axis-text-x"
                  >
                    {`${getTeamShortName(pt.data.homeTeam)}-${getTeamShortName(pt.data.awayTeam)}`}
                  </text>
                )}

                {/* Large transparent hover target */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="15"
                  fill="transparent"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredPoint(pt)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div style={{
            position: 'absolute',
            left: `${(hoveredPoint.x / viewBoxWidth) * 100}%`,
            top: `${(hoveredPoint.y / viewBoxHeight) * 100 - 10}%`,
            transform: 'translate(-50%, -100%)',
            background: 'var(--tooltip-bg, rgba(15, 16, 26, 0.95))',
            border: '1px solid var(--primary)',
            borderRadius: '8px',
            padding: '10px 14px',
            pointerEvents: 'none',
            zIndex: 100,
            minWidth: '160px',
            boxShadow: 'var(--shadow-lg), var(--shadow-glow)',
            backdropFilter: 'blur(10px)',
            color: 'var(--text-main)',
            transition: 'left 0.1s ease, top 0.1s ease'
          }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>
              {hoveredPoint.data.matchStage === 'GROUP' ? 'ΦΑΣΗ ΟΜΙΛΩΝ' : 'ΝΟΚ-ΑΟΥΤ'}
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '6px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Flag teamName={hoveredPoint.data.homeTeam} width={16} height={12} />
              <span>{getTeamShortName(hoveredPoint.data.homeTeam)}</span>
              <span style={{ margin: '0 2px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>vs</span>
              <span>{getTeamShortName(hoveredPoint.data.awayTeam)}</span>
              <Flag teamName={hoveredPoint.data.awayTeam} width={16} height={12} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '0.8rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Θέση:</span>{' '}
                <span style={{ fontWeight: 700, color: '#fbbf24' }}>#{hoveredPoint.data.rank}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Πόντοι:</span>{' '}
                <span style={{ fontWeight: 700, color: '#06b6d4' }}>{hoveredPoint.data.points}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
