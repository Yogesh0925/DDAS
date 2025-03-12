import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUser, loginUser, createUser, updateUser, User } from '../db';

interface AuthContextType {
  user: Omit<User, 'password'> | null;
  login: (email: string, password: string) => Promise<void>;
  register: (user: { email: string; password: string; name: string }) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Omit<User, 'password'> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionId = localStorage.getItem('sessionId');
    if (sessionId) {
      const userId = localStorage.getItem('userId');
      if (userId) {
        getUser(userId).then(user => {
          setUser(user);
          setLoading(false);
        });
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const session = await loginUser(email, password);
    localStorage.setItem('sessionId', session.id);
    localStorage.setItem('userId', session.userId);
    const userData = await getUser(session.userId);
    setUser(userData);
  };

  const register = async (userData: { email: string; password: string; name: string }) => {
    const newUser = await createUser(userData);
    const session = await loginUser(userData.email, userData.password);
    localStorage.setItem('sessionId', session.id);
    localStorage.setItem('userId', session.userId);
    const user = await getUser(newUser.id!);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('sessionId');
    localStorage.removeItem('userId');
    setUser(null);
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user?.id) throw new Error('Not authenticated');
    const updatedUser = await updateUser(user.id, updates);
    const { password, ...userWithoutPassword } = updatedUser;
    setUser(userWithoutPassword);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}