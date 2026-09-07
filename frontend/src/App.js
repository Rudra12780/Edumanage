import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './Components/page/LandingPage';
import LoginPage from './Components/page/LoginPage';
import AdminDashboard from './Components/page/AdminDashboard';
import TeacherDashboard from './Components/page/TeacherDashboard';
import StudentDashboard from './Components/page/StudentDashboard';
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
    <BrowserRouter>
      <div className="app-root">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route 
            path="/login" 
            element={<LoginPage onLoginSuccess={handleLoginSuccess} />} 
          />
          <Route 
            path="/admin" 
            element={
              <AdminDashboard 
                currentUser={currentUser} 
                onRoleChange={handleRoleChange} 
              />
            } 
          />
          <Route 
            path="/teacher" 
            element={
              <TeacherDashboard 
                currentUser={currentUser} 
                onRoleChange={handleRoleChange} 
              />
            } 
          />
          <Route 
            path="/student" 
            element={
              <StudentDashboard 
                currentUser={currentUser} 
                onRoleChange={handleRoleChange} 
              />
            } 
          />
          {/* Catch-all redirect to landing page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
