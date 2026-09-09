import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  GraduationCap,
  Bell,
  Search,
  Menu,
  Shield,
  BookOpen,
  User,
  LogOut,
  ChevronDown
} from 'lucide-react';
import '../css/Navbar.css';
import ThemeSwitcher from './ThemeSwitcher';
import { ADMIN_ROUTE, setAdminAuthorized } from '../../config/adminConfig';
import { TEACHER_ROUTE, setTeacherAuthorized } from '../../config/teacherConfig';

const Navbar = ({ toggleSidebar, currentRole = 'admin', onRoleChange, currentUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Derive active display role
  let activeRole = currentRole;
  if (location.pathname.includes('/admin') || location.pathname === ADMIN_ROUTE || location.pathname.includes('/admin@1234')) activeRole = 'admin';
  else if (location.pathname.includes('/teacher') || location.pathname === TEACHER_ROUTE || location.pathname.includes('/teacher@1234')) activeRole = 'teacher';
  else if (location.pathname.includes('/student')) activeRole = 'student';

  const notifications = [
    { id: 1, text: 'New assignment submitted for CS101', time: '5m ago' },
    { id: 2, text: 'Tuition payment deadline approaching', time: '1h ago' },
    { id: 3, text: 'Faculty meeting scheduled at 4:00 PM', time: '3h ago' },
  ];

  const handleLogout = () => {
    setAdminAuthorized(false);
    setTeacherAuthorized(false);
    navigate('/');
  };

  const userDisplayName = currentUser?.name || (
    activeRole === 'admin' ? 'Dr. Sarah Jenkins' :
    activeRole === 'teacher' ? 'Prof. David Miller' : 'Alex Rivera'
  );

  const userInitial = userDisplayName.charAt(0);

  return (
    <header className="em-navbar">
      <div className="em-navbar-left">
        <button 
          className="em-menu-toggle" 
          onClick={toggleSidebar} 
          title="Toggle Navigation"
          aria-label="Toggle Navigation"
        >
          <Menu size={20} />
        </button>

        <div 
          className="em-nav-brand" 
          onClick={() => navigate('/')} 
          style={{ cursor: 'pointer' }}
        >
          <div className="brand-badge">
            <GraduationCap size={17} />
          </div>
          <div className="brand-text-block">
            <span className="brand-title">EDU·MANAGE</span>
            <span className="brand-sub">ACADEMIA</span>
          </div>
        </div>

        <div className="em-search-wrapper">
          <Search size={15} className="em-search-icon" />
          <input 
            type="text" 
            placeholder="Search directory, courses, faculty..." 
            className="em-search-input"
          />
        </div>
      </div>

      <div className="em-navbar-right">
        {/* Active Role Indicator */}
        <div className="em-role-switcher">
          {activeRole === 'admin' && (
            <span className="em-role-pill active" style={{ cursor: 'default', background: 'var(--neo-pink, #ff66c4)' }}>
              <Shield size={12} /> Admin
            </span>
          )}
          {activeRole === 'teacher' && (
            <span className="em-role-pill active" style={{ cursor: 'default', background: 'var(--neo-yellow, #ffe600)' }}>
              <BookOpen size={12} /> Faculty Desk
            </span>
          )}
          {activeRole === 'student' && (
            <span className="em-role-pill active" style={{ cursor: 'default', background: 'var(--neo-cyan, #38bdf8)' }}>
              <User size={12} /> Student Hub
            </span>
          )}
        </div>

        {/* Theme Switcher */}
        <ThemeSwitcher />

        {/* Notifications Button */}
        <div style={{ position: 'relative' }}>
          <button 
            className="em-icon-button"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="em-badge-dot"></span>
          </button>

          {showNotifications && (
            <div className="em-dropdown-popover">
              <div className="em-dropdown-header">
                <h4>Notifications</h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}>
                  Mark all read
                </span>
              </div>
              <div className="em-dropdown-items">
                {notifications.map((item) => (
                  <div key={item.id} className="em-dropdown-item">
                    <div className="notif-icon">
                      <Bell size={14} />
                    </div>
                    <div>
                      <div className="notif-text">{item.text}</div>
                      <div className="notif-time">{item.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User profile dropdown */}
        <div style={{ position: 'relative' }}>
          <div 
            className="em-user-profile" 
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
          >
            <div className="em-avatar">{userInitial}</div>
            <div className="em-user-info">
              <span className="em-user-name">{userDisplayName}</span>
              <span className="em-user-role-label">{activeRole}</span>
            </div>
            <ChevronDown size={14} color="var(--text-muted)" />
          </div>

          {showUserMenu && (
            <div className="em-dropdown-popover" style={{ width: '200px' }}>
              <div className="em-dropdown-header">
                <h4>My Account</h4>
              </div>
              <div style={{ padding: '0.5rem' }}>
                <button 
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/landing');
                  }} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    width: '100%', 
                    padding: '8px 12px', 
                    fontSize: '0.85rem',
                    borderRadius: '6px',
                    color: 'var(--text-main)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-surface)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <GraduationCap size={15} /> Campus Architecture
                </button>
                <button 
                  onClick={handleLogout} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    width: '100%', 
                    padding: '8px 12px', 
                    fontSize: '0.85rem',
                    borderRadius: '6px',
                    color: 'var(--danger)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--danger-light)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <LogOut size={15} /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
