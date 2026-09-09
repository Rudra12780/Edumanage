// =========================================================
// TEACHER / FACULTY ACCESS SECURITY CONFIGURATION
// =========================================================

export const TEACHER_ROUTE = process.env.REACT_APP_TEACHER_ROUTE || '/teacher@1234';
export const TEACHER_PASSWORD = process.env.REACT_APP_TEACHER_PASSWORD || '1207';

export const isTeacherAuthorized = () => {
  return sessionStorage.getItem('edumanage_teacher_auth') === 'true';
};

export const setTeacherAuthorized = (isAuth) => {
  if (isAuth) {
    sessionStorage.setItem('edumanage_teacher_auth', 'true');
  } else {
    sessionStorage.removeItem('edumanage_teacher_auth');
  }
};
