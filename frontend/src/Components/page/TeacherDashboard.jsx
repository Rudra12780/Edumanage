import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Clock,
  Check,
  Save,
  Send,
  Calendar,
  Layers,
  Plus,
  Users,
  Lock,
  AlertCircle,
  Bell,
  FileText,
  Download,
  Award
} from 'lucide-react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import StatCard from './StatCard';
import DataTable from './DataTable';
import Modal from './Modal';
import { api, API_BASE_URL } from '../../config/api';
import '../css/AdminDashboard.css';
import '../css/TeacherDashboard.css';

const TeacherDashboard = ({ currentUser, onRoleChange }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedClass, setSelectedClass] = useState('CS101');
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [toastNotice, setToastNotice] = useState(null);

  // Assignments submissions and grading desk state
  const [assignments, setAssignments] = useState([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [assignmentAccessError, setAssignmentAccessError] = useState(null);
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [gradingAssignment, setGradingAssignment] = useState(null);
  const [gradeValue, setGradeValue] = useState('');
  const [feedbackValue, setFeedbackValue] = useState('');
  const [isSavingGrade, setIsSavingGrade] = useState(false);
  const [gradeError, setGradeError] = useState('');

  // Broadcast modal state
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementSending, setAnnouncementSending] = useState(false);
  const [announcementError, setAnnouncementError] = useState('');
  const [broadcastedNotifs, setBroadcastedNotifs] = useState([]);

  // Enroll Student modal state
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [studentError, setStudentError] = useState('');
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    roll: '',
    dept: 'Computer Science',
    year: 'Year 1',
    gpa: '3.50',
    password: ''
  });

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

  // Class list with associated departments
  const classes = [
    { code: 'CS101', name: 'Computer Systems & Architecture', dept: 'Computer Science' },
    { code: 'DS204', name: 'Machine Learning Fundamentals', dept: 'Data Science' },
    { code: 'CS302', name: 'Web Engineering & Microservices', dept: 'Computer Science' },
    { code: 'IT410', name: 'Cloud Infrastructure Lab', dept: 'Computer Science' },
    { code: 'BIO302', name: 'Molecular Genetics & Genomics', dept: 'Biotechnology' },
    { code: 'BUS105', name: 'Financial Accounting Principles', dept: 'Business Admin' },
  ];

  const [courseCatalog, setCourseCatalog] = useState([]);

  useEffect(() => {
    api.get('/admin/courses').then(data => {
      if (data && data.length > 0) setCourseCatalog(data);
    }).catch(() => {});
  }, []);

  const getDeptForClass = (classCode) => {
    const codeStr = (classCode || '').trim().toUpperCase();
    const foundCourse = courseCatalog.find(c => (c.code || '').toUpperCase() === codeStr);
    if (foundCourse && foundCourse.dept) return foundCourse.dept;
    const foundClass = classes.find(c => (c.code || '').toUpperCase() === codeStr);
    if (foundClass && foundClass.dept) return foundClass.dept;
    if (codeStr.startsWith('DS')) return 'Data Science';
    if (codeStr.startsWith('BIO')) return 'Biotechnology';
    if (codeStr.startsWith('BUS')) return 'Business Admin';
    return 'Computer Science';
  };

  // Dynamic Students Roster loaded from Backend
  const [students, setStudents] = useState([]);

  // Attendance by lecture
  const [attendanceByLecture, setAttendanceByLecture] = useState({
    'LEC-1': {},
    'LEC-2': {},
    'LEC-3': {},
    'LEC-4': {}
  });

  // Load students and saved attendance for active class
  const fetchStudents = async (classCode) => {
    try {
      const [studentData, savedAttendance] = await Promise.all([
        api.get(`/teachers/students?classCode=${classCode}`),
        api.get(`/teachers/attendance?classCode=${classCode}&allLectures=true`).catch(() => ({}))
      ]);
      const list = studentData || [];
      setStudents(list);

      // Hydrate attendance from saved records in backend, fallback to 'present' only if not yet recorded
      setAttendanceByLecture(() => {
        const next = {};
        ['LEC-1', 'LEC-2', 'LEC-3', 'LEC-4'].forEach(lecId => {
          next[lecId] = {};
          const savedLec = (savedAttendance && savedAttendance[lecId]) || {};
          list.forEach(s => {
            next[lecId][s.id] = savedLec[s.id] || 'present';
          });
        });
        return next;
      });
    } catch (err) {
      console.error('Failed to fetch class students and attendance:', err);
    }
  };

  // Load class notifications
  const fetchNotifications = async (classCode) => {
    try {
      const res = await api.get(`/notifications?classCode=${classCode}`);
      setBroadcastedNotifs(res?.notifications || []);
    } catch (e) {}
  };

  // Load submissions for class restricted to assigned faculty
  const fetchAssignments = async (classCode) => {
    try {
      setAssignmentsLoading(true);
      setAssignmentAccessError(null);
      const teacherParam = currentUser?.id ? `&teacherId=${currentUser.id}` : '';
      const data = await api.get(`/teachers/assignments?classCode=${classCode}${teacherParam}`);
      setAssignments(data || []);
    } catch (err) {
      console.error('Error loading assignments:', err);
      if (err.data && err.data.notAssigned) {
        setAssignmentAccessError(err.message || `Access restricted: You are not assigned to class ${classCode}`);
      } else {
        setAssignmentAccessError(err.message || 'Failed to retrieve assignment submissions.');
      }
      setAssignments([]);
    } finally {
      setAssignmentsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents(selectedClass);
    fetchNotifications(selectedClass);
    fetchAssignments(selectedClass);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass]);

  useEffect(() => {
    if (activeTab === 'grading') {
      fetchAssignments(selectedClass);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleOpenGradeModal = (assignment) => {
    setGradingAssignment(assignment);
    setGradeValue(assignment.grade && assignment.grade !== '-' && assignment.grade !== 'Under Review' ? assignment.grade : 'A');
    setFeedbackValue(assignment.feedback || '');
    setGradeError('');
    setIsGradeModalOpen(true);
  };

  const handleSaveGrade = async () => {
    if (!gradingAssignment) return;
    if (!gradeValue.trim()) {
      setGradeError('Please enter a grade or marks.');
      return;
    }

    try {
      setIsSavingGrade(true);
      setGradeError('');

      const res = await api.patch(`/teachers/assignments/${gradingAssignment.id}/grade`, {
        grade: gradeValue.trim(),
        feedback: feedbackValue.trim(),
        status: 'Graded'
      });

      const updated = res.assignment || {};
      setAssignments(prev => prev.map(a => 
        a.id === gradingAssignment.id ? {
          ...a,
          grade: updated.grade || gradeValue.trim(),
          feedback: updated.feedback !== undefined ? updated.feedback : feedbackValue.trim(),
          status: 'Graded',
          graded_at: updated.graded_at || new Date().toISOString()
        } : a
      ));

      setIsGradeModalOpen(false);
      setToastNotice(`Grade saved successfully for ${gradingAssignment.student_name || 'student'}`);
      setShowSaveToast(true);
      setTimeout(() => setShowSaveToast(false), 3000);
    } catch (err) {
      setGradeError(err.message || 'Failed to save grade.');
    } finally {
      setIsSavingGrade(false);
    }
  };

  const handleDownloadStudentFile = (assignment) => {
    const filename = assignment.submitted_file;
    if (!filename) {
      alert('No file uploaded for this assignment submission.');
      return;
    }
    const downloadUrl = `${API_BASE_URL}/assignments/download/${encodeURIComponent(filename)}`;
    window.open(downloadUrl, '_blank');
  };

  const submissionsColumns = [
    {
      header: 'Student',
      render: (row) => (
        <div>
          <strong style={{ color: 'var(--text-main)', display: 'block' }}>{row.student_name || 'Enrolled Student'}</strong>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Roll: {row.student_roll || row.student_id}</span>
        </div>
      )
    },
    {
      header: 'Assignment Title',
      render: (row) => (
        <div>
          <strong style={{ color: 'var(--text-main)' }}>{row.title}</strong>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Class {row.course}</span>
        </div>
      )
    },
    {
      header: 'Submitted File',
      render: (row) => {
        if (!row.submitted_file) {
          return <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>No file uploaded</span>;
        }
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FileText size={18} color="var(--primary)" />
            <div style={{ maxWidth: '180px' }}>
              <div style={{ 
                fontSize: '0.82rem', 
                fontWeight: 600, 
                color: 'var(--text-main)', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                whiteSpace: 'nowrap' 
              }}>
                {row.original_file_name || row.submitted_file}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {row.file_size ? formatFileSize(row.file_size) : 'Attached file'}
              </div>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              title="Download Student File"
              style={{ padding: '3px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              onClick={() => handleDownloadStudentFile(row)}
            >
              <Download size={12} /> Download
            </button>
          </div>
        );
      }
    },
    {
      header: 'Submission Date/Time',
      render: (row) => (
        <span style={{ fontSize: '0.82rem', color: row.submitted_at ? 'var(--text-main)' : 'var(--text-muted)' }}>
          {row.submitted_at ? new Date(row.submitted_at).toLocaleString() : 'Not submitted yet'}
        </span>
      )
    },
    {
      header: 'Status',
      render: (row) => {
        let cls = 'badge-warning';
        if (row.status === 'Graded') cls = 'badge-success';
        if (row.status === 'Submitted') cls = 'badge-indigo';
        return <span className={`badge ${cls}`}>{row.status}</span>;
      }
    },
    {
      header: 'Grade',
      render: (row) => (
        <strong style={{ 
          fontSize: '0.9rem', 
          color: row.status === 'Graded' ? '#10B981' : 'var(--text-muted)' 
        }}>
          {row.grade || '-'}
        </strong>
      ),
      width: '100px'
    },
    {
      header: 'Action',
      render: (row) => {
        if (row.status === 'Pending') {
          return <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Awaiting submission</span>;
        }
        return (
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => handleOpenGradeModal(row)}
          >
            <Award size={13} /> {row.status === 'Graded' ? 'Edit Grade' : 'Grade / Review'}
          </button>
        );
      }
    }
  ];

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

  const handleSaveAttendance = async () => {
    try {
      await api.post('/teachers/attendance', {
        classCode: selectedClass,
        lectureId: selectedLectureId,
        records: attendanceByLecture[selectedLectureId] || {}
      });
      setShowSaveToast(true);
      setTimeout(() => setShowSaveToast(false), 3000);
    } catch (e) {
      alert('Failed to save attendance: ' + e.message);
    }
  };

  // Broadcast announcement
  const handleSendAnnouncement = async () => {
    if (!announcementText.trim()) return;
    setAnnouncementSending(true);
    setAnnouncementError('');

    try {
      await api.post('/notifications', {
        title: announcementTitle.trim() || `Class Announcement for ${selectedClass}`,
        message: announcementText.trim(),
        target_class: selectedClass,
        sender_id: currentUser?.id || null,
        sender_name: currentUser?.name || 'Faculty Instructor',
        sender_role: 'teacher'
      });

      setIsAnnouncementModalOpen(false);
      setAnnouncementTitle('');
      setAnnouncementText('');
      setToastNotice(`Announcement broadcasted to class ${selectedClass}!`);
      setTimeout(() => setToastNotice(null), 4000);
      fetchNotifications(selectedClass);
    } catch (err) {
      setAnnouncementError(err.message || 'Failed to send announcement.');
    } finally {
      setAnnouncementSending(false);
    }
  };

  // Enroll student with auto-associated department
  const handleEnrollStudent = async (e) => {
    e.preventDefault();
    setStudentError('');

    if (!newStudent.name || !newStudent.email || !newStudent.password) {
      setStudentError('Name, institutional email, and password are required.');
      return;
    }

    const autoDept = getDeptForClass(selectedClass);

    try {
      await api.post('/teachers/students', {
        ...newStudent,
        dept: autoDept,
        class_code: selectedClass
      });

      await fetchStudents(selectedClass);
      setIsAddStudentModalOpen(false);
      setNewStudent({
        name: '',
        email: '',
        roll: '',
        dept: autoDept,
        year: 'Year 1',
        gpa: '3.50',
        password: ''
      });

      setToastNotice(`Student ${newStudent.name} successfully enrolled in ${selectedClass} (${autoDept}) with unique password!`);
      setTimeout(() => setToastNotice(null), 4000);
    } catch (err) {
      setStudentError(err.message || 'Invalid or already used password.');
    }
  };

  // Compute metrics for active lecture
  const activePresentCount = students.filter(s => currentLectureAttendance[s.id] === 'present').length;
  const activeLateCount = students.filter(s => currentLectureAttendance[s.id] === 'late').length;
  const activeAbsentCount = students.filter(s => currentLectureAttendance[s.id] === 'absent').length;
  const activeRate = students.length > 0 
    ? Math.round(((activePresentCount + activeLateCount) / students.length) * 100) 
    : 0;

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

  // Columns for the Class Students Roster
  const studentRosterColumns = [
    { header: 'Roll No', accessor: 'roll', width: '120px' },
    { header: 'Student Name', accessor: 'name' },
    { header: 'Institutional Email', accessor: 'email' },
    { header: 'Class Code', accessor: 'class_code', width: '100px' },
    { header: 'Department', accessor: 'dept' },
    { header: 'Year', accessor: 'year', width: '100px' },
    { header: 'GPA', accessor: 'gpa', width: '90px' },
    {
      header: 'Status',
      render: (row) => (
        <span className={`badge ${row.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>
          {row.status}
        </span>
      )
    }
  ];

  return (
    <div className="dashboard-wrapper">
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
          {/* Header Title Bar */}
          <div className="dashboard-header">
            <div className="dashboard-header-title">
              <h1>
                {activeTab === 'overview' && '⚡ Faculty Instruction & Grading Desk'}
                {activeTab === 'classes' && '📚 Assigned Academic Classes & Curriculums'}
                {activeTab === 'students' && '👥 Class Students Roster & Enrollments'}
                {activeTab === 'attendance' && '📋 Lecture-Wise Attendance Suite'}
                {activeTab === 'grading' && '📝 Assignment Evaluation & Gradebook'}
                {activeTab === 'timetable' && '⏱️ Faculty Lecture Schedule & Rooms'}
                {activeTab === 'messages' && '💬 Student Inquiries & Announcements'}
              </h1>
              <p>
                {activeTab === 'overview' && 'Daily Teaching Briefing • Lecture Registers, Live Marks & Evaluation Queue'}
                {activeTab === 'classes' && 'Manage active instructional course sections and curriculum progress'}
                {activeTab === 'students' && `Manage enrolled students for class ${selectedClass} and enroll new scholars with unique credentials`}
                {activeTab === 'attendance' && 'Independent period-by-period tracking: verify student presence for each lecture session'}
                {activeTab === 'grading' && 'Review student lab submissions, enter marks, and provide constructive feedback'}
                {activeTab === 'timetable' && 'Detailed daily and weekly timetable breakdown with hall allocations'}
                {activeTab === 'messages' && 'Student communication threads and direct campus announcements'}
              </p>
            </div>

            <div className="dashboard-header-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => { setStudentError(''); setIsAddStudentModalOpen(true); }}
              >
                <Plus size={16} /> Enroll Student
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => { setAnnouncementError(''); setIsAnnouncementModalOpen(true); }}
              >
                <Send size={16} /> Broadcast Announcement
              </button>
            </div>
          </div>

          {/* Toast Notification */}
          {toastNotice && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0.9rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: 'var(--text-main)',
              fontSize: '0.85rem',
              fontWeight: '600',
              marginBottom: '1rem',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <Check size={18} color="#10B981" style={{ marginRight: '8px' }} />
              <span>{toastNotice}</span>
            </div>
          )}

          {/* Class Selector Bar */}
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
                    {cls.code}: {cls.name}
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

          {/* TAB 1: TEACHER OVERVIEW */}
          {activeTab === 'overview' && (
            <>
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
                  title="Enrolled in Class"
                  value={students.length}
                  subtitle={`Active students in ${selectedClass}`}
                  icon={Users}
                  colorScheme="indigo"
                  trend="Registered"
                  trendType="up"
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
                  title="Broadcasted Notices"
                  value={broadcastedNotifs.length}
                  subtitle={`Delivered to ${selectedClass}`}
                  icon={Bell}
                  colorScheme="amber"
                  trend="Live"
                  trendType="neutral"
                />
              </div>

              {/* Quick 2-Column Overview: Today's Schedule & Attendance Glance */}
              <div className="dashboard-grid-2col" style={{ marginBottom: '2rem' }}>
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

                <div className="content-card">
                  <div className="content-card-header">
                    <h3>Quick Attendance Overview ({currentLecture.period})</h3>
                    <span className="badge badge-indigo">{currentLecture.time}</span>
                  </div>
                  <div style={{ padding: '0.5rem 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Current Session:</span>
                      <strong style={{ color: 'var(--text-main)' }}>{currentLecture.subject}</strong>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
                      <div style={{ flex: 1, background: 'rgba(16, 185, 129, 0.1)', padding: '0.85rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10B981' }}>{activePresentCount}</div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#10B981' }}>Present</div>
                      </div>
                      <div style={{ flex: 1, background: 'rgba(245, 158, 11, 0.1)', padding: '0.85rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#F59E0B' }}>{activeLateCount}</div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#F59E0B' }}>Late</div>
                      </div>
                      <div style={{ flex: 1, background: 'rgba(239, 68, 68, 0.1)', padding: '0.85rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#EF4444' }}>{activeAbsentCount}</div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#EF4444' }}>Absent</div>
                      </div>
                    </div>
                    <button 
                      className="btn btn-primary btn-sm" 
                      style={{ width: '100%' }}
                      onClick={() => setActiveTab('attendance')}
                    >
                      Open Full Attendance Register →
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: ASSIGNED CLASSES */}
          {activeTab === 'classes' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {classes.map((cls) => (
                <div key={cls.code} className="content-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <span className="badge badge-indigo" style={{ fontSize: '0.85rem', fontWeight: 800, padding: '4px 10px' }}>
                        {cls.code}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>{cls.name}</h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                      Meets Mon, Wed & Fri • 4 Academic Credit Hours • Lab Practicum Included
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                    <button 
                      className="btn btn-secondary btn-sm" 
                      style={{ flex: 1 }}
                      onClick={() => {
                        setSelectedClass(cls.code);
                        setActiveTab('students');
                      }}
                    >
                      View Students
                    </button>
                    <button 
                      className="btn btn-primary btn-sm" 
                      style={{ flex: 1 }}
                      onClick={() => {
                        setSelectedClass(cls.code);
                        setIsAnnouncementModalOpen(true);
                      }}
                    >
                      Announce
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB: CLASS STUDENTS ROSTER */}
          {activeTab === 'students' && (
            <div>
              <DataTable
                title={`Class ${selectedClass} Students Roster`}
                subtitle={`Showing ${students.length} enrolled students in ${selectedClass} • Teachers can register students with unique credentials`}
                columns={studentRosterColumns}
                data={students}
                searchPlaceholder="Search enrolled students..."
                actionButton={
                  <button className="btn btn-primary btn-sm" onClick={() => { setStudentError(''); setIsAddStudentModalOpen(true); }}>
                    <Plus size={14} /> Enroll New Student
                  </button>
                }
              />
            </div>
          )}

          {/* TAB 3: ATTENDANCE MANAGEMENT */}
          {activeTab === 'attendance' && (
            <>
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
                        <div className="lecture-tab-time">{lec.time}</div>
                        <div className="lecture-tab-subject">{lec.subject}</div>
                        <div className="lecture-tab-stats">
                          <span className="stat-pres">{pres} Present</span>
                          <span className="stat-sep">•</span>
                          <span className="stat-abs">{abs} Absent</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {attendanceViewMode === 'sheet' ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Quick Actions: 
                      <button className="btn btn-secondary btn-sm" style={{ marginLeft: 8 }} onClick={() => handleMarkAllInLecture('present')}>Mark All Present</button>
                      <button className="btn btn-secondary btn-sm" style={{ marginLeft: 8 }} onClick={() => handleMarkAllInLecture('absent')}>Mark All Absent</button>
                    </div>
                  </div>

                  <DataTable
                    title={`${currentLecture.period} Attendance Sheet (${selectedClass})`}
                    subtitle={`Time: ${currentLecture.time} • Room: ${currentLecture.room}`}
                    columns={attendanceColumns}
                    data={students}
                    searchPlaceholder="Filter students in session..."
                  />
                </div>
              ) : (
                <div className="content-card">
                  <div className="content-card-header">
                    <h3>Cross-Lecture Attendance Matrix</h3>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                          <th style={{ padding: '0.75rem' }}>Roll No</th>
                          <th style={{ padding: '0.75rem' }}>Student Name</th>
                          {lectures.map(l => (
                            <th key={l.id} style={{ padding: '0.75rem', textAlign: 'center' }}>{l.period}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {students.map(s => (
                          <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '0.75rem', fontWeight: 600 }}>{s.roll}</td>
                            <td style={{ padding: '0.75rem' }}>{s.name}</td>
                            {lectures.map(l => {
                              const status = attendanceByLecture[l.id]?.[s.id] || 'present';
                              return (
                                <td key={l.id} style={{ padding: '0.75rem', textAlign: 'center' }}>
                                  <button
                                    onClick={() => handleCycleStatus(l.id, s.id)}
                                    className={`badge ${status === 'present' ? 'badge-success' : status === 'late' ? 'badge-warning' : 'badge-danger'}`}
                                    style={{ cursor: 'pointer', border: 'none' }}
                                  >
                                    {status}
                                  </button>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* TAB: GRADES & REVIEWS (ASSIGNMENT SUBMISSIONS & EVALUATION) */}
          {activeTab === 'grading' && (
            <div>
              {assignmentAccessError ? (
                <div className="content-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'rgba(239, 68, 68, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem'
                  }}>
                    <Lock size={30} color="#EF4444" />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                    Access Restricted to Assigned Faculty
                  </h3>
                  <p style={{ maxWidth: '540px', margin: '0 auto 1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                    {assignmentAccessError}
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {classes.map(c => (
                      <button
                        key={c.code}
                        className={`btn btn-sm ${selectedClass === c.code ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setSelectedClass(c.code)}
                      >
                        Switch to {c.code}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <DataTable
                  title={`Assignment Submissions & Grading Desk (${selectedClass})`}
                  subtitle={`Showing ${assignments.filter(a => a.status !== 'Pending').length} submitted files from enrolled students in ${selectedClass} • Download student files and evaluate submissions`}
                  columns={submissionsColumns}
                  data={assignments}
                  searchPlaceholder="Search student submissions..."
                  actionButton={
                    <button 
                      className="btn btn-secondary btn-sm"
                      disabled={assignmentsLoading}
                      onClick={() => fetchAssignments(selectedClass)}
                    >
                      {assignmentsLoading ? 'Refreshing...' : 'Refresh Submissions'}
                    </button>
                  }
                />
              )}
            </div>
          )}

          {/* TAB 4: MESSAGES & ANNOUNCEMENTS */}
          {(activeTab === 'messages' || activeTab === 'timetable') && (
            <div className="content-card" style={{ padding: '2rem' }}>
              <div className="content-card-header" style={{ marginBottom: '1.5rem' }}>
                <h3>Broadcasted Announcements to {selectedClass}</h3>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => { setAnnouncementError(''); setIsAnnouncementModalOpen(true); }}
                >
                  <Send size={14} /> New Announcement
                </button>
              </div>

              {broadcastedNotifs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                  <Bell size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                  <p>No announcements broadcasted to class {selectedClass} yet.</p>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => { setAnnouncementError(''); setIsAnnouncementModalOpen(true); }}
                  >
                    Send First Announcement
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {broadcastedNotifs.map(n => (
                    <div key={n.id} style={{ padding: '1.25rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>{n.title}</strong>
                        <span className="badge badge-indigo">Class {n.target_class}</span>
                      </div>
                      <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {n.message}
                      </p>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Sent by: {n.sender_name} • {new Date(n.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Broadcast Announcement Modal */}
      <Modal
        isOpen={isAnnouncementModalOpen}
        onClose={() => setIsAnnouncementModalOpen(false)}
        title={`Send Announcement to Class ${selectedClass}`}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsAnnouncementModalOpen(false)}>Cancel</button>
            <button 
              className="btn btn-primary" 
              onClick={handleSendAnnouncement}
              disabled={announcementSending || !announcementText.trim()}
            >
              {announcementSending ? 'Broadcasting...' : 'Send Announcement'}
            </button>
          </>
        }
      >
        {announcementError && (
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
            fontWeight: 600,
            marginBottom: '1rem'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{announcementError}</span>
          </div>
        )}

        <div className="form-group">
          <label>Target Class (Recipients)</label>
          <input type="text" disabled className="form-control" value={`Class ${selectedClass} (All enrolled students will receive this notification)`} />
        </div>

        <div className="form-group">
          <label>Announcement Subject / Title</label>
          <input
            type="text"
            className="form-control"
            placeholder="e.g. Lab 3 Submission Due Date Extended"
            value={announcementTitle}
            onChange={(e) => setAnnouncementTitle(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Announcement Message</label>
          <textarea
            rows={4}
            required
            className="form-control"
            placeholder="Write information, syllabus notes, or reminders for your students..."
            value={announcementText}
            onChange={(e) => setAnnouncementText(e.target.value)}
          ></textarea>
        </div>
      </Modal>

      {/* Enroll New Student Modal */}
      <Modal
        isOpen={isAddStudentModalOpen}
        onClose={() => setIsAddStudentModalOpen(false)}
        title={`Enroll New Student in ${selectedClass}`}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsAddStudentModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleEnrollStudent}>Enroll Student</button>
          </>
        }
      >
        {studentError && (
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
            fontWeight: 600,
            marginBottom: '1rem'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{studentError}</span>
          </div>
        )}

        <form onSubmit={handleEnrollStudent}>
          <div className="form-group">
            <label>Student Full Name</label>
            <input
              type="text"
              required
              className="form-control"
              placeholder="e.g. Maya Lin"
              value={newStudent.name}
              onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Institutional Email</label>
            <input
              type="email"
              required
              className="form-control"
              placeholder="maya.l@edumanage.edu"
              value={newStudent.email}
              onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label>Enrolling Class</label>
              <input
                type="text"
                disabled
                className="form-control"
                value={selectedClass}
              />
            </div>

            <div>
              <label>Associated Department</label>
              <input
                type="text"
                disabled
                className="form-control"
                value={getDeptForClass(selectedClass)}
              />
            </div>
          </div>

          <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label>Roll Number</label>
              <input
                type="text"
                className="form-control"
                placeholder={selectedClass.startsWith('DS') ? 'e.g. 22DS10' : 'e.g. 22CS10'}
                value={newStudent.roll}
                onChange={(e) => setNewStudent({ ...newStudent, roll: e.target.value })}
              />
            </div>

            <div>
              <label>Year Level</label>
              <select
                className="form-control"
                value={newStudent.year}
                onChange={(e) => setNewStudent({ ...newStudent, year: e.target.value })}
              >
                <option value="Year 1">Year 1</option>
                <option value="Year 2">Year 2</option>
                <option value="Year 3">Year 3</option>
                <option value="Year 4">Year 4</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lock size={14} /> Student Password (Unique, Manually Entered by Teacher)
            </label>
            <input
              type="password"
              required
              className="form-control"
              placeholder="Enter unique password for student account..."
              value={newStudent.password}
              onChange={(e) => {
                setNewStudent({ ...newStudent, password: e.target.value });
                if (studentError) setStudentError('');
              }}
            />
            <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
              The same password must not be allowed for multiple accounts. If duplicate, system will reject with "Invalid or already used password."
            </small>
          </div>
        </form>
      </Modal>

      {/* Grade & Review Submission Modal */}
      <Modal
        isOpen={isGradeModalOpen}
        onClose={() => { if (!isSavingGrade) setIsGradeModalOpen(false); }}
        title={`Grade Submission: ${gradingAssignment?.title || ''}`}
        footer={
          <>
            <button 
              className="btn btn-secondary" 
              onClick={() => setIsGradeModalOpen(false)}
              disabled={isSavingGrade}
            >
              Cancel
            </button>
            <button 
              className="btn btn-primary" 
              onClick={handleSaveGrade}
              disabled={isSavingGrade || !gradeValue.trim()}
            >
              {isSavingGrade ? 'Saving Grade...' : 'Save Grade & Feedback'}
            </button>
          </>
        }
      >
        {gradingAssignment && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ background: 'var(--bg-surface)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Student Name & Roll</div>
                <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)', display: 'block' }}>
                  {gradingAssignment.student_name || 'Enrolled Student'}
                </strong>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Roll: {gradingAssignment.student_roll || gradingAssignment.student_id} • Class {gradingAssignment.course}
                </span>
              </div>
              <div style={{ background: 'var(--bg-surface)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Submitted At</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginTop: 2 }}>
                  {gradingAssignment.submitted_at ? new Date(gradingAssignment.submitted_at).toLocaleString() : 'N/A'}
                </div>
                <span className={`badge ${gradingAssignment.status === 'Graded' ? 'badge-success' : 'badge-indigo'}`} style={{ marginTop: 4 }}>
                  {gradingAssignment.status}
                </span>
              </div>
            </div>

            {/* Attached File Box */}
            <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                Submitted Assignment File
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <FileText size={28} color="var(--primary)" />
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)', display: 'block' }}>
                      {gradingAssignment.original_file_name || gradingAssignment.submitted_file || 'assignment_file.pdf'}
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {gradingAssignment.file_size ? formatFileSize(gradingAssignment.file_size) : 'Uploaded document'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleDownloadStudentFile(gradingAssignment)}
                >
                  <Download size={14} /> Download File
                </button>
              </div>
            </div>

            {gradeError && (
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
                <AlertCircle size={16} />
                <span>{gradeError}</span>
              </div>
            )}

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>Grade / Score Awarded</label>
              <input 
                type="text"
                className="form-control"
                placeholder="e.g. 95/100, A+, 88%"
                value={gradeValue}
                onChange={(e) => setGradeValue(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-main)',
                  color: 'var(--text-main)',
                  fontSize: '0.95rem',
                  fontWeight: 600
                }}
              />
            </div>

            <div className="form-group">
              <label>Instructor Feedback & Remarks</label>
              <textarea
                rows={4}
                className="form-control"
                placeholder="Provide constructive feedback, praise, or rubric remarks for the student..."
                value={feedbackValue}
                onChange={(e) => setFeedbackValue(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-main)',
                  color: 'var(--text-main)',
                  fontSize: '0.88rem',
                  lineHeight: 1.4,
                  resize: 'vertical'
                }}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TeacherDashboard;
