// User types (using snake_case to match database columns)
export interface User {
  id: string;
  email: string;
  name: string;
  gender: 'male' | 'female' | 'other';
  height: number; // in cm
  weight: number; // in kg
  fitness_goal: 'gym' | 'lose_weight' | 'gain_weight' | 'maintain_weight';
  cuisine_preferences: string[]; // ['italian', 'asian', 'mexican', etc.]
  taste_preferences: ('sweet' | 'spicy' | 'salty' | 'sour' | 'umami')[];
  birth_date?: string;
  activity_level?: ActivityLevel;
  target_weight?: number;
  target_weeks?: number;
  daily_calorie_goal?: number;
  current_streak?: number;
  last_scan_date?: string;
  created_at: string;
  updated_at: string;
}

// Activity level type
export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';

// Meal consumed type
export interface MealConsumed {
  id: string;
  user_id: string;
  recipe_id: string;
  recipe_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servings: number;
  created_at: string;
}

// Ingredient types
export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string; // 'g', 'ml', 'pcs', etc.
  calories?: number;
}

// Macro types
export interface Macros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// Micro nutrients
export interface Micros {
  vitaminA?: number;
  vitaminC?: number;
  vitaminD?: number;
  vitaminE?: number;
  calcium?: number;
  iron?: number;
  magnesium?: number;
  potassium?: number;
}

// Recipe types
export type MacroGoal = 'high_protein' | 'high_carb' | 'high_fat' | 'pre_workout' | 'post_workout';
export type MealTiming = 'pre-workout' | 'post-workout' | 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: Ingredient[];
  steps: string[];
  macros: Macros;
  micros: Micros;
  cuisine: string;
  taste: string[];
  prepTime: number; // in minutes
  cookTime: number;
  servings: number;
  imageUrl?: string;
  macroGoalMatch?: MacroGoal;
  matchScore?: number; // 0-100, how well it matches user preferences
  whyItFits?: string; // AI explanation of why this recipe fits the goal
  mealTiming?: MealTiming;
  tags?: string[]; // e.g., ["high-protein", "low-carb", "bulking", "cutting", "quick", "meal-prep"]
  ingredientsUsed?: number; // how many scanned ingredients are used
  healthScore?: number; // 1-10 health rating
}

// Scan types (using snake_case to match database columns)
export interface Scan {
  id: string;
  user_id: string;
  image_url: string;
  ingredients: Ingredient[];
  created_at: string;
  recipes?: Recipe[];
}

// Filter types
export interface RecipeFilters {
  macroGoal?: MacroGoal;
  cuisine?: string[];
  taste?: string[];
  maxPrepTime?: number;
  minProtein?: number;
}

// Water intake type
export interface WaterIntake {
  id: string;
  user_id: string;
  glasses: number;
  date: string;
  created_at: string;
}

// Community types
export interface CommunityPost {
  id: string;
  user_id: string;
  user_name: string;
  recipe_name: string;
  recipe_image?: string;
  calories: number;
  caption?: string;
  likes_count: number;
  created_at: string;
  liked_by_me?: boolean;
}

// Discover types
export interface DiscoverCategory {
  id: string;
  label: string;
  emoji: string;
  tag: string;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
}

// Onboarding types
export interface OnboardingData {
  name: string;
  gender: 'male' | 'female' | 'other';
  height: number;
  weight: number;
  fitnessGoal: 'gym' | 'lose_weight' | 'gain_weight' | 'maintain_weight';
  cuisinePreferences: string[];
  tastePreferences: ('sweet' | 'spicy' | 'salty' | 'sour' | 'umami')[];
}

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Onboarding: undefined;
  Main: { screen?: string } | undefined;
  Camera: undefined;
  RecipeDetail: { recipeId: string; scanId: string | null };
  IngredientEdit: { scanId: string };
  RecipeFilters: { scanId: string };
};

export type MainTabParamList = {
  Home: undefined;
  Discover: undefined;
  Tracker: undefined;
  Community: undefined;
  Profile: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};
