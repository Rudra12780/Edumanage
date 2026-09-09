import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  ArrowRight,
  BookOpen,
  UserCheck,
  CheckCircle,
  BarChart3,
  Calendar,
  Lock,
  Layers,
  Sparkles,
  Award
} from 'lucide-react';
import '../css/LandingPage.css';
import ThemeSwitcher from './ThemeSwitcher';

const LandingPage = () => {
  const navigate = useNavigate();
  const [activeRoleTab, setActiveRoleTab] = useState('teacher');

  const roleDetails = {
    teacher: {
      title: 'Faculty Instruction & Grading Suite',
      desc: 'Empowering educators with intuitive attendance management, streamlined assignment evaluations, and class schedule management.',
      features: [
        '1-Click batch attendance recording with live analytics',
        'Assignment grading queue with instant feedback',
        'Direct student inquiry desk and announcement board',
        'Real-time class progress and curriculum tracker'
      ],
      route: '/teacher@1234',
      btnText: 'Launch Faculty Desk',
      preview: {
        metric1: { tag: 'Assigned Classes', val: '4 Classes' },
        metric2: { tag: 'Active Students', val: '156 Total' },
        metric3: { tag: 'Pending Reviews', val: '18 Tasks' },
        metric4: { tag: 'Today Lectures', val: '3 Sessions' },
      }
    },
    student: {
      title: 'Student Academic Success Hub',
      desc: 'An inspiring, student-first dashboard to track coursework, submit homework, monitor GPA milestones, and stay ahead of deadlines.',
      features: [
        'Visual cumulative GPA tracking & transcript projections',
        'Assignment dropzone with status badges & alerts',
        'Live course syllabus progress and lecture notes',
        'Interactive weekly timetable and exam calendar'
      ],
      route: '/student',
      btnText: 'Launch Student Portal',
      preview: {
        metric1: { tag: 'Current GPA', val: '3.88 / 4.0' },
        metric2: { tag: 'Credits Done', val: '74 / 120' },
        metric3: { tag: 'Attendance Rate', val: '96%' },
        metric4: { tag: 'Active Courses', val: '6 Enrolled' },
      }
    }
  };

  const currentDetails = roleDetails[activeRoleTab];

  return (
    <div className="landing-page-container">
      {/* Navigation Header */}
      <nav className="landing-nav">
        <div className="landing-brand">
          <div className="badge-icon">
            <GraduationCap size={20} strokeWidth={2.5} />
          </div>
          <div className="brand-text-block">
            <span className="brand-title">EDU·MANAGE</span>
            <span className="brand-sub">OPERATING SYSTEM</span>
          </div>
        </div>

        <div className="landing-nav-links">
          <a href="#features" className="landing-nav-link">Architecture</a>
          <a href="#roles" className="landing-nav-link">Portals</a>
          <a href="#impact" className="landing-nav-link">Record</a>
        </div>

        <div className="landing-nav-actions">
          <ThemeSwitcher />
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => navigate('/')}
          >
            Sign In
          </button>
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => navigate('/teacher@1234')}
          >
            Faculty Portal
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-chip">
          <span className="pulse-dot"></span>
          <span>HIGH-CONTRAST ACADEMIC INFRASTRUCTURE // MMXXVI</span>
        </div>

        <h1 className="hero-title">
          THE ARCHITECTURE OF <br />
          <span className="gradient-text">HIGHER LEARNING</span>
        </h1>

        <p className="hero-subtitle">
          A dignified, cohesive operating platform for deans, distinguished faculty, and scholars.
          Governing university operations with monumental precision and architectural symmetry.
        </p>

        <div className="hero-cta-group">
          <button 
            className="btn btn-primary btn-lg"
            onClick={() => navigate('/')}
          >
            Enter Sanctuary <ArrowRight size={16} />
          </button>
          <button 
            className="btn btn-secondary btn-lg"
            onClick={() => {
              const el = document.getElementById('roles');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Inspect Portals
          </button>
        </div>
      </section>

      {/* Stats Counter */}
      <div className="hero-stats-row" id="impact">
        <div className="hero-stat-item">
          <div className="hero-stat-num">XII,000+</div>
          <div className="hero-stat-label">Enrolled Scholars</div>
        </div>
        <div className="hero-stat-item">
          <div className="hero-stat-num">99.4%</div>
          <div className="hero-stat-label">Institutional Uptime</div>
        </div>
        <div className="hero-stat-item">
          <div className="hero-stat-num">CDL+</div>
          <div className="hero-stat-label">Chartered Faculties</div>
        </div>
        <div className="hero-stat-item">
          <div className="hero-stat-num">3.2M</div>
          <div className="hero-stat-label">Academic Evaluations</div>
        </div>
      </div>

      {/* Role Showcase Section */}
      <section className="role-showcase-section" id="roles">
        <div className="section-header">
          <h2>CHARTERED FOR EVERY STAKEHOLDER</h2>
          <p>Dignified specialized suites curated for governance, instruction, and scholarship</p>
        </div>

        <div className="role-tabs">
          <button 
            className={`role-tab-btn ${activeRoleTab === 'teacher' ? 'active' : ''}`}
            onClick={() => setActiveRoleTab('teacher')}
          >
            <BookOpen size={15} /> I · Faculty Desk
          </button>
          <button 
            className={`role-tab-btn ${activeRoleTab === 'student' ? 'active' : ''}`}
            onClick={() => setActiveRoleTab('student')}
          >
            <UserCheck size={15} /> II · Scholar Hub
          </button>
        </div>

        <div className="role-preview-card">
          <div className="role-preview-info">
            <h3>{currentDetails.title}</h3>
            <p>{currentDetails.desc}</p>
            <ul className="role-preview-features">
              {currentDetails.features.map((feat, i) => (
                <li key={i}>
                  <CheckCircle size={16} />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
            <button 
              className="btn btn-primary"
              onClick={() => navigate(currentDetails.route)}
            >
              {currentDetails.btnText} <ArrowRight size={16} />
            </button>
          </div>

          <div className="role-preview-visual">
            <div className="visual-mock-header">
              <div className="visual-mock-dots">
                <span className="visual-mock-dot dot-red"></span>
                <span className="visual-mock-dot dot-yellow"></span>
                <span className="visual-mock-dot dot-green"></span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Live Metric Telemetry</span>
            </div>
            <div className="visual-mock-grid">
              <div className="visual-mock-box">
                <span className="tag">{currentDetails.preview.metric1.tag}</span>
                <div className="val">{currentDetails.preview.metric1.val}</div>
              </div>
              <div className="visual-mock-box">
                <span className="tag">{currentDetails.preview.metric2.tag}</span>
                <div className="val">{currentDetails.preview.metric2.val}</div>
              </div>
              <div className="visual-mock-box">
                <span className="tag">{currentDetails.preview.metric3.tag}</span>
                <div className="val">{currentDetails.preview.metric3.val}</div>
              </div>
              <div className="visual-mock-box">
                <span className="tag">{currentDetails.preview.metric4.tag}</span>
                <div className="val">{currentDetails.preview.metric4.val}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section className="features-grid-section" id="features">
        <div className="section-header">
          <h2>Full-Spectrum Academic Architecture</h2>
          <p>Everything modern academic institutions require under one beautiful roof</p>
        </div>

        <div className="features-grid">
          <div className="feature-box">
            <div className="feature-box-icon">
              <BarChart3 size={24} />
            </div>
            <h4>Real-Time Analytics</h4>
            <p>Track student performance trends, attendance patterns, and grade distributions with actionable insights.</p>
          </div>

          <div className="feature-box">
            <div className="feature-box-icon">
              <Calendar size={24} />
            </div>
            <h4>Smart Timetabling</h4>
            <p>Automated lecture scheduling and conflict-free room allocations for smooth daily classroom operations.</p>
          </div>

          <div className="feature-box">
            <div className="feature-box-icon">
              <Lock size={24} />
            </div>
            <h4>Role-Based Access</h4>
            <p>Enterprise grade data privacy and permissions ensuring each role accesses only relevant information.</p>
          </div>

          <div className="feature-box">
            <div className="feature-box-icon">
              <Award size={24} />
            </div>
            <h4>Grading & Transcript Hub</h4>
            <p>Automated GPA computations, digital report cards, and instant assignment evaluation workflows.</p>
          </div>

          <div className="feature-box">
            <div className="feature-box-icon">
              <Layers size={24} />
            </div>
            <h4>Unified Architecture</h4>
            <p>Modular micro-components built cleanly separating presentation and style logic for high scalability.</p>
          </div>

          <div className="feature-box">
            <div className="feature-box-icon">
              <Sparkles size={24} />
            </div>
            <h4>Modern User Experience</h4>
            <p>Fluid typography, sleek dark/light mode accents, glassmorphism, and responsive mobile-first layouts.</p>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <div className="landing-cta-banner">
        <h2>Ready to Transform Your Campus?</h2>
        <p>Experience the EduManage platform right now with interactive sample environments.</p>
        <button 
          className="btn btn-primary btn-lg" 
          onClick={() => navigate('/')}
        >
          Sign In / Demo Login
        </button>
      </div>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="landing-brand" style={{ fontSize: '1.2rem' }}>
            <div className="badge-icon" style={{ width: '30px', height: '30px' }}>
              <GraduationCap size={16} />
            </div>
            <span>EduManage</span>
          </div>

          <div className="footer-copyright">
            © 2026 EduManage System Inc. All rights reserved.
          </div>

          <div className="footer-links">
            <a href="#privacy">Privacy</a>
            <a href="#terms">Terms</a>
            <a href="#support">Campus Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
