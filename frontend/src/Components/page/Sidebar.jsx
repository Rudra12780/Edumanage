import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  FileSpreadsheet,
  Award,
  Clock,
  Settings,
  DollarSign,
  ShieldCheck,
  Compass,
  MessageSquareText
} from 'lucide-react';
import '../css/Sidebar.css';

const Sidebar = ({ isCollapsed, currentRole = 'admin', activeTab, onTabSelect }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine current active section
  let role = currentRole;
  if (location.pathname.includes('/admin')) role = 'admin';
  else if (location.pathname.includes('/teacher')) role = 'teacher';
  else if (location.pathname.includes('/student')) role = 'student';

  const menuConfigs = {
    admin: [
      { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard, path: '/admin' },
      { id: 'students', label: 'Students Directory', icon: GraduationCap, badge: '2,840' },
      { id: 'teachers', label: 'Faculty & Teachers', icon: Users, badge: '142' },
      { id: 'courses', label: 'Academic Courses', icon: BookOpen, badge: '38' },
      { id: 'finance', label: 'Tuition & Finance', icon: DollarSign },
      { id: 'settings', label: 'System Settings', icon: Settings },
    ],
    teacher: [
      { id: 'overview', label: 'Teacher Overview', icon: LayoutDashboard, path: '/teacher' },
      { id: 'classes', label: 'Assigned Classes', icon: BookOpen, badge: '4' },
      { id: 'attendance', label: 'Mark Attendance', icon: CalendarCheck },
      { id: 'grading', label: 'Grades & Reviews', icon: FileSpreadsheet, badge: '18' },
      { id: 'timetable', label: 'Lecture Schedule', icon: Clock },
      { id: 'messages', label: 'Student Inquiries', icon: MessageSquareText, badge: '3' },
    ],
    student: [
      { id: 'overview', label: 'Student Dashboard', icon: LayoutDashboard, path: '/student' },
      { id: 'courses', label: 'Enrolled Courses', icon: BookOpen, badge: '6' },
      { id: 'assignments', label: 'My Assignments', icon: CalendarCheck, badge: '3' },
      { id: 'grades', label: 'Grades & GPA', icon: Award },
      { id: 'timetable', label: 'Weekly Schedule', icon: Clock },
      { id: 'resources', label: 'E-Library & Notes', icon: Compass },
    ],
  };

  const currentMenuItems = menuConfigs[role] || menuConfigs.admin;

  const handleItemClick = (item) => {
    if (onTabSelect) {
      onTabSelect(item.id);
    }
    if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <aside className={`em-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="em-sidebar-content">
        <span className="em-sidebar-group-label">Menu Navigation</span>
        <nav className="em-sidebar-nav">
          {currentMenuItems.map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id || (!activeTab && item.id === 'overview');
            return (
              <button
                key={item.id}
                className={`em-sidebar-link ${isSelected ? 'active' : ''}`}
                onClick={() => handleItemClick(item)}
                title={item.label}
              >
                <div className="icon">
                  <Icon size={19} />
                </div>
                <span className="link-text">{item.label}</span>
                {item.badge && <span className="link-badge">{item.badge}</span>}
              </button>
            );
          })}
        </nav>

        <div className="em-sidebar-footer">
          <div className="em-role-badge-card">
            <div className="em-role-icon-box">
              <ShieldCheck size={18} />
            </div>
            <div className="em-role-meta">
              <span className="title">{role} Access</span>
              <span className="sub">EduManage v2.4</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
