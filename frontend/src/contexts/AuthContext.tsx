import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authService } from '../services/auth.service';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: { email: string; password: string }) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isCustomer: boolean;
  isElectrician: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('voltfix_user');
    if (!saved) return null;
    try {
      const parsed = JSON.parse(saved);
      if (parsed && (parsed.role === 'ADMIN' || parsed.email === 'admin@voltfix.com')) {
        parsed.name = 'Abu Bakar Rakib';
        if (!parsed.avatarUrl || parsed.avatarUrl.includes('unsplash')) {
          parsed.avatarUrl = '/avatar-rakib.png';
        }
      }
      return parsed;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('voltfix_token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      const me = await authService.getMe();
      if (me && (me.role === 'ADMIN' || me.email === 'admin@voltfix.com')) {
        me.name = 'Abu Bakar Rakib';
        if (!me.avatarUrl || me.avatarUrl.includes('unsplash')) {
          me.avatarUrl = '/avatar-rakib.png';
        }
      }
      setUser(me);
      localStorage.setItem('voltfix_user', JSON.stringify(me));
    } catch {
      setUser(null);
      localStorage.removeItem('voltfix_token');
      localStorage.removeItem('voltfix_user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();

    const handleLogoutEvent = () => {
      setUser(null);
    };

    window.addEventListener('voltfix_auth_logout', handleLogoutEvent);
    return () => window.removeEventListener('voltfix_auth_logout', handleLogoutEvent);
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    const result = await authService.login(credentials);
    if (result.user && (result.user.role === 'ADMIN' || result.user.email === 'admin@voltfix.com')) {
      result.user.name = 'Abu Bakar Rakib';
      if (!result.user.avatarUrl || result.user.avatarUrl.includes('unsplash')) {
        result.user.avatarUrl = '/avatar-rakib.png';
      }
    }
    localStorage.setItem('voltfix_token', result.accessToken);
    localStorage.setItem('voltfix_user', JSON.stringify(result.user));
    setUser(result.user);
  };

  const register = async (data: any) => {
    const result = await authService.register(data);
    localStorage.setItem('voltfix_token', result.accessToken);
    localStorage.setItem('voltfix_user', JSON.stringify(result.user));
    setUser(result.user);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('voltfix_token');
      localStorage.removeItem('voltfix_user');
      setUser(null);
    }
  };

  const isCustomer = user?.role === 'CUSTOMER';
  const isElectrician = user?.role === 'ELECTRICIAN';
  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        isCustomer,
        isElectrician,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
