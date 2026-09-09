import React, { useState } from 'react';
import {
  BookOpen,
  CalendarCheck,
  FileSpreadsheet,
  Clock,
  Check,
  Save,
  Send,
  Calendar,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import StatCard from './StatCard';
import DataTable from './DataTable';
import Modal from './Modal';
import '../css/AdminDashboard.css';
import '../css/TeacherDashboard.css';

const TeacherDashboard = ({ currentUser, onRoleChange }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedClass, setSelectedClass] = useState('CS101');
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [announcementText, setAnnouncementText] = useState('');

  // View mode: 'sheet' (current lecture) or 'matrix' (all lectures comparative)
  const [attendanceViewMode, setAttendanceViewMode] = useState('sheet');

  // Academic Lectures for Today
  const lectures = [
    {
      id: 'LEC-1',
      period: 'Lecture 1',
      time: '09:00 - 10:30 AM',
      room: 'Hall 302',
      subject: 'CS101: Systems Architecture & Pipeline',
      type: 'Theory Lecture',
      status: 'Completed'
    },
    {
      id: 'LEC-2',
      period: 'Lecture 2',
      time: '11:00 AM - 12:30 PM',
      room: 'Lab 2A',
      subject: 'CS101: Cache Simulation Practicum',
      type: 'Hands-on Lab',
      status: 'In Session'
    },
    {
      id: 'LEC-3',
      period: 'Lecture 3',
      time: '01:30 - 03:00 PM',
      room: 'Hall 105',
      subject: 'CS302: Microservices & Event Bus',
      type: 'Seminar',
      status: 'Upcoming'
    },
    {
      id: 'LEC-4',
      period: 'Lecture 4',
      time: '03:15 - 04:45 PM',
      room: 'Lab 4B',
      subject: 'DS204: Machine Learning Weights',
      type: 'Laboratory',
      status: 'Upcoming'
    },
  ];

  const [selectedLectureId, setSelectedLectureId] = useState('LEC-2');

  // Class list
  const classes = [
    { code: 'CS101', name: 'Computer Systems & Architecture', count: 42 },
    { code: 'DS204', name: 'Machine Learning Fundamentals', count: 38 },
    { code: 'CS302', name: 'Web Engineering & Microservices', count: 44 },
    { code: 'IT410', name: 'Cloud Infrastructure Lab', count: 32 },
  ];

  // Enrolled Students Roster
  const students = [
    { id: 'STU-101', name: 'Aiden Vance', roll: '22CS01' },
    { id: 'STU-102', name: 'Bella Martinez', roll: '22CS02' },
    { id: 'STU-103', name: 'Caleb Murphy', roll: '22CS03' },
    { id: 'STU-104', name: 'Diana Prince', roll: '22CS04' },
    { id: 'STU-105', name: 'Ethan Hunt', roll: '22CS05' },
    { id: 'STU-106', name: 'Fiona Gallagher', roll: '22CS06' },
  ];

  // Independent Attendance records per lecture
  // Notice: Ethan Hunt was present in LEC-1, but absent in LEC-2 and LEC-3!
  const [attendanceByLecture, setAttendanceByLecture] = useState({
    'LEC-1': {
      'STU-101': 'present',
      'STU-102': 'present',
      'STU-103': 'present',
      'STU-104': 'present',
      'STU-105': 'present', // Attended Lecture 1
      'STU-106': 'late',
    },
    'LEC-2': {
      'STU-101': 'present',
      'STU-102': 'present',
      'STU-103': 'late',
      'STU-104': 'present',
      'STU-105': 'absent', // Skipped Lecture 2!
      'STU-106': 'present',
    },
    'LEC-3': {
      'STU-101': 'present',
      'STU-102': 'late',
      'STU-103': 'present',
      'STU-104': 'present',
      'STU-105': 'absent', // Skipped Lecture 3!
      'STU-106': 'present',
    },
    'LEC-4': {
      'STU-101': 'present',
      'STU-102': 'present',
      'STU-103': 'absent',
      'STU-104': 'present',
      'STU-105': 'present',
      'STU-106': 'present',
    },
  });

  // Grading Queue
  const [gradingQueue, setGradingQueue] = useState([
    { id: 'SUB-1', student: 'Bella Martinez', assignment: 'Lab 3: Cache Memory Simulation', date: 'Today, 08:30 AM', score: '95', status: 'Graded' },
    { id: 'SUB-2', student: 'Aiden Vance', assignment: 'Lab 3: Cache Memory Simulation', date: 'Yesterday, 11:20 PM', score: '88', status: 'Graded' },
    { id: 'SUB-3', student: 'Diana Prince', assignment: 'Lab 3: Cache Memory Simulation', date: 'Yesterday, 04:15 PM', score: '', status: 'Pending Review' },
    { id: 'SUB-4', student: 'Ethan Hunt', assignment: 'Lab 3: Cache Memory Simulation', date: 'Oct 12, 02:00 PM', score: '', status: 'Pending Review' },
  ]);

  // Timetable for today
  const todayLectures = [
    { time: '09:00 AM', room: 'Hall 302', title: 'CS101: Systems Architecture (LEC-1)', status: 'Completed' },
    { time: '11:00 AM', room: 'Lab 2A', title: 'CS101: Cache Simulation Lab (LEC-2)', status: 'In Session' },
    { time: '01:30 PM', room: 'Hall 105', title: 'CS302: Microservices Seminar (LEC-3)', status: 'Upcoming' },
    { time: '03:15 PM', room: 'Lab 4B', title: 'DS204: ML Practicum (LEC-4)', status: 'Upcoming' },
  ];

  const currentLecture = lectures.find(l => l.id === selectedLectureId) || lectures[0];
  const currentLectureAttendance = attendanceByLecture[selectedLectureId] || {};

  // Update status for a specific lecture and student
  const handleStatusChange = (lectureId, studentId, newStatus) => {
    setAttendanceByLecture(prev => ({
      ...prev,
      [lectureId]: {
        ...prev[lectureId],
        [studentId]: newStatus
      }
    }));
  };

  // Cycle status for cross-lecture matrix clicking
  const handleCycleStatus = (lectureId, studentId) => {
    const current = attendanceByLecture[lectureId]?.[studentId] || 'absent';
    const nextStatus = current === 'present' ? 'late' : current === 'late' ? 'absent' : 'present';
    handleStatusChange(lectureId, studentId, nextStatus);
  };

  // Batch mark all in lecture
  const handleMarkAllInLecture = (status) => {
    setAttendanceByLecture(prev => {
      const updated = { ...prev[selectedLectureId] };
      students.forEach(s => {
        updated[s.id] = status;
      });
      return {
        ...prev,
        [selectedLectureId]: updated
      };
    });
  };

  const handleSaveAttendance = () => {
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 3000);
  };

  const handleScoreChange = (subId, val) => {
    setGradingQueue(gradingQueue.map(item => 
      item.id === subId ? { ...item, score: val, status: val ? 'Graded' : 'Pending Review' } : item
    ));
  };

  // Compute metrics for active lecture
  const activePresentCount = students.filter(s => currentLectureAttendance[s.id] === 'present').length;
  const activeLateCount = students.filter(s => currentLectureAttendance[s.id] === 'late').length;
  const activeAbsentCount = students.filter(s => currentLectureAttendance[s.id] === 'absent').length;
  const activeRate = Math.round(((activePresentCount + activeLateCount) / students.length) * 100);

  // Overall attendance across all lectures today
  let totalOpportunities = 0;
  let totalAttended = 0;
  lectures.forEach(l => {
    const att = attendanceByLecture[l.id] || {};
    students.forEach(s => {
      totalOpportunities++;
      if (att[s.id] === 'present' || att[s.id] === 'late') {
        totalAttended++;
      }
    });
  });
  const overallTodayRate = Math.round((totalAttended / (totalOpportunities || 1)) * 100);

  // Columns for the single lecture sheet
  const attendanceColumns = [
    { header: 'Roll No', accessor: 'roll', width: '120px' },
    { header: 'Student Name', accessor: 'name' },
    {
      header: `Status for ${currentLecture.period}`,
      render: (row) => {
        const currentStatus = currentLectureAttendance[row.id] || 'present';
        return (
          <div className="attendance-status-group">
            <button
              type="button"
              className={`attendance-toggle-btn present ${currentStatus === 'present' ? 'active' : ''}`}
              onClick={() => handleStatusChange(selectedLectureId, row.id, 'present')}
            >
              Present
            </button>
            <button
              type="button"
              className={`attendance-toggle-btn late ${currentStatus === 'late' ? 'active' : ''}`}
              onClick={() => handleStatusChange(selectedLectureId, row.id, 'late')}
            >
              Late
            </button>
            <button
              type="button"
              className={`attendance-toggle-btn absent ${currentStatus === 'absent' ? 'active' : ''}`}
              onClick={() => handleStatusChange(selectedLectureId, row.id, 'absent')}
            >
              Absent
            </button>
          </div>
        );
      }
    },
    {
      header: 'Session Indicator',
      render: (row) => {
        const currentStatus = currentLectureAttendance[row.id] || 'present';
        return (
          <span className={`badge ${
            currentStatus === 'present' ? 'badge-success' : 
            currentStatus === 'late' ? 'badge-warning' : 'badge-danger'
          }`}>
            {currentStatus}
          </span>
        );
      }
    }
  ];

  const gradingColumns = [
    { header: 'Student', accessor: 'student' },
    { header: 'Assignment Task', accessor: 'assignment' },
    { header: 'Submitted At', accessor: 'date' },
    {
      header: 'Score / 100',
      render: (row) => (
        <input
          type="number"
          min="0"
          max="100"
          placeholder="Score"
          value={row.score}
          onChange={(e) => handleScoreChange(row.id, e.target.value)}
          className="score-input"
        />
      )
    },
    {
      header: 'Status',
      render: (row) => (
        <span className={`badge ${row.status === 'Graded' ? 'badge-success' : 'badge-warning'}`}>
          {row.status}
        </span>
      )
    }
  ];

  return (
    <div data-style="neo-brutalism">
      <Navbar
        toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentRole="teacher"
        onRoleChange={onRoleChange}
        currentUser={currentUser}
      />

      <div className="dashboard-layout">
        <Sidebar
          isCollapsed={sidebarCollapsed}
          currentRole="teacher"
          activeTab={activeTab}
          onTabSelect={(tab) => setActiveTab(tab)}
        />

        <main className="dashboard-main">
          <div className="dashboard-header">
            <div className="dashboard-header-title">
              <h1>⚡ Faculty Instruction & Grading Desk</h1>
              <p>Neo-Brutalist Academic Studio • Lecture-Wise Attendance & Evaluation</p>
            </div>

            <div className="dashboard-header-actions">
              <button 
                className="btn btn-primary"
                onClick={() => setIsAnnouncementModalOpen(true)}
              >
                <Send size={16} /> Broadcast Announcement
              </button>
            </div>
          </div>

          {/* KPI Stat Cards */}
          <div className="dashboard-stats-grid">
            <StatCard
              title="Today's Lecture"
              value={currentLecture.period}
              subtitle={`${currentLecture.time} • ${currentLecture.room}`}
              icon={Clock}
              colorScheme="cyan"
              trend={currentLecture.status}
              trendType="neutral"
            />
            <StatCard
              title={`${currentLecture.period} Attendance`}
              value={`${activeRate}%`}
              subtitle={`${activePresentCount} Present, ${activeAbsentCount} Absent`}
              icon={CalendarCheck}
              colorScheme="emerald"
              trend={activeAbsentCount > 0 ? `${activeAbsentCount} flagged` : 'All attended'}
              trendType={activeAbsentCount > 0 ? 'down' : 'up'}
            />
            <StatCard
              title="Daily Aggregate"
              value={`${overallTodayRate}%`}
              subtitle="Cumulative across 4 lectures"
              icon={BookOpen}
              colorScheme="indigo"
              trend="4 Sessions"
              trendType="neutral"
            />
            <StatCard
              title="Pending Submissions"
              value={gradingQueue.filter(g => g.status === 'Pending Review').length}
              subtitle="Requires Grading & Feedback"
              icon={FileSpreadsheet}
              colorScheme="amber"
              trend="Due this week"
              trendType="down"
            />
          </div>

          {/* Class Switcher Selector */}
          <div className="class-selector-bar">
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4, fontFamily: 'var(--font-heading)', letterSpacing: '0.05em' }}>
                ACTIVE COURSE SUBJECT
              </span>
              <div className="class-chips-group">
                {classes.map((cls) => (
                  <button
                    key={cls.code}
                    className={`class-chip ${selectedClass === cls.code ? 'active' : ''}`}
                    onClick={() => setSelectedClass(cls.code)}
                  >
                    {cls.code}: {cls.name} ({cls.count})
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              {showSaveToast && (
                <span style={{ color: 'var(--success)', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Check size={16} /> Lecture Records Synced!
                </span>
              )}
              <button className="btn btn-secondary btn-sm" onClick={handleSaveAttendance}>
                <Save size={15} /> Save Attendance
              </button>
            </div>
          </div>

          {/* LECTURE-WISE ATTENDANCE SECTION */}
          <div className="lecture-nav-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Layers size={20} /> Academic Lecture Selector
                </h2>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Attendance is strictly tracked per period. Students present in Period 1 may be absent in Period 2.
                </p>
              </div>

              {/* Toggle Sheet vs Matrix */}
              <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-surface)', padding: 3, borderRadius: 'var(--radius-xs)', border: '1px solid var(--border)' }}>
                <button
                  type="button"
                  className={`btn btn-sm ${attendanceViewMode === 'sheet' ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setAttendanceViewMode('sheet')}
                >
                  Current Period Sheet
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${attendanceViewMode === 'matrix' ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setAttendanceViewMode('matrix')}
                >
                  Cross-Lecture Matrix
                </button>
              </div>
            </div>

            {/* 4 Lecture Tabs */}
            <div className="lecture-tabs-row">
              {lectures.map((lec) => {
                const att = attendanceByLecture[lec.id] || {};
                const pres = students.filter(s => att[s.id] === 'present').length;
                const abs = students.filter(s => att[s.id] === 'absent').length;
                const isSelected = selectedLectureId === lec.id;

                return (
                  <button
                    key={lec.id}
                    type="button"
                    className={`lecture-tab-btn ${isSelected ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedLectureId(lec.id);
                      setAttendanceViewMode('sheet');
                    }}
                  >
                    <div className="lecture-tab-top">
                      <span className="lecture-pill">{lec.period}</span>
                      <span className="lecture-tab-status">{lec.status}</span>
                    </div>
                    <div className="lecture-tab-title">{lec.subject}</div>
                    <div className="lecture-tab-meta">
                      <span>{lec.time}</span>
                      <span>{lec.room}</span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border-subtle)', paddingTop: 4, marginTop: 4 }}>
                      <span>Attendance:</span>
                      <strong>{pres}/{students.length} ({abs} absent)</strong>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* VIEW 1: CURRENT LECTURE ATTENDANCE SHEET */}
          {attendanceViewMode === 'sheet' && (
            <div className="dashboard-grid-2col">
              <div>
                <div className="lecture-header-strip" style={{ marginBottom: '1rem' }}>
                  <div className="lecture-meta-badges">
                    <span className="lecture-meta-item">
                      <strong>Active:</strong> {currentLecture.period} ({currentLecture.time})
                    </span>
                    <span className="lecture-meta-item">
                      <strong>Room:</strong> {currentLecture.room}
                    </span>
                    <span className="lecture-meta-item">
                      <strong>Type:</strong> {currentLecture.type}
                    </span>
                  </div>

                  <div className="lecture-quick-actions">
                    <button 
                      type="button" 
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleMarkAllInLecture('present')}
                      title="Quick mark all students as present for this lecture"
                    >
                      <CheckCircle2 size={14} /> Mark All Present
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleMarkAllInLecture('absent')}
                      title="Reset attendance"
                    >
                      <RotateCcw size={14} /> Reset
                    </button>
                  </div>
                </div>

                <DataTable
                  title={`${currentLecture.period} Attendance: ${currentLecture.subject}`}
                  subtitle={`Live roster marks for ${currentLecture.time} session`}
                  columns={attendanceColumns}
                  data={students}
                  searchPlaceholder="Filter students by name or roll..."
                />

                <div className="lecture-insight-banner">
                  <Sparkles size={18} style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <strong>Lecture Independence Guarantee:</strong> Changes made here apply exclusively to <strong>{currentLecture.period}</strong>. To view or audit student skipping patterns across periods, switch to the <em>Cross-Lecture Matrix</em>.
                  </div>
                </div>
              </div>

              {/* Today's Schedule Card */}
              <div className="content-card">
                <div className="content-card-header">
                  <h3>Today's Academic Schedule</h3>
                  <Calendar size={18} color="var(--primary)" />
                </div>

                <div className="schedule-list">
                  {todayLectures.map((lec, i) => (
                    <div key={i} className={`schedule-card-item ${lec.status === 'In Session' ? 'now' : ''}`}>
                      <div className="schedule-time-box">
                        <span className="time">{lec.time.split(' ')[0]}</span>
                        <span className="room">{lec.room}</span>
                      </div>
                      <div className="schedule-details">
                        <h4>{lec.title}</h4>
                        <p>{lec.status}</p>
                      </div>
                      <span className={`badge ${lec.status === 'In Session' ? 'badge-indigo' : lec.status === 'Completed' ? 'badge-success' : 'badge-neutral'}`}>
                        {lec.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: CROSS-LECTURE COMPARATIVE MATRIX */}
          {attendanceViewMode === 'matrix' && (
            <div className="matrix-container">
              <div className="matrix-header-bar">
                <div>
                  <h3>📊 Cross-Lecture Attendance Matrix (Day Overview)</h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                    Click any cell to toggle (Present ➔ Late ➔ Absent). Shows student continuity across all periods.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span className="matrix-cell-badge present" style={{ cursor: 'default' }}>Present</span>
                  <span className="matrix-cell-badge late" style={{ cursor: 'default' }}>Late</span>
                  <span className="matrix-cell-badge absent" style={{ cursor: 'default' }}>Absent</span>
                </div>
              </div>

              <div className="matrix-table-wrap">
                <table className="matrix-table">
                  <thead>
                    <tr>
                      <th>Roll No</th>
                      <th>Student Name</th>
                      {lectures.map(lec => (
                        <th key={lec.id} style={{ textAlign: 'center' }}>
                          <div>{lec.period}</div>
                          <div style={{ fontSize: '0.65rem', fontWeight: 'normal', textTransform: 'none', color: 'var(--text-muted)' }}>
                            {lec.time}
                          </div>
                        </th>
                      ))}
                      <th style={{ textAlign: 'center' }}>Attended / 4</th>
                      <th style={{ textAlign: 'center' }}>Continuity Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(student => {
                      const l1Status = attendanceByLecture['LEC-1']?.[student.id] || 'present';
                      const l2Status = attendanceByLecture['LEC-2']?.[student.id] || 'present';
                      const l3Status = attendanceByLecture['LEC-3']?.[student.id] || 'present';
                      const l4Status = attendanceByLecture['LEC-4']?.[student.id] || 'present';

                      const statuses = [l1Status, l2Status, l3Status, l4Status];
                      const attendedCount = statuses.filter(s => s === 'present' || s === 'late').length;
                      const hasSkipped = l1Status === 'present' && (l2Status === 'absent' || l3Status === 'absent' || l4Status === 'absent');

                      return (
                        <tr key={student.id}>
                          <td><strong>{student.roll}</strong></td>
                          <td>{student.name}</td>
                          {lectures.map(lec => {
                            const status = attendanceByLecture[lec.id]?.[student.id] || 'present';
                            return (
                              <td key={lec.id} style={{ textAlign: 'center' }}>
                                <button
                                  type="button"
                                  className={`matrix-cell-badge ${status}`}
                                  onClick={() => handleCycleStatus(lec.id, student.id)}
                                  title={`Click to cycle status for ${student.name} in ${lec.period}`}
                                >
                                  {status}
                                </button>
                              </td>
                            );
                          })}
                          <td style={{ textAlign: 'center', fontWeight: 700 }}>
                            {attendedCount} / 4
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {hasSkipped ? (
                              <span className="badge badge-danger" title="Attended Lecture 1 but skipped subsequent lectures">
                                ⚠️ Skipped Subsequent
                              </span>
                            ) : attendedCount === 4 ? (
                              <span className="badge badge-success">
                                ✓ Perfect Attendance
                              </span>
                            ) : (
                              <span className="badge badge-warning">
                                Partial Attendance
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
                <div className="lecture-insight-banner" style={{ margin: 0 }}>
                  <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 2, color: 'var(--warning)' }} />
                  <div>
                    <strong>Demonstrating Lecture-Wise Independence:</strong> Notice student <strong>Ethan Hunt (22CS05)</strong> attended <strong>Lecture 1 (09:00 AM)</strong>, but was marked <strong>Absent</strong> for <strong>Lecture 2 (11:00 AM)</strong> and <strong>Lecture 3 (01:30 PM)</strong>. The Cross-Lecture Comparative Matrix immediately flags this discontinuity!
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Grading Queue Table */}
          <div style={{ marginTop: '2rem' }}>
            <DataTable
              title="Assignment Evaluation & Grading Queue"
              subtitle="Review uploaded laboratory submissions and post grades directly"
              columns={gradingColumns}
              data={gradingQueue}
              searchPlaceholder="Filter submissions..."
            />
          </div>
        </main>
      </div>

      {/* Broadcast Announcement Modal */}
      <Modal
        isOpen={isAnnouncementModalOpen}
        onClose={() => setIsAnnouncementModalOpen(false)}
        title={`Send Announcement to ${selectedClass}`}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsAnnouncementModalOpen(false)}>Cancel</button>
            <button 
              className="btn btn-primary" 
              onClick={() => {
                alert(`Broadcasted to ${selectedClass}: ${announcementText || 'Reminder sent'}`);
                setIsAnnouncementModalOpen(false);
                setAnnouncementText('');
              }}
            >
              Send Announcement
            </button>
          </>
        }
      >
        <div className="form-group">
          <label>Target Class</label>
          <input type="text" disabled className="form-control" value={selectedClass} />
        </div>
        <div className="form-group">
          <label>Announcement Message</label>
          <textarea
            rows={4}
            className="form-control"
            placeholder="Write note or assignment reminder for your students..."
            value={announcementText}
            onChange={(e) => setAnnouncementText(e.target.value)}
          ></textarea>
        </div>
      </Modal>
    </div>
  );
};

export default TeacherDashboard;
