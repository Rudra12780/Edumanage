import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './Components/page/LandingPage';
import LoginPage from './Components/page/LoginPage';
import AdminRouteGuard from './Components/security/AdminRouteGuard';
import TeacherRouteGuard from './Components/security/TeacherRouteGuard';
import StudentDashboard from './Components/page/StudentDashboard';
import { ThemeProvider } from './Components/ThemeContext';
import { ADMIN_ROUTE } from './config/adminConfig';
import { TEACHER_ROUTE } from './config/teacherConfig';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState({
    name: 'Dr. Sarah Jenkins',
    role: 'admin',
    email: 'admin@edumanage.edu'
  });

  const handleRoleChange = (newRole) => {
    if (newRole === 'admin') {
      setCurrentUser({ name: 'Dr. Sarah Jenkins', role: 'admin', email: 'admin@edumanage.edu' });
    } else if (newRole === 'teacher') {
      setCurrentUser({ name: 'Prof. David Miller', role: 'teacher', email: 'teacher@edumanage.edu' });
    } else if (newRole === 'student') {
      setCurrentUser({ name: 'Alex Rivera', role: 'student', email: 'student@edumanage.edu' });
    }
  };

  const handleLoginSuccess = (userObj) => {
    setCurrentUser(userObj);
  };

  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="app-root">
          <Routes>
            {/* Student Login is the default root page at localhost:3000 */}
            <Route 
              path="/" 
              element={<LoginPage onLoginSuccess={handleLoginSuccess} />} 
            />
            <Route 
              path="/login" 
              element={<LoginPage onLoginSuccess={handleLoginSuccess} />} 
            />
            
            {/* Overview / Landing Page */}
            <Route path="/landing" element={<LandingPage />} />

            {/* Secure Admin Portal Route guarded by AdminRouteGuard */}
            <Route 
              path="/admin@1234" 
              element={
                <AdminRouteGuard 
                  currentUser={currentUser} 
                  onRoleChange={handleRoleChange} 
                />
              } 
            />
            <Route 
              path="/admin%401234" 
              element={
                <AdminRouteGuard 
                  currentUser={currentUser} 
                  onRoleChange={handleRoleChange} 
                />
              } 
            />
            {ADMIN_ROUTE !== '/admin@1234' && ADMIN_ROUTE !== '/admin%401234' && (
              <Route 
                path={ADMIN_ROUTE} 
                element={
                  <AdminRouteGuard 
                    currentUser={currentUser} 
                    onRoleChange={handleRoleChange} 
                  />
                } 
              />
            )}
            {/* Public /admin is locked down and redirects away */}
            <Route path="/admin" element={<Navigate to="/" replace />} />

            {/* Secure Teacher Portal Route guarded by TeacherRouteGuard */}
            <Route 
              path="/teacher@1234" 
              element={
                <TeacherRouteGuard 
                  currentUser={currentUser} 
                  onRoleChange={handleRoleChange} 
                />
              } 
            />
            <Route 
              path="/teacher%401234" 
              element={
                <TeacherRouteGuard 
                  currentUser={currentUser} 
                  onRoleChange={handleRoleChange} 
                />
              } 
            />
            {TEACHER_ROUTE !== '/teacher@1234' && TEACHER_ROUTE !== '/teacher%401234' && (
              <Route 
                path={TEACHER_ROUTE} 
                element={
                  <TeacherRouteGuard 
                    currentUser={currentUser} 
                    onRoleChange={handleRoleChange} 
                  />
                } 
              />
            )}
            {/* Public /teacher is locked down and redirects away */}
            <Route path="/teacher" element={<Navigate to="/" replace />} />

            {/* Student Dashboard */}
            <Route 
              path="/student" 
              element={
                <StudentDashboard 
                  currentUser={currentUser} 
                  onRoleChange={handleRoleChange} 
                />
              } 
            />

            {/* Catch-all redirect to default student login page */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
