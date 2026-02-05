import React, { useState, useMemo, useCallback, memo, useTransition } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  FlatList,
  Image,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  InteractionManager,
} from 'react-native';
import { colors, typography, spacing, borders, shadows } from '../../constants/designSystem';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../config/supabase';
import { ALL_RECIPES, DiscoverRecipe } from './recipeData';

// Pre-index recipe tags as Sets for O(1) lookup during filtering
const INDEXED_RECIPES = ALL_RECIPES.map(recipe => ({
  ...recipe,
  tagSet: new Set(recipe.tags),
}));
type IndexedRecipe = typeof INDEXED_RECIPES[0];

const MEAL_TYPES = [
  { id: 'breakfast', label: 'Breakfast', emoji: '\uD83C\uDF73', image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=200&h=200&fit=crop' },
  { id: 'lunch', label: 'Lunch', emoji: '\uD83C\uDF5D', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&h=200&fit=crop' },
  { id: 'dinner', label: 'Dinner', emoji: '\uD83C\uDF7D\uFE0F', image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=200&h=200&fit=crop' },
  { id: 'snack', label: 'Snack', emoji: '\uD83C\uDF4E', image: 'https://images.unsplash.com/photo-1604909052743-94e838986d24?w=200&h=200&fit=crop' },
];

const GOALS = [
  { id: 'high-protein', label: 'High Protein', emoji: '\uD83D\uDCAA' },
  { id: 'bulking', label: 'Bulking', emoji: '\uD83C\uDFCB\uFE0F' },
  { id: 'cutting', label: 'Cutting', emoji: '\u2702\uFE0F' },
  { id: 'pre-workout', label: 'Pre-workout', emoji: '\u26A1' },
  { id: 'vegan', label: 'Vegan', emoji: '\uD83C\uDF31' },
  { id: 'quick', label: 'Quick (<15min)', emoji: '\u23F1\uFE0F' },
  { id: 'spicy', label: 'Spicy', emoji: '\uD83C\uDF36\uFE0F' },
  { id: 'sweet', label: 'Sweet', emoji: '\uD83C\uDF70' },
  { id: 'carnivore', label: 'Carnivore', emoji: '\uD83E\uDD69' },
];

const CUISINES = [
  { id: 'italian', label: 'Italian', image: 'https://images.unsplash.com/photo-1498579150354-977475b7ea0b?w=400&h=240&fit=crop' },
  { id: 'middle_eastern', label: 'Middle Eastern', image: 'https://images.unsplash.com/photo-1540914124281-342587941389?w=400&h=240&fit=crop' },
  { id: 'asian', label: 'Asian', image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=240&fit=crop' },
  { id: 'mexican', label: 'Mexican', image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=240&fit=crop' },
];

// Build label lookup
const TAG_LABELS: Record<string, string> = {};
for (const m of MEAL_TYPES) TAG_LABELS[m.id] = m.label;
for (const g of GOALS) TAG_LABELS[g.id] = g.label;
for (const c of CUISINES) TAG_LABELS[c.id] = c.label;

// Cuisine IDs for OR logic
const CUISINE_IDS = new Set(CUISINES.map(c => c.id));

type RecipeItem = DiscoverRecipe;

// Memoized components for performance - using Pressable for instant response
const MealTypeCard = memo(({ item, isActive, onPress }: {
  item: typeof MEAL_TYPES[0];
  isActive: boolean;
  onPress: () => void;
}) => (
  <Pressable
    style={({ pressed }) => [
      styles.mealTypeCard,
      isActive && styles.mealTypeCardActive,
      pressed && styles.pressed,
    ]}
    onPress={onPress}
    delayLongPress={200}
  >
    <Image source={{ uri: item.image }} style={styles.mealTypeImage} />
    <View style={[styles.mealTypeOverlay, isActive && styles.mealTypeOverlayActive]}>
      <Text style={styles.mealTypeEmoji}>{item.emoji}</Text>
      <Text style={styles.mealTypeLabel}>{item.label}</Text>
    </View>
  </Pressable>
));

const GoalCard = memo(({ item, isActive, onPress }: {
  item: typeof GOALS[0];
  isActive: boolean;
  onPress: () => void;
}) => (
  <Pressable
    style={({ pressed }) => [
      styles.goalCard,
      isActive && styles.goalCardActive,
      pressed && styles.pressed,
    ]}
    onPress={onPress}
    delayLongPress={200}
  >
    <Text style={styles.goalEmoji}>{item.emoji}</Text>
    <Text style={styles.goalLabel}>{item.label}</Text>
  </Pressable>
));

const CuisineCard = memo(({ item, isActive, onPress }: {
  item: typeof CUISINES[0];
  isActive: boolean;
  onPress: () => void;
}) => (
  <Pressable
    style={({ pressed }) => [
      styles.cuisineCard,
      isActive && styles.cuisineCardActive,
      pressed && styles.pressed,
    ]}
    onPress={onPress}
    delayLongPress={200}
  >
    <Image source={{ uri: item.image }} style={styles.cuisineImage} />
    <View style={[styles.cuisineOverlay, isActive && styles.cuisineOverlayActive]}>
      <Text style={styles.cuisineLabel}>{item.label}</Text>
    </View>
  </Pressable>
));

const RecipeCard = memo(({ recipe, onPress }: {
  recipe: IndexedRecipe;
  onPress: () => void;
}) => (
  <Pressable
    style={({ pressed }) => [
      styles.resultCard,
      pressed && styles.pressed,
    ]}
    onPress={onPress}
    delayLongPress={200}
  >
    <Image source={{ uri: recipe.image }} style={styles.resultImage} />
    <View style={styles.resultInfo}>
      <Text style={styles.resultName}>{recipe.name}</Text>
      <Text style={styles.resultDesc} numberOfLines={2}>{recipe.description}</Text>
      <View style={styles.resultMeta}>
        <Text style={styles.resultMetaText}>{recipe.calories} kcal</Text>
        <Text style={styles.resultMetaDot}>{'\u00B7'}</Text>
        <Text style={styles.resultMetaText}>P: {recipe.protein}g</Text>
        <Text style={styles.resultMetaDot}>{'\u00B7'}</Text>
        <Text style={styles.resultMetaText}>C: {recipe.carbs}g</Text>
        <Text style={styles.resultMetaDot}>{'\u00B7'}</Text>
        <Text style={styles.resultMetaText}>F: {recipe.fat}g</Text>
      </View>
      <Text style={styles.resultTime}>{recipe.time} min</Text>
    </View>
  </Pressable>
));

export const DiscoverScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [selectedRecipe, setSelectedRecipe] = useState<IndexedRecipe | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isPending, startTransition] = useTransition();

  const toggleFilter = useCallback((key: string) => {
    // Update UI immediately, defer expensive filtering
    startTransition(() => {
      setActiveFilters(prev => {
        const next = new Set(prev);
        if (next.has(key)) {
          next.delete(key);
        } else {
          next.add(key);
        }
        return next;
      });
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    startTransition(() => {
      setActiveFilters(new Set());
    });
  }, []);

  // Filter recipes: cuisines use OR logic (union), other filters use AND (intersection)
  // Optimized with pre-indexed Set-based lookups for O(1) tag checking
  const results = useMemo(() => {
    if (activeFilters.size === 0) return [];

    // Separate cuisine filters from other filters
    const cuisineFilters: string[] = [];
    const otherFilters: string[] = [];
    activeFilters.forEach(tag => {
      if (CUISINE_IDS.has(tag)) {
        cuisineFilters.push(tag);
      } else {
        otherFilters.push(tag);
      }
    });

    // Use pre-indexed recipes with tagSet for O(1) lookups
    const filtered = INDEXED_RECIPES.filter(recipe => {
      // All non-cuisine filters must match (AND)
      for (const tag of otherFilters) {
        if (!recipe.tagSet.has(tag)) return false;
      }

      // If cuisines selected, recipe must match at least one (OR)
      if (cuisineFilters.length > 0) {
        for (const tag of cuisineFilters) {
          if (recipe.tagSet.has(tag)) return true;
        }
        return false;
      }

      return true;
    });

    // Sort by relevance based on active goal filters
    if (activeFilters.has('high-protein')) {
      filtered.sort((a, b) => b.protein - a.protein);
    } else if (activeFilters.has('cutting')) {
      filtered.sort((a, b) => a.calories - b.calories);
    } else if (activeFilters.has('bulking')) {
      filtered.sort((a, b) => b.calories - a.calories);
    } else if (activeFilters.has('pre-workout')) {
      filtered.sort((a, b) => b.carbs - a.carbs);
    } else if (activeFilters.has('quick')) {
      filtered.sort((a, b) => a.time - b.time);
    }

    return filtered;
  }, [activeFilters]);

  const activeLabels = useMemo(() => {
    return Array.from(activeFilters).map(key => TAG_LABELS[key] || key);
  }, [activeFilters]);

  const handleAddToTracker = async () => {
    if (!user || !selectedRecipe) return;
    setIsAdding(true);
    try {
      await supabase.from('meals_consumed').insert({
        user_id: user.id,
        recipe_id: selectedRecipe.name,
        recipe_name: selectedRecipe.name,
        calories: selectedRecipe.calories,
        protein: selectedRecipe.protein,
        carbs: selectedRecipe.carbs,
        fat: selectedRecipe.fat,
        servings: 1,
      });
      setSelectedRecipe(null);
      navigation.navigate('Main', { screen: 'Tracker' });
    } catch (e) {
      console.error('Error adding meal:', e);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Discover</Text>
          <Text style={styles.subtitle}>Find your perfect meal</Text>
        </View>

        {/* Meal Types Carousel */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meal Type</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={MEAL_TYPES}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.carouselContent}
            extraData={activeFilters}
            renderItem={({ item }) => (
              <MealTypeCard
                item={item}
                isActive={activeFilters.has(item.id)}
                onPress={() => toggleFilter(item.id)}
              />
            )}
          />
        </View>

        {/* Search by Goal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Search by Goal</Text>
          <View style={styles.goalsGrid}>
            {GOALS.map(goal => (
              <GoalCard
                key={goal.id}
                item={goal}
                isActive={activeFilters.has(goal.id)}
                onPress={() => toggleFilter(goal.id)}
              />
            ))}
          </View>
        </View>

        {/* Cuisines */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cuisines</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={CUISINES}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.carouselContent}
            extraData={activeFilters}
            renderItem={({ item }) => (
              <CuisineCard
                item={item}
                isActive={activeFilters.has(item.id)}
                onPress={() => toggleFilter(item.id)}
              />
            )}
          />
        </View>

        {/* Results */}
        {activeFilters.size > 0 && (
          <View style={styles.section}>
            <View style={styles.resultsHeader}>
              <View style={styles.activeTagsRow}>
                {activeLabels.map((label, i) => (
                  <View key={i} style={styles.activeTag}>
                    <Text style={styles.activeTagText}>{label}</Text>
                    <Pressable onPress={() => toggleFilter(Array.from(activeFilters)[i])}>
                      <Text style={styles.activeTagRemove}>{'\u00D7'}</Text>
                    </Pressable>
                  </View>
                ))}
                <Pressable onPress={clearAllFilters} style={styles.clearAllButton}>
                  <Text style={styles.clearText}>Clear all</Text>
                </Pressable>
              </View>
            </View>

            <Text style={styles.resultCount}>
              {results.length} recipe{results.length !== 1 ? 's' : ''} found
            </Text>

            {results.length > 0 ? (
              <FlatList
                data={results}
                keyExtractor={(item, index) => `${item.name}-${index}`}
                renderItem={({ item }) => (
                  <RecipeCard
                    recipe={item}
                    onPress={() => setSelectedRecipe(item)}
                  />
                )}
                scrollEnabled={false}
                initialNumToRender={5}
                maxToRenderPerBatch={5}
                windowSize={3}
                removeClippedSubviews={true}
                getItemLayout={(_, index) => ({
                  length: 100,
                  offset: 100 * index,
                  index,
                })}
              />
            ) : (
              <View style={styles.emptyResults}>
                <Text style={styles.emptyEmoji}>{'\uD83D\uDD0D'}</Text>
                <Text style={styles.emptyText}>No recipes match all selected filters</Text>
                <Text style={styles.emptySubtext}>Try removing a filter to see more results</Text>
              </View>
            )}
          </View>
        )}

        <View style={{ height: spacing['2xl'] }} />
      </ScrollView>

      {/* Recipe Detail Modal */}
      <Modal
        visible={selectedRecipe !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedRecipe(null)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalBackdrop}>
            <Pressable
              style={styles.modalBackdropTouchable}
              onPress={() => setSelectedRecipe(null)}
            />
            <View style={styles.modalContent}>
              {selectedRecipe && (
                <>
                  <Image
                    source={{ uri: selectedRecipe.image }}
                    style={styles.modalImage}
                  />
                  <View style={styles.modalBody}>
                    <Text style={styles.modalTitle}>{selectedRecipe.name}</Text>
                    <Text style={styles.modalDescription}>{selectedRecipe.description}</Text>

                    <View style={styles.modalTagsRow}>
                      {selectedRecipe.tags.map((tag, i) => (
                        <View key={i} style={styles.modalTag}>
                          <Text style={styles.modalTagText}>{TAG_LABELS[tag] || tag}</Text>
                        </View>
                      ))}
                    </View>

                    <View style={styles.modalStats}>
                      <View style={styles.modalStatItem}>
                        <Text style={styles.modalStatValue}>{selectedRecipe.calories}</Text>
                        <Text style={styles.modalStatLabel}>kcal</Text>
                      </View>
                      <View style={styles.modalStatItem}>
                        <Text style={styles.modalStatValue}>{selectedRecipe.protein}g</Text>
                        <Text style={styles.modalStatLabel}>protein</Text>
                      </View>
                      <View style={styles.modalStatItem}>
                        <Text style={styles.modalStatValue}>{selectedRecipe.carbs}g</Text>
                        <Text style={styles.modalStatLabel}>carbs</Text>
                      </View>
                      <View style={styles.modalStatItem}>
                        <Text style={styles.modalStatValue}>{selectedRecipe.fat}g</Text>
                        <Text style={styles.modalStatLabel}>fat</Text>
                      </View>
                    </View>
                    <Text style={styles.modalTime}>{selectedRecipe.time} min prep time</Text>

                    <Pressable
                      style={({ pressed }) => [
                        styles.addToTrackerButton,
                        pressed && styles.pressed,
                      ]}
                      onPress={handleAddToTracker}
                      disabled={isAdding}
                    >
                      {isAdding ? (
                        <ActivityIndicator color={colors.white} />
                      ) : (
                        <Text style={styles.addToTrackerText}>Add to Tracker</Text>
                      )}
                    </Pressable>

                    <Pressable
                      style={({ pressed }) => [
                        styles.modalCloseButton,
                        pressed && styles.pressed,
                      ]}
                      onPress={() => setSelectedRecipe(null)}
                    >
                      <Text style={styles.modalCloseText}>Close</Text>
                    </Pressable>
                  </View>
                </>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  header: {
    padding: spacing.lg,
    paddingTop: spacing['3xl'] + spacing.md,
  },
  title: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.heavy,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.heavy,
    color: colors.text.primary,
    marginBottom: spacing.base,
    paddingHorizontal: spacing.lg,
    letterSpacing: -0.3,
  },
  carouselContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  mealTypeCard: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    ...shadows.md,
  },
  mealTypeCardActive: {
    borderWidth: 3,
    borderColor: colors.primary,
  },
  mealTypeImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.gray[200],
  },
  mealTypeOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealTypeOverlayActive: {
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  mealTypeEmoji: {
    fontSize: 28,
    marginBottom: 2,
  },
  mealTypeLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  goalCard: {
    width: '47%',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.base,
    borderRadius: borders.radius.xl,
    backgroundColor: colors.gray[50],
    alignItems: 'center',
    ...shadows.sm,
  },
  goalCardActive: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  goalEmoji: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  goalLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  cuisineCard: {
    width: 200,
    height: 120,
    borderRadius: borders.radius.xl,
    overflow: 'hidden',
    ...shadows.md,
  },
  cuisineCardActive: {
    borderWidth: 3,
    borderColor: colors.primary,
  },
  cuisineImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.gray[200],
  },
  cuisineOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
    padding: spacing.base,
  },
  cuisineOverlayActive: {
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  cuisineLabel: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.heavy,
    color: colors.white,
  },
  // Results
  resultsHeader: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  activeTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    alignItems: 'center',
  },
  activeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borders.radius.full || 20,
    gap: spacing.sm,
  },
  activeTagText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.white,
  },
  activeTagRemove: {
    fontSize: typography.sizes.md,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: typography.weights.bold,
  },
  clearAllButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  clearText: {
    fontSize: typography.sizes.sm,
    color: colors.text.light,
    fontWeight: typography.weights.semibold,
  },
  resultCount: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  resultCard: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: borders.radius.lg,
    backgroundColor: colors.white,
    ...shadows.md,
  },
  resultImage: {
    width: 80,
    height: 80,
    borderRadius: borders.radius.md,
    backgroundColor: colors.gray[200],
  },
  resultInfo: {
    flex: 1,
    marginLeft: spacing.base,
    justifyContent: 'center',
  },
  resultName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  resultDesc: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    marginBottom: spacing.sm,
    lineHeight: typography.sizes.sm * typography.lineHeights.normal,
  },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultMetaText: {
    fontSize: typography.sizes.xs,
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },
  resultMetaDot: {
    fontSize: typography.sizes.xs,
    color: colors.text.light,
    marginHorizontal: spacing.sm,
  },
  resultTime: {
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  emptyResults: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: typography.sizes.md,
    color: colors.text.tertiary,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: typography.sizes.sm,
    color: colors.text.light,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalBackdropTouchable: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borders.radius['2xl'] || 24,
    borderTopRightRadius: borders.radius['2xl'] || 24,
    overflow: 'hidden',
    maxHeight: '85%',
  },
  modalImage: {
    width: '100%',
    height: 220,
    backgroundColor: colors.gray[200],
  },
  modalBody: {
    padding: spacing.lg,
  },
  modalTitle: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.heavy,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    letterSpacing: -0.3,
  },
  modalDescription: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    marginBottom: spacing.base,
    lineHeight: typography.sizes.md * typography.lineHeights.relaxed,
  },
  modalTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  modalTag: {
    backgroundColor: colors.gray[100],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borders.radius.full || 20,
  },
  modalTagText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    fontWeight: typography.weights.semibold,
  },
  modalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.xl,
    paddingVertical: spacing.base,
    backgroundColor: colors.gray[50],
    borderRadius: borders.radius.lg,
  },
  modalStatItem: {
    alignItems: 'center',
  },
  modalStatValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.heavy,
    color: colors.text.primary,
  },
  modalStatLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  modalTime: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  addToTrackerButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.base,
    borderRadius: borders.radius.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  addToTrackerText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  modalCloseButton: {
    paddingVertical: spacing.base,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.tertiary,
  },
});
