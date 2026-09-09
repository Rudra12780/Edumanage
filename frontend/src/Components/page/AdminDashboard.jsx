import React, { useState } from 'react';
import {
  Users,
  GraduationCap,
  BookOpen,
  DollarSign,
  Plus,
  Download,
  Filter,
  CheckCircle2,
  Info
} from 'lucide-react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import StatCard from './StatCard';
import DataTable from './DataTable';
import Modal from './Modal';
import '../css/AdminDashboard.css';

const AdminDashboard = ({ currentUser, onRoleChange }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [statusToast, setStatusToast] = useState(null);
  const [showPolicyGuide, setShowPolicyGuide] = useState(true);

  // Initial State for Students
  const [students, setStudents] = useState([
    { id: 'STU-1092', name: 'Sophia Chen', email: 'sophia.c@edumanage.edu', dept: 'Computer Science', year: 'Year 3', gpa: '3.92', status: 'Active' },
    { id: 'STU-1093', name: 'Liam Walker', email: 'liam.w@edumanage.edu', dept: 'Mechanical Eng.', year: 'Year 2', gpa: '3.64', status: 'Active' },
    { id: 'STU-1094', name: 'Emma Watson', email: 'emma.w@edumanage.edu', dept: 'Business Admin', year: 'Year 4', gpa: '3.88', status: 'Active' },
    { id: 'STU-1095', name: 'Noah Miller', email: 'noah.m@edumanage.edu', dept: 'Data Science', year: 'Year 1', gpa: '3.45', status: 'Probation' },
    { id: 'STU-1096', name: 'Olivia Brown', email: 'olivia.b@edumanage.edu', dept: 'Biotechnology', year: 'Year 3', gpa: '3.97', status: 'Active' },
    { id: 'STU-1097', name: 'Lucas Scott', email: 'lucas.s@edumanage.edu', dept: 'Computer Science', year: 'Year 2', gpa: '3.21', status: 'Inactive' },
  ]);

  const handleStatusChange = (studentId, newStatus) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        return { ...s, status: newStatus };
      }
      return s;
    }));

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
  };

  // Initial State for Faculty
  const [teachers] = useState([
    { id: 'FAC-401', name: 'Dr. Robert Vance', dept: 'Computer Science', courses: 'CS101, Algorithms', students: 120, status: 'Active' },
    { id: 'FAC-402', name: 'Prof. David Miller', dept: 'Data Science', courses: 'Machine Learning, Stats', students: 95, status: 'Active' },
    { id: 'FAC-403', name: 'Dr. Clara Oswald', dept: 'Biotechnology', courses: 'Genetics, Cell Bio', students: 80, status: 'On Leave' },
    { id: 'FAC-404', name: 'Prof. Marcus Brody', dept: 'History & Arts', courses: 'World History, Archaeology', students: 110, status: 'Active' },
  ]);

  // Initial State for Courses
  const [courses] = useState([
    { code: 'CS101', name: 'Introduction to Computer Systems', dept: 'Computer Science', credits: 4, enrolled: 88, max: 90 },
    { code: 'DS204', name: 'Statistical Data Analysis', dept: 'Data Science', credits: 3, enrolled: 65, max: 70 },
    { code: 'BIO302', name: 'Molecular Genetics & Genomics', dept: 'Biotechnology', credits: 4, enrolled: 52, max: 60 },
    { code: 'BUS105', name: 'Principles of Financial Accounting', dept: 'Business', credits: 3, enrolled: 114, max: 120 },
  ]);

  // New Student Form State
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    dept: 'Computer Science',
    year: 'Year 1',
    gpa: '3.50',
    status: 'Active'
  });

  const handleAddStudent = (e) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.email) return;

    const created = {
      id: `STU-${Math.floor(1000 + Math.random() * 9000)}`,
      ...newStudent
    };

    setStudents([created, ...students]);
    setIsAddModalOpen(false);
    setNewStudent({
      name: '',
      email: '',
      dept: 'Computer Science',
      year: 'Year 1',
      gpa: '3.50',
      status: 'Active'
    });
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
    { header: 'Department', accessor: 'dept' },
    { header: 'Year', accessor: 'year', width: '100px' },
    { header: 'GPA', accessor: 'gpa', width: '90px' },
    {
      header: 'STATUS',
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
              className={`status-neo-select ${statusStyleClass}`}
              title="Click to change student status: Active, Probation, or Inactive"
            >
              <option value="Active" style={{ background: '#141418', color: '#4ADE80', fontWeight: '800' }}>ACTIVE</option>
              <option value="Probation" style={{ background: '#141418', color: '#FFE600', fontWeight: '800' }}>PROBATION</option>
              <option value="Inactive" style={{ background: '#141418', color: '#FF6584', fontWeight: '800' }}>INACTIVE</option>
            </select>
          </div>
        );
      }
    }
  ];

  const teacherColumns = [
    { header: 'Faculty ID', accessor: 'id', width: '120px' },
    { header: 'Faculty Name', accessor: 'name' },
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
          <span>{row.enrolled} / {row.max} enrolled</span>
          <div style={{ height: 5, background: 'var(--bg-surface)', borderRadius: 3, marginTop: 4, overflow: 'hidden' }}>
            <div style={{ width: `${(row.enrolled / row.max) * 100}%`, height: '100%', background: 'var(--primary)' }}></div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div data-style="neo-brutalism">
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
              <h1>⚡ Institutional Command Center</h1>
              <p>Neo-Brutalist University Oversight • Faculty Registers, Endowments & Student Records</p>
            </div>

            <div className="dashboard-header-actions">
              <button className="btn btn-secondary" onClick={() => window.print()}>
                <Download size={16} /> Export Report
              </button>
              <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
                <Plus size={16} /> Add Student
              </button>
            </div>
          </div>

          {/* Metric Stats Cards */}
          <div className="dashboard-stats-grid">
            <StatCard
              title="Total Enrolled Students"
              value={students.length + 2834}
              subtitle="Across 6 Academic Faculties"
              icon={GraduationCap}
              colorScheme="indigo"
              trend="+12.4% YoY"
              trendType="up"
            />
            <StatCard
              title="Active Faculty & Staff"
              value="142"
              subtitle="94% Full-Time Tenured"
              icon={Users}
              colorScheme="emerald"
              trend="+4.2%"
              trendType="up"
            />
            <StatCard
              title="Accredited Courses"
              value="38"
              subtitle="98% Capacity Filled"
              icon={BookOpen}
              colorScheme="cyan"
              trend="100% Active"
              trendType="neutral"
            />
            <StatCard
              title="Tuition Fees Collected"
              value="$1,420,800"
              subtitle="FY 2026 Academic Budget"
              icon={DollarSign}
              colorScheme="violet"
              trend="+8.6% Target"
              trendType="up"
            />
          </div>

          {/* Dynamic Tab Views */}
          {activeTab === 'overview' && (
            <>
              <div className="dashboard-grid-2col">
                <DataTable
                  title="Recent Student Registrations"
                  subtitle="Latest admissions verified by the registrar"
                  columns={studentColumns}
                  data={students.slice(0, 5)}
                  searchPlaceholder="Filter students..."
                  actionButton={
                    <button className="btn btn-primary btn-sm" onClick={() => setIsAddModalOpen(true)}>
                      <Plus size={14} /> Quick Add
                    </button>
                  }
                />

                {/* Department Distribution Card */}
                <div className="content-card">
                  <div className="content-card-header">
                    <h3>Faculty Enrollments</h3>
                    <Filter size={16} color="var(--text-muted)" />
                  </div>

                  <div className="dept-list">
                    <div className="dept-item">
                      <div className="dept-info">
                        <span className="dept-name">Computer Science & AI</span>
                        <span className="dept-count">1,120 Students (40%)</span>
                      </div>
                      <div className="dept-progress-track">
                        <div className="dept-progress-fill" style={{ width: '40%', background: '#4f46e5' }}></div>
                      </div>
                    </div>

                    <div className="dept-item">
                      <div className="dept-info">
                        <span className="dept-name">Business & Finance</span>
                        <span className="dept-count">740 Students (26%)</span>
                      </div>
                      <div className="dept-progress-track">
                        <div className="dept-progress-fill" style={{ width: '26%', background: '#06b6d4' }}></div>
                      </div>
                    </div>

                    <div className="dept-item">
                      <div className="dept-info">
                        <span className="dept-name">Biotechnology & Health</span>
                        <span className="dept-count">560 Students (20%)</span>
                      </div>
                      <div className="dept-progress-track">
                        <div className="dept-progress-fill" style={{ width: '20%', background: '#10b981' }}></div>
                      </div>
                    </div>

                    <div className="dept-item">
                      <div className="dept-info">
                        <span className="dept-name">Mechanical Engineering</span>
                        <span className="dept-count">420 Students (14%)</span>
                      </div>
                      <div className="dept-progress-track">
                        <div className="dept-progress-fill" style={{ width: '14%', background: '#f59e0b' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Audit & Activity Log */}
              <div className="content-card">
                <div className="content-card-header">
                  <h3>System Audit & Operational Events</h3>
                  <span className="badge badge-indigo">Real-Time</span>
                </div>
                <div className="activity-feed">
                  <div className="activity-item">
                    <div className="activity-dot green"></div>
                    <div className="activity-content">
                      <div className="activity-title">Semester Grade Submission Window Opened</div>
                      <div className="activity-desc">Instructors can now finalize evaluations for Mid-Term assessments.</div>
                      <div className="activity-time">15 minutes ago • System Trigger</div>
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-dot blue"></div>
                    <div className="activity-content">
                      <div className="activity-title">New Faculty Member Onboarded</div>
                      <div className="activity-desc">Dr. Clara Oswald assigned to Molecular Genetics course curriculum.</div>
                      <div className="activity-time">2 hours ago • Registrar Office</div>
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-dot purple"></div>
                    <div className="activity-content">
                      <div className="activity-title">Campus Fee Reconciliation Complete</div>
                      <div className="activity-desc">$142,000 processed in batch student tuition reconciliations.</div>
                      <div className="activity-time">Yesterday at 5:30 PM • Finance Gateway</div>
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
                          <strong>Privileges:</strong> Good academic standing (GPA ≥ 3.50). Full campus privileges enabled.<br />
                          <strong>Workflows:</strong> Access to lecture halls, LMS coursework dropzone, live attendance tracking, library lending, and official transcript issue.
                        </p>
                      </div>

                      <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', borderLeft: '4px solid #F59E0B' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#F59E0B', fontSize: '0.82rem', marginBottom: '6px' }}>
                          <span className="badge-dot" style={{ background: '#F59E0B' }}></span> 🟡 PROBATION STATUS
                        </div>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                          <strong>Privileges:</strong> Academic alert flag (GPA &lt; 3.50 or attendance &lt; 75%).<br />
                          <strong>Workflows:</strong> Still attends lectures and sits for examinations, but triggers mandatory weekly faculty mentoring. Restricted from student council.
                        </p>
                      </div>

                      <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', borderLeft: '4px solid #EF4444' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#EF4444', fontSize: '0.82rem', marginBottom: '6px' }}>
                          <span className="badge-dot" style={{ background: '#EF4444' }}></span> 🔴 INACTIVE STATUS
                        </div>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                          <strong>Privileges:</strong> Registration suspended or semester withdrawal.<br />
                          <strong>Workflows:</strong> LMS portal locked, coursework access blocked, and student ID pass deactivated. Re-activation requires Dean/Admin clearance.
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
                  searchPlaceholder="Search by name, email, department..."
                  actionButton={
                    <button className="btn btn-primary btn-sm" onClick={() => setIsAddModalOpen(true)}>
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
        </form>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
