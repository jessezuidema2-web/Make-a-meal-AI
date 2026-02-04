import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  ScrollView,
  Platform,
  Image,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../config/supabase';
import { Recipe, Scan, MacroGoal, MealTiming } from '../../types';
import { generateRecipes, checkCanPerformAction, AIServiceError } from '../../services/aiService';
import { colors, typography, spacing, borders, shadows } from '../../constants/designSystem';

const MEAL_TIMING_CONFIG: Record<MealTiming, { emoji: string; label: string }> = {
  'pre-workout': { emoji: '\u26A1', label: 'Pre-Workout' },
  'post-workout': { emoji: '\uD83D\uDCAA', label: 'Post-Workout' },
  'breakfast': { emoji: '\uD83C\uDF73', label: 'Breakfast' },
  'lunch': { emoji: '\uD83C\uDF5D', label: 'Lunch' },
  'dinner': { emoji: '\uD83C\uDF7D\uFE0F', label: 'Dinner' },
  'snack': { emoji: '\uD83C\uDF4E', label: 'Snack' },
};

export const RecipeListScreen = ({ route, navigation }: any) => {
  const { scanId } = route.params;
  const { user, session } = useAuth();
  const [scan, setScan] = useState<Scan | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMacroGoal, setSelectedMacroGoal] = useState<MacroGoal | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const macroGoals: { value: MacroGoal; label: string; emoji: string }[] = [
    { value: 'high_protein', label: 'High Protein', emoji: '\uD83E\uDD69' },
    { value: 'high_carb', label: 'High Carb', emoji: '\uD83C\uDF5D' },
    { value: 'high_fat', label: 'High Fat', emoji: '\uD83E\uDD51' },
    { value: 'pre_workout', label: 'Pre-Workout', emoji: '\u26A1' },
    { value: 'post_workout', label: 'Post-Workout', emoji: '\uD83D\uDCAA' },
  ];

  useEffect(() => {
    loadScanAndGenerateRecipes();
  }, []);

  useEffect(() => {
    filterRecipes();
  }, [recipes, selectedMacroGoal, user]);

  const loadScanAndGenerateRecipes = async () => {
    try {
      const { data: scanData, error: scanError } = await supabase
        .from('scans')
        .select('*')
        .eq('id', scanId)
        .single();

      if (scanError) throw scanError;
      setScan(scanData);

      // Check if recipes already generated
      if (scanData.recipes && scanData.recipes.length > 0) {
        setRecipes(scanData.recipes);
        setIsLoading(false);
        return;
      }

      // Generate recipes using AI
      await generateRecipesForScan(scanData);
    } catch (error) {
      console.error('Error loading scan:', error);
      Alert.alert('Error', 'Failed to load recipes');
    } finally {
      setIsLoading(false);
    }
  };

  const generateRecipesForScan = async (scanData: Scan) => {
    try {
      // Check rate limit
      const limitCheck = await checkCanPerformAction('recipe_generation');
      if (!limitCheck.allowed) {
        Alert.alert(
          'Generation Limit Reached',
          limitCheck.message || 'Please upgrade to continue',
          [
            { text: 'OK' },
            {
              text: 'Upgrade',
              onPress: () => {
                // TODO: Navigate to subscription screen
                console.log('Navigate to subscription');
              },
            },
          ]
        );
        return;
      }

      // Call AI service via Edge Function (secure)
      const generatedRecipes = await generateRecipes(scanId);

      setRecipes(generatedRecipes);
    } catch (error) {
      console.error('Error generating recipes:', error);

      let errorMessage = 'Failed to generate recipes. Please try again.';
      let errorTitle = 'Error';

      if (error instanceof AIServiceError) {
        errorMessage = error.message;

        // Handle auth-specific errors
        if (error.statusCode === 401 || error.code === 'AUTH_FAILED' || error.code === 'SESSION_EXPIRED') {
          errorTitle = 'Session Expired';
          errorMessage = 'Your session has expired. Please log in again.';
          Alert.alert(errorTitle, errorMessage, [
            { text: 'Log In', onPress: () => navigation.navigate('Login') }
          ]);
          return;
        }
      }

      Alert.alert(errorTitle, errorMessage);
    }
  };

  const filterRecipes = () => {
    if (!user) {
      setFilteredRecipes(recipes);
      return;
    }

    let filtered = [...recipes];

    // Apply macro goal filter if selected
    if (selectedMacroGoal) {
      filtered = filtered.filter(recipe => recipe.macroGoalMatch === selectedMacroGoal);
    }

    // Sort by match score (how well it matches user preferences)
    filtered.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

    setFilteredRecipes(filtered);
  };

  const handleRecipePress = (recipe: Recipe) => {
    navigation.navigate('RecipeDetail', { recipeId: recipe.id, scanId });
  };

  const totalIngredients = scan?.ingredients?.length || 0;

  const renderRecipe = ({ item }: { item: Recipe }) => {
    const timing = item.mealTiming ? MEAL_TIMING_CONFIG[item.mealTiming] : null;

    return (
      <TouchableOpacity
        style={styles.recipeCard}
        onPress={() => handleRecipePress(item)}
      >
        <Image
          source={{ uri: item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop' }}
          style={styles.recipeImage}
          resizeMode="cover"
        />
        <View style={styles.recipeHeader}>
          <Text style={styles.recipeName} numberOfLines={2}>{item.name}</Text>
          <View style={styles.badgeRow}>
            {timing && (
              <View style={styles.timingBadge}>
                <Text style={styles.timingText}>{timing.emoji} {timing.label}</Text>
              </View>
            )}
            {item.matchScore !== undefined && (
              <View style={styles.matchBadge}>
                <Text style={styles.matchText}>{item.matchScore}%</Text>
              </View>
            )}
          </View>
        </View>

        <Text style={styles.recipeDescription} numberOfLines={2}>
          {item.description}
        </Text>

        {item.ingredientsUsed !== undefined && totalIngredients > 0 && (
          <Text style={styles.ingredientsUsedText}>
            Uses {item.ingredientsUsed}/{totalIngredients} ingredients
          </Text>
        )}

        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {item.tags.slice(0, 4).map((tag, index) => (
              <View key={index} style={styles.tagChip}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
            {item.tags.length > 4 && (
              <Text style={styles.moreTagsText}>+{item.tags.length - 4}</Text>
            )}
          </View>
        )}

        <View style={styles.macrosRow}>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{item.macros?.calories ?? 0}</Text>
            <Text style={styles.macroLabel}>kcal</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{item.macros?.protein ?? 0}g</Text>
            <Text style={styles.macroLabel}>protein</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{item.macros?.carbs ?? 0}g</Text>
            <Text style={styles.macroLabel}>carbs</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{item.macros?.fat ?? 0}g</Text>
            <Text style={styles.macroLabel}>fat</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{item.prepTime + item.cookTime} min</Text>
          <Text style={styles.metaText}>{item.servings} servings</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Generating recipes...</Text>
        <Text style={styles.loadingSubtext}>
          Our AI is creating personalized recipes for you
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Recipes</Text>
        <TouchableOpacity
          style={styles.filterToggle}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text style={styles.filterToggleText}>
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Text>
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={styles.filtersContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            <TouchableOpacity
              style={[
                styles.filterChip,
                !selectedMacroGoal && styles.filterChipSelected,
              ]}
              onPress={() => setSelectedMacroGoal(null)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  !selectedMacroGoal && styles.filterChipTextSelected,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            {macroGoals.map(goal => (
              <TouchableOpacity
                key={goal.value}
                style={[
                  styles.filterChip,
                  selectedMacroGoal === goal.value && styles.filterChipSelected,
                ]}
                onPress={() => setSelectedMacroGoal(goal.value)}
              >
                <Text style={styles.filterEmoji}>{goal.emoji}</Text>
                <Text
                  style={[
                    styles.filterChipText,
                    selectedMacroGoal === goal.value && styles.filterChipTextSelected,
                  ]}
                >
                  {goal.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <FlatList
        data={filteredRecipes}
        renderItem={renderRecipe}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No recipes found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.lg,
  },
  loadingText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginTop: spacing.base,
  },
  loadingSubtext: {
    fontSize: typography.sizes.base,
    color: colors.text.tertiary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: spacing.base,
  },
  title: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.heavy,
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  filterToggle: {
    padding: spacing.sm,
  },
  filterToggleText: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },
  filtersContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.base,
  },
  filterScroll: {
    gap: spacing.md,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderRadius: borders.radius.full,
    backgroundColor: colors.gray[100],
    gap: spacing.sm,
  },
  filterChipSelected: {
    backgroundColor: colors.accent,
  },
  filterEmoji: {
    fontSize: typography.sizes.base,
  },
  filterChipText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
  },
  filterChipTextSelected: {
    color: colors.white,
  },
  list: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  recipeImage: {
    width: '100%',
    height: 180,
    borderRadius: borders.radius.lg,
    marginBottom: spacing.base,
    backgroundColor: colors.gray[200],
  },
  recipeCard: {
    padding: spacing.lg,
    borderRadius: borders.radius.xl,
    backgroundColor: colors.white,
    marginBottom: spacing.base,
    ...shadows.md,
  },
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  recipeName: {
    flex: 1,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginRight: spacing.sm,
    lineHeight: typography.sizes.xl * typography.lineHeights.tight,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  timingBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borders.radius.md,
  },
  timingText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  matchBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borders.radius.md,
  },
  matchText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.white,
  },
  recipeDescription: {
    fontSize: typography.sizes.base,
    color: colors.text.tertiary,
    marginBottom: spacing.md,
    lineHeight: typography.sizes.base * typography.lineHeights.relaxed,
  },
  ingredientsUsedText: {
    fontSize: typography.sizes.sm,
    color: colors.accent,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.md,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  tagChip: {
    backgroundColor: colors.accentLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borders.radius.sm,
  },
  tagText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.accent,
  },
  moreTagsText: {
    fontSize: typography.sizes.xs,
    color: colors.text.light,
    alignSelf: 'center',
    marginLeft: spacing.xs,
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.base,
    paddingTop: spacing.base,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.heavy,
    color: colors.text.primary,
  },
  macroLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.base,
  },
  metaText: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    fontWeight: typography.weights.normal,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.tertiary,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    fontSize: typography.sizes.base,
    color: colors.text.light,
  },
});
