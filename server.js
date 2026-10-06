import express from 'express';
import cors from 'cors';
import axios from 'axios';
import FormData from 'form-data';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
let DEFAULT_PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Store current token in memory (can be changed dynamically via UI)
let DEFAULT_API_TOKEN = 'DjwPheCM3Ab60hVifgGkMzs213Es9eGZg8j0/ozBff2h0ddBliIAt/p9o2mtUdbHiGX1xTFRUkedmf6JKaK8Ay8i3a/UJxIfDjgGyNbymK8BQV7ihGtHl124rZvBN8v8AblFXqPeToAkULAUEMki6t4OBy2FUvA8nnULVO5Z8fb1KR7Z2Cp+VFJOZTX8pLVpfHdYScRjw52vGm4bjqH7nrLIF95qkTdUrkDVCkW0/JFVIFLzwcx4AbC5ZGuMthDlVK4bMBl1CQOA26BZqDfylYu3Q0bf+6Jpeylhrt6DBLD11SKCuhPha7nXgx0Zu9cbvh+CuDhBIwHedgg8rhqVfGpsHBBPM6P/Bu5SzQ56Ps+FffvllxGqzdoiO28vWqsn6CbzRUnF7eAc2SgfgD40PQ2q0q/SXUzfH8ZhB0LeY7sKby8FOF69WvcaClv9pKOT5FWvgHUYvDDhxc3sIVXnjT5ABOvFE6Nc0EZAqA9tlCzhxIrz3NlucvjsvsHbT2dPnQM1TTZzj2AmpmQUIEv06XqOnTKDWGLlyCsd549yjge8jMcjkR/rXDC6npazbIyP1oXDsZQCDcbPpiY9Dtj0gg==';

// Helper headers for CIT Portal
const getHeaders = (customToken) => ({
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.6',
  'Api-Token': customToken || DEFAULT_API_TOKEN,
  'Connection': 'keep-alive',
  'Origin': 'https://portal.cit.edu.in',
  'Referer': 'https://portal.cit.edu.in/mob/',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'same-origin',
  'Sec-GPC': '1',
  'User-Agent': 'Mozilla/5.0 (Linux; Android 16; Pixel 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Mobile Safari/537.36',
  'X-Requested-With': 'XMLHttpRequest',
  'sec-ch-ua': '"Chromium";v="154", "Brave";v="154", "Not A(Brand";v="99"',
  'sec-ch-ua-mobile': '?1',
  'sec-ch-ua-platform': '"Android"'
});

