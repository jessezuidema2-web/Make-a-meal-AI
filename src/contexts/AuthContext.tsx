import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../config/supabase';
import { authService } from '../services/authService';
import { User, LoginCredentials, RegisterCredentials } from '../types';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signUp: (credentials: RegisterCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (profile: Partial<User>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔵 AuthContext: Initializing...');

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔵 AuthContext: Initial session check:', session ? 'Session found' : 'No session');
      setSession(session);
      if (session?.user) {
        console.log('🔵 AuthContext: Loading profile for user:', session.user.id);
        loadUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔵 AuthContext: Auth state changed:', event);
      console.log('   Session:', session ? 'EXISTS' : 'NULL');
      console.log('   User ID:', session?.user?.id);

      setSession(session);
      if (session?.user) {
        console.log('🔵 AuthContext: Loading profile after auth change...');
        loadUserProfile(session.user.id);
      } else {
        console.log('🔵 AuthContext: No session, clearing user');
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const profile = await authService.getUserProfile(userId);
      setUser(profile);
      console.log('✅ User profile loaded:', profile);
    } catch (error) {
      console.error('❌ Error loading user profile:', error);
      // If profile doesn't exist, user will be redirected to onboarding
      // This is expected for new users
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (credentials: LoginCredentials) => {
    console.log('🔵 AuthContext.signIn: Starting login for:', credentials.email);
    setLoading(true);
    try {
      const { user } = await authService.signIn(credentials);
      console.log('✅ AuthContext.signIn: Login successful, user:', user?.id);
      if (user) {
        await loadUserProfile(user.id);
      }
    } catch (error) {
      console.error('❌ AuthContext.signIn: Login failed:', error);
      setLoading(false);
      throw error;
    }
  };

  const signUp = async (credentials: RegisterCredentials) => {
    console.log('🔵 AuthContext.signUp: Starting signup for:', credentials.email);
    setLoading(true);
    try {
      const result = await authService.signUp(credentials);
      console.log('✅ AuthContext.signUp: Signup successful');
      console.log('   User:', result?.user?.id);
      console.log('   Session:', result?.session ? 'YES' : 'NO');
      // User will be automatically logged in via onAuthStateChange
    } catch (error) {
      console.error('❌ AuthContext.signUp: Signup failed:', error);
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      throw error;
    }
  };

  const updateProfile = async (profile: Partial<User>) => {
    if (!user) throw new Error('No user logged in');
    try {
      const updatedUser = await authService.updateUserProfile(user.id, profile);
      setUser(updatedUser);
    } catch (error) {
      throw error;
    }
  };

  const refreshProfile = async () => {
    if (!session?.user) throw new Error('No session found');
    console.log('🔄 Refreshing user profile...');
    await loadUserProfile(session.user.id);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
