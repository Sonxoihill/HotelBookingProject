const TOKEN_KEY = 'token';
const USER_KEY = 'user_info';

export const tokenStorage = {
  getToken: () => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setToken: (token) => {
    try {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      }
    } catch (error) {
      console.error('Error saving token to localStorage', error);
    }
  },

  removeToken: () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error removing token from localStorage', error);
    }
  },

  getUser: () => {
    try {
      const user = localStorage.getItem(USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  setUser: (user) => {
    try {
      if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      }
    } catch (error) {
      console.error('Error saving user to localStorage', error);
    }
  },

  removeUser: () => {
    try {
      localStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error('Error removing user from localStorage', error);
    }
  },

  clearAuth: () => {
    tokenStorage.removeToken();
    tokenStorage.removeUser();
  },

  getDecodedToken: () => {
    try {
      const token = tokenStorage.getToken();
      if (!token) return null;
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  },

  isTokenExpired: () => {
    const decoded = tokenStorage.getDecodedToken();
    if (!decoded || !decoded.exp) return true;
    return decoded.exp * 1000 <= Date.now();
  },

  getUserRole: () => {
    // Ưu tiên đọc role trực tiếp từ chữ ký payload của JWT token để đảm bảo tính xác thực
    const decoded = tokenStorage.getDecodedToken();
    if (decoded?.role) return decoded.role;
    const user = tokenStorage.getUser();
    return user?.role || null;
  },

  isAuthenticated: () => {
    const token = tokenStorage.getToken();
    if (!token) return false;
    if (tokenStorage.isTokenExpired()) {
      tokenStorage.clearAuth();
      return false;
    }
    return true;
  },
};

export default tokenStorage;
