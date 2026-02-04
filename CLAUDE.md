# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Make a Meal AI is a React Native (Expo) fitness meal planning app that uses AI to scan ingredients and generate personalized recipes based on user fitness goals and preferences.

**Tech Stack:**
- Framework: React Native with Expo
- Language: TypeScript (strict mode)
- Backend: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- AI: OpenAI (gpt-4-vision for ingredient detection, gpt-4-turbo for recipe generation)
- Navigation: React Navigation (native stack + bottom tabs)

## Development Commands

### Running the App
```bash
# Start development server
npm start

# Run on specific platforms
npm run android    # Android emulator
npm run ios        # iOS simulator
npm run web        # Web browser
```

### Database & Backend
```bash
# Test Supabase connection and database setup
node verify-database.js

# Test authentication flow
node test-auth.js

# Test complete app flow (signup -> profile -> scan simulation)
node test-app-flow.js
```

### Supabase Edge Functions
```bash
# Deploy Edge Functions (requires Supabase CLI)
supabase functions deploy analyze-ingredients
supabase functions deploy generate-recipes

# Test functions locally
supabase functions serve
```

## Architecture Overview

### Navigation Flow
The app uses a conditional navigation structure based on auth state:

1. **No Session** → Auth Stack (Login/Register screens)
2. **Session but No Profile** → Onboarding Screen (collect user preferences)
3. **Session + Profile** → Main App (bottom tabs + modals)

This logic is centralized in `src/navigation/AppNavigator.tsx` which reads from `AuthContext`.

### Authentication Pattern
Authentication uses a Context + Service pattern:

- **AuthContext** (`src/contexts/AuthContext.tsx`): Manages auth state, listens to Supabase auth changes via `onAuthStateChange`, loads user profile from database
- **authService** (`src/services/authService.ts`): Handles Supabase auth operations (signIn, signUp, getUserProfile, createUserProfile)

**Important:** Users table is NOT auto-created on signup. The flow is:
1. User signs up → creates `auth.users` record only
2. User completes onboarding → creates `users` table record with preferences
3. `AuthContext` loads profile → if null, shows onboarding; if exists, shows main app

### Data Flow for Core Feature (Ingredient Scanning → Recipe Generation)

1. **Camera Screen** → User takes photo or selects from gallery
2. **Upload to Supabase Storage** → Image stored in `ingredient-scans` bucket
3. **Create Scan Record** → Insert into `scans` table with image URL
4. **Call Edge Function** → `analyze-ingredients` uses OpenAI Vision to detect ingredients
5. **Ingredient Edit Screen** → User reviews/edits detected ingredients
6. **Generate Recipes** → Call `generate-recipes` Edge Function with ingredients + user preferences
7. **Recipe List Screen** → Display AI-generated recipes with match scores
8. **Recipe Detail** → Full recipe with macros, micros, steps, save to favorites

### Environment Configuration
Uses Expo's built-in environment variable loading:

- **Variables** must be prefixed with `EXPO_PUBLIC_` in `.env` file
- **app.config.js** validates env vars at build time and passes to expo-constants
- **src/config/env.ts** exports typed environment variables using `expo-constants`
- **Never commit** `.env` file (in .gitignore)

Required env vars:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

### Database Schema

5 main tables (defined in `supabase-setup.sql`):

1. **users** - User profiles with fitness goals and preferences (snake_case to match DB)
2. **scans** - Ingredient scan history with AI-detected ingredients and generated recipes
3. **favorites** - User's saved recipes
4. **usage_tracking** - Rate limiting and analytics for AI calls
5. **subscriptions** - Stripe subscription data (future feature)

**RLS (Row Level Security):** Enabled on all tables. Users can only access their own data.

### Type System

All types defined in `src/types/index.ts` with strict TypeScript enforcement.

**Important naming convention:** Database fields use `snake_case` (e.g., `fitness_goal`, `cuisine_preferences`) to match PostgreSQL conventions. Types mirror this exactly to avoid mapping issues.

## Key Files & Their Purposes

### Configuration
- `src/config/supabase.ts` - Supabase client with AsyncStorage session persistence
- `src/config/env.ts` - Type-safe environment variable exports
- `app.config.js` - Expo configuration with env var validation

### Core Services
- `src/services/authService.ts` - Authentication operations (sign in/up, profile CRUD)
- `src/services/aiService.ts` - AI service client for Edge Functions (analyze ingredients, generate recipes)

