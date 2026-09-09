import React, { useState, useEffect } from 'react';
import {
  Users,
  GraduationCap,
  BookOpen,
  Plus,
  Download,
  CheckCircle2,
  Info,
  Lock,
  AlertCircle
} from 'lucide-react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import StatCard from './StatCard';
import DataTable from './DataTable';
import Modal from './Modal';
import { api } from '../../config/api';
import '../css/AdminDashboard.css';

const AdminDashboard = ({ currentUser, onRoleChange }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddTeacherModalOpen, setIsAddTeacherModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [statusToast, setStatusToast] = useState(null);
  const [showPolicyGuide, setShowPolicyGuide] = useState(true);

  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);

  // Error messages for modals
  const [teacherError, setTeacherError] = useState('');
  const [studentError, setStudentError] = useState('');

  // New Faculty Form State
  const [newTeacher, setNewTeacher] = useState({
    name: '',
    email: '',
    dept: 'Computer Science',
    courses: 'CS101: Systems Architecture',
    status: 'Active',
    password: ''
  });

  // New Student Form State
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    roll: '',
    dept: 'Computer Science',
    class_code: 'CS101',
    year: 'Year 1',
    gpa: '3.50',
    status: 'Active',
    password: ''
  });

  const fetchData = async () => {
    try {
      const [tList, sList, cList] = await Promise.all([
        api.get('/admin/teachers').catch(() => []),
        api.get('/admin/students').catch(() => []),
        api.get('/admin/courses').catch(() => [])
      ]);
      setTeachers(tList || []);
      setStudents(sList || []);
      setCourses(cList || []);
    } catch (err) {
      console.error('Failed to load administrative directory data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (studentId, newStatus) => {
    try {
      await api.patch(`/admin/students/${studentId}/status`, { status: newStatus });
      setStudents(prev => prev.map(s => (s.id === studentId ? { ...s, status: newStatus } : s)));

      const student = students.find(s => s.id === studentId);
      const studentName = student ? student.name : 'Student';
      let detail = '';
      if (newStatus === 'Active') {
        detail = 'Full LMS & campus privileges active. Enrolled in courses.';
      } else if (newStatus === 'Probation') {
        detail = 'Academic standing under review. Counselor advisory sessions required.';
      } else if (newStatus === 'Inactive') {
        detail = 'Academic enrollment paused. LMS portal and library access suspended.';
      }

      setStatusToast({
        status: newStatus,
        message: `${studentName} marked as ${newStatus}. ${detail}`
      });

      setTimeout(() => {
        setStatusToast(null);
      }, 5000);
    } catch (err) {
      alert('Failed to update student status: ' + err.message);
    }
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    setTeacherError('');

    if (!newTeacher.name || !newTeacher.email || !newTeacher.password) {
      setTeacherError('Name, institutional email, and password are required.');
      return;
    }

    try {
      await api.post('/admin/teachers', newTeacher);
      const updated = await api.get('/admin/teachers');
      setTeachers(updated || []);
      setIsAddTeacherModalOpen(false);
      setNewTeacher({
        name: '',
        email: '',
        dept: 'Computer Science',
        courses: 'CS101: Systems Architecture',
        status: 'Active',
        password: ''
      });

      setStatusToast({
        status: 'Active',
        message: `Faculty member ${newTeacher.name} registered with unique password!`
      });
      setTimeout(() => setStatusToast(null), 5000);
    } catch (err) {
      setTeacherError(err.message || 'Invalid or already used password.');
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setStudentError('');

    if (!newStudent.name || !newStudent.email || !newStudent.password) {
      setStudentError('Name, institutional email, and password are required.');
      return;
    }

    try {
      await api.post('/admin/students', newStudent);
      const updated = await api.get('/admin/students');
      setStudents(updated || []);
      setIsAddModalOpen(false);
      setNewStudent({
        name: '',
        email: '',
        roll: '',
        dept: 'Computer Science',
        class_code: 'CS101',
        year: 'Year 1',
        gpa: '3.50',
        status: 'Active',
        password: ''
      });

      setStatusToast({
        status: 'Active',
        message: `Student ${newStudent.name} registered with unique password!`
      });
      setTimeout(() => setStatusToast(null), 5000);
    } catch (err) {
      setStudentError(err.message || 'Invalid or already used password.');
    }
  };

  const studentColumns = [
    { header: 'ID', accessor: 'id', width: '110px' },
    {
      header: 'Student Name',
      render: (row) => (
        <div>
          <strong style={{ display: 'block', color: 'var(--text-main)' }}>{row.name}</strong>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{row.email}</span>
        </div>
      )
    },
    { header: 'Roll No', accessor: 'roll', width: '100px' },
    { header: 'Class', accessor: 'class_code', width: '90px' },
    { header: 'Department', accessor: 'dept' },
    { header: 'Year', accessor: 'year', width: '90px' },
    { header: 'GPA', accessor: 'gpa', width: '80px' },
    {
      header: 'Status',
      accessor: 'status',
      width: '150px',
      render: (row) => {
        let statusStyleClass = 'status-active';
        if (row.status === 'Probation') statusStyleClass = 'status-probation';
        if (row.status === 'Inactive') statusStyleClass = 'status-inactive';

        return (
          <div style={{ display: 'inline-flex', alignItems: 'center' }}>
            <select
              value={row.status}
              onChange={(e) => handleStatusChange(row.id, e.target.value)}
              className={`status-pill-select ${statusStyleClass}`}
              title="Click to change student status: Active, Probation, or Inactive"
            >
              <option value="Active">🟢 Active</option>
              <option value="Probation">🟡 Probation</option>
              <option value="Inactive">🔴 Inactive</option>
            </select>
          </div>
        );
      }
    }
  ];

  const teacherColumns = [
    { header: 'Faculty ID', accessor: 'id', width: '120px' },
    {
      header: 'Faculty Name',
      render: (row) => (
        <div>
          <strong style={{ display: 'block', color: 'var(--text-main)' }}>{row.name}</strong>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{row.email}</span>
        </div>
      )
    },
    { header: 'Department', accessor: 'dept' },
    { header: 'Courses Assigned', accessor: 'courses' },
    { header: 'Total Students', accessor: 'students', width: '130px' },
    {
      header: 'Status',
      render: (row) => (
        <span className={`badge ${row.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>
          {row.status}
        </span>
      )
    }
  ];

  const courseColumns = [
    { header: 'Course Code', accessor: 'code', width: '120px' },
    { header: 'Course Name', accessor: 'name' },
    { header: 'Department', accessor: 'dept' },
    { header: 'Credits', accessor: 'credits', width: '90px' },
    {
      header: 'Capacity',
      render: (row) => (
        <div>
          <span>{row.enrolled || 0} / {row.max || 60} enrolled</span>
          <div style={{ height: 5, background: 'var(--bg-surface)', borderRadius: 3, marginTop: 4, overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(100, ((row.enrolled || 0) / (row.max || 60)) * 100)}%`, height: '100%', background: 'var(--primary)' }}></div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="dashboard-wrapper">
      <Navbar
        toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentRole="admin"
        onRoleChange={onRoleChange}
        currentUser={currentUser}
      />

      <div className="dashboard-layout">
        <Sidebar
          isCollapsed={sidebarCollapsed}
          currentRole="admin"
          activeTab={activeTab}
          onTabSelect={(tab) => setActiveTab(tab)}
        />

        <main className="dashboard-main">
          {/* Header Title Bar */}
          <div className="dashboard-header">
            <div className="dashboard-header-title">
              <h1>
                {activeTab === 'overview' && '⚡ Institutional Command Center'}
                {activeTab === 'students' && '🎓 Student Directory & Academic Status'}
                {activeTab === 'teachers' && '👥 Faculty & Teaching Staff Directory'}
                {activeTab === 'courses' && '📚 Campus Course Catalog & Syllabi'}
                {activeTab === 'finance' && '💳 Tuition & Institutional Finance'}
                {activeTab === 'settings' && '⚙️ System Configuration & Policies'}
              </h1>
              <p>
                {activeTab === 'overview' && 'Comprehensive Campus Oversight • Faculty Registers, Endowments & Student Records'}
                {activeTab === 'students' && 'Manage student enrollments, academic probation workflows, and active records'}
                {activeTab === 'teachers' && 'Faculty members, department assignments, and instructional directories'}
                {activeTab === 'courses' && 'Accredited degree courses, enrollment quotas, and syllabus tracks'}
                {activeTab === 'finance' && 'Fiscal tuition collections, financial ledger accounts, and endowments'}
                {activeTab === 'settings' && 'Platform governance, authentication rules, and institutional defaults'}
              </p>
            </div>

            <div className="dashboard-header-actions">
              <button className="btn btn-secondary" onClick={() => window.print()}>
                <Download size={16} /> Export Report
              </button>
              {activeTab === 'teachers' ? (
                <button className="btn btn-primary" onClick={() => { setTeacherError(''); setIsAddTeacherModalOpen(true); }}>
                  <Plus size={16} /> Add Teacher
                </button>
              ) : (
                <button className="btn btn-primary" onClick={() => { setStudentError(''); setIsAddModalOpen(true); }}>
                  <Plus size={16} /> Add Student
                </button>
              )}
            </div>
          </div>

          {/* Dynamic Tab Views */}
          {activeTab === 'overview' && (
            <>
              {/* Metric Stats Cards */}
              <div className="dashboard-stats-grid">
                <StatCard
                  title="Enrolled Students"
                  value={students.length}
                  subtitle="Active institutional scholars"
                  icon={GraduationCap}
                  colorScheme="indigo"
                  trend={`${students.filter(s => s.status === 'Active').length} Active`}
                  trendType="up"
                />
                <StatCard
                  title="Faculty Members"
                  value={teachers.length}
                  subtitle="Academic instruction staff"
                  icon={Users}
                  colorScheme="cyan"
                  trend={`${teachers.filter(t => t.status === 'Active').length} Active`}
                  trendType="up"
                />
                <StatCard
                  title="Accredited Courses"
                  value={courses.length}
                  subtitle="Degree curriculum offerings"
                  icon={BookOpen}
                  colorScheme="emerald"
                  trend="Curriculum active"
                  trendType="neutral"
                />
                <StatCard
                  title="System Health"
                  value="100%"
                  subtitle="SQLite Database Persistent"
                  icon={CheckCircle2}
                  colorScheme="amber"
                  trend="Online"
                  trendType="up"
                />
              </div>

              {/* Campus Academic Faculties Overview */}
              <div className="content-card" style={{ marginBottom: '2rem' }}>
                <div className="content-card-header">
                  <h3>Academic Program Distribution</h3>
                  <span className="badge badge-indigo">Enrolled Scholars</span>
                </div>
                <div style={{ padding: '1rem 0' }}>
                  <div className="dept-list">
                    <div className="dept-item">
                      <div className="dept-info">
                        <span className="dept-name">Computer Science & AI</span>
                        <span className="dept-count">
                          {students.filter(s => s.dept === 'Computer Science').length} Students
                        </span>
                      </div>
                      <div className="dept-progress-track">
                        <div className="dept-progress-fill" style={{ width: '60%', background: '#4f46e5' }}></div>
                      </div>
                    </div>

                    <div className="dept-item">
                      <div className="dept-info">
                        <span className="dept-name">Data Science & Analytics</span>
                        <span className="dept-count">
                          {students.filter(s => s.dept === 'Data Science').length} Students
                        </span>
                      </div>
                      <div className="dept-progress-track">
                        <div className="dept-progress-fill" style={{ width: '35%', background: '#06b6d4' }}></div>
                      </div>
                    </div>

                    <div className="dept-item">
                      <div className="dept-info">
                        <span className="dept-name">Business Administration</span>
                        <span className="dept-count">
                          {students.filter(s => s.dept === 'Business Admin').length} Students
                        </span>
                      </div>
                      <div className="dept-progress-track">
                        <div className="dept-progress-fill" style={{ width: '25%', background: '#10b981' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'students' && (() => {
            const displayedStudents = statusFilter === 'All' 
              ? students 
              : students.filter(s => s.status === statusFilter);

            const activeCount = students.filter(s => s.status === 'Active').length;
            const probationCount = students.filter(s => s.status === 'Probation').length;
            const inactiveCount = students.filter(s => s.status === 'Inactive').length;

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Status Change Feedback Toast */}
                {statusToast && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.9rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    background: statusToast.status === 'Active' ? 'rgba(16, 185, 129, 0.12)' : statusToast.status === 'Probation' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                    border: `1px solid ${statusToast.status === 'Active' ? 'rgba(16, 185, 129, 0.3)' : statusToast.status === 'Probation' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                    color: 'var(--text-main)',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <CheckCircle2 size={18} color={statusToast.status === 'Active' ? '#10B981' : statusToast.status === 'Probation' ? '#F59E0B' : '#EF4444'} />
                      <span>{statusToast.message}</span>
                    </div>
                    <button 
                      onClick={() => setStatusToast(null)} 
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* Educational / Policy Architecture: How Student Status Works */}
                <div style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem 1.5rem',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Info size={18} color="var(--primary)" />
                      <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        Institutional Policy: How Student Status Operates
                      </h4>
                    </div>
                    <button 
                      onClick={() => setShowPolicyGuide(!showPolicyGuide)}
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}
                    >
                      {showPolicyGuide ? 'Hide Policy Details ▲' : 'Explain Status Guidelines ▼'}
                    </button>
                  </div>

                  {showPolicyGuide && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                      <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', borderLeft: '4px solid #10B981' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#10B981', fontSize: '0.82rem', marginBottom: '6px' }}>
                          <span className="badge-dot" style={{ background: '#10B981' }}></span> 🟢 ACTIVE STATUS
                        </div>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                          <strong>Privileges:</strong> Good academic standing. Full campus privileges enabled.
                        </p>
                      </div>

                      <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', borderLeft: '4px solid #F59E0B' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#F59E0B', fontSize: '0.82rem', marginBottom: '6px' }}>
                          <span className="badge-dot" style={{ background: '#F59E0B' }}></span> 🟡 PROBATION STATUS
                        </div>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                          <strong>Privileges:</strong> Academic alert flag. Requires counselor advisory sessions.
                        </p>
                      </div>

                      <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', borderLeft: '4px solid #EF4444' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#EF4444', fontSize: '0.82rem', marginBottom: '6px' }}>
                          <span className="badge-dot" style={{ background: '#EF4444' }}></span> 🔴 INACTIVE STATUS
                        </div>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                          <strong>Privileges:</strong> Registration suspended. LMS portal locked.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Status Filter Tabs */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginRight: '4px' }}>Quick Filter:</span>
                  <button
                    className={`btn btn-sm ${statusFilter === 'All' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setStatusFilter('All')}
                  >
                    All Students ({students.length})
                  </button>
                  <button
                    className={`btn btn-sm ${statusFilter === 'Active' ? 'btn-primary' : 'btn-secondary'}`}
                    style={statusFilter === 'Active' ? { background: '#10B981', borderColor: '#10B981', color: '#fff' } : {}}
                    onClick={() => setStatusFilter('Active')}
                  >
                    🟢 Active ({activeCount})
                  </button>
                  <button
                    className={`btn btn-sm ${statusFilter === 'Probation' ? 'btn-primary' : 'btn-secondary'}`}
                    style={statusFilter === 'Probation' ? { background: '#F59E0B', borderColor: '#F59E0B', color: '#000' } : {}}
                    onClick={() => setStatusFilter('Probation')}
                  >
                    🟡 Probation ({probationCount})
                  </button>
                  <button
                    className={`btn btn-sm ${statusFilter === 'Inactive' ? 'btn-primary' : 'btn-secondary'}`}
                    style={statusFilter === 'Inactive' ? { background: '#EF4444', borderColor: '#EF4444', color: '#fff' } : {}}
                    onClick={() => setStatusFilter('Inactive')}
                  >
                    🔴 Inactive ({inactiveCount})
                  </button>
                </div>

                <DataTable
                  title="Full Students Directory"
                  subtitle={`Showing ${displayedStudents.length} of ${students.length} students • Select any dropdown in 'Status' to update instantly`}
                  columns={studentColumns}
                  data={displayedStudents}
                  searchPlaceholder="Search by name, email, roll number..."
                  actionButton={
                    <button className="btn btn-primary btn-sm" onClick={() => { setStudentError(''); setIsAddModalOpen(true); }}>
                      <Plus size={14} /> Register New Student
                    </button>
                  }
                />
              </div>
            );
          })()}

          {activeTab === 'teachers' && (
            <DataTable
              title="Faculty & Teaching Staff Directory"
              subtitle="Verified academic instructors and department assignments"
              columns={teacherColumns}
              data={teachers}
              searchPlaceholder="Search faculty members..."
              actionButton={
                <button className="btn btn-primary btn-sm" onClick={() => { setTeacherError(''); setIsAddTeacherModalOpen(true); }}>
                  <Plus size={14} /> Register New Teacher
                </button>
              }
            />
          )}

          {activeTab === 'courses' && (
            <DataTable
              title="Campus Course Catalog"
              subtitle="Accredited syllabus programs and active capacity metrics"
              columns={courseColumns}
              data={courses}
              searchPlaceholder="Search course codes..."
            />
          )}

          {(activeTab === 'finance' || activeTab === 'settings') && (
            <div className="content-card" style={{ textAlign: 'center', padding: '3.5rem' }}>
              <CheckCircle2 size={40} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
              <h3>{activeTab.toUpperCase()} Module Online</h3>
              <p style={{ color: 'var(--text-muted)', maxWidth: 450, margin: '0 auto' }}>
                All systems configured for 2026 Academic Term. Financial records are synced with campus treasury gateway.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Add Teacher Modal */}
      <Modal
        isOpen={isAddTeacherModalOpen}
        onClose={() => setIsAddTeacherModalOpen(false)}
        title="Register New Teacher / Faculty"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsAddTeacherModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAddTeacher}>Register Teacher</button>
          </>
        }
      >
        {teacherError && (
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
            <span>{teacherError}</span>
          </div>
        )}

        <form onSubmit={handleAddTeacher}>
          <div className="form-group">
            <label>Teacher Full Name</label>
            <input
              type="text"
              required
              className="form-control"
              placeholder="e.g. Prof. David Miller"
              value={newTeacher.name}
              onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Institutional Email</label>
            <input
              type="email"
              required
              className="form-control"
              placeholder="david.m@edumanage.edu"
              value={newTeacher.email}
              onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Department</label>
            <select
              className="form-control"
              value={newTeacher.dept}
              onChange={(e) => setNewTeacher({ ...newTeacher, dept: e.target.value })}
            >
              <option value="Computer Science">Computer Science</option>
              <option value="Data Science">Data Science</option>
              <option value="Business Admin">Business Admin</option>
              <option value="Biotechnology">Biotechnology</option>
              <option value="Mechanical Eng.">Mechanical Eng.</option>
            </select>
          </div>

          <div className="form-group">
            <label>Courses Assigned</label>
            <input
              type="text"
              required
              className="form-control"
              placeholder="e.g. CS101: Systems Architecture, CS302"
              value={newTeacher.courses}
              onChange={(e) => setNewTeacher({ ...newTeacher, courses: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lock size={14} /> Teacher Account Password (Unique, Manually Entered)
            </label>
            <input
              type="password"
              required
              className="form-control"
              placeholder="Enter unique password for this teacher..."
              value={newTeacher.password}
              onChange={(e) => {
                setNewTeacher({ ...newTeacher, password: e.target.value });
                if (teacherError) setTeacherError('');
              }}
            />
            <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
              Must be unique across all accounts in the system. If duplicate, system will reject with "Invalid or already used password."
            </small>
          </div>
        </form>
      </Modal>

      {/* Add Student Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Student"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAddStudent}>Register Student</button>
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

        <form onSubmit={handleAddStudent}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              required
              className="form-control"
              placeholder="e.g. Jordan Hayes"
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
              placeholder="jordan.h@edumanage.edu"
              value={newStudent.email}
              onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label>Roll Number</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. 22CS01"
                value={newStudent.roll}
                onChange={(e) => setNewStudent({ ...newStudent, roll: e.target.value })}
              />
            </div>
            <div>
              <label>Class Code</label>
              <select
                className="form-control"
                value={newStudent.class_code}
                onChange={(e) => setNewStudent({ ...newStudent, class_code: e.target.value })}
              >
                <option value="CS101">CS101</option>
                <option value="DS204">DS204</option>
                <option value="CS302">CS302</option>
                <option value="IT410">IT410</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Department</label>
            <select
              className="form-control"
              value={newStudent.dept}
              onChange={(e) => setNewStudent({ ...newStudent, dept: e.target.value })}
            >
              <option value="Computer Science">Computer Science</option>
              <option value="Data Science">Data Science</option>
              <option value="Business Admin">Business Admin</option>
              <option value="Biotechnology">Biotechnology</option>
              <option value="Mechanical Eng.">Mechanical Eng.</option>
            </select>
          </div>

          <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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

            <div>
              <label>Initial GPA</label>
              <input
                type="text"
                className="form-control"
                value={newStudent.gpa}
                onChange={(e) => setNewStudent({ ...newStudent, gpa: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lock size={14} /> Student Account Password (Unique, Manually Entered)
            </label>
            <input
              type="password"
              required
              className="form-control"
              placeholder="Enter unique password for student..."
              value={newStudent.password}
              onChange={(e) => {
                setNewStudent({ ...newStudent, password: e.target.value });
                if (studentError) setStudentError('');
              }}
            />
            <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
              Must be unique across all accounts. If duplicate, system will show "Invalid or already used password."
            </small>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
