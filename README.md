# Make a Meal AI

AI-powered fitness meal planning app for iOS and Android. Scan your ingredients, get personalized recipe recommendations based on your fitness goals and preferences.

## Features

- 📸 **Ingredient Scanning**: Take photos of your fridge/pantry to automatically detect ingredients
- 🏋️ **Fitness Goal Tracking**: Customize recipes for muscle gain, weight loss, or weight gain
- 🍝 **Personalized Recommendations**: Recipes ranked by your cuisine and taste preferences
- 📊 **Detailed Nutrition**: Full macro and micronutrient breakdown for every recipe
- ❤️ **Favorites**: Save and access your favorite recipes anytime
- 🎯 **Meal Goals**: Filter by high protein, high carb, pre-workout, post-workout, etc.

## Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Authentication**: Supabase Auth
- **Payments**: Stripe
- **AI**: OpenAI/Anthropic (configurable)
- **Navigation**: React Navigation

## Prerequisites

- Node.js 18+ and npm
- Expo CLI
- iOS Simulator (macOS) or Android Emulator
- Supabase account
- AI API key (OpenAI or Anthropic)

## Setup

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

\`\`\`env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_AI_API_URL=your_ai_api_endpoint
EXPO_PUBLIC_AI_API_KEY=your_ai_api_key
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
\`\`\`

### 3. Setup Supabase Database

Create the following tables in your Supabase project:

#### Users Table
\`\`\`sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  height NUMERIC NOT NULL,
  weight NUMERIC NOT NULL,
  fitness_goal TEXT NOT NULL CHECK (fitness_goal IN ('gym', 'lose_weight', 'gain_weight')),
  cuisine_preferences TEXT[] NOT NULL DEFAULT '{}',
  taste_preferences TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
\`\`\`

#### Scans Table
\`\`\`sql
CREATE TABLE scans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  ingredients JSONB NOT NULL DEFAULT '[]',
  recipes JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_scans_user_id ON scans(user_id);
CREATE INDEX idx_scans_created_at ON scans(created_at DESC);
\`\`\`

#### Favorites Table
\`\`\`sql
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipe_id TEXT NOT NULL,
  recipe JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, recipe_id)
);

CREATE INDEX idx_favorites_user_id ON favorites(user_id);
\`\`\`

### 4. Setup Supabase Storage

Create a storage bucket named `ingredient-scans` with public access for images.

### 5. Run the App

\`\`\`bash
# Start Expo development server
npx expo start

# Run on iOS
npx expo run:ios

# Run on Android
npx expo run:android

# Run on web
npx expo start --web
\`\`\`

## Building for Production

### iOS (App Store)

\`\`\`bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo account
eas login

# Configure build
eas build:configure

# Build for iOS
eas build --platform ios

# Submit to App Store
eas submit --platform ios
\`\`\`

### Android (Google Play)

\`\`\`bash
# Build for Android
eas build --platform android

# Submit to Google Play
eas submit --platform android
\`\`\`

## App Flow

1. **Authentication**: Login or register
2. **Onboarding**: Set personal info, fitness goal, cuisine & taste preferences
3. **Home**: Scan ingredients button + recent scans history
4. **Camera**: Take photo or select from gallery
5. **AI Analysis**: Automatic ingredient detection
6. **Edit Ingredients**: Review and modify detected ingredients
7. **Recipe Generation**: AI generates personalized recipes
8. **Recipe List**: Browse recipes filtered by preferences
9. **Recipe Detail**: View full recipe with macros, micros, steps
10. **Favorites**: Save and access favorite recipes
11. **Profile**: View and update preferences

## Monetization (Planned)

Freemium model similar to CalAI:
- Free: Limited scans per month
- Premium: Unlimited scans, advanced filters, meal planning

## License

Private - All rights reserved

## Contact

For questions or support, contact [your-email@example.com]
