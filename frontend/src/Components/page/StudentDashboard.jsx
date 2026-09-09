import React, { useState } from 'react';
import {
  Award,
  BookOpen,
  CalendarCheck,
  Clock,
  Upload
} from 'lucide-react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import StatCard from './StatCard';
import DataTable from './DataTable';
import Modal from './Modal';
import '../css/AdminDashboard.css';
import '../css/StudentDashboard.css';

const StudentDashboard = ({ currentUser, onRoleChange }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);

  // Student Courses
  const courses = [
    { code: 'CS101', name: 'Computer Systems & Architecture', instructor: 'Prof. Miller', progress: 78, nextDue: 'Oct 18' },
    { code: 'DS204', name: 'Machine Learning & Stats', instructor: 'Dr. Jenkins', progress: 65, nextDue: 'Oct 20' },
    { code: 'CS302', name: 'Web Systems Engineering', instructor: 'Dr. Robert Vance', progress: 85, nextDue: 'Oct 24' },
    { code: 'MTH220', name: 'Discrete Mathematics', instructor: 'Prof. Brody', progress: 92, nextDue: 'Completed' },
    { code: 'ENG112', name: 'Technical Communications', instructor: 'Prof. Clara Oswald', progress: 70, nextDue: 'Nov 02' },
    { code: 'SEC301', name: 'Cybersecurity Fundamentals', instructor: 'Dr. Hayes', progress: 54, nextDue: 'Oct 30' },
  ];

  // Assignments
  const [assignments, setAssignments] = useState([
    { id: 'ASN-1', title: 'Lab 4: Cache Hit Analysis', course: 'CS101', due: 'Tomorrow, 11:59 PM', status: 'Pending', grade: '-' },
    { id: 'ASN-2', title: 'Term Paper: Ethics in Artificial Intelligence', course: 'DS204', due: 'Oct 22, 2026', status: 'Submitted', grade: 'Under Review' },
    { id: 'ASN-3', title: 'REST API & GraphQL Comparison Project', course: 'CS302', due: 'Oct 28, 2026', status: 'Graded', grade: '96 / 100 (A+)' },
    { id: 'ASN-4', title: 'Problem Set 5: Graph Theory', course: 'MTH220', due: 'Oct 12, 2026', status: 'Graded', grade: '90 / 100 (A)' },
  ]);

  // Timetable
  const timetable = {
    Monday: [
      { time: '09:00 - 10:30', title: 'CS101 Lecture', room: 'Hall 302' },
      { time: '11:00 - 12:30', title: 'Discrete Math', room: 'Hall 105' },
    ],
    Tuesday: [
      { time: '10:00 - 12:00', title: 'Machine Learning Lab', room: 'Lab 4B' },
      { time: '02:00 - 03:30', title: 'Technical Comm', room: 'Room 201' },
    ],
    Wednesday: [
      { time: '09:00 - 10:30', title: 'CS101 Tutorial', room: 'Room 102' },
      { time: '01:00 - 03:00', title: 'Web Systems Project', room: 'Lab 2A' },
    ],
    Thursday: [
      { time: '11:00 - 12:30', title: 'Cybersecurity Fund.', room: 'Hall 204' },
      { time: '03:00 - 04:30', title: 'Library Study Session', room: 'Central Lib' },
    ],
    Friday: [
      { time: '10:00 - 11:30', title: 'AI Ethics Seminar', room: 'Auditorium' },
      { time: '01:30 - 03:30', title: 'Open Mentorship Hours', room: 'Office 402' },
    ]
  };

  const handleOpenSubmit = (row) => {
    setSelectedAssignment(row);
    setIsSubmitModalOpen(true);
  };

  const handleConfirmSubmit = () => {
    if (selectedAssignment) {
      setAssignments(assignments.map(a => 
        a.id === selectedAssignment.id ? { ...a, status: 'Submitted', grade: 'Under Review' } : a
      ));
    }
    setIsSubmitModalOpen(false);
    setUploadedFile(null);
  };

  const assignmentColumns = [
    {
      header: 'Assignment Title',
      render: (row) => (
        <div>
          <strong style={{ color: 'var(--text-main)' }}>{row.title}</strong>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>{row.course}</span>
        </div>
      )
    },
    { header: 'Deadline', accessor: 'due' },
    {
      header: 'Status',
      render: (row) => {
        let cls = 'badge-warning';
        if (row.status === 'Graded') cls = 'badge-success';
        if (row.status === 'Submitted') cls = 'badge-indigo';
        return <span className={`badge ${cls}`}>{row.status}</span>;
      }
    },
    { header: 'Grade', accessor: 'grade', width: '130px' },
    {
      header: 'Action',
      render: (row) => (
        row.status === 'Pending' ? (
          <button className="btn btn-primary btn-sm" onClick={() => handleOpenSubmit(row)}>
            <Upload size={13} /> Submit Work
          </button>
        ) : (
          <button className="btn btn-secondary btn-sm" onClick={() => alert(`Viewing details for ${row.title}`)}>
            View Details
          </button>
        )
      )
    }
  ];

  return (
    <div data-style="neo-brutalism">
      <Navbar
        toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentRole="student"
        onRoleChange={onRoleChange}
        currentUser={currentUser}
      />

      <div className="dashboard-layout">
        <Sidebar
          isCollapsed={sidebarCollapsed}
          currentRole="student"
          activeTab={activeTab}
          onTabSelect={(tab) => setActiveTab(tab)}
        />

        <main className="dashboard-main">
          {/* Student Welcome Banner */}
          <div className="student-banner">
            <div className="student-banner-info">
              <div className="student-large-avatar">⚡</div>
              <div className="student-banner-text">
                <h2>⚡ ALEX RIVERA // SCHOLAR HUB</h2>
                <p>COMPUTER SCIENCE & AI // YEAR 3 // STU-ID: #STU-2024-88</p>
              </div>
            </div>

            <div className="student-gpa-badge">
              <div className="label">Cumulative GPA</div>
              <div className="value">3.88</div>
            </div>
          </div>

          {/* Metric Stats */}
          <div className="dashboard-stats-grid">
            <StatCard
              title="Credits Earned"
              value="74 / 120"
              subtitle="61% Degree Progress"
              icon={Award}
              colorScheme="indigo"
              trend="Dean's List"
              trendType="up"
            />
            <StatCard
              title="Attendance Rate"
              value="96.2%"
              subtitle="Only 2 missed sessions"
              icon={CalendarCheck}
              colorScheme="emerald"
              trend="Excellent"
              trendType="up"
            />
            <StatCard
              title="Pending Tasks"
              value={assignments.filter(a => a.status === 'Pending').length}
              subtitle="Due before Sunday"
              icon={Clock}
              colorScheme="amber"
              trend="1 Critical"
              trendType="down"
            />
            <StatCard
              title="Current Term Courses"
              value="6 Active"
              subtitle="18 Total Credit Hours"
              icon={BookOpen}
              colorScheme="cyan"
              trend="Fall 2026"
              trendType="neutral"
            />
          </div>

          {/* Enrolled Courses Section */}
          <div style={{ marginBottom: '2.5rem' }}>
            <div className="content-card-header" style={{ marginBottom: '1.2rem' }}>
              <div className="dashboard-header-title">
                <h2 style={{ fontSize: '1.3rem' }}>My Enrolled Courses</h2>
                <p>Track your academic syllabus progress and upcoming milestones</p>
              </div>
            </div>

            <div className="courses-grid">
              {courses.map((course) => (
                <div key={course.code} className="course-card">
                  <div>
                    <div className="course-card-top">
                      <span className="course-code-pill">{course.code}</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Due: {course.nextDue}</span>
                    </div>
                    <div className="course-title">{course.name}</div>
                    <div className="course-instructor">Instructor: {course.instructor}</div>
                  </div>

                  <div className="course-progress-section">
                    <div className="course-progress-label">
                      <span>Syllabus Completion</span>
                      <span>{course.progress}%</span>
                    </div>
                    <div className="course-progress-bar">
                      <div className="course-progress-fill" style={{ width: `${course.progress}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Assignments Table */}
          <div style={{ marginBottom: '2.5rem' }}>
            <DataTable
              title="Coursework & Assignment Submissions"
              subtitle="Upload assignments and monitor grading status"
              columns={assignmentColumns}
              data={assignments}
              searchPlaceholder="Filter assignments..."
            />
          </div>

          {/* Timetable / Schedule View */}
          <div className="content-card">
            <div className="content-card-header">
              <h3>Weekly Class Schedule</h3>
              <span className="badge badge-indigo">Semester 1</span>
            </div>

            <div className="timetable-row-grid">
              {Object.entries(timetable).map(([day, slots]) => (
                <div key={day} className="timetable-day-col">
                  <div className="timetable-day-header">{day}</div>
                  {slots.map((slot, idx) => (
                    <div key={idx} className="timetable-slot">
                      <div className="slot-time">{slot.time}</div>
                      <div className="slot-title">{slot.title}</div>
                      <div className="slot-room">{slot.room}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Assignment Submission Modal */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title={`Submit Work: ${selectedAssignment?.title || ''}`}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsSubmitModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleConfirmSubmit}>Confirm & Turn In</button>
          </>
        }
      >
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Course: <strong>{selectedAssignment?.course}</strong>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Deadline: <strong style={{ color: 'var(--danger)' }}>{selectedAssignment?.due}</strong>
          </div>
        </div>

        <div className="form-group">
          <label>Attach Project Archive or PDF File</label>
          <div 
            style={{
              border: '2px dashed var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '2rem',
              textAlign: 'center',
              cursor: 'pointer',
              background: 'var(--bg-surface)'
            }}
            onClick={() => setUploadedFile('lab4_cache_analysis_alex_rivera.pdf')}
          >
            <Upload size={28} color="var(--primary)" style={{ margin: '0 auto 8px' }} />
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
              {uploadedFile ? uploadedFile : 'Click to select or drop files here'}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Supports PDF, ZIP, TAR.GZ up to 25MB
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Comments for Instructor (Optional)</label>
          <textarea className="form-control" rows={3} placeholder="Add any notes about your solution..."></textarea>
        </div>
      </Modal>
    </div>
  );
};

export default StudentDashboard;
