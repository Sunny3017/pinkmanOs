import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);
const TOKEN_STORAGE_KEY = 'pinkman_token';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only call /me if we have a token; otherwise the initial 401 is expected.
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) {
      setLoading(false);
      setUser(null);
      return;
    }
    fetchUser();
  }, []);

  const login = async (username, password) => {
    // Backend accepts username OR email; UI uses email input.
    const response = await api.post('/auth/login', { email: username, password });
    if (response.data?.token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, response.data.token);
    }
    setUser(response.data.user);
    return response.data.user;
  };

  const logout = async () => {
    await api.post('/auth/logout');
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, fetchUser }}>
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
