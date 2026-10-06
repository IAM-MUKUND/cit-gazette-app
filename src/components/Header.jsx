import React from 'react';
import { Calendar, Percent, RefreshCw, Key, Sun, Moon, Newspaper } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, onRefresh, loading, token, onOpenTokenModal, theme, onToggleTheme }) {
  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).toUpperCase();

  return (
    <header className="editorial-masthead">
      
      {/* Top Bar Metadata */}
      <div className="masthead-tagline">
        <span>CIT COIMBATORE</span>
        <span>{currentDateFormatted}</span>
        <span>VOL. IX • NO. 42</span>
      </div>

      {/* Main Gazette Header Title */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '12px', margin: '10px 0 18px 0' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%' }}>
          <Newspaper size={30} style={{ color: 'var(--ink-primary)', flexShrink: 0 }} />
          <h1 style={{ fontSize: 'clamp(1.3rem, 5vw, 2.3rem)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1, fontFamily: 'var(--font-title)' }}>
            The Daily Academic Gazette
          </h1>
        </div>
        
        <p style={{ fontFamily: 'var(--font-editorial)', fontStyle: 'italic', fontSize: 'clamp(0.85rem, 3vw, 1rem)', color: 'var(--ink-muted)', margin: 0, maxWidth: '600px' }}>
          Official Schedule Dispatch & Attendance Registry for Data Science
        </p>

        {/* Action Controls & E-Ink Theme Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', width: '100%', marginTop: '6px' }}>
          <button
            onClick={onToggleTheme}
            className="eink-pill"
            style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
            title="Toggle E-Ink Paper / Dark Slate Mode"
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            <span>{theme === 'dark' ? 'Paper Mode' : 'Dark Slate'}</span>
          </button>

          <button
            onClick={onRefresh}
            disabled={loading}
            className="eink-pill"
            style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
            title="Reload Portal Data"
          >
            <RefreshCw size={13} className={loading ? 'spin' : ''} />
            <span>Sync</span>
          </button>

          <button
            onClick={onOpenTokenModal}
            className="eink-pill"
            style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <Key size={13} />
            <span>Token</span>
          </button>
        </div>

      </div>

      {/* Navigation Tabs (Responsive Full Width on Mobile) */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', width: '100%', maxWidth: '500px', margin: '14px auto 0 auto' }}>
        <button
          onClick={() => setActiveTab('timetable')}
          style={{
            flex: 1,
            padding: '10px 12px',
            fontFamily: 'var(--font-mono)',
            fontSize: 'clamp(0.75rem, 3vw, 0.88rem)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: activeTab === 'timetable' ? 'var(--paper-card)' : 'var(--ink-primary)',
            background: activeTab === 'timetable' ? 'var(--ink-primary)' : 'transparent',
            border: '2px solid var(--border-ink)',
            borderRadius: '2px',
            boxShadow: activeTab === 'timetable' ? 'none' : 'var(--shadow-subtle)',
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <Calendar size={14} />
          <span>Timetable</span>
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          style={{
            flex: 1,
            padding: '10px 12px',
            fontFamily: 'var(--font-mono)',
            fontSize: 'clamp(0.75rem, 3vw, 0.88rem)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: activeTab === 'attendance' ? 'var(--paper-card)' : 'var(--ink-primary)',
            background: activeTab === 'attendance' ? 'var(--ink-primary)' : 'transparent',
            border: '2px solid var(--border-ink)',
            borderRadius: '2px',
            boxShadow: activeTab === 'attendance' ? 'none' : 'var(--shadow-subtle)',
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <Percent size={14} />
          <span>Attendance</span>
        </button>
      </div>

    </header>
  );
}
