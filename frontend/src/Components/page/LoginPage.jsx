import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  GraduationCap,
  Shield,
  BookOpen,
  User,
  Mail,
  Lock,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import '../css/LoginPage.css';

const LoginPage = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [role, setRole] = useState('admin');
  const [email, setEmail] = useState('admin@edumanage.edu');
  const [password, setPassword] = useState('password123');

  const presetCredentials = {
    admin: {
      email: 'admin@edumanage.edu',
      password: 'password123',
      name: 'Dr. Sarah Jenkins',
      role: 'admin',
      dashboard: '/admin'
    },
    teacher: {
      email: 'teacher@edumanage.edu',
      password: 'password123',
      name: 'Prof. David Miller',
      role: 'teacher',
      dashboard: '/teacher'
    },
    student: {
      email: 'student@edumanage.edu',
      password: 'password123',
      name: 'Alex Rivera',
      role: 'student',
      dashboard: '/student'
    }
  };

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setEmail(presetCredentials[selectedRole].email);
    setPassword(presetCredentials[selectedRole].password);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const userObj = presetCredentials[role];
    if (onLoginSuccess) {
      onLoginSuccess(userObj);
    }
    navigate(userObj.dashboard);
  };

  const handleInstantDemo = (demoRole) => {
    const userObj = presetCredentials[demoRole];
    if (onLoginSuccess) {
      onLoginSuccess(userObj);
    }
    navigate(userObj.dashboard);
  };

  return (
    <div className="login-page-container">
      <div className="login-bg-glow"></div>

      <div className="login-card">
        <div className="login-header">
          <div className="login-brand-icon">
            <GraduationCap size={26} />
          </div>
          <h2>Welcome to EduManage</h2>
          <p>Sign in to access your customized academic portal</p>
        </div>

        {/* Role Selector */}
        <div className="login-role-tabs">
          <button 
            type="button"
            className={`login-role-tab ${role === 'admin' ? 'active' : ''}`}
            onClick={() => handleRoleSelect('admin')}
          >
            <Shield size={16} />
            <span>Admin</span>
          </button>
          <button 
            type="button"
            className={`login-role-tab ${role === 'teacher' ? 'active' : ''}`}
            onClick={() => handleRoleSelect('teacher')}
          >
            <BookOpen size={16} />
            <span>Teacher</span>
          </button>
          <button 
            type="button"
            className={`login-role-tab ${role === 'student' ? 'active' : ''}`}
            onClick={() => handleRoleSelect('student')}
          >
            <User size={16} />
            <span>Student</span>
          </button>
        </div>

        {/* 1-Click Instant Demo Login */}
        <div className="demo-preset-box">
          <div className="demo-preset-text">
            <strong>Ready for 1-Click Demo?</strong>
            <span>Log in immediately as {role.toUpperCase()}</span>
          </div>
          <button 
            type="button" 
            className="demo-btn"
            onClick={() => handleInstantDemo(role)}
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
            Sign In as {role.charAt(0).toUpperCase() + role.slice(1)} <ArrowRight size={16} />
          </button>
        </form>

        <div className="login-footer-links">
          <span>Return to </span>
          <Link to="/">EduManage Home</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
