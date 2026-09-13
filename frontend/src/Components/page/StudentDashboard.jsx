import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  BookOpen,
  Clock,
  Upload,
  Download,
  Bell,
  CheckCircle2,
  CalendarCheck,
  FileText,
  AlertCircle
} from 'lucide-react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import StatCard from './StatCard';
import DataTable from './DataTable';
import Modal from './Modal';
import { api, API_BASE_URL } from '../../config/api';
import '../css/AdminDashboard.css';
import '../css/StudentDashboard.css';

const StudentDashboard = ({ currentUser, onRoleChange }) => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [viewingAssignment, setViewingAssignment] = useState(null);
  const fileInputRef = useRef(null);

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
  const [attendanceData, setAttendanceData] = useState({ total: 0, present: 0, late: 0, absent: 0, percentage: 100, records: [] });

  // Enforce strict access control: student must be authenticated
  useEffect(() => {
    const activeStudent = student || (currentUser?.role === 'student' ? currentUser : null);
    if (!activeStudent || activeStudent.role !== 'student') {
      navigate('/login', { replace: true });
      return;
    }

    const loadStudentData = async () => {
      try {
        const [profile, courseList, asnList, notifData, attData] = await Promise.all([
          api.get(`/students/${activeStudent.id}`).catch(() => activeStudent),
          api.get(`/students/${activeStudent.id}/courses`).catch(() => []),
          api.get(`/students/${activeStudent.id}/assignments`).catch(() => []),
          api.get(`/notifications?classCode=${activeStudent.class_code || 'CS101'}&userId=${activeStudent.id}`).catch(() => ({ notifications: [] })),
          api.get(`/students/${activeStudent.id}/attendance`).catch(() => ({ total: 0, present: 0, late: 0, absent: 0, percentage: 100, records: [] }))
        ]);

        if (profile) setStudent(profile);
        setCourses(courseList || []);
        setAssignments(asnList || []);
        setNotifications(notifData?.notifications || []);
        if (attData) setAttendanceData(attData);
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

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleOpenSubmit = (row) => {
    setSelectedAssignment(row);
    setSelectedFile(null);
    setUploadError('');
    setIsSubmitModalOpen(true);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setUploadError('');
    }
  };

  const handleConfirmSubmit = async () => {
    if (!selectedAssignment) return;
    if (!selectedFile) {
      setUploadError('Please select a file from your device before submitting.');
      return;
    }

    try {
      setIsUploading(true);
      setUploadError('');
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await api.upload(`/students/${student.id}/assignments/${selectedAssignment.id}/submit`, formData);
      const updated = res.assignment || {};

      setAssignments(prev => prev.map(a => 
        a.id === selectedAssignment.id ? {
          ...a,
          status: 'Submitted',
          grade: 'Under Review',
          submitted_file: updated.submitted_file || selectedFile.name,
          original_file_name: updated.original_file_name || selectedFile.name,
          file_size: updated.file_size || selectedFile.size,
          file_url: updated.file_url || `/api/assignments/download/${updated.submitted_file}`,
          submitted_at: updated.submitted_at || new Date().toISOString()
        } : a
      ));

      setIsSubmitModalOpen(false);
      setSelectedFile(null);
    } catch (err) {
      console.error('Submission error:', err);
      setUploadError(err.message || 'Failed to submit assignment. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleViewDetails = (row) => {
    setViewingAssignment(row);
    setIsDetailsModalOpen(true);
  };

  const handleDownloadFile = (row) => {
    const filename = row.submitted_file;
    if (!filename) {
      alert('No file attached to this assignment.');
      return;
    }
    const downloadUrl = `${API_BASE_URL}/assignments/download/${encodeURIComponent(filename)}`;
    window.open(downloadUrl, '_blank');
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
          <button className="btn btn-secondary btn-sm" onClick={() => handleViewDetails(row)}>
            <FileText size={13} /> View Submission
          </button>
        )
      )
    }
  ];

  const attendanceColumns = [
    { header: 'Date', accessor: 'date', width: '130px' },
    { header: 'Class Code', accessor: 'class_code', width: '120px' },
    {
      header: 'Lecture Session',
      render: (row) => {
        let name = row.lecture_id;
        if (row.lecture_id === 'LEC-1') name = 'Lecture 1 (09:00 AM)';
        if (row.lecture_id === 'LEC-2') name = 'Lecture 2 (11:00 AM)';
        if (row.lecture_id === 'LEC-3') name = 'Lecture 3 (01:30 PM)';
        if (row.lecture_id === 'LEC-4') name = 'Lecture 4 (03:15 PM)';
        return <span>{name}</span>;
      }
    },
    {
      header: 'Attendance Status',
      render: (row) => {
        let cls = 'badge-success';
        let label = 'Present';
        if (row.status === 'late') { cls = 'badge-warning'; label = 'Late'; }
        if (row.status === 'absent') { cls = 'badge-danger'; label = 'Absent'; }
        return <span className={`badge ${cls}`}>{label}</span>;
      },
      width: '140px'
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
                  title="Overall Attendance"
                  value={`${attendanceData.percentage}%`}
                  subtitle={`${attendanceData.present}/${attendanceData.total} Sessions`}
                  icon={CalendarCheck}
                  colorScheme={attendanceData.percentage >= 75 ? 'cyan' : 'rose'}
                  trend={attendanceData.percentage >= 75 ? 'Good' : 'Alert'}
                  trendType={attendanceData.percentage >= 75 ? 'up' : 'down'}
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

          {/* TAB: ATTENDANCE */}
          {activeTab === 'attendance' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem' }}>
              {/* Summary Stats Grid */}
              <div className="dashboard-stats-grid">
                <StatCard
                  title="Overall Attendance"
                  value={`${attendanceData.percentage}%`}
                  subtitle={attendanceData.percentage >= 75 ? 'Satisfactory Standing' : 'Below Minimum Requirement'}
                  icon={CalendarCheck}
                  colorScheme={attendanceData.percentage >= 75 ? 'emerald' : 'rose'}
                  trend={attendanceData.percentage >= 75 ? 'Good Standing' : 'Attendance Alert'}
                  trendType={attendanceData.percentage >= 75 ? 'up' : 'down'}
                />
                <StatCard
                  title="Total Lectures"
                  value={attendanceData.total}
                  subtitle="Recorded Academic Sessions"
                  icon={Clock}
                  colorScheme="indigo"
                  trend="Curriculum Total"
                  trendType="neutral"
                />
                <StatCard
                  title="Present Lectures"
                  value={attendanceData.present}
                  subtitle="Attended On Time"
                  icon={CheckCircle2}
                  colorScheme="emerald"
                  trend={`${attendanceData.present} Sessions`}
                  trendType="up"
                />
                <StatCard
                  title="Late / Absent"
                  value={`${attendanceData.late} / ${attendanceData.absent}`}
                  subtitle="Tardy / Missed Lectures"
                  icon={Award}
                  colorScheme="amber"
                  trend={`${attendanceData.absent} Absent`}
                  trendType="down"
                />
              </div>

              {/* Attendance Table */}
              <DataTable
                title="Lecture-by-Lecture Attendance History"
                subtitle={`Showing verified faculty registers for ${student.name} (${student.class_code})`}
                columns={attendanceColumns}
                data={attendanceData.records || []}
                searchPlaceholder="Filter by date, class, or lecture..."
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
        onClose={() => { if (!isUploading) setIsSubmitModalOpen(false); }}
        title={`Submit Work: ${selectedAssignment?.title || ''}`}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsSubmitModalOpen(false)} disabled={isUploading}>
              Cancel
            </button>
            <button 
              className="btn btn-primary" 
              onClick={handleConfirmSubmit}
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? 'Uploading & Submitting...' : 'Confirm & Turn In'}
            </button>
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

        {uploadError && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            color: '#ef4444',
            fontSize: '0.85rem',
            marginBottom: '1rem'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{uploadError}</span>
          </div>
        )}

        <div className="form-group">
          <label>Select Assignment File from Device</label>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <div 
            style={{
              border: selectedFile ? '2px solid var(--primary)' : '2px dashed var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '2rem 1.5rem',
              textAlign: 'center',
              cursor: 'pointer',
              background: selectedFile ? 'rgba(79, 70, 229, 0.04)' : 'var(--bg-surface)',
              transition: 'all 0.2s ease'
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            {selectedFile ? (
              <div>
                <CheckCircle2 size={32} color="#10b981" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)', wordBreak: 'break-all' }}>
                  {selectedFile.name}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  Size: {formatFileSize(selectedFile.size)}
                </div>
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm" 
                  style={{ marginTop: '0.75rem' }}
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                >
                  Choose Different File
                </button>
              </div>
            ) : (
              <div>
                <Upload size={32} color="var(--primary)" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                  Click to Choose File / Upload File
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  Supports PDF, Word, Code, ZIP, and images up to 50MB
                </div>
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm" 
                  style={{ marginTop: '0.75rem' }}
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                >
                  Browse Device Files
                </button>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* View Submitted Assignment Details Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title={`Submission Details: ${viewingAssignment?.title || ''}`}
        footer={
          <button className="btn btn-secondary" onClick={() => setIsDetailsModalOpen(false)}>
            Close
          </button>
        }
      >
        {viewingAssignment && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ background: 'var(--bg-surface)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Course</div>
                <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>{viewingAssignment.course}</strong>
              </div>
              <div style={{ background: 'var(--bg-surface)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</div>
                <span className={`badge ${viewingAssignment.status === 'Graded' ? 'badge-success' : 'badge-indigo'}`} style={{ marginTop: 2 }}>
                  {viewingAssignment.status}
                </span>
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                Submitted Assignment File
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <FileText size={28} color="var(--primary)" />
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)', display: 'block' }}>
                      {viewingAssignment.original_file_name || viewingAssignment.submitted_file || 'assignment_submission.pdf'}
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {viewingAssignment.file_size ? formatFileSize(viewingAssignment.file_size) : 'Uploaded document'}
                      {viewingAssignment.submitted_at && ` • Submitted on ${new Date(viewingAssignment.submitted_at).toLocaleString()}`}
                    </span>
                  </div>
                </div>

                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => handleDownloadFile(viewingAssignment)}
                >
                  <Download size={14} /> Download File
                </button>
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Evaluation & Feedback</span>
                <span style={{ fontWeight: 800, fontSize: '1.1rem', color: viewingAssignment.status === 'Graded' ? '#10b981' : 'var(--primary)' }}>
                  {viewingAssignment.grade || 'Under Review'}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {viewingAssignment.feedback || (viewingAssignment.status === 'Graded' ? 'Graded by course faculty.' : 'Your submission is received and is currently under faculty review.')}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StudentDashboard;