### Navigation
- `src/navigation/AppNavigator.tsx` - Root navigator with conditional auth flow
- Navigation types defined in `src/types/index.ts` (RootStackParamList, MainTabParamList, AuthStackParamList)

### Screens (by user flow)
1. Auth: `src/screens/auth/{Login,Register}Screen.tsx`
2. Onboarding: `src/screens/onboarding/OnboardingScreen.tsx`
3. Main tabs: `src/screens/{home,favorites,profile}/`
4. Camera flow: `src/screens/camera/CameraScreen.tsx` → `src/screens/ingredients/IngredientEditScreen.tsx` → `src/screens/recipes/RecipeListScreen.tsx` → `src/screens/recipes/RecipeDetailScreen.tsx`

### Backend (Supabase Edge Functions)
- `supabase/functions/analyze-ingredients/index.ts` - OpenAI Vision API for ingredient detection
- `supabase/functions/generate-recipes/index.ts` - OpenAI GPT-4 for personalized recipe generation

Both functions:
- Validate JWT auth token
- Enforce rate limiting (usage_tracking table)
- Keep API keys server-side (Supabase secrets)
- Return structured JSON responses

## Important Patterns & Conventions

### Error Handling
- Services throw errors with descriptive messages
- Screens catch errors and display user-friendly alerts
- Console logging is extensive for debugging (prefixed with emojis: 🔵 for flow, ✅ for success, ❌ for errors)

### State Management
- Auth state: Context API (`AuthContext`)
- Local component state: React hooks (useState, useEffect)
- No global state management library (Redux, etc.)

### Async Operations
- All Supabase calls are async/await
- Loading states managed locally in components
- Network errors handled gracefully with try/catch

### File Naming
- Screens: PascalCase with "Screen" suffix (e.g., `LoginScreen.tsx`)
- Services: camelCase with "Service" suffix (e.g., `authService.ts`)
- Types: PascalCase for interfaces, camelCase for type aliases
- Components: PascalCase (following React conventions)

## Current Supabase Project

**Project Ref:** `gihrcllopjznunjaimdj`
**URL:** `https://gihrcllopjznunjaimdj.supabase.co`
**Dashboard:** https://supabase.com/dashboard/project/gihrcllopjznunjaimdj

**Important Settings:**
- Email confirmation is DISABLED - users are auto-confirmed on signup
- Storage bucket `ingredient-scans` must be PUBLIC for image uploads
- RLS policies are enabled on all tables

## Common Development Workflows

### Adding a New Screen
1. Create screen component in appropriate `src/screens/` subdirectory
2. Add route to navigation types in `src/types/index.ts`
3. Add screen to navigator in `src/navigation/AppNavigator.tsx`
4. Import and use `useNavigation` hook for navigation

### Modifying User Profile Fields
1. Update `User` interface in `src/types/index.ts`
2. Update database schema in Supabase dashboard or via migration
3. Update `OnboardingScreen.tsx` if field is collected during onboarding
4. Update `ProfileScreen.tsx` if field should be editable
5. Update `authService.createUserProfile()` and `updateUserProfile()`

### Adding AI Features
1. Create or modify Edge Function in `supabase/functions/`
2. Add function call to `src/services/aiService.ts`
3. Update rate limiting logic in `usage_tracking` table if needed
4. Deploy function: `supabase functions deploy <function-name>`
5. Test with local development: `supabase functions serve`

### Working with Database
- Schema defined in `supabase-setup.sql`
- Run new migrations through Supabase Dashboard SQL Editor or CLI
- Always enable RLS on new tables
- Add indexes for foreign keys and frequently queried fields

## Testing & Verification

The project includes several verification scripts:

- **verify-database.js** - Checks if all database tables exist and are accessible
- **test-auth.js** - Tests Supabase authentication directly (signup, login, profile operations)
- **test-app-flow.js** - Simulates complete user flow from signup through profile creation

Run these after making backend changes to ensure everything works.

## Security Considerations

- API keys (OpenAI) are stored in Supabase secrets, never in client code
- All Edge Functions validate JWT tokens before processing
- RLS policies prevent users from accessing other users' data
- Rate limiting prevents abuse of AI features
- `.env` file is gitignored - never commit credentials
- Images in storage bucket use RLS policies (users can only see their own uploads)

## Known Issues & Workarounds

- **Environment variables not loading:** Ensure `app.config.js` exists and `.env` uses `EXPO_PUBLIC_` prefix
- **Profile not loading after signup:** User must complete onboarding to create profile in `users` table
- **Storage bucket access:** Bucket must be set to PUBLIC in Supabase dashboard for image URLs to work
