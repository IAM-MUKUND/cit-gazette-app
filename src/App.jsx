import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Timetable from './components/Timetable';
import Attendance from './components/Attendance';
import TokenModal from './components/TokenModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('timetable');
  const [customToken, setCustomToken] = useState(null);
  const [attendanceList, setAttendanceList] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [theme, setTheme] = useState('paper'); // 'paper' or 'dark'

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'paper' ? 'dark' : 'paper');
  };

  useEffect(() => {
    fetch('/api/token')
      .then(res => res.json())
      .then(data => {
        if (data.token) {
          setCustomToken(data.token);
        }
      })
      .catch(err => console.warn('Could not fetch server default token:', err));
  }, []);

  const fetchAttendance = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = {};
      if (customToken) {
        headers['x-api-token'] = customToken;
      }

      const res = await fetch('/api/attendance', { headers });
      const json = await res.json();

      if (json && json.data) {
        setAttendanceList(json.data);

        const map = {};
        json.data.forEach(item => {
          if (item.subject_code) {
            map[item.subject_code] = item;
          }
        });
        setAttendanceMap(map);
      } else {
        setAttendanceList([]);
        setAttendanceMap({});
      }
    } catch (err) {
      console.error('Error fetching attendance:', err);
      setError('Could not load attendance percentage dataset.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [customToken]);

  const handleRefresh = () => {
    fetchAttendance();
  };

  return (
    <div className="app-container">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRefresh={handleRefresh}
        loading={loading}
        token={customToken}
        onOpenTokenModal={() => setIsTokenModalOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main>
        {activeTab === 'timetable' ? (
          <Timetable
            attendanceMap={attendanceMap}
            customToken={customToken}
          />
        ) : (
          <Attendance
            attendanceList={attendanceList}
            loading={loading}
            error={error}
          />
        )}
      </main>

      <footer style={{ marginTop: '50px', textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--ink-faded)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', borderTop: '1px solid var(--border-paper)', paddingTop: '20px' }}>
        <p>COIMBATORE INSTITUTE OF TECHNOLOGY</p>
      </footer>

      <TokenModal
        isOpen={isTokenModalOpen}
        onClose={() => setIsTokenModalOpen(false)}
        currentToken={customToken}
        onUpdateToken={(newToken) => setCustomToken(newToken)}
      />
    </div>
  );
}
