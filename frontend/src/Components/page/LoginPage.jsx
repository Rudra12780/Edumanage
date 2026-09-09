import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  GraduationCap,
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import ThemeSwitcher from './ThemeSwitcher';
import '../css/LoginPage.css';

const LoginPage = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('student@edumanage.edu');
  const [password, setPassword] = useState('password123');

  const studentUser = {
    email: 'student@edumanage.edu',
    password: 'password123',
    name: 'Alex Rivera',
    role: 'student',
    dashboard: '/student'
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onLoginSuccess) {
      onLoginSuccess(studentUser);
    }
    navigate('/student');
  };

  const handleInstantDemo = () => {
    if (onLoginSuccess) {
      onLoginSuccess(studentUser);
    }
    navigate('/student');
  };

  return (
    <div className="login-page-container" data-style="neo-brutalism">
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

        {/* 1-Click Instant Demo Login */}
        <div className="demo-preset-box">
          <div className="demo-preset-text">
            <strong>Ready for 1-Click Demo?</strong>
            <span>Log in immediately as SCHOLAR (Alex Rivera)</span>
          </div>
          <button 
            type="button" 
            className="demo-btn"
            onClick={handleInstantDemo}
          >
            Instant Login <Sparkles size={12} style={{ display: 'inline', marginLeft: 4 }} />
          </button>
        </div>

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
                placeholder="you@institution.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="login-options">
            <label>
              <input type="checkbox" defaultChecked /> Remember me
            </label>
            <a href="#forgot" onClick={(e) => e.preventDefault()}>Forgot password?</a>
          </div>

          <button type="submit" className="btn btn-primary login-submit-btn">
            Sign In as Student <ArrowRight size={16} />
          </button>
        </form>

        <div className="login-footer-links" style={{ flexDirection: 'column', gap: '6px', textAlign: 'center' }}>
          <div>
            <span>Explore </span>
            <Link to="/landing">Campus Overview & Architecture</Link>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '4px' }}>
            Faculty & Admin portals: direct institutional routes (<code>/teacher@1234</code>, <code>/admin@1234</code>)
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