// Mock timetable database generator for offline/token fallback
const getMockTimetable = (targetDateStr) => {
  const dateObj = new Date(targetDateStr || Date.now());
  const dayOfWeek = dateObj.getDay(); // 0: Sun, 1: Mon, 2: Tue, 3: Wed, 4: Thu, 5: Fri, 6: Sat

  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return {
      status: "1",
      message: "Success (Weekend - No Scheduled Classes)",
      data: [],
      date: targetDateStr,
      d: dayOfWeek
    };
  }

  const scheduleByDay = {
    1: [
      { hour_value: 1, subject_code: "21MDS91", subject_name: "Econometric Analysis", short_name: "EA", subject_type: "Theory", employee_name: "Smt S.Deivarani", room_name: "DS-301", block_name: "Science Block" },
      { hour_value: 2, subject_code: "21MDS92", subject_name: "Web Analytics", short_name: "WA", subject_type: "Theory", employee_name: "Dr D.Sudha Devi", room_name: "DS-301", block_name: "Science Block" },
      { hour_value: 3, subject_code: "21MDSE3", subject_name: "Computational Intelligence", short_name: "CI", subject_type: "Theory", employee_name: "Dr J.RATHIKA", room_name: "DS-301", block_name: "Science Block" },
      { hour_value: 4, subject_code: "21MDS93", subject_name: "Healthcare Analytics", short_name: "HA", subject_type: "Theory", employee_name: "Dr M.Marimuthu", room_name: "DS-301", block_name: "Science Block" },
      { hour_value: 5, subject_code: "22MDCEL11", subject_name: "AI SYSTEMS ENGINEERING LABORATORY", short_name: "AI LAB", subject_type: "Lab", employee_name: "Dr K. RAJARAJESHWARI", room_name: "CC-LAB 2", block_name: "IT Block" },
      { hour_value: 6, subject_code: "22MDCEL11", subject_name: "AI SYSTEMS ENGINEERING LABORATORY", short_name: "AI LAB", subject_type: "Lab", employee_name: "Dr K. RAJARAJESHWARI", room_name: "CC-LAB 2", block_name: "IT Block" },
      { hour_value: 7, subject_code: "TWM - DS", subject_name: "Tutor Ward Meeting", short_name: "TWM", subject_type: "Theory", employee_name: "Dr J.RATHIKA", room_name: "DS-301", block_name: "Science Block" }
    ],
    2: [
      { hour_value: 1, subject_code: "21MDS95", subject_name: "Web Analytics Laboratory", short_name: "WA Lab", subject_type: "Lab", employee_name: "Dr D.Sudha Devi", room_name: "CC-LAB 1", block_name: "IT Block" },
      { hour_value: 2, subject_code: "21MDS95", subject_name: "Web Analytics Laboratory", short_name: "WA Lab", subject_type: "Lab", employee_name: "Dr D.Sudha Devi", room_name: "CC-LAB 1", block_name: "IT Block" },
      { hour_value: 3, subject_code: "21MDS91", subject_name: "Econometric Analysis", short_name: "EA", subject_type: "Theory", employee_name: "Smt S.Deivarani", room_name: "DS-301", block_name: "Science Block" },
      { hour_value: 4, subject_code: "21MDS93", subject_name: "Healthcare Analytics", short_name: "HA", subject_type: "Theory", employee_name: "Dr M.Marimuthu", room_name: "DS-301", block_name: "Science Block" },
      { hour_value: 5, subject_code: "21MDSE3", subject_name: "Computational Intelligence", short_name: "CI", subject_type: "Theory", employee_name: "Dr J.RATHIKA", room_name: "DS-301", block_name: "Science Block" },
      { hour_value: 6, subject_code: "21MDSEL3", subject_name: "Computational Intelligence Laboratory", short_name: "CI Lab", subject_type: "Lab", employee_name: "Dr J.RATHIKA", room_name: "CC-LAB 3", block_name: "IT Block" },
      { hour_value: 7, subject_code: "21MDSEL3", subject_name: "Computational Intelligence Laboratory", short_name: "CI Lab", subject_type: "Lab", employee_name: "Dr J.RATHIKA", room_name: "CC-LAB 3", block_name: "IT Block" }
    ],
    3: [
      { hour_value: 1, subject_code: "21MDS94", subject_name: "Econometric Analysis Laboratory", short_name: "EA Lab", subject_type: "Lab", employee_name: "Dr K. RAJARAJESHWARI", room_name: "CC-LAB 2", block_name: "IT Block" },
      { hour_value: 2, subject_code: "21MDS94", subject_name: "Econometric Analysis Laboratory", short_name: "EA Lab", subject_type: "Lab", employee_name: "Dr M.Marimuthu", room_name: "CC-LAB 2", block_name: "IT Block" },
      { hour_value: 3, subject_code: "21MDS92", subject_name: "Web Analytics", short_name: "WA", subject_type: "Theory", employee_name: "Dr D.Sudha Devi", room_name: "DS-301", block_name: "Science Block" },
      { hour_value: 4, subject_code: "21MDS91", subject_name: "Econometric Analysis", short_name: "EA", subject_type: "Theory", employee_name: "Smt S.Deivarani", room_name: "DS-301", block_name: "Science Block" },
      { hour_value: 5, subject_code: "WELLNESS - 9 SEM DS", subject_name: "WELLNESS SESSION DS", short_name: "WELLNESS - DS", subject_type: "Theory", employee_name: "Mrs MAHALAKSHMI RAJAGOPAL", room_name: "AUDITORIUM", block_name: "Main Block" },
      { hour_value: 6, subject_code: "21MDSE3", subject_name: "Computational Intelligence", short_name: "CI", subject_type: "Theory", employee_name: "Dr J.RATHIKA", room_name: "DS-301", block_name: "Science Block" },
      { hour_value: 7, subject_code: "TWM - DS", subject_name: "Tutor Ward Meeting - DS", short_name: "TWM - DS", subject_type: "Theory", employee_name: "Dr J.RATHIKA", room_name: "DS-301", block_name: "Science Block" }
    ],
    4: [
      { hour_value: 1, subject_code: "21MDS93", subject_name: "Healthcare Analytics", short_name: "HA", subject_type: "Theory", employee_name: "Dr M.Marimuthu", room_name: "DS-301", block_name: "Science Block" },
      { hour_value: 2, subject_code: "21MDS91", subject_name: "Econometric Analysis", short_name: "EA", subject_type: "Theory", employee_name: "Smt S.Deivarani", room_name: "DS-301", block_name: "Science Block" },
      { hour_value: 3, subject_code: "21MDS95", subject_name: "Web Analytics Laboratory", short_name: "WA Lab", subject_type: "Lab", employee_name: "Dr D.Sudha Devi", room_name: "CC-LAB 1", block_name: "IT Block" },
      { hour_value: 4, subject_code: "21MDS95", subject_name: "Web Analytics Laboratory", short_name: "WA Lab", subject_type: "Lab", employee_name: "Dr D.Sudha Devi", room_name: "CC-LAB 1", block_name: "IT Block" },
      { hour_value: 5, subject_code: "22MDCEL11", subject_name: "AI SYSTEMS ENGINEERING LABORATORY", short_name: "AI LAB", subject_type: "Lab", employee_name: "Dr K. RAJARAJESHWARI", room_name: "CC-LAB 2", block_name: "IT Block" },
      { hour_value: 6, subject_code: "22MDCEL11", subject_name: "AI SYSTEMS ENGINEERING LABORATORY", short_name: "AI LAB", subject_type: "Lab", employee_name: "Dr K. RAJARAJESHWARI", room_name: "CC-LAB 2", block_name: "IT Block" },
      { hour_value: 7, subject_code: "ASSOCIATION - DS", subject_name: "ASSOCIATION - 9 SEM", short_name: "ASSOCIATION DS", subject_type: "Theory", employee_name: "Dr M.Marimuthu", room_name: "SEMINAR HALL 2", block_name: "Main Block" }
    ],
    5: [
      { hour_value: 1, subject_code: "21MDSE3", subject_name: "Computational Intelligence", short_name: "CI", subject_type: "Theory", employee_name: "Dr J.RATHIKA", room_name: "DS-301", block_name: "Science Block" },
      { hour_value: 2, subject_code: "21MDS93", subject_name: "Healthcare Analytics", short_name: "HA", subject_type: "Theory", employee_name: "Dr M.Marimuthu", room_name: "DS-301", block_name: "Science Block" },
      { hour_value: 3, subject_code: "21MDS92", subject_name: "Web Analytics", short_name: "WA", subject_type: "Theory", employee_name: "Dr D.Sudha Devi", room_name: "DS-301", block_name: "Science Block" },
      { hour_value: 4, subject_code: "21MDS94", subject_name: "Econometric Analysis Laboratory", short_name: "EA Lab", subject_type: "Lab", employee_name: "Dr K. RAJARAJESHWARI", room_name: "CC-LAB 2", block_name: "IT Block" },
      { hour_value: 5, subject_code: "21MDS94", subject_name: "Econometric Analysis Laboratory", short_name: "EA Lab", subject_type: "Lab", employee_name: "Dr K. RAJARAJESHWARI", room_name: "CC-LAB 2", block_name: "IT Block" },
      { hour_value: 6, subject_code: "21MDS91", subject_name: "Econometric Analysis", short_name: "EA", subject_type: "Theory", employee_name: "Smt S.Deivarani", room_name: "DS-301", block_name: "Science Block" },
      { hour_value: 7, subject_code: "21MDS92", subject_name: "Web Analytics", short_name: "WA", subject_type: "Theory", employee_name: "Dr D.Sudha Devi", room_name: "DS-301", block_name: "Science Block" }
    ]
  };

  const dayData = (scheduleByDay[dayOfWeek] || scheduleByDay[1]).map((item, idx) => ({
    id: 9000 + idx,
    idate: `${targetDateStr} 08:30:00`,
    coursetype: "msc",
    course: 6,
    academic_year: "2022-2027",
    college_year: "2026-2027",
    semester: 9,
    section: "a",
    day_value: dayOfWeek,
    coursename: "DATA SCIENCE",
    course_shortname: "M.Sc.-DS",
    degreename: "M.Sc.",
    department_name: "DATA SCIENCE",
    ...item
  }));

  return {
    status: "1",
    message: "Success",
    data: dayData,
    date: targetDateStr,
    d: dayOfWeek
  };
};

