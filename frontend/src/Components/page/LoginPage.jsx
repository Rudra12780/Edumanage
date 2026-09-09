import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  GraduationCap,
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import ThemeSwitcher from './ThemeSwitcher';
import { api } from '../../config/api';
import '../css/LoginPage.css';

const LoginPage = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await api.post('/auth/login', {
        email: email.trim(),
        password: password.trim()
      });

      if (res && res.user) {
        sessionStorage.setItem('edumanage_current_user', JSON.stringify(res.user));
        if (onLoginSuccess) {
          onLoginSuccess(res.user);
        }

        if (res.user.role === 'student') {
          navigate('/student');
        } else if (res.user.role === 'teacher') {
          navigate('/teacher@1234');
        } else if (res.user.role === 'admin') {
          navigate('/admin@1234');
        } else {
          navigate('/student');
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-top-bar">
        <Link to="/landing" className="login-back-link">
          <ArrowLeft size={16} /> Campus Overview
        </Link>
        <ThemeSwitcher />
      </div>

      <div className="login-bg-glow"></div>

      <div className="login-card">
        <div className="login-header">
          <div className="login-brand-icon">
            <GraduationCap size={28} strokeWidth={2.5} />
          </div>
          <h2>⚡ Student Portal Sign In</h2>
          <p>AUTHENTICATE TO ACCESS YOUR SCHOLAR DESK</p>
        </div>

        {errorMsg && (
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
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Authentication Form */}
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label>Institutional Email</label>
            <div className="login-input-wrapper">
              <Mail size={16} className="login-input-icon" />
              <input 
                type="email" 
                required
                className="login-input"
                placeholder="student@institution.edu"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                autoFocus
              />
            </div>
          </div>

          <div className="login-field">
            <label>Password</label>
            <div className="login-input-wrapper">
              <Lock size={16} className="login-input-icon" />
              <input 
                type="password" 
                required
                className="login-input"
                placeholder="Enter account password..."
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
              />
            </div>
          </div>

          <div className="login-options">
            <label>
              <input type="checkbox" defaultChecked /> Remember me
            </label>
            <a href="#help" onClick={(e) => { e.preventDefault(); alert('Please contact your department faculty for student account password credentials.'); }}>
              Need credentials help?
            </a>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary login-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Authenticating...' : 'Sign In as Student'} <ArrowRight size={16} />
          </button>
        </form>

        <div className="login-footer-links" style={{ flexDirection: 'column', gap: '6px', textAlign: 'center' }}>
          <div>
            <span>Explore </span>
            <Link to="/landing">Campus Overview & Architecture</Link>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Faculty & Admin portals: direct institutional routes (<code>/teacher@1234</code>, <code>/admin@1234</code>)
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
