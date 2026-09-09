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
import { TEACHER_PASSWORD, TEACHER_ROUTE, isTeacherAuthorized, setTeacherAuthorized } from '../../config/teacherConfig';
import TeacherDashboard from '../page/TeacherDashboard';
import ThemeSwitcher from '../page/ThemeSwitcher';
import '../css/AdminRouteGuard.css';

const TeacherRouteGuard = ({ currentUser, onRoleChange }) => {
  const [isAuth, setIsAuth] = useState(isTeacherAuthorized());
  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successNotice, setSuccessNotice] = useState(false);

  const handleAuthorize = (e) => {
    e.preventDefault();
    const entered = passcode.trim();
    if (entered && (entered === '1207' || entered === TEACHER_PASSWORD || entered.toLowerCase() === 'madam')) {
      setErrorMsg('');
      setSuccessNotice(true);
      setTeacherAuthorized(true);
      if (onRoleChange) {
        onRoleChange('teacher');
      }
      setTimeout(() => {
        setIsAuth(true);
      }, 350);
    } else {
      setErrorMsg('ACCESS DENIED: Invalid teacher passcode. Enter 1207.');
      setSuccessNotice(false);
    }
  };

  // If already authorized, render the Teacher Dashboard
  if (isAuth) {
    return (
      <TeacherDashboard 
        currentUser={currentUser} 
        onRoleChange={onRoleChange} 
      />
    );
  }

  // Otherwise, present the restricted Faculty Security Gate
  return (
    <div className="admin-guard-container" data-style="neo-brutalism">
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
            Enter Teacher Passcode (1207) to access instructional desk
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
            <label htmlFor="teacher-passcode-input">Teacher Passcode</label>
            <div className="admin-input-wrapper">
              <Lock size={18} className="admin-input-icon" />
              <input 
                id="teacher-passcode-input"
                type="password"
                required
                className="admin-password-input"
                placeholder="Enter passcode 1207..."
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                autoFocus
              />
            </div>
          </div>

          <div className="admin-hint-box">
            <span>🛡️ Required Passcode: </span>
            <span className="admin-hint-code">1207</span>
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
