# Make-a-Meal-AI Project State

Laatst bijgewerkt: 2024-02-04

---

## Quick Reference

| Item | Waarde |
|------|--------|
| Framework | React Native + Expo 54 |
| Taal | TypeScript 5.9 |
| Backend | Supabase (PostgreSQL + Auth + Storage + Edge Functions) |
| AI | OpenAI (Vision + GPT-4o-mini) |
| Recepten in Discover | 162 (unieke foto's) |

---

## Belangrijke Bestanden

### Frontend
- `src/screens/discover/DiscoverScreen.tsx` - Browse recepten met filters
- `src/screens/discover/recipeData.ts` - 162 recepten database
- `src/screens/home/HomeScreen.tsx` - Dashboard + calorie tracker
- `src/screens/recipes/RecipeListScreen.tsx` - AI-gegenereerde recepten
- `src/screens/recipes/RecipeDetailScreen.tsx` - Recept detail view
- `src/contexts/AuthContext.tsx` - Authenticatie state
- `src/services/aiService.ts` - AI API calls

### Backend
- `supabase/functions/analyze-ingredients/` - Vision API
- `supabase/functions/generate-recipes/` - Recept generatie
- `supabase-setup.sql` - Database schema

### Config
- `app.config.js` - Expo configuratie
- `.env` - Environment variables (NIET committen!)

---

## Filter Systeem (Discover)

### Categorieën
- **MEAL_TYPES:** breakfast, lunch, dinner, snack
- **GOALS:** high-protein, bulking, cutting, pre-workout, vegan, quick, spicy, sweet, carnivore
- **CUISINES:** italian, middle_eastern, asian, mexican

### Filter Logica
Intersection-based: recepten moeten ALLE geselecteerde tags hebben.
```typescript
results = ALL_RECIPES.filter(recipe =>
  filterArr.every(tag => recipe.tags.includes(tag))
);
```

### Coverage (minimaal 5 per combinatie)
- asian + breakfast + sweet: 7
- asian + carnivore: 10
- mexican + spicy + high-protein: 10
- italian + vegan: 8
- breakfast + high-protein: 31
- dinner + carnivore: 29

---

## Database Tabellen

| Tabel | Primaire Key | Foreign Keys |
|-------|--------------|--------------|
| users | id (UUID) | auth.users.id |
| scans | id (UUID) | user_id → users |
| favorites | id (UUID) | user_id → users |
| meals_consumed | id (UUID) | user_id → users |
| community_posts | id (UUID) | user_id → users |
| subscriptions | id (UUID) | user_id → users |

---

## Recept Interface

```typescript
interface DiscoverRecipe {
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: number;        // prep time in minutes
  image: string;       // Unsplash URL
  tags: string[];      // filter tags
}
```

---

## Veelvoorkomende Taken

### Nieuw recept toevoegen
1. Open `src/screens/discover/recipeData.ts`
2. Voeg toe aan juiste cuisine array (ITALIAN_RECIPES, ASIAN_RECIPES, etc.)
3. Zorg voor unieke Unsplash URL
4. Voeg relevante tags toe
5. Run `npx tsc --noEmit` om te checken

### Filter toevoegen
1. Voeg toe aan GOALS of CUISINES in DiscoverScreen.tsx
2. Update TAG_LABELS lookup
3. Voeg tag toe aan relevante recepten in recipeData.ts

### Macro berekening
- Protein: 4 kcal/g
- Carbs: 4 kcal/g
- Fat: 9 kcal/g
- Totaal moet ongeveer kloppen: calories ≈ (protein*4) + (carbs*4) + (fat*9)