// Mock Attendance Data
const MOCK_ATTENDANCE = {
  status: "1",
  message: "Success",
  type: "subject_wise",
  data: [
    { student_uuid: "854c5c95-1729-444f-a7e1-9ef59254c13e", batch: "2022-2027", course_id: 6, academic_year: "2026-2027", semester: 9, subject_id: 2285, total_hours: 62, total_hours_present: 55, total_hours_od: 8, total_percentage: 88.71, total_od_percentage: 12.9, hours_per_day: 7, subject_uuid: "8ce1605a-c025-49f3-8e11-9624827483b3", subject_code: "21MDS94", subject_name: "Econometric Analysis Laboratory", subject_name_with_short_name: "Econometric Analysis Laboratory EA Lab", show_in_elective_attendance: 1 },
    { student_uuid: "854c5c95-1729-444f-a7e1-9ef59254c13e", batch: "2022-2027", course_id: 6, academic_year: "2026-2027", semester: 9, subject_id: 2280, total_hours: 56, total_hours_present: 49, total_hours_od: 5, total_percentage: 87.5, total_od_percentage: 8.93, hours_per_day: 7, subject_uuid: "a89edd56-d896-4e5f-8a30-23df68e98ea1", subject_code: "21MDS91", subject_name: "Econometric Analysis", subject_name_with_short_name: "Econometric Analysis EA", show_in_elective_attendance: 0 },
    { student_uuid: "854c5c95-1729-444f-a7e1-9ef59254c13e", batch: "2022-2027", course_id: 6, academic_year: "2026-2027", semester: 9, subject_id: 2287, total_hours: 9, total_hours_present: 9, total_hours_od: 0, total_percentage: 100, total_od_percentage: 0, hours_per_day: 7, subject_uuid: "39344a0d-7841-46b7-bd79-4ad0a2883778", subject_code: "21MDSEL3", subject_name: "Computational Intelligence Laboratory", subject_name_with_short_name: "Computational Intelligence Laboratory CI Lab", show_in_elective_attendance: 1 },
    { student_uuid: "854c5c95-1729-444f-a7e1-9ef59254c13e", batch: "2022-2027", course_id: 6, academic_year: "2026-2027", semester: 9, subject_id: 2282, total_hours: 59, total_hours_present: 51, total_hours_od: 6, total_percentage: 86.44, total_od_percentage: 10.17, hours_per_day: 7, subject_uuid: "0d2fe9c1-649b-420b-addb-404af66f32c5", subject_code: "21MDS93", subject_name: "Healthcare Analytics", subject_name_with_short_name: "Healthcare Analytics HA", show_in_elective_attendance: 0 },
    { student_uuid: "854c5c95-1729-444f-a7e1-9ef59254c13e", batch: "2022-2027", course_id: 6, academic_year: "2026-2027", semester: 9, subject_id: 2283, total_hours: 44, total_hours_present: 36, total_hours_od: 4, total_percentage: 81.82, total_od_percentage: 9.09, hours_per_day: 7, subject_uuid: "9e63043e-b7b4-46aa-bc5e-503fc187178c", subject_code: "21MDSE3", subject_name: "Computational Intelligence", subject_name_with_short_name: "Computational Intelligence CI", show_in_elective_attendance: 1 },
    { student_uuid: "854c5c95-1729-444f-a7e1-9ef59254c13e", batch: "2022-2027", course_id: 6, academic_year: "2026-2027", semester: 9, subject_id: 2294, total_hours: 19, total_hours_present: 15, total_hours_od: 0, total_percentage: 78.95, total_od_percentage: 0, hours_per_day: 7, subject_uuid: "6c7c0504-fc47-419a-9b5c-bc2803fcaade", subject_code: "TWM - DS", subject_name: "Tutor Ward Meeting - DS", subject_name_with_short_name: "Tutor Ward Meeting - DS TWM - DS", show_in_elective_attendance: 0 },
    { student_uuid: "854c5c95-1729-444f-a7e1-9ef59254c13e", batch: "2022-2027", course_id: 6, academic_year: "2026-2027", semester: 9, subject_id: 2281, total_hours: 53, total_hours_present: 50, total_hours_od: 4, total_percentage: 94.34, total_od_percentage: 7.55, hours_per_day: 7, subject_uuid: "012f479d-bcf0-4a2c-9a2b-946d6a73310a", subject_code: "21MDS92", subject_name: "Web Analytics", subject_name_with_short_name: "Web Analytics WA", show_in_elective_attendance: 0 },
    { student_uuid: "854c5c95-1729-444f-a7e1-9ef59254c13e", batch: "2022-2027", course_id: 6, academic_year: "2026-2027", semester: 9, subject_id: 2286, total_hours: 59, total_hours_present: 52, total_hours_od: 4, total_percentage: 88.14, total_od_percentage: 6.78, hours_per_day: 7, subject_uuid: "0ed9e660-a39f-4976-8e21-20d7c66b6975", subject_code: "21MDS95", subject_name: "Web Analytics Laboratory", subject_name_with_short_name: "Web Analytics Laboratory WA Lab", show_in_elective_attendance: 1 },
    { student_uuid: "854c5c95-1729-444f-a7e1-9ef59254c13e", batch: "2022-2027", course_id: 6, academic_year: "2026-2027", semester: 9, subject_id: 2296, total_hours: 18, total_hours_present: 12, total_hours_od: 0, total_percentage: 66.67, total_od_percentage: 0, hours_per_day: 7, subject_uuid: "e1594e36-3351-4ee6-a4d3-5b4894ec099e", subject_code: "ASSOCIATION - DS", subject_name: "ASSOCIATION - 9 SEM", subject_name_with_short_name: "ASSOCIATION - 9 SEM ASSOCIATION DS", show_in_elective_attendance: 0 },
    { student_uuid: "854c5c95-1729-444f-a7e1-9ef59254c13e", batch: "2022-2027", course_id: 6, academic_year: "2026-2027", semester: 9, subject_id: 2292, total_hours: 56, total_hours_present: 51, total_hours_od: 0, total_percentage: 91.07, total_od_percentage: 0, hours_per_day: 7, subject_uuid: "17ebb7c6-938d-49dc-97cc-deca6a7d0b85", subject_code: "22MDCEL11", subject_name: "AI SYSTEMS ENGINEERING LABORATORY - DS", subject_name_with_short_name: "AI SYSTEMS ENGINEERING LABORATORY - DS AI LAB - DS", show_in_elective_attendance: 1 }
  ]
};

