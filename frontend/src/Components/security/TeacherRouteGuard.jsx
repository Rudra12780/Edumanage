import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Lock,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { TEACHER_ROUTE, isTeacherAuthorized, setTeacherAuthorized } from '../../config/teacherConfig';
import TeacherDashboard from '../page/TeacherDashboard';
import ThemeSwitcher from '../page/ThemeSwitcher';
import { api } from '../../config/api';
import '../css/AdminRouteGuard.css';

const TeacherRouteGuard = ({ currentUser, onRoleChange }) => {
  const [isAuth, setIsAuth] = useState(isTeacherAuthorized());
  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successNotice, setSuccessNotice] = useState(false);
  const [activeTeacherUser, setActiveTeacherUser] = useState(() => {
    const saved = sessionStorage.getItem('edumanage_current_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.role === 'teacher') return parsed;
      } catch (e) {}
    }
    return currentUser;
  });

  const handleAuthorize = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const entered = passcode.trim();

    if (!entered) return;

    try {
      const res = await api.post('/auth/teacher-clearance', { passcode: entered });

      if (res && res.authorized) {
        setErrorMsg('');
        setSuccessNotice(true);
        setTeacherAuthorized(true);

        const teacherUser = res.user || {
          name: 'Faculty Instructor',
          role: 'teacher',
          email: 'teacher@edumanage.edu'
        };

        setActiveTeacherUser(teacherUser);
        sessionStorage.setItem('edumanage_current_user', JSON.stringify(teacherUser));

        if (onRoleChange) {
          onRoleChange('teacher');
        }

        setTimeout(() => {
          setIsAuth(true);
        }, 350);
      }
    } catch (err) {
      setErrorMsg(err.message || 'ACCESS DENIED: Invalid teacher credentials.');
      setSuccessNotice(false);
    }
  };

  // If already authorized, render the Teacher Dashboard
  if (isAuth) {
    return (
      <TeacherDashboard 
        currentUser={activeTeacherUser || currentUser} 
        onRoleChange={onRoleChange} 
      />
    );
  }

  // Otherwise, present the restricted Faculty Security Gate
  return (
    <div className="admin-guard-container">
      <div className="admin-guard-topbar">
        <Link to="/" className="admin-guard-back-btn">
          <ArrowLeft size={16} /> Student Login
        </Link>
        <ThemeSwitcher />
      </div>

      <div className="admin-guard-card">
        <div style={{ textAlign: 'center' }}>
          <div className="admin-security-stamp" style={{ background: 'var(--primary-light)', color: 'var(--primary)', borderColor: 'var(--primary)' }}>
            <BookOpen size={14} /> FACULTY DESK • CREDENTIAL VERIFICATION
          </div>
        </div>

        <div className="admin-guard-header">
          <div className="admin-guard-icon-box" style={{ background: 'var(--primary-light)', color: 'var(--primary)', borderColor: 'var(--primary)' }}>
            <KeyRound size={34} strokeWidth={2.5} />
          </div>
          <h1 className="admin-guard-title">TEACHER ACCESS GATE</h1>
          <p className="admin-guard-subtitle">
            Enter your assigned teacher password to unlock faculty desk
          </p>
        </div>

        {errorMsg && (
          <div className="admin-guard-alert error">
            <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>{errorMsg}</div>
          </div>
        )}

        {successNotice && (
          <div className="admin-guard-alert" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', borderColor: '#10B981' }}>
            <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>Access Granted! Unlocking Faculty Instruction Suite...</div>
          </div>
        )}

        <form className="admin-guard-form" onSubmit={handleAuthorize}>
          <div className="admin-field-group">
            <label htmlFor="teacher-passcode-input">Teacher Password / Clearance Key</label>
            <div className="admin-input-wrapper">
              <Lock size={18} className="admin-input-icon" />
              <input 
                id="teacher-passcode-input"
                type="password"
                required
                className="admin-password-input"
                placeholder="Enter your assigned faculty password..."
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                autoFocus
              />
            </div>
          </div>

          <button type="submit" className="admin-submit-btn">
            Access Faculty Desk <ArrowRight size={18} />
          </button>
        </form>

        <div className="admin-guard-footer">
          <span>Protected Route: <code>{TEACHER_ROUTE}</code></span>
          <Link to="/" className="admin-guard-link">
            Student Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TeacherRouteGuard;
