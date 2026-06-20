import React, { useState, useRef, useEffect } from 'react';
import { TrendingUp, Trophy, Flag as LucideFlag, ChevronDown } from 'lucide-react';
import { Flag, getTeamShortName } from '../Countries';
import { Avatar, AVATARS } from '../Avatars';

export default function HistoryChart({ 
  history, 
  totalUsers = 20,
  compareHistory,
  compareUserName,
  usersList,
  onCompareSelect,
  compareUserId,
  userAvatar,
  compareUserAvatar
}) {
  const [chartType, setChartType] = useState('rank'); // 'rank' or 'points'
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const selectedUser = usersList?.find(u => u.id === compareUserId);

  // Extract avatar colors
  const extractColor = (gradient) => {
    if (!gradient) return null;
    const match = gradient.match(/#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})/);
    return match ? match[0] : null;
  };

  const primaryAvatarData = AVATARS?.find(a => a.id === userAvatar);
  const compareAvatarData = AVATARS?.find(a => a.id === compareUserAvatar);

  let primaryColor = primaryAvatarData ? extractColor(primaryAvatarData.gradient) || '#6366f1' : '#6366f1';
  let compareColor = compareAvatarData ? extractColor(compareAvatarData.gradient) || '#10b981' : '#10b981';

  if (primaryColor === compareColor) {
    // If they have the exact same avatar color, tweak the compare color to differentiate
    compareColor = primaryColor.toLowerCase() === '#10b981' ? '#f43f5e' : '#10b981';
  }

  if (!history || history.length === 0) {
    return (
      <div className="glass-card" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', marginBottom: '32px' }}>
        <p>Η γραφική παράσταση θα εμφανιστεί μόλις ολοκληρωθεί ο πρώτος αγώνας!</p>
      </div>
    );
  }

  const chartHistory = history;

  const N = chartHistory.length;
  const paddingLeft = 52;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 35;
  const viewBoxWidth = 600;
  const viewBoxHeight = 255;

  const chartWidth = viewBoxWidth - paddingLeft - paddingRight;
  const chartHeight = viewBoxHeight - paddingTop - paddingBottom;

  // Calculate points min/max
  const allPoints = [
    ...chartHistory.map(h => h.points),
    ...(compareHistory || []).map(h => h.points)
  ];
  const maxPoints = Math.max(...allPoints, 10);
  const minPoints = 0;

  // Calculate rank min/max
  const rankValues = chartHistory.map(h => h.rank);
  const maxRank = Math.max(...rankValues, totalUsers);
  const minRank = 1;

  // Generate coordinates
  const points = chartHistory.map((item, idx) => {
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

  // Generate coordinates for comparison user
  const comparePoints = (compareHistory || []).map((item, idx) => {
    // We align them by index. If lengths differ, we still map to the same X.
    const x = paddingLeft + (idx * chartWidth) / Math.max(1, N - 1);
    let y = 0;
    if (chartType === 'points') {
      y = (paddingTop + chartHeight) - ((item.points - minPoints) * chartHeight) / Math.max(1, maxPoints - minPoints);
    } else {
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

  // Compare SVG Path description
  let comparePathD = '';
  if (comparePoints.length > 0) {
    comparePathD = `M ${comparePoints[0].x} ${comparePoints[0].y}`;
    for (let i = 1; i < comparePoints.length; i++) {
      comparePathD += ` L ${comparePoints[i].x} ${comparePoints[i].y}`;
    }
  }

  // Area path description for fill gradient (primary only)
  let areaD = '';
  if (points.length > 0) {
    areaD = `${pathD} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;
  }

  return (
    <div className="glass-card responsive-card-padding" style={{ padding: '28px', marginBottom: '32px', position: 'relative', overflow: 'visible' }}>
      <style>{`
        .chart-header-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .chart-controls-wrapper {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 8px;
        }
        .chart-filters-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .legend-row {
          display: flex;
          gap: 12px;
          font-size: 0.8rem;
          font-weight: 600;
        }
        .select-btn {
          min-width: 160px;
          padding: 6px 12px;
        }
        @media (max-width: 767px) {
          .chart-header-row {
            flex-direction: column;
            align-items: stretch;
          }
          .chart-controls-wrapper {
            align-items: stretch;
          }
          .chart-filters-row {
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 8px;
          }
          .select-btn {
            min-width: 0;
            width: 100%;
            padding: 6px 10px;
          }
          .legend-row {
            justify-content: center;
            margin-top: 4px;
          }
        }
      `}</style>
      <div className="chart-header-row">
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
          <TrendingUp size={18} style={{ color: 'var(--primary)' }} />
          <span>Πορεία στο Τουρνουά</span>
        </h3>

        {/* Legend and UI Controls */}
        <div className="chart-controls-wrapper">
          
          <div className="chart-filters-row">
            {/* Custom User Selector */}
            {usersList && usersList.length > 0 && (
              <div style={{ position: 'relative' }} ref={dropdownRef}>
                <button
                  className="select-btn"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'var(--table-header-bg, rgba(255,255,255,0.03))',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontFamily: 'var(--font-body)',
                    outline: 'none',
                    cursor: 'pointer',
                    justifyContent: 'space-between',
                    transition: 'background 0.2s'
                  }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--table-header-bg, rgba(255,255,255,0.08))'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'var(--table-header-bg, rgba(255,255,255,0.03))'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {selectedUser ? (
                    <>
                      <Avatar id={selectedUser.avatar} size={18} />
                      <span style={{ fontWeight: 600 }}>{selectedUser.username}</span>
                    </>
                  ) : (
                    <span>Σύγκριση με...</span>
                  )}
                </div>
                <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
              </button>

              {isDropdownOpen && (
                <div className="glass" style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '6px',
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 100,
                  maxHeight: '220px',
                  overflowY: 'auto',
                  minWidth: '180px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px'
                }}>
                  <div
                    onClick={() => { onCompareSelect(''); setIsDropdownOpen(false); }}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: !compareUserId ? 'var(--table-header-bg, rgba(255,255,255,0.05))' : 'transparent',
                      transition: 'background 0.1s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--table-header-bg, rgba(255,255,255,0.1))'}
                    onMouseLeave={(e) => e.currentTarget.style.background = !compareUserId ? 'var(--table-header-bg, rgba(255,255,255,0.05))' : 'transparent'}
                  >
                    Καμία σύγκριση
                  </div>
                  {usersList.map(u => (
                    <div
                      key={u.id}
                      onClick={() => { onCompareSelect(u.id); setIsDropdownOpen(false); }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: compareUserId === u.id ? 'var(--table-header-bg, rgba(255,255,255,0.05))' : 'transparent',
                        transition: 'background 0.1s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--table-header-bg, rgba(255,255,255,0.1))'}
                      onMouseLeave={(e) => e.currentTarget.style.background = compareUserId === u.id ? 'var(--table-header-bg, rgba(255,255,255,0.05))' : 'transparent'}
                    >
                      <Avatar id={u.avatar} size={24} />
                      <span style={{ fontWeight: compareUserId === u.id ? 700 : 500, color: 'var(--text-main)' }}>{u.username}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab Selector */}
          <div style={{
            display: 'flex',
            background: 'var(--table-header-bg, rgba(255,255,255,0.03))',
            padding: '4px',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            alignItems: 'center'
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

          {/* Legend */}
          {compareHistory && compareHistory.length > 0 && (
            <div className="legend-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '12px', height: '4px', background: primaryColor, borderRadius: '2px' }}></div>
                <span style={{ color: 'var(--text-main)' }}>Εσύ</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '12px', height: '4px', background: compareColor, borderRadius: '2px' }}></div>
                <span style={{ color: 'var(--text-muted)' }}>{compareUserName}</span>
              </div>
            </div>
          )}

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
              <stop offset="0%" stopColor={primaryColor} stopOpacity="0.4" />
              <stop offset="100%" stopColor={primaryColor} stopOpacity="0.0" />
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

          {/* Compare Line Path */}
          {comparePathD && (
            <path
              d={comparePathD}
              fill="none"
              stroke={compareColor}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                filter: `drop-shadow(0px 0px 4px ${compareColor}66)`
              }}
            />
          )}

          {/* Glowing Line Path (Primary) */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke={primaryColor}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                filter: `drop-shadow(0px 0px 4px ${primaryColor}66)`
              }}
            />
          )}

          {/* Compare Points Circles */}
          {comparePoints.map((pt, idx) => {
            const isHovered = hoveredPoint && hoveredPoint.index === idx;
            return (
              <circle
                key={`cmp-${idx}`}
                cx={pt.x}
                cy={pt.y}
                r={isHovered ? 6 : 3}
                fill={compareColor}
                stroke={isHovered ? '#ffffff' : 'var(--bg-main)'}
                strokeWidth={isHovered ? "2" : "1.5"}
                style={{ transition: 'all 0.15s', pointerEvents: 'none', filter: isHovered ? `drop-shadow(0 0 6px ${compareColor})` : 'none' }}
              />
            );
          })}

          {/* Interactive circles and hover targets */}
          {points.map((pt, idx) => {
            const isHovered = hoveredPoint && hoveredPoint.index === idx;
            return (
              <g key={idx}>
                {/* Data point circle */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 7 : 4}
                  fill={primaryColor}
                  stroke={isHovered ? '#ffffff' : 'var(--bg-main)'}
                  strokeWidth={isHovered ? "2.5" : "2"}
                  style={{ transition: 'all 0.15s', pointerEvents: 'none', filter: isHovered ? `drop-shadow(0 0 6px ${primaryColor})` : 'none' }}
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
                {(idx === 0) ? (
                  <svg x={pt.x - 9} y={paddingTop + chartHeight + 8} width="18" height="18">
                    <LucideFlag size={18} color="var(--text-muted)" />
                  </svg>
                ) : (idx === N - 1) ? (
                  <svg x={pt.x - 9} y={paddingTop + chartHeight + 8} width="18" height="18">
                    <Trophy size={18} color="#fbbf24" />
                  </svg>
                ) : (N <= 8) ? (
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
                ) : null}

                {/* Large transparent hover target for the whole column */}
                <rect
                  x={pt.x - chartWidth / Math.max(1, N - 1) / 2}
                  y={paddingTop - 10}
                  width={chartWidth / Math.max(1, N - 1)}
                  height={chartHeight + 20}
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
        {hoveredPoint && (() => {
          const primaryData = hoveredPoint.data;
          const compareData = comparePoints[hoveredPoint.index]?.data;

          const xRatio = hoveredPoint.x / viewBoxWidth;
          let translateX = '-50%';
          if (xRatio < 0.2) translateX = '-10%'; // Shift right if near left edge
          else if (xRatio > 0.8) translateX = '-90%'; // Shift left if near right edge

          return (
            <div style={{
              position: 'absolute',
              left: `${(hoveredPoint.x / viewBoxWidth) * 100}%`,
              top: `${(hoveredPoint.y / viewBoxHeight) * 100 - 10}%`,
              transform: `translate(${translateX}, -100%)`,
              background: 'var(--tooltip-bg, rgba(15, 16, 26, 0.95))',
              border: '1px solid var(--primary)',
              borderRadius: '8px',
              padding: '10px 14px',
              pointerEvents: 'none',
              zIndex: 100,
              minWidth: '200px',
              boxShadow: 'var(--shadow-lg), var(--shadow-glow)',
              backdropFilter: 'blur(10px)',
              color: 'var(--text-main)',
              transition: 'left 0.1s ease, top 0.1s ease'
            }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>
                {primaryData.matchStage === 'GROUP' ? 'ΦΑΣΗ ΟΜΙΛΩΝ' : 'ΝΟΚ-ΑΟΥΤ'}
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '10px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Flag teamName={primaryData.homeTeam} width={16} height={12} />
                <span>{getTeamShortName(primaryData.homeTeam)}</span>
                <span style={{ margin: '0 2px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>vs</span>
                <span>{getTeamShortName(primaryData.awayTeam)}</span>
                <Flag teamName={primaryData.awayTeam} width={16} height={12} />
              </div>

              {/* Data Table */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: primaryColor }}></div>
                    <span style={{ fontWeight: 600 }}>Εσύ</span>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', marginRight: '4px' }}>Θέση:</span>
                      <span style={{ fontWeight: 700, color: '#fbbf24' }}>#{primaryData.rank}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', marginRight: '4px' }}>Πόντοι:</span>
                      <span style={{ fontWeight: 700, color: '#06b6d4' }}>{primaryData.points}</span>
                    </div>
                  </div>
                </div>

                {compareData && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: compareColor }}></div>
                      <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{compareUserName}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <div>
                        <span style={{ color: 'var(--text-muted)', marginRight: '4px' }}>Θέση:</span>
                        <span style={{ fontWeight: 700, color: '#fbbf24' }}>#{compareData.rank}</span>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', marginRight: '4px' }}>Πόντοι:</span>
                        <span style={{ fontWeight: 700, color: compareColor }}>{compareData.points}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
