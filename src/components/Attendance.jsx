import React, { useState } from 'react';
import { Percent, CheckCircle2, AlertTriangle, AlertCircle, Search, SlidersHorizontal, Calculator, Award, Sparkles, BookOpen } from 'lucide-react';

export default function Attendance({ attendanceList, loading, error }) {
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('lowest');
  const [targetCutoff, setTargetCutoff] = useState(75);

  const totalConducted = attendanceList.reduce((acc, s) => acc + (s.total_hours || 0), 0);
  const totalPresent = attendanceList.reduce((acc, s) => acc + (s.total_hours_present || 0), 0);
  const totalOD = attendanceList.reduce((acc, s) => acc + (s.total_hours_od || 0), 0);
  
  const overallAvg = totalConducted > 0 
    ? (((totalPresent + totalOD) / totalConducted) * 100).toFixed(2) 
    : '0.00';

  const filteredList = attendanceList.filter((item) => {
    const pct = item.total_percentage;
    
    if (filterType === 'critical' && pct >= 75) return false;
    if (filterType === 'warning' && (pct < 75 || pct >= 85)) return false;
    if (filterType === 'safe' && pct < 85) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCode = item.subject_code?.toLowerCase().includes(q);
      const matchName = item.subject_name?.toLowerCase().includes(q);
      return matchCode || matchName;
    }

    return true;
  });

  const sortedList = [...filteredList].sort((a, b) => {
    if (sortBy === 'lowest') return a.total_percentage - b.total_percentage;
    if (sortBy === 'highest') return b.total_percentage - a.total_percentage;
    if (sortBy === 'code') return a.subject_code.localeCompare(b.subject_code);
    return 0;
  });

  const criticalCount = attendanceList.filter(s => s.total_percentage < 75).length;
  const warningCount = attendanceList.filter(s => s.total_percentage >= 75 && s.total_percentage < 85).length;
  const safeCount = attendanceList.filter(s => s.total_percentage >= 85).length;

  const calculateBunkStatus = (subject, target) => {
    const total = subject.total_hours || 0;
    const present = (subject.total_hours_present || 0) + (subject.total_hours_od || 0);
    const currentPct = subject.total_percentage;
    const targetDecimal = target / 100;

    if (currentPct >= target) {
      const maxBunks = Math.floor((present - targetDecimal * total) / targetDecimal);
      return {
        status: 'safe',
        margin: Math.max(0, maxBunks),
        text: maxBunks > 0 
          ? `SAFE MARGIN: You can skip ${maxBunks} upcoming lecture${maxBunks > 1 ? 's' : ''}.` 
          : `MARGIN ALERT: At ${currentPct}%. Do not miss upcoming class!`
      };
    } else {
      const neededClasses = Math.ceil((targetDecimal * total - present) / (1 - targetDecimal));
      return {
        status: 'critical',
        needed: Math.max(1, neededClasses),
        text: `RECOVERY REQUIRED: Attend ${neededClasses} consecutive class${neededClasses > 1 ? 'es' : ''} for ${target}%.`
      };
    }
  };

  return (
    <div style={{ marginTop: '10px', width: '100%', overflowX: 'hidden' }}>
      
      {/* Editorial Overall Summary Ledger Card */}
      <div className="eink-card" style={{ padding: '20px 16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
          
          {/* Gauge & Main Stats Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
            
            {/* E-Ink Ink Circle Gauge */}
            <div style={{ position: 'relative', width: '110px', height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="110" height="110" viewBox="0 0 110 110">
                <circle cx="55" cy="55" r="46" stroke="var(--border-paper)" strokeWidth="4" fill="none" />
                <circle cx="55" cy="55" r="50" stroke="var(--border-paper)" strokeWidth="1" strokeDasharray="3 3" fill="none" opacity="0.6" />
                <circle
                  cx="55"
                  cy="55"
                  r="46"
                  stroke="var(--ink-primary)"
                  strokeWidth="5"
                  fill="none"
                  strokeDasharray={289}
                  strokeDashoffset={289 - (289 * Math.min(100, Number(overallAvg))) / 100}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.6s ease', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                />
              </svg>
              <div style={{ position: 'absolute', textAlign: 'center', width: '100%' }}>
                <div style={{ display: 'inline-flex', alignItems: 'baseline', justifyContent: 'center', gap: '1px' }}>
                  <span style={{ fontSize: '1.35rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--ink-primary)', lineHeight: 1 }}>
                    {overallAvg}
                  </span>
                  <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--ink-muted)' }}>
                    %
                  </span>
                </div>
                <div style={{ fontSize: '0.58rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--ink-faded)', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: '4px' }}>
                  OVERALL
                </div>
              </div>
            </div>

            {/* Attendance Title & Total Hours */}
            <div style={{ flex: 1, minWidth: '200px', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-title)', fontWeight: 700, color: 'var(--ink-primary)', margin: 0 }}>
                  Attendance Ledger
                </h2>
                {overallAvg >= 85 && (
                  <span className="badge-eink badge-forest" style={{ fontSize: '0.65rem' }}>
                    <Award size={11} /> SAFE STANDING
                  </span>
                )}
              </div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--ink-muted)', marginTop: '4px' }}>
                Total Hours Conducted: <strong style={{ color: 'var(--ink-primary)' }}>{totalConducted} hrs</strong>
              </p>
              <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                <span style={{ color: 'var(--accent-forest)', fontWeight: 700 }}>Present: {totalPresent} hrs</span>
                <span style={{ color: 'var(--accent-amber)', fontWeight: 700 }}>OD: {totalOD} hrs</span>
              </div>
            </div>

          </div>

          {/* Quick Filter Ledger Stamp Cards (Strict 3-Column Mobile Flex) */}
          <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
            
            <div
              onClick={() => setFilterType('safe')}
              style={{
                flex: 1,
                background: filterType === 'safe' ? 'var(--accent-forest-bg)' : 'var(--paper-card-alt)',
                border: filterType === 'safe' ? '2px solid var(--accent-forest)' : '1px solid var(--border-paper)',
                borderRadius: '4px',
                padding: '10px 4px',
                textAlign: 'center',
                cursor: 'pointer',
                boxSizing: 'border-box'
              }}
            >
              <CheckCircle2 size={16} style={{ color: 'var(--accent-forest)', margin: '0 auto 4px auto' }} />
              <div style={{ fontSize: '1.2rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--ink-primary)' }}>{safeCount}</div>
              <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)', textTransform: 'uppercase' }}>Safe (≥85%)</div>
            </div>

            <div
              onClick={() => setFilterType('warning')}
              style={{
                flex: 1,
                background: filterType === 'warning' ? 'var(--accent-amber-bg)' : 'var(--paper-card-alt)',
                border: filterType === 'warning' ? '2px solid var(--accent-amber)' : '1px solid var(--border-paper)',
                borderRadius: '4px',
                padding: '10px 4px',
                textAlign: 'center',
                cursor: 'pointer',
                boxSizing: 'border-box'
              }}
            >
              <AlertTriangle size={16} style={{ color: 'var(--accent-amber)', margin: '0 auto 4px auto' }} />
              <div style={{ fontSize: '1.2rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--ink-primary)' }}>{warningCount}</div>
              <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)', textTransform: 'uppercase' }}>Warn (75-84)</div>
            </div>

            <div
              onClick={() => setFilterType('critical')}
              style={{
                flex: 1,
                background: filterType === 'critical' ? 'var(--accent-stamp-bg)' : 'var(--paper-card-alt)',
                border: filterType === 'critical' ? '2px solid var(--accent-stamp)' : '1px solid var(--border-paper)',
                borderRadius: '4px',
                padding: '10px 4px',
                textAlign: 'center',
                cursor: 'pointer',
                boxSizing: 'border-box'
              }}
            >
              <AlertCircle size={16} style={{ color: 'var(--accent-stamp)', margin: '0 auto 4px auto' }} />
              <div style={{ fontSize: '1.2rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--ink-primary)' }}>{criticalCount}</div>
              <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)', textTransform: 'uppercase' }}>Crit (&lt;75%)</div>
            </div>

          </div>

        </div>
      </div>

      {/* Filter Toolbar & Bunk Simulator */}
      <div className="eink-card" style={{ padding: '16px 14px', marginBottom: '20px', width: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
          
          {/* Status Filter Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', width: '100%' }}>
            <button
              onClick={() => setFilterType('all')}
              className="eink-pill"
              style={{
                flex: '1 1 auto',
                padding: '6px 10px',
                background: filterType === 'all' ? 'var(--ink-primary)' : 'transparent',
                color: filterType === 'all' ? 'var(--paper-card)' : 'var(--ink-primary)'
              }}
            >
              All ({attendanceList.length})
            </button>
            <button
              onClick={() => setFilterType('critical')}
              className="eink-pill"
              style={{
                flex: '1 1 auto',
                padding: '6px 10px',
                background: filterType === 'critical' ? 'var(--accent-stamp)' : 'transparent',
                color: filterType === 'critical' ? '#FFFFFF' : 'var(--accent-stamp)',
                borderColor: 'var(--accent-stamp)'
              }}
            >
              Critical ({criticalCount})
            </button>
            <button
              onClick={() => setFilterType('warning')}
              className="eink-pill"
              style={{
                flex: '1 1 auto',
                padding: '6px 10px',
                background: filterType === 'warning' ? 'var(--accent-amber)' : 'transparent',
                color: filterType === 'warning' ? '#FFFFFF' : 'var(--accent-amber)',
                borderColor: 'var(--accent-amber)'
              }}
            >
              Warn ({warningCount})
            </button>
            <button
              onClick={() => setFilterType('safe')}
              className="eink-pill"
              style={{
                flex: '1 1 auto',
                padding: '6px 10px',
                background: filterType === 'safe' ? 'var(--accent-forest)' : 'transparent',
                color: filterType === 'safe' ? '#FFFFFF' : 'var(--accent-forest)',
                borderColor: 'var(--accent-forest)'
              }}
            >
              Safe ({safeCount})
            </button>
          </div>

          {/* Target Cutoff Selector */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--ink-muted)' }}>
              <Calculator size={13} />
              <span>Target Cutoff:</span>
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[75, 80, 85].map((val) => (
                <button
                  key={val}
                  onClick={() => setTargetCutoff(val)}
                  style={{
                    padding: '4px 10px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: targetCutoff === val ? 'var(--paper-card)' : 'var(--ink-primary)',
                    background: targetCutoff === val ? 'var(--ink-primary)' : 'var(--paper-card-alt)',
                    border: '1px solid var(--border-ink)',
                    borderRadius: '2px'
                  }}
                >
                  {val}%
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Search & Sort Input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '14px', paddingTop: '12px', borderTop: '1px dashed var(--border-paper)', width: '100%' }}>
          
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-faded)' }} />
            <input
              type="text"
              placeholder="Search code or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--paper-card)',
                border: '1.5px solid var(--border-ink)',
                borderRadius: '2px',
                padding: '8px 10px 8px 30px',
                color: 'var(--ink-primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%' }}>
            <SlidersHorizontal size={13} style={{ color: 'var(--ink-muted)', flexShrink: 0 }} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                flex: 1,
                width: '100%',
                background: 'var(--paper-card)',
                border: '1.5px solid var(--border-ink)',
                borderRadius: '2px',
                padding: '6px 10px',
                color: 'var(--ink-primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="lowest">Lowest Attendance First</option>
              <option value="highest">Highest Attendance First</option>
              <option value="code">Subject Code (A-Z)</option>
            </select>
          </div>

        </div>

      </div>

      {/* Subject Cards Grid */}
      {loading ? (
        <div className="eink-card" style={{ padding: '40px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink-muted)' }}>Loading attendance ledger...</p>
        </div>
      ) : sortedList.length === 0 ? (
        <div className="eink-card" style={{ padding: '40px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-editorial)', color: 'var(--ink-muted)' }}>No subjects match query.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', width: '100%' }}>
          {sortedList.map((subject, idx) => {
            const pct = subject.total_percentage;
            const bunkCalc = calculateBunkStatus(subject, targetCutoff);

            return (
              <div
                key={subject.subject_id || idx}
                className="eink-card"
                style={{
                  padding: '18px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  gap: '14px',
                  width: '100%'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                    <div>
                      <span className="badge-eink" style={{ marginBottom: '4px' }}>
                        {subject.subject_code}
                      </span>
                      <h3 style={{ fontSize: '1.05rem', fontFamily: 'var(--font-title)', fontWeight: 700, color: 'var(--ink-primary)', margin: '4px 0 0 0', lineHeight: 1.25 }}>
                        {subject.subject_name}
                      </h3>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span style={{ fontSize: '1.45rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--ink-primary)' }}>
                        {pct}%
                      </span>
                    </div>
                  </div>

                  {/* E-Ink Progress Bar */}
                  <div style={{ marginTop: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--ink-muted)', marginBottom: '5px' }}>
                      <span>Attended: {subject.total_hours_present} / {subject.total_hours} hrs</span>
                      <span>Target: {targetCutoff}%</span>
                    </div>
                    <div className="eink-progress-bg">
                      <div
                        className="eink-progress-fill"
                        style={{
                          width: `${Math.min(100, pct)}%`
                        }}
                      />
                    </div>
                  </div>

                  {/* Attendance Details Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginTop: '12px', background: 'var(--paper-card-alt)', padding: '8px', border: '1px solid var(--border-paper)', borderRadius: '2px', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', textAlign: 'center' }}>
                    <div>
                      <div style={{ color: 'var(--ink-faded)' }}>Present</div>
                      <div style={{ fontWeight: 700, color: 'var(--accent-forest)' }}>{subject.total_hours_present}h</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--ink-faded)' }}>OD</div>
                      <div style={{ fontWeight: 700, color: 'var(--accent-amber)' }}>{subject.total_hours_od}h</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--ink-faded)' }}>Absent</div>
                      <div style={{ fontWeight: 700, color: 'var(--accent-stamp)' }}>{subject.total_hours - subject.total_hours_present - subject.total_hours_od}h</div>
                    </div>
                  </div>
                </div>

                {/* Bunk Simulator Banner */}
                <div
                  className={`badge-eink ${bunkCalc.status === 'safe' ? 'badge-forest' : 'badge-stamp'}`}
                  style={{
                    padding: '8px 10px',
                    fontSize: '0.72rem',
                    width: '100%',
                    justifyContent: 'flex-start',
                    boxSizing: 'border-box'
                  }}
                >
                  <Sparkles size={13} style={{ flexShrink: 0 }} />
                  <span style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>{bunkCalc.text}</span>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
