import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, User, BookOpen, Sparkles, ArrowRight, CheckCircle2, FileText, AlertCircle } from 'lucide-react';

const PERIOD_TIMES = {
  1: { start: '08:45', end: '09:40', label: '08:45 - 09:40 AM' },
  2: { start: '09:40', end: '10:35', label: '09:40 - 10:35 AM' },
  3: { start: '10:50', end: '11:45', label: '10:50 - 11:45 AM' },
  4: { start: '11:45', end: '12:40', label: '11:45 AM - 12:40 PM' },
  5: { start: '01:40', end: '02:35', label: '01:40 - 02:35 PM' },
  6: { start: '02:35', end: '03:30', label: '02:35 - 03:30 PM' },
  7: { start: '03:30', end: '04:25', label: '03:30 - 04:25 PM' }
};

export default function Timetable({ attendanceMap, customToken }) {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const [timetableData, setTimetableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const getTomorrowStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const getDayAfterTomorrowStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  };

  const tomorrowStr = getTomorrowStr();
  const dayAfterStr = getDayAfterTomorrowStr();

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const fetchTimetable = async () => {
      try {
        const headers = {};
        if (customToken) {
          headers['x-api-token'] = customToken;
        }

        const res = await fetch(`/api/timetable?date=${selectedDate}`, { headers });
        const json = await res.json();

        if (isMounted) {
          if (json && json.data) {
            setTimetableData(json.data);
          } else {
            setTimetableData([]);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching timetable:', err);
        if (isMounted) {
          setError('Failed to load schedule.');
          setLoading(false);
        }
      }
    };

    fetchTimetable();
    return () => { isMounted = false; };
  }, [selectedDate, customToken]);

  const changeDateBy = (offset) => {
    const curr = new Date(selectedDate);
    curr.setDate(curr.getDate() + offset);
    setSelectedDate(curr.toISOString().split('T')[0]);
  };

  const formatDateLabel = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isToday = selectedDate === todayStr;
  const isTomorrow = selectedDate === tomorrowStr;

  const getCurrentActiveHour = () => {
    if (!isToday) return null;
    const now = new Date();
    const hours = now.getHours();
    const mins = now.getMinutes();
    const currentTimeVal = hours * 60 + mins;

    if (currentTimeVal >= 525 && currentTimeVal < 580) return 1;
    if (currentTimeVal >= 580 && currentTimeVal < 635) return 2;
    if (currentTimeVal >= 650 && currentTimeVal < 705) return 3;
    if (currentTimeVal >= 705 && currentTimeVal < 760) return 4;
    if (currentTimeVal >= 820 && currentTimeVal < 875) return 5;
    if (currentTimeVal >= 875 && currentTimeVal < 930) return 6;
    if (currentTimeVal >= 930 && currentTimeVal < 985) return 7;

    return null;
  };

  const currentActiveHour = getCurrentActiveHour();

  const groupedSchedule = timetableData.reduce((acc, item) => {
    const key = item.hour_value;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {});

  const hoursList = [1, 2, 3, 4, 5, 6, 7];

  return (
    <div style={{ marginTop: '10px', width: '100%', overflowX: 'hidden' }}>
      
      {/* Date Dispatch Control Panel */}
      <div className="eink-card" style={{ padding: '16px 14px', marginBottom: '20px', width: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
          
          {/* Quick Date Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', width: '100%' }}>
            <button
              onClick={() => setSelectedDate(todayStr)}
              style={{
                flex: '1 1 auto',
                padding: '7px 10px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: isToday ? 'var(--paper-card)' : 'var(--ink-primary)',
                background: isToday ? 'var(--ink-primary)' : 'var(--paper-card-alt)',
                border: '1.5px solid var(--border-ink)',
                borderRadius: '2px'
              }}
            >
              TODAY
            </button>

            <button
              onClick={() => setSelectedDate(tomorrowStr)}
              style={{
                flex: '1.5 1 auto',
                padding: '7px 10px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                color: isTomorrow ? 'var(--paper-card)' : 'var(--accent-amber)',
                background: isTomorrow ? 'var(--accent-amber)' : 'var(--accent-amber-bg)',
                border: '1.5px solid var(--accent-amber)',
                borderRadius: '2px'
              }}
            >
              <Sparkles size={13} />
              <span>TOMORROW (NEXT DAY)</span>
            </button>

            <button
              onClick={() => setSelectedDate(dayAfterStr)}
              style={{
                flex: '1 1 auto',
                padding: '7px 10px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: selectedDate === dayAfterStr ? 'var(--paper-card)' : 'var(--ink-muted)',
                background: selectedDate === dayAfterStr ? 'var(--ink-primary)' : 'transparent',
                border: '1.5px solid var(--border-paper)',
                borderRadius: '2px'
              }}
            >
              DAY AFTER
            </button>
          </div>

          {/* Date Picker & Navigators */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', width: '100%' }}>
            <button
              onClick={() => changeDateBy(-1)}
              className="eink-pill"
              style={{ padding: '6px 12px' }}
              title="Previous Day"
            >
              <ChevronLeft size={16} />
            </button>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
              style={{
                flex: 1,
                background: 'var(--paper-card)',
                border: '1.5px solid var(--border-ink)',
                borderRadius: '2px',
                padding: '6px 10px',
                color: 'var(--ink-primary)',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                fontSize: '0.82rem',
                outline: 'none',
                cursor: 'pointer',
                textAlign: 'center'
              }}
            />

            <button
              onClick={() => changeDateBy(1)}
              className="eink-pill"
              style={{ padding: '6px 12px' }}
              title="Next Day"
            >
              <ChevronRight size={16} />
            </button>
          </div>

        </div>

        {/* Selected Date Editorial Sub-Banner */}
        <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px dashed var(--border-ink)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              SCHEDULE EDITION:
            </span>
            <h2 style={{ fontSize: '1.15rem', fontFamily: 'var(--font-title)', fontWeight: 700, color: 'var(--ink-primary)', margin: '2px 0 0 0' }}>
              {formatDateLabel(selectedDate)}
            </h2>
          </div>

          <div>
            {isToday && (
              <span className="badge-eink badge-forest">
                <CheckCircle2 size={12} /> TODAY DISPATCH
              </span>
            )}
            {isTomorrow && (
              <span className="badge-eink badge-amber">
                <Sparkles size={12} /> NEXT DAY PREVIEW
              </span>
            )}
          </div>
        </div>

      </div>

      {/* Schedule Content */}
      {loading ? (
        <div className="eink-card" style={{ padding: '40px', textAlign: 'center' }}>
          <Clock size={32} className="spin" style={{ color: 'var(--ink-primary)', margin: '0 auto 12px auto' }} />
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--ink-muted)' }}>Reading Schedule Data...</p>
        </div>
      ) : error ? (
        <div className="eink-card" style={{ padding: '24px', textAlign: 'center', borderColor: 'var(--accent-stamp)' }}>
          <AlertCircle size={28} style={{ color: 'var(--accent-stamp)', margin: '0 auto 10px auto' }} />
          <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-stamp)', fontWeight: 700, fontSize: '0.85rem' }}>{error}</p>
        </div>
      ) : timetableData.length === 0 ? (
        <div className="eink-card" style={{ padding: '40px 16px', textAlign: 'center' }}>
          <FileText size={38} style={{ color: 'var(--ink-faded)', margin: '0 auto 14px auto' }} />
          <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-title)', color: 'var(--ink-primary)', marginBottom: '6px' }}>
            No Lectures Scheduled
          </h3>
          <p style={{ color: 'var(--ink-muted)', maxWidth: '380px', margin: '0 auto 16px auto', fontFamily: 'var(--font-editorial)', fontSize: '0.95rem' }}>
            No mandatory academic classes are registered for this day (Holiday / Weekend).
          </p>
          <button
            onClick={() => setSelectedDate(tomorrowStr)}
            className="eink-pill"
            style={{ padding: '8px 16px', fontSize: '0.78rem' }}
          >
            Check Tomorrow's Schedule <ArrowRight size={14} style={{ marginLeft: '4px', verticalAlign: 'middle' }} />
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
          {hoursList.map((hourNum) => {
            const periodItems = groupedSchedule[hourNum];
            if (!periodItems || periodItems.length === 0) return null;

            const periodTime = PERIOD_TIMES[hourNum] || { label: `Hour ${hourNum}` };
            const isActiveClass = currentActiveHour === hourNum;

            return (
              <div
                key={hourNum}
                className="eink-card"
                style={{
                  padding: '16px 14px',
                  background: isActiveClass ? 'var(--paper-card-alt)' : 'var(--paper-card)',
                  borderColor: isActiveClass ? 'var(--border-ink)' : 'var(--border-ink)',
                  width: '100%'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                  
                  {/* Period Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px dashed var(--border-paper)', paddingBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="badge-eink" style={{ fontSize: '0.75rem', background: 'var(--border-ink)', color: 'var(--paper-card)' }}>
                        HOUR 0{hourNum}
                      </span>
                      {isActiveClass && (
                        <span className="badge-eink badge-stamp">
                          ACTIVE NOW
                        </span>
                      )}
                    </div>

                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: 700, color: 'var(--ink-muted)' }}>
                      <Clock size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                      {periodTime.label}
                    </div>
                  </div>

                  {/* Subject Information */}
                  <div style={{ width: '100%' }}>
                    {periodItems.map((item, idx) => {
                      const attInfo = attendanceMap ? attendanceMap[item.subject_code] : null;

                      return (
                        <div key={idx} style={{ marginTop: idx > 0 ? '12px' : 0, paddingTop: idx > 0 ? '12px' : 0, borderTop: idx > 0 ? '1px dashed var(--border-paper)' : 'none' }}>
                          
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: '180px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-title)', fontWeight: 700, color: 'var(--ink-primary)', margin: 0, lineHeight: 1.25 }}>
                                  {item.subject_name}
                                </h3>
                                <span className={item.subject_type === 'Lab' ? 'badge-eink badge-amber' : 'badge-eink'} style={{ fontSize: '0.65rem' }}>
                                  <BookOpen size={11} /> {item.subject_type || 'Theory'}
                                </span>
                              </div>

                              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--ink-muted)', marginTop: '4px' }}>
                                Code: <strong style={{ color: 'var(--ink-primary)' }}>{item.subject_code}</strong> • Abbr: {item.short_name}
                              </p>
                            </div>

                            {/* Subject Attendance Badge */}
                            {attInfo && (
                              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                <span className={`badge-eink ${attInfo.total_percentage >= 85 ? 'badge-forest' : attInfo.total_percentage >= 75 ? 'badge-amber' : 'badge-stamp'}`} style={{ fontSize: '0.68rem' }}>
                                  {attInfo.total_percentage}%
                                </span>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ink-faded)', marginTop: '3px' }}>
                                  {attInfo.total_hours_present}/{attInfo.total_hours}h
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Faculty & Room Information */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginTop: '10px', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--ink-muted)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <User size={13} />
                              <span>{item.employee_name || 'Faculty Member'}</span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <MapPin size={13} />
                              <span>{item.room_name ? `${item.room_name} (${item.block_name || ''})` : 'Main Campus'}</span>
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
