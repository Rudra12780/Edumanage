import React, { useState } from 'react';
import {
  BookOpen,
  CalendarCheck,
  FileSpreadsheet,
  Clock,
  Check,
  Save,
  Send,
  Calendar
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

  // Class list
  const classes = [
    { code: 'CS101', name: 'Computer Systems & Architecture', count: 42 },
    { code: 'DS204', name: 'Machine Learning Fundamentals', count: 38 },
    { code: 'CS302', name: 'Web Engineering & Microservices', count: 44 },
    { code: 'IT410', name: 'Cloud Infrastructure Lab', count: 32 },
  ];

  // Attendance state for students
  const [attendanceData, setAttendanceData] = useState([
    { id: 'STU-101', name: 'Aiden Vance', roll: '22CS01', status: 'present' },
    { id: 'STU-102', name: 'Bella Martinez', roll: '22CS02', status: 'present' },
    { id: 'STU-103', name: 'Caleb Murphy', roll: '22CS03', status: 'late' },
    { id: 'STU-104', name: 'Diana Prince', roll: '22CS04', status: 'present' },
    { id: 'STU-105', name: 'Ethan Hunt', roll: '22CS05', status: 'absent' },
    { id: 'STU-106', name: 'Fiona Gallagher', roll: '22CS06', status: 'present' },
  ]);

  // Grading Queue
  const [gradingQueue, setGradingQueue] = useState([
    { id: 'SUB-1', student: 'Bella Martinez', assignment: 'Lab 3: Cache Memory Simulation', date: 'Today, 08:30 AM', score: '95', status: 'Graded' },
    { id: 'SUB-2', student: 'Aiden Vance', assignment: 'Lab 3: Cache Memory Simulation', date: 'Yesterday, 11:20 PM', score: '88', status: 'Graded' },
    { id: 'SUB-3', student: 'Diana Prince', assignment: 'Lab 3: Cache Memory Simulation', date: 'Yesterday, 04:15 PM', score: '', status: 'Pending Review' },
    { id: 'SUB-4', student: 'Ethan Hunt', assignment: 'Lab 3: Cache Memory Simulation', date: 'Oct 12, 02:00 PM', score: '', status: 'Pending Review' },
  ]);

  // Timetable for today
  const todayLectures = [
    { time: '09:00 AM', room: 'Hall 302', title: 'CS101: Computer Systems', status: 'In Progress' },
    { time: '11:30 AM', room: 'Lab 4B', title: 'DS204: Neural Networks Hands-On', status: 'Upcoming' },
    { time: '02:00 PM', room: 'Hall 105', title: 'CS302: Web Engineering Seminar', status: 'Upcoming' },
  ];

  const handleStatusChange = (studentId, newStatus) => {
    setAttendanceData(attendanceData.map(s => 
      s.id === studentId ? { ...s, status: newStatus } : s
    ));
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

  const attendanceColumns = [
    { header: 'Roll No', accessor: 'roll', width: '120px' },
    { header: 'Student Name', accessor: 'name' },
    {
      header: 'Mark Status',
      render: (row) => (
        <div className="attendance-status-group">
          <button
            type="button"
            className={`attendance-toggle-btn present ${row.status === 'present' ? 'active' : ''}`}
            onClick={() => handleStatusChange(row.id, 'present')}
          >
            Present
          </button>
          <button
            type="button"
            className={`attendance-toggle-btn late ${row.status === 'late' ? 'active' : ''}`}
            onClick={() => handleStatusChange(row.id, 'late')}
          >
            Late
          </button>
          <button
            type="button"
            className={`attendance-toggle-btn absent ${row.status === 'absent' ? 'active' : ''}`}
            onClick={() => handleStatusChange(row.id, 'absent')}
          >
            Absent
          </button>
        </div>
      )
    },
    {
      header: 'Attendance Indicator',
      render: (row) => (
        <span className={`badge ${
          row.status === 'present' ? 'badge-success' : 
          row.status === 'late' ? 'badge-warning' : 'badge-danger'
        }`}>
          {row.status}
        </span>
      )
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

  const presentCount = attendanceData.filter(s => s.status === 'present').length;
  const lateCount = attendanceData.filter(s => s.status === 'late').length;
  const absentCount = attendanceData.filter(s => s.status === 'absent').length;

  return (
    <div>
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
              <h1>Faculty Instruction & Grading Desk</h1>
              <p>Welcome back, Prof. Miller • Fall 2026 Academic Term</p>
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
              title="Assigned Classes"
              value="4 Subjects"
              subtitle="156 Total Enrolled"
              icon={BookOpen}
              colorScheme="indigo"
              trend="Semester 1"
              trendType="neutral"
            />
            <StatCard
              title="Attendance Today"
              value={`${Math.round(((presentCount + lateCount) / attendanceData.length) * 100)}%`}
              subtitle={`${presentCount} Present, ${absentCount} Absent`}
              icon={CalendarCheck}
              colorScheme="emerald"
              trend="+3% vs avg"
              trendType="up"
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
            <StatCard
              title="Today's Lectures"
              value="3 Sessions"
              subtitle="Next: Hall 302 at 09:00 AM"
              icon={Clock}
              colorScheme="cyan"
              trend="On Schedule"
              trendType="neutral"
            />
          </div>

          {/* Class Switcher Selector */}
          <div className="class-selector-bar">
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                CURRENT ACTIVE CLASS
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
                  <Check size={16} /> Attendance Saved!
                </span>
              )}
              <button className="btn btn-secondary btn-sm" onClick={handleSaveAttendance}>
                <Save size={15} /> Save Attendance
              </button>
            </div>
          </div>

          {/* Interactive Attendance & Lecture Schedule */}
          <div className="dashboard-grid-2col">
            <DataTable
              title={`Class Attendance Tracker — ${selectedClass}`}
              subtitle="Toggle present, late or absent marks in real-time"
              columns={attendanceColumns}
              data={attendanceData}
              searchPlaceholder="Search student..."
            />

            {/* Today's Schedule Card */}
            <div className="content-card">
              <div className="content-card-header">
                <h3>Today's Schedule</h3>
                <Calendar size={18} color="var(--primary)" />
              </div>

              <div className="schedule-list">
                {todayLectures.map((lec, i) => (
                  <div key={i} className={`schedule-card-item ${lec.status === 'In Progress' ? 'now' : ''}`}>
                    <div className="schedule-time-box">
                      <span className="time">{lec.time}</span>
                      <span className="room">{lec.room}</span>
                    </div>
                    <div className="schedule-details">
                      <h4>{lec.title}</h4>
                      <p>{lec.status}</p>
                    </div>
                    <span className={`badge ${lec.status === 'In Progress' ? 'badge-indigo' : 'badge-neutral'}`}>
                      {lec.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

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
