import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { authService } from '../services/authService';
import { adminService, AppUser } from '../services/adminService';

interface AuthContextType {
  user: User | null;
  appUser: AppUser | null;
  loading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = authService.onAuthChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const users = await adminService.getUsers();
          const found = users.find(u => u.uid === firebaseUser.uid);
          setAppUser(found ?? null);
        } catch {
          setAppUser(null);
        }
      } else {
        setAppUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const signUp = async (email: string, password: string, displayName: string) => {
    const cred = await authService.signUp(email, password);
    await adminService.createUserRecord(cred.user.uid, email, displayName);
    const users = await adminService.getUsers();
    const found = users.find(u => u.uid === cred.user.uid);
    setAppUser(found ?? null);
  };

  const signIn = async (email: string, password: string) => {
    await authService.signIn(email, password);
  };

  const signOut = async () => {
    await authService.signOut();
    setAppUser(null);
  };

  const value: AuthContextType = {
    user,
    appUser,
    loading,
    isAdmin: appUser?.role === 'admin',
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
