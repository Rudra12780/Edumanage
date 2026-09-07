import React, { useState } from 'react';
import {
  Users,
  GraduationCap,
  BookOpen,
  DollarSign,
  Plus,
  Download,
  Filter,
  CheckCircle2
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

  // Initial State for Students
  const [students, setStudents] = useState([
    { id: 'STU-1092', name: 'Sophia Chen', email: 'sophia.c@edumanage.edu', dept: 'Computer Science', year: 'Year 3', gpa: '3.92', status: 'Active' },
    { id: 'STU-1093', name: 'Liam Walker', email: 'liam.w@edumanage.edu', dept: 'Mechanical Eng.', year: 'Year 2', gpa: '3.64', status: 'Active' },
    { id: 'STU-1094', name: 'Emma Watson', email: 'emma.w@edumanage.edu', dept: 'Business Admin', year: 'Year 4', gpa: '3.88', status: 'Active' },
    { id: 'STU-1095', name: 'Noah Miller', email: 'noah.m@edumanage.edu', dept: 'Data Science', year: 'Year 1', gpa: '3.45', status: 'Probation' },
    { id: 'STU-1096', name: 'Olivia Brown', email: 'olivia.b@edumanage.edu', dept: 'Biotechnology', year: 'Year 3', gpa: '3.97', status: 'Active' },
    { id: 'STU-1097', name: 'Lucas Scott', email: 'lucas.s@edumanage.edu', dept: 'Computer Science', year: 'Year 2', gpa: '3.21', status: 'Inactive' },
  ]);

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
      header: 'Status',
      render: (row) => {
        let badgeClass = 'badge-success';
        if (row.status === 'Probation') badgeClass = 'badge-warning';
        if (row.status === 'Inactive') badgeClass = 'badge-danger';
        return <span className={`badge ${badgeClass}`}>{row.status}</span>;
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
    <div>
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
              <h1>Admin Command Center</h1>
              <p>Institutional oversight, faculty metrics, student records & campus finance</p>
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

          {activeTab === 'students' && (
            <DataTable
              title="Full Students Directory"
              subtitle="All registered students and academic status"
              columns={studentColumns}
              data={students}
              searchPlaceholder="Search by name, email, department..."
              actionButton={
                <button className="btn btn-primary btn-sm" onClick={() => setIsAddModalOpen(true)}>
                  <Plus size={14} /> Register New Student
                </button>
              }
            />
          )}

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