// GET or POST /api/token
app.get('/api/token', (req, res) => {
  res.json({ token: DEFAULT_API_TOKEN });
});

app.post('/api/token', (req, res) => {
  if (req.body && req.body.token) {
    DEFAULT_API_TOKEN = req.body.token;
    return res.json({ success: true, message: 'API Token updated successfully!', token: DEFAULT_API_TOKEN });
  }
  res.status(400).json({ success: false, message: 'Invalid token provided.' });
});

// GET /api/timetable
app.get('/api/timetable', async (req, res) => {
  const targetDateStr = req.query.date || new Date().toISOString().split('T')[0];
  const customToken = req.headers['x-api-token'];

  const form = new FormData();
  form.append('type', 'today');
  form.append('format_2', '1');
  form.append('date', targetDateStr);

  try {
    const response = await axios.post(
      'https://portal.cit.edu.in/api/mob/stu/v2/timetable/my-time-table',
      form,
      {
        headers: {
          ...form.getHeaders(),
          ...getHeaders(customToken)
        },
        timeout: 8000
      }
    );

    if (response.data && response.data.status === "1") {
      return res.json(response.data);
    } else {
      return res.json(getMockTimetable(targetDateStr));
    }
  } catch (error) {
    return res.json(getMockTimetable(targetDateStr));
  }
});

