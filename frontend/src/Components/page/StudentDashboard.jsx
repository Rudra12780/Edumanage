import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  BookOpen,
  Clock,
  Upload,
  Download,
  Bell,
  CheckCircle2
} from 'lucide-react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import StatCard from './StatCard';
import DataTable from './DataTable';
import Modal from './Modal';
import { api } from '../../config/api';
import '../css/AdminDashboard.css';
import '../css/StudentDashboard.css';

const StudentDashboard = ({ currentUser, onRoleChange }) => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);

  // Authenticated Student State
  const [student, setStudent] = useState(() => {
    const saved = sessionStorage.getItem('edumanage_current_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.role === 'student') return parsed;
      } catch (e) {}
    }
    return currentUser?.role === 'student' ? currentUser : null;
  });

  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Enforce strict access control: student must be authenticated
  useEffect(() => {
    const activeStudent = student || (currentUser?.role === 'student' ? currentUser : null);
    if (!activeStudent || activeStudent.role !== 'student') {
      navigate('/login', { replace: true });
      return;
    }

    const loadStudentData = async () => {
      try {
        const [profile, courseList, asnList, notifData] = await Promise.all([
          api.get(`/students/${activeStudent.id}`).catch(() => activeStudent),
          api.get(`/students/${activeStudent.id}/courses`).catch(() => []),
          api.get(`/students/${activeStudent.id}/assignments`).catch(() => []),
          api.get(`/notifications?classCode=${activeStudent.class_code || 'CS101'}&userId=${activeStudent.id}`).catch(() => ({ notifications: [] }))
        ]);

        if (profile) setStudent(profile);
        setCourses(courseList || []);
        setAssignments(asnList || []);
        setNotifications(notifData?.notifications || []);
      } catch (err) {
        console.error('Failed to load student isolated records:', err);
      }
    };

    loadStudentData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student?.id, currentUser, navigate]);

  if (!student) {
    return null; // Will redirect via useEffect
  }

  // Timetable
  const timetable = {
    Monday: [
      { time: '09:00 - 10:30', title: `${student.class_code || 'CS101'} Lecture 1`, room: 'Hall 302' },
      { time: '11:00 - 12:30', title: 'Curriculum Practicum', room: 'Lab 2A' },
    ],
    Tuesday: [
      { time: '10:00 - 12:00', title: 'Applied Lab Workshop', room: 'Lab 4B' },
      { time: '02:00 - 03:30', title: 'Technical Seminar', room: 'Room 201' },
    ],
    Wednesday: [
      { time: '09:00 - 10:30', title: `${student.class_code || 'CS101'} Tutorial`, room: 'Room 102' },
      { time: '01:00 - 03:00', title: 'Project Laboratory', room: 'Lab 2A' },
    ],
    Thursday: [
      { time: '11:00 - 12:30', title: 'Department Core Course', room: 'Hall 204' },
      { time: '03:00 - 04:30', title: 'Library Study Session', room: 'Central Lib' },
    ],
    Friday: [
      { time: '10:00 - 11:30', title: 'Institutional Lecture', room: 'Auditorium' },
      { time: '01:30 - 03:30', title: 'Faculty Mentorship Hours', room: 'Office 402' },
    ]
  };

  const handleOpenSubmit = (row) => {
    setSelectedAssignment(row);
    setIsSubmitModalOpen(true);
  };

  const handleConfirmSubmit = async () => {
    if (selectedAssignment) {
      try {
        await api.post(`/students/${student.id}/assignments/${selectedAssignment.id}/submit`, {
          fileName: uploadedFile || 'assignment_submission.pdf'
        });
        setAssignments(prev => prev.map(a => 
          a.id === selectedAssignment.id ? { ...a, status: 'Submitted', grade: 'Under Review' } : a
        ));
      } catch (err) {
        alert('Failed to submit: ' + err.message);
      }
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
          <button className="btn btn-secondary btn-sm" onClick={() => alert(`Submitted file: ${row.submitted_file || 'assignment_submission.pdf'}`)}>
            View Details
          </button>
        )
      )
    }
  ];

  return (
    <div className="dashboard-wrapper">
      <Navbar
        toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentRole="student"
        onRoleChange={onRoleChange}
        currentUser={student}
      />

      <div className="dashboard-layout">
        <Sidebar
          isCollapsed={sidebarCollapsed}
          currentRole="student"
          activeTab={activeTab}
          onTabSelect={(tab) => setActiveTab(tab)}
        />

        <main className="dashboard-main">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <>
              {/* Student Welcome Banner with Isolated Credentials */}
              <div className="student-banner">
                <div className="student-banner-info">
                  <div className="student-large-avatar">⚡</div>
                  <div className="student-banner-text">
                    <h2>⚡ {student.name?.toUpperCase() || 'SCHOLAR'} • SCHOLAR HUB</h2>
                    <p>
                      {student.dept?.toUpperCase()} • {student.year?.toUpperCase()} • ROLL: #{student.roll} • CLASS: {student.class_code}
                    </p>
                  </div>
                </div>

                <div className="student-gpa-badge">
                  <div className="label">Cumulative GPA</div>
                  <div className="value">{student.gpa || '3.50'}</div>
                </div>
              </div>

              {/* Metric Stats */}
              <div className="dashboard-stats-grid">
                <StatCard
                  title="Enrolled Courses"
                  value={courses.length || 4}
                  subtitle="Active Term Offerings"
                  icon={BookOpen}
                  colorScheme="indigo"
                  trend={`Class ${student.class_code}`}
                  trendType="neutral"
                />
                <StatCard
                  title="Academic Standing"
                  value={student.status || 'Active'}
                  subtitle="Enrollment Status"
                  icon={Award}
                  colorScheme="emerald"
                  trend="In Good Standing"
                  trendType="up"
                />
                <StatCard
                  title="Pending Assignments"
                  value={assignments.filter(a => a.status === 'Pending').length}
                  subtitle="Coursework Queue"
                  icon={Clock}
                  colorScheme="amber"
                  trend="This Week"
                  trendType="down"
                />
                <StatCard
                  title="Class Announcements"
                  value={notifications.length}
                  subtitle={`From ${student.class_code} Faculty`}
                  icon={Bell}
                  colorScheme="cyan"
                  trend="Direct Delivery"
                  trendType="neutral"
                />
              </div>

              {/* Class Announcements Delivered Section */}
              <div className="content-card" style={{ marginBottom: '2rem' }}>
                <div className="content-card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Bell size={18} color="var(--primary)" />
                    <h3>Faculty Announcements for Class {student.class_code}</h3>
                  </div>
                  <span className="badge badge-indigo">Class Specific</span>
                </div>

                {notifications.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                    <CheckCircle2 size={32} style={{ margin: '0 auto 0.5rem', color: '#10B981', opacity: 0.8 }} />
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>
                      All caught up! No active announcements for class <strong>{student.class_code}</strong>.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {notifications.map(n => (
                      <div 
                        key={n.id} 
                        style={{
                          padding: '1rem 1.25rem',
                          background: 'var(--bg-surface)',
                          borderRadius: 'var(--radius-md)',
                          borderLeft: '4px solid var(--primary)',
                          borderTop: '1px solid var(--border)',
                          borderRight: '1px solid var(--border)',
                          borderBottom: '1px solid var(--border)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <strong style={{ fontSize: '0.92rem', color: 'var(--text-main)' }}>{n.title}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {new Date(n.created_at).toLocaleDateString()} • {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p style={{ margin: '0 0 6px 0', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                          {n.message}
                        </p>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          Broadcasted by: <strong>{n.sender_name}</strong> (Target: Class {n.target_class})
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick 2-Column Overview: Active Courses & Upcoming Submissions */}
              <div className="dashboard-grid-2col" style={{ marginBottom: '2rem' }}>
                <div className="content-card">
                  <div className="content-card-header">
                    <h3>Active Coursework Overview</h3>
                    <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('courses')}>
                      View Courses →
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {courses.slice(0, 3).map((c) => (
                      <div key={c.code} style={{ padding: '0.75rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{c.code}: {c.name}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.credits} Credits</span>
                        </div>
                        <div style={{ width: '100%', height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: '75%', height: '100%', background: 'var(--primary)', borderRadius: 3 }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="content-card">
                  <div className="content-card-header">
                    <h3>Upcoming Coursework Due</h3>
                    <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('assignments')}>
                      Open Assignments →
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {assignments.slice(0, 3).map((a) => (
                      <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-main)' }}>{a.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{a.course} • Due: {a.due}</div>
                        </div>
                        <span className={`badge ${a.status === 'Graded' ? 'badge-success' : a.status === 'Submitted' ? 'badge-indigo' : 'badge-warning'}`}>
                          {a.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: ENROLLED COURSES */}
          {activeTab === 'courses' && (
            <div style={{ marginBottom: '2.5rem' }}>
              <div className="content-card-header" style={{ marginBottom: '1.2rem' }}>
                <div className="dashboard-header-title">
                  <h2 style={{ fontSize: '1.3rem' }}>My Enrolled Courses</h2>
                  <p>Course curriculum tracks enrolled for {student.name} (Class {student.class_code})</p>
                </div>
              </div>

              <div className="courses-grid">
                {courses.map((course) => (
                  <div key={course.code} className="course-card">
                    <div>
                      <div className="course-card-top">
                        <span className="course-code-pill">{course.code}</span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{course.credits} Credits</span>
                      </div>
                      <div className="course-title">{course.name}</div>
                      <div className="course-instructor">Department: {course.dept}</div>
                    </div>

                    <div className="course-progress-section">
                      <div className="course-progress-label">
                        <span>Class Enrollment</span>
                        <span>{student.class_code}</span>
                      </div>
                      <div className="course-progress-bar">
                        <div className="course-progress-fill" style={{ width: '80%' }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ASSIGNMENTS */}
          {activeTab === 'assignments' && (
            <div style={{ marginBottom: '2.5rem' }}>
              <DataTable
                title="My Coursework & Assignment Submissions"
                subtitle={`Showing personal coursework for ${student.name} • No other student submissions are accessible`}
                columns={assignmentColumns}
                data={assignments}
                searchPlaceholder="Filter assignments..."
              />
            </div>
          )}

          {/* TAB 4: GRADES & GPA */}
          {activeTab === 'grades' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem' }}>
              <div className="content-card">
                <div className="content-card-header">
                  <div>
                    <h3>Official Academic Standing & Record</h3>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {student.name} • Institutional Roll #{student.roll} • {student.dept} ({student.year})
                    </p>
                  </div>
                  <span className={`badge ${student.status === 'Active' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
                    Status: {student.status}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', margin: '1.25rem 0' }}>
                  <div style={{ background: 'var(--bg-surface)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>CUMULATIVE GPA</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', marginTop: 4 }}>{student.gpa || '3.50'} / 4.00</div>
                    <div style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600, marginTop: 4 }}>Official Standing</div>
                  </div>
                  <div style={{ background: 'var(--bg-surface)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>ASSIGNED CLASS</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 4 }}>{student.class_code}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Current Semester Cohort</div>
                  </div>
                  <div style={{ background: 'var(--bg-surface)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>ACCOUNT CLEARANCE</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10B981', marginTop: 8 }}>{student.status}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Private Student Desk</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: TIMETABLE */}
          {activeTab === 'timetable' && (
            <div className="content-card">
              <div className="content-card-header">
                <h3>Weekly Class Schedule</h3>
                <span className="badge badge-indigo">Class {student.class_code}</span>
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
          )}

          {/* TAB 6: RESOURCES */}
          {activeTab === 'resources' && (
            <div className="content-card">
              <div className="content-card-header">
                <h3>E-Library & Course Learning Resources</h3>
                <span className="badge badge-indigo">Class {student.class_code}</span>
              </div>
              <div style={{ padding: '1rem 0' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Institutional textbooks, lecture handouts, and syllabus outlines for your registered department ({student.dept}).
                </p>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                  <div style={{ background: 'var(--bg-surface)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', flex: 1, minWidth: 260 }}>
                    <h4>{student.class_code} Lecture Handouts</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>PDF Document • Updated this term</p>
                    <button className="btn btn-secondary btn-sm" onClick={() => alert('Downloading course handout...')}>
                      <Download size={14} /> Download PDF
                    </button>
                  </div>
                  <div style={{ background: 'var(--bg-surface)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', flex: 1, minWidth: 260 }}>
                    <h4>Department Lab Exercises</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ZIP Archive • Practicum starters</p>
                    <button className="btn btn-secondary btn-sm" onClick={() => alert('Downloading lab archive...')}>
                      <Download size={14} /> Download ZIP
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
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
            onClick={() => setUploadedFile(`submission_${student.roll.toLowerCase()}.pdf`)}
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
      </Modal>
    </div>
  );
};

export default StudentDashboard;
