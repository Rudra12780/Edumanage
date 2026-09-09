// =========================================================
// ADMIN ACCESS SECURITY CONFIGURATION
// =========================================================

export const ADMIN_ROUTE = process.env.REACT_APP_ADMIN_ROUTE || '/admin@1234';
export const ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD || 'edumanage';

export const isAdminAuthorized = () => {
  return sessionStorage.getItem('edumanage_admin_auth') === 'true';
};

export const setAdminAuthorized = (isAuth) => {
  if (isAuth) {
    sessionStorage.setItem('edumanage_admin_auth', 'true');
  } else {
    sessionStorage.removeItem('edumanage_admin_auth');
  }
};