// GET /api/attendance
app.get('/api/attendance', async (req, res) => {
  const customToken = req.headers['x-api-token'];

  try {
    const response = await axios.post(
      'https://portal.cit.edu.in/api/mob/stu/v2/timetable/att-percentage',
      {},
      {
        headers: {
          'Content-Length': 0,
          ...getHeaders(customToken)
        },
        timeout: 8000
      }
    );

    if (response.data && response.data.status === "1") {
      return res.json(response.data);
    } else {
      return res.json(MOCK_ATTENDANCE);
    }
  } catch (error) {
    return res.json(MOCK_ATTENDANCE);
  }
});

// Helper function to list all network IP addresses
function getLocalIpAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const k in interfaces) {
    for (const k2 of interfaces[k]) {
      if (k2.family === 'IPv4' && !k2.internal) {
        addresses.push(k2.address);
      }
    }
  }
  return addresses;
}

// Port listener helper with automatic fallback if port is in use
function listenOnPort(targetPort) {
  if (process.env.NODE_ENV !== 'production') {
    createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    }).then(vite => {
      app.use(vite.middlewares);
      startListening(targetPort);
    });
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
    startListening(targetPort);
  }
}

function startListening(portToTry) {
  const server = app.listen(portToTry, '0.0.0.0', () => {
    const ips = getLocalIpAddresses();
    console.log(`\n======================================================`);
    console.log(`🚀 CIT Portal Timetable & Attendance Web App is Live!`);
    console.log(`======================================================`);
    console.log(`📱 Local PC Access:    http://localhost:${portToTry}`);
    if (ips.length > 0) {
      console.log(`📱 iPhone 13 Wi-Fi URL: http://${ips[0]}:${portToTry}`);
      ips.slice(1).forEach(ip => {
        console.log(`   Alt Wi-Fi URL:     http://${ip}:${portToTry}`);
      });
    }
    console.log(`======================================================\n`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`⚠️  Port ${portToTry} is already in use. Retrying on port ${portToTry + 1}...`);
      startListening(portToTry + 1);
    } else {
      console.error('Server error:', err);
    }
  });
}

listenOnPort(DEFAULT_PORT);
