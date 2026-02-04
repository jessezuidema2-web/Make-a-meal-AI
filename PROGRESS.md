# Implementation Progress - Calorie Tracking Features

## Status: ALL CODE COMPLETE - DATABASE MIGRATION PENDING

## Completed (Code)

### 1. Types uitgebreid (`src/types/index.ts`)
- [x] User interface: birth_date, activity_level, target_weight, target_weeks, daily_calorie_goal
- [x] MealConsumed interface
- [x] ActivityLevel type
- [x] MainTabParamList: Tracker tab toegevoegd

### 2. Calorie Calculator (`src/utils/calorieCalculator.ts`) - NIEUW
- [x] Harris-Benedict BMR formule (man/vrouw)
- [x] Activiteitsmultiplicator (5 niveaus)
- [x] Doel-aanpassing (afvallen/aankomen/behouden)
- [x] calculateAge, calculateBMR, calculateDailyCalorieGoal

### 3. Onboarding uitgebreid (`src/screens/onboarding/OnboardingScreen.tsx`)
- [x] Nieuwe stap "Health Details" na fitness goal
- [x] Geboortedatum input (YYYY-MM-DD)
- [x] Activiteitsniveau selector (5 opties)
- [x] Conditioneel: doel gewicht + weken (bij lose/gain weight)
- [x] Calorie goal berekening bij profiel aanmaken

### 4. RecipeDetailScreen - "Eet dit recept" (`src/screens/recipes/RecipeDetailScreen.tsx`)
- [x] "Eat this recipe" knop met fork emoji
- [x] handleEatRecipe() -> insert in meals_consumed
- [x] Loading state + success feedback alert

### 5. HomeScreen - Calorie tracker card (`src/screens/home/HomeScreen.tsx`)
- [x] Dagelijks calorie overzicht card (paars accent)
- [x] Voortgangsbalk (consumed / goal)
- [x] Macro breakdown (P/C/F)
- [x] Lijst van vandaag gegeten recepten met verwijder optie
- [x] useFocusEffect voor data refresh

### 6. Tracker tab - NIEUW (`src/screens/tracker/TrackerScreen.tsx`)
- [x] Datum navigatie (vorige/volgende dag)
- [x] Groot calorie overzicht met progress bar
- [x] Macro breakdown
- [x] Week overzicht bar chart
- [x] Lijst gegeten recepten met verwijder optie
- [x] Goal indicator

### 7. AI Ingrediënt Suggesties
- [x] `src/services/aiService.ts` - suggestExtraIngredients() functie
- [x] `src/screens/ingredients/IngredientEditScreen.tsx` - AI Suggestions knop
- [x] Suggesties als tappable chips om toe te voegen
- [x] `supabase/functions/suggest-ingredients/index.ts` - Edge Function (NIEUW)

### 8. ProfileScreen uitgebreid (`src/screens/profile/ProfileScreen.tsx`)
- [x] Geboortedatum veld (bewerkbaar)
- [x] Activiteitsniveau selector
- [x] Doel gewicht + weken (conditioneel)
- [x] Berekende calorie goal weergave (paarse card)
- [x] Herberekening bij profiel update

### 9. Navigation (`src/navigation/AppNavigator.tsx`)
- [x] Tracker tab toegevoegd met chart emoji

## STILL TODO - Database

### Run SQL Migration
**Bestand:** `migrations/001_calorie_tracking.sql`

Run in Supabase Dashboard > SQL Editor:
- ALTER TABLE users (5 nieuwe kolommen)
- CREATE TABLE meals_consumed
- RLS policy
- Index

### Deploy Edge Function
```bash
supabase functions deploy suggest-ingredients
```

## Files Changed/Created

| File | Status |
|------|--------|
| `src/types/index.ts` | MODIFIED |
| `src/utils/calorieCalculator.ts` | NEW |
| `src/screens/onboarding/OnboardingScreen.tsx` | MODIFIED |
| `src/screens/recipes/RecipeDetailScreen.tsx` | MODIFIED |
| `src/screens/home/HomeScreen.tsx` | MODIFIED |
| `src/screens/tracker/TrackerScreen.tsx` | NEW |
| `src/screens/ingredients/IngredientEditScreen.tsx` | MODIFIED |
| `src/screens/profile/ProfileScreen.tsx` | MODIFIED |
| `src/services/aiService.ts` | MODIFIED |
| `src/navigation/AppNavigator.tsx` | MODIFIED |
| `supabase/functions/suggest-ingredients/index.ts` | NEW |
| `migrations/001_calorie_tracking.sql` | NEW |
