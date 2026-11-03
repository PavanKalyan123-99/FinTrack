import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [token, setToken] = useState(() => authService.getToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = authService.getToken();
      if (storedToken) {
        try {
          const res = await authService.getMe();
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('fintrack_user', JSON.stringify(res.user));
          }
        } catch {
          // Token might be expired or invalid
          authService.logout();
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();

    // Listen to unauthorized event from api interceptor
    const handleLogoutEvent = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('fintrack_auth_logout', handleLogoutEvent);
    return () => window.removeEventListener('fintrack_auth_logout', handleLogoutEvent);
  }, []);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    if (data.success) {
      setUser(data.user);
      setToken(data.token);
    }
    return data;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    if (data.success) {
      setUser(data.user);
      setToken(data.token);
    }
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const nextUser = { ...prev, ...updatedFields };
      localStorage.setItem('fintrack_user', JSON.stringify(nextUser));
      return nextUser;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
