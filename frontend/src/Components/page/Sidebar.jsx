import React from 'react';
import { useLocation } from 'react-router-dom';
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
import { ADMIN_ROUTE } from '../../config/adminConfig';
import { TEACHER_ROUTE } from '../../config/teacherConfig';

const Sidebar = ({ isCollapsed, currentRole = 'admin', activeTab = 'overview', onTabSelect }) => {
  const location = useLocation();

  // Determine current active section
  let role = currentRole;
  if (location.pathname.includes('/admin') || location.pathname === ADMIN_ROUTE || location.pathname.includes('/admin@1234')) role = 'admin';
  else if (location.pathname.includes('/teacher') || location.pathname === TEACHER_ROUTE || location.pathname.includes('/teacher@1234')) role = 'teacher';
  else if (location.pathname.includes('/student')) role = 'student';

  const menuConfigs = {
    admin: [
      { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
      { id: 'students', label: 'Students Directory', icon: GraduationCap, badge: '6' },
      { id: 'teachers', label: 'Faculty & Teachers', icon: Users, badge: '4' },
      { id: 'courses', label: 'Academic Courses', icon: BookOpen, badge: '5' },
      { id: 'finance', label: 'Tuition & Finance', icon: DollarSign },
      { id: 'settings', label: 'System Settings', icon: Settings },
    ],
    teacher: [
      { id: 'overview', label: 'Teacher Overview', icon: LayoutDashboard },
      { id: 'classes', label: 'Assigned Classes', icon: BookOpen, badge: '4' },
      { id: 'students', label: 'Class Students Roster', icon: Users },
      { id: 'attendance', label: 'Mark Attendance', icon: CalendarCheck },
      { id: 'grading', label: 'Grades & Reviews', icon: FileSpreadsheet, badge: '18' },
      { id: 'timetable', label: 'Lecture Schedule', icon: Clock },
      { id: 'messages', label: 'Student Inquiries', icon: MessageSquareText, badge: '3' },
    ],
    student: [
      { id: 'overview', label: 'Student Dashboard', icon: LayoutDashboard },
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
                type="button"
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
              <span className="title">{role} Portal</span>
              <span className="sub">EduManage System</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
