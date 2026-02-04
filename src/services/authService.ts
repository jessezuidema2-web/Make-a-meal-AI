import { supabase } from '../config/supabase';
import { LoginCredentials, RegisterCredentials, User } from '../types';

export const authService = {
  async signIn(credentials: LoginCredentials) {
    console.log('🔐 Attempting sign in for:', credentials.email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      console.error('❌ Sign in error:', error);
      throw error;
    }
    console.log('✅ Sign in successful:', data);
    return data;
  },

  async signUp(credentials: RegisterCredentials) {
    console.log('🔐 Attempting sign up for:', credentials.email);
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          name: credentials.name,
        },
      },
    });

    if (error) {
      console.error('❌ Sign up error:', error);
      throw error;
    }
    console.log('✅ Sign up successful:', data);
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  async updateUserProfile(userId: string, profile: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update(profile)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUserProfile(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('ℹ️ No user profile found - user needs onboarding');
        return null; // No rows returned - new user needs onboarding
      }
      if (error.code === '42P01') {
        console.error('❌ Users table does not exist! Run supabase-setup.sql first');
      }
      console.error('❌ Database error:', error);
      throw error;
    }
    return data;
  },

  async createUserProfile(userId: string, profileData: Omit<User, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: userId,
        ...profileData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Failed to create profile:', error);
      throw error;
    }
    console.log('✅ Profile created successfully:', data);
    return data;
  },
};
