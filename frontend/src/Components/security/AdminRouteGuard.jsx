import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Lock,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { ADMIN_PASSWORD, ADMIN_ROUTE, isAdminAuthorized, setAdminAuthorized } from '../../config/adminConfig';
import AdminDashboard from '../page/AdminDashboard';
import ThemeSwitcher from '../page/ThemeSwitcher';
import '../css/AdminRouteGuard.css';

const AdminRouteGuard = ({ currentUser, onRoleChange }) => {
  const [isAuth, setIsAuth] = useState(isAdminAuthorized());
  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successNotice, setSuccessNotice] = useState(false);

  const handleAuthorize = (e) => {
    e.preventDefault();
    if (passcode.trim() === ADMIN_PASSWORD) {
      setErrorMsg('');
      setSuccessNotice(true);
      setAdminAuthorized(true);
      setTimeout(() => {
        setIsAuth(true);
      }, 400);
    } else {
      setErrorMsg('ACCESS DENIED: Invalid administrator passcode. Verification failed.');
      setSuccessNotice(false);
    }
  };

  // If already authorized, render the Admin Dashboard
  if (isAuth) {
    return (
      <AdminDashboard 
        currentUser={currentUser} 
        onRoleChange={onRoleChange} 
      />
    );
  }

  // Otherwise, present the restricted Admin Security Gate
  return (
    <div className="admin-guard-container" data-style="neo-brutalism">
      <div className="admin-guard-topbar">
        <Link to="/" className="admin-guard-back-btn">
          <ArrowLeft size={16} /> EduManage Home
        </Link>
        <ThemeSwitcher />
      </div>

      <div className="admin-guard-card">
        <div style={{ textAlign: 'center' }}>
          <div className="admin-security-stamp">
            <ShieldAlert size={14} /> RESTRICTED ROUTE • CLEARANCE REQ.
          </div>
        </div>

        <div className="admin-guard-header">
          <div className="admin-guard-icon-box">
            <KeyRound size={34} strokeWidth={2.5} />
          </div>
          <h1 className="admin-guard-title">ADMIN SECURITY GATE</h1>
          <p className="admin-guard-subtitle">
            Restricted Administrative Portal Access
          </p>
        </div>

        {errorMsg && (
          <div className="admin-guard-alert error">
            <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>{errorMsg}</div>
          </div>
        )}

        {successNotice && (
          <div className="admin-guard-alert" style={{ background: '#d4edda', color: '#155724' }}>
            <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>Access Granted! Unlocking administrator console...</div>
          </div>
        )}

        <form className="admin-guard-form" onSubmit={handleAuthorize}>
          <div className="admin-field-group">
            <label htmlFor="admin-passcode-input">Admin Clearance Passcode</label>
            <div className="admin-input-wrapper">
              <Lock size={18} className="admin-input-icon" />
              <input 
                id="admin-passcode-input"
                type="password"
                required
                className="admin-password-input"
                placeholder="Enter edumanage password..."
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
            <span className="admin-hint-code">edumanage</span>
          </div>

          <button type="submit" className="admin-submit-btn">
            Authorize Clearance <ArrowRight size={18} />
          </button>
        </form>

        <div className="admin-guard-footer">
          <span>Protected Route: <code>{ADMIN_ROUTE}</code></span>
          <Link to="/login" className="admin-guard-link">
            Standard Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminRouteGuard;
