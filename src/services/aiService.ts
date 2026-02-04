// AI Service - Client interface for AI operations
// All AI calls go through Supabase Edge Functions for security

import { supabase } from '../config/supabase';
import { Ingredient, Recipe } from '../types';

export class AIServiceError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AIServiceError';
  }
}

async function getValidAccessToken(): Promise<string> {
  let { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    throw new AIServiceError('Failed to get session. Please log in again.', 'SESSION_ERROR');
  }

  if (!session || !session.access_token) {
    throw new AIServiceError('Not authenticated. Please log in.', 'NOT_AUTHENTICATED');
  }

  const bufferTime = 60 * 1000;
  const isExpiredOrExpiring = session.expires_at && (session.expires_at * 1000 - bufferTime) < Date.now();

  if (isExpiredOrExpiring) {
    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();

    if (refreshError || !refreshData.session?.access_token) {
      throw new AIServiceError('Session expired. Please log in again.', 'SESSION_EXPIRED');
    }

    session = refreshData.session;
  }

  return session.access_token;
}

async function authenticatedFetch<T>(url: string, body: object, retryCount: number = 1): Promise<T> {
  const accessToken = await getValidAccessToken();

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });

  if (response.status === 401 && retryCount > 0) {
    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();

    if (refreshError || !refreshData.session) {
      throw new AIServiceError('Authentication failed. Please log in again.', 'AUTH_FAILED', 401);
    }

    const retryResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${refreshData.session.access_token}`,
      },
      body: JSON.stringify(body),
    });

    if (!retryResponse.ok) {
      if (retryResponse.status === 401) {
        throw new AIServiceError('Authentication failed after retry. Please log in again.', 'AUTH_FAILED', 401);
      }
      throw new AIServiceError(`Request failed (${retryResponse.status})`, 'REQUEST_FAILED', retryResponse.status);
    }

    return retryResponse.json();
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new AIServiceError('Authentication failed. Please log in again.', 'AUTH_FAILED', 401);
    }
    if (response.status === 429) {
      throw new AIServiceError('Rate limit exceeded. Please upgrade to premium or try again later.', 'RATE_LIMIT_EXCEEDED', 429);
    }
    throw new AIServiceError(`Request failed (${response.status})`, 'REQUEST_FAILED', response.status);
  }

  return response.json();
}

export async function analyzeIngredients(
  imageData: string,
  scanId: string,
  isBase64: boolean = false
): Promise<Ingredient[]> {
  try {
    const data = await authenticatedFetch<{ ingredients: Ingredient[] }>(
      'https://gihrcllopjznunjaimdj.supabase.co/functions/v1/analyze-ingredients',
      { imageData, scanId, isBase64 }
    );
    return data.ingredients || [];
  } catch (error) {
    if (error instanceof AIServiceError) throw error;
    throw new AIServiceError('Failed to analyze ingredients. Please try again.');
  }
}

export async function generateRecipes(scanId: string): Promise<Recipe[]> {
  try {
    const data = await authenticatedFetch<{ recipes: Recipe[] }>(
      'https://gihrcllopjznunjaimdj.supabase.co/functions/v1/generate-recipes',
      { scanId }
    );
    return data.recipes || [];
  } catch (error) {
    if (error instanceof AIServiceError) throw error;
    throw new AIServiceError('Failed to generate recipes. Please try again.');
  }
}

export async function suggestExtraIngredients(
  currentIngredients: string[],
  userPreferences?: {
    cuisinePreferences?: string[];
    tastePreferences?: string[];
    fitnessGoal?: string;
  }
): Promise<Ingredient[]> {
  try {
    const data = await authenticatedFetch<{ suggestions: Ingredient[] }>(
      'https://gihrcllopjznunjaimdj.supabase.co/functions/v1/suggest-ingredients',
      { ingredients: currentIngredients, userPreferences }
    );
    return data.suggestions || [];
  } catch (error) {
    if (error instanceof AIServiceError) throw error;
    throw new AIServiceError('Failed to get ingredient suggestions. Please try again.');
  }
}

export async function checkCanPerformAction(
  actionType: 'scan' | 'recipe_generation'
): Promise<{ allowed: boolean; message?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { allowed: false, message: 'Please log in to continue' };
    }

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan_type, status')
      .eq('user_id', user.id)
      .single();

    if (subscription?.plan_type === 'premium' && subscription?.status === 'active') {
      return { allowed: true };
    }

    if (actionType === 'scan') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { count } = await supabase
        .from('scans')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', thirtyDaysAgo.toISOString());

      if ((count ?? 0) >= 10) {
        return {
          allowed: false,
          message: 'You have used all 10 free scans this month. Upgrade to premium for unlimited scans.',
        };
      }

      return { allowed: true, message: `${10 - (count ?? 0)} free scans remaining this month` };
    }

    if (actionType === 'recipe_generation') {
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);

      const { count } = await supabase
        .from('usage_tracking')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('action_type', 'recipe_generation')
        .gte('created_at', oneHourAgo.toISOString());

      if ((count ?? 0) >= 5) {
        return {
          allowed: false,
          message: 'You have used all 5 free recipe generations this hour. Upgrade to premium for unlimited access.',
        };
      }

      return { allowed: true, message: `${5 - (count ?? 0)} free generations remaining this hour` };
    }

    return { allowed: true };
  } catch (error) {
    return { allowed: true };
  }
}

export async function getUserUsageStats(): Promise<{
  scansThisMonth: number;
  recipesThisHour: number;
  planType: string;
  scanLimit: number;
  recipeLimit: number;
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan_type')
      .eq('user_id', user.id)
      .single();

    const isPremium = subscription?.plan_type === 'premium';

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count: scansCount } = await supabase
      .from('scans')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', thirtyDaysAgo.toISOString());

    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const { count: recipesCount } = await supabase
      .from('usage_tracking')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('action_type', 'recipe_generation')
      .gte('created_at', oneHourAgo.toISOString());

    return {
      scansThisMonth: scansCount ?? 0,
      recipesThisHour: recipesCount ?? 0,
      planType: subscription?.plan_type || 'free',
      scanLimit: isPremium ? -1 : 10,
      recipeLimit: isPremium ? -1 : 5,
    };
  } catch (error) {
    return {
      scansThisMonth: 0,
      recipesThisHour: 0,
      planType: 'free',
      scanLimit: 10,
      recipeLimit: 5,
    };
  }
}
