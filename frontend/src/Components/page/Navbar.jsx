import React, { useState, useEffect } from 'react';
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
import { api } from '../../config/api';

const Navbar = ({ toggleSidebar, currentRole = 'admin', onRoleChange, currentUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Derive active display role
  let activeRole = currentRole;
  if (location.pathname.includes('/admin') || location.pathname === ADMIN_ROUTE || location.pathname.includes('/admin@1234')) activeRole = 'admin';
  else if (location.pathname.includes('/teacher') || location.pathname === TEACHER_ROUTE || location.pathname.includes('/teacher@1234')) activeRole = 'teacher';
  else if (location.pathname.includes('/student')) activeRole = 'student';

  const fetchNavbarNotifications = async () => {
    try {
      const classCode = currentUser?.class_code || 'ALL';
      const userId = currentUser?.id || 'anonymous';
      const res = await api.get(`/notifications?classCode=${classCode}&userId=${userId}`);
      if (res) {
        setNotifications(res.notifications || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (e) {
      // silently handle if offline
    }
  };

  useEffect(() => {
    fetchNavbarNotifications();
    const interval = setInterval(fetchNavbarNotifications, 15000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.class_code, currentUser?.id]);

  const handleMarkAllRead = async () => {
    try {
      await api.post('/notifications/mark-all-read', {
        userId: currentUser?.id || 'anonymous',
        classCode: currentUser?.class_code || 'ALL'
      });
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    } catch (e) {}
  };

  const handleLogout = () => {
    sessionStorage.removeItem('edumanage_current_user');
    sessionStorage.removeItem('edumanage_teacher_auth');
    sessionStorage.removeItem('edumanage_admin_auth');
    setAdminAuthorized(false);
    setTeacherAuthorized(false);
    navigate('/');
  };

  const userDisplayName = currentUser?.name || (
    activeRole === 'admin' ? 'Dr. Sarah Jenkins' :
    activeRole === 'teacher' ? 'Faculty Instructor' : 'Scholar Student'
  );

  const userInitial = userDisplayName.charAt(0);

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return 'Just now';
    const d = new Date(dateStr);
    const diff = Math.floor((new Date() - d) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString();
  };

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
            {unreadCount > 0 && <span className="em-badge-dot"></span>}
          </button>

          {showNotifications && (
            <div className="em-dropdown-popover">
              <div className="em-dropdown-header">
                <h4>Notifications {unreadCount > 0 ? `(${unreadCount} new)` : ''}</h4>
                {notifications.length > 0 && (
                  <span 
                    style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}
                    onClick={handleMarkAllRead}
                  >
                    Mark all read
                  </span>
                )}
              </div>
              <div className="em-dropdown-items">
                {notifications.length === 0 ? (
                  <div style={{ padding: '1.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    No announcements yet.
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div key={item.id} className={`em-dropdown-item ${!item.is_read ? 'unread' : ''}`}>
                      <div className="notif-icon">
                        <Bell size={14} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: 2 }}>
                          {item.title}
                        </div>
                        <div className="notif-text" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          {item.message}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 600 }}>
                            {item.sender_name} • Class {item.target_class}
                          </span>
                          <span className="notif-time">{formatTimeAgo(item.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
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
                <div style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Signed in as: <strong>{userDisplayName}</strong>
                </div>
                <div style={{ borderTop: '1px solid var(--border)', margin: '0.5rem 0' }}></div>
                <button 
                  onClick={handleLogout}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    width: '100%', 
                    padding: '0.5rem 0.75rem', 
                    background: 'none', 
                    border: 'none', 
                    color: 'var(--danger)', 
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}
                >
                  <LogOut size={14} /> Log Out
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
