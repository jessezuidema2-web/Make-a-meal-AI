import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  Animated,
  TextInput,
  Modal,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../config/supabase';
import { Recipe, MealTiming } from '../../types';
import { colors, typography, spacing, borders, shadows } from '../../constants/designSystem';

const MEAL_TIMING_CONFIG: Record<MealTiming, { emoji: string; label: string; color: string }> = {
  'pre-workout': { emoji: '\u26A1', label: 'Pre-Workout', color: '#FF9500' },
  'post-workout': { emoji: '\uD83D\uDCAA', label: 'Post-Workout', color: '#34C759' },
  'breakfast': { emoji: '\uD83C\uDF73', label: 'Breakfast', color: '#FF9F0A' },
  'lunch': { emoji: '\uD83C\uDF5D', label: 'Lunch', color: '#007AFF' },
  'dinner': { emoji: '\uD83C\uDF7D\uFE0F', label: 'Dinner', color: '#5856D6' },
  'snack': { emoji: '\uD83C\uDF4E', label: 'Snack', color: '#FF2D55' },
};

export const RecipeDetailScreen = ({ route, navigation }: any) => {
  const { recipeId, scanId } = route.params;
  const { user } = useAuth();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEating, setIsEating] = useState(false);
  const [totalIngredients, setTotalIngredients] = useState(0);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [shareCaption, setShareCaption] = useState('');

  useEffect(() => {
    loadRecipe();
    checkIfFavorite();
  }, []);

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    Animated.sequence([
      Animated.timing(toastOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(1500),
      Animated.timing(toastOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setToastVisible(false));
  };

  const loadRecipe = async () => {
    try {
      if (!scanId) {
        const { data: favoriteData, error: favError } = await supabase
          .from('favorites')
          .select('recipe')
          .eq('recipe_id', recipeId)
          .single();
        if (favError) throw favError;
        if (favoriteData?.recipe) setRecipe(favoriteData.recipe);
      } else {
        const { data: scanData, error } = await supabase
          .from('scans')
          .select('recipes, ingredients')
          .eq('id', scanId)
          .single();
        if (error) throw error;
        const foundRecipe = scanData.recipes?.find((r: Recipe) => r.id === recipeId);
        if (foundRecipe) setRecipe(foundRecipe);
        if (scanData.ingredients) setTotalIngredients(scanData.ingredients.length);
      }
    } catch (error) {
      console.error('Error loading recipe:', error);
      Alert.alert('Error', 'Failed to load recipe');
    } finally {
      setIsLoading(false);
    }
  };

  const checkIfFavorite = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('recipe_id', recipeId)
        .maybeSingle();
      if (error && error.code !== 'PGRST116') throw error;
      setIsFavorite(!!data);
    } catch (error) {
      console.error('Error checking favorite:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!user || !recipe) return;
    try {
      if (isFavorite) {
        const { error } = await supabase.from('favorites').delete().eq('user_id', user.id).eq('recipe_id', recipeId);
        if (error) throw error;
        setIsFavorite(false);
      } else {
        const { error } = await supabase.from('favorites').insert({
          user_id: user.id, recipe_id: recipeId, recipe, created_at: new Date().toISOString(),
        });
        if (error) throw error;
        setIsFavorite(true);
      }
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', error.message || 'Failed to update favorite');
    }
  };

  const handleShareToCommunity = async () => {
    if (!user || !recipe || !shareCaption.trim()) return;
    try {
      const { error } = await supabase.from('community_posts').insert({
        user_id: user.id,
        user_name: user.name || 'Anonymous',
        recipe_name: recipe.name,
        recipe_image: recipe.imageUrl || null,
        calories: recipe.macros?.calories ?? 0,
        caption: shareCaption.trim(),
        likes_count: 0,
      });
      if (error) throw error;
      setShareModalVisible(false);
      setShareCaption('');
      showToast('Shared to community!');
    } catch (error: any) {
      console.error('Error sharing:', error);
      Alert.alert('Error', error.message || 'Failed to share');
    }
  };

  const handleEatRecipe = async () => {
    if (!user || !recipe) return;
    setIsEating(true);
    try {
      const { error } = await supabase.from('meals_consumed').insert({
        user_id: user.id,
        recipe_id: recipe.id,
        recipe_name: recipe.name,
        calories: recipe.macros?.calories ?? 0,
        protein: recipe.macros?.protein ?? 0,
        carbs: recipe.macros?.carbs ?? 0,
        fat: recipe.macros?.fat ?? 0,
        servings: 1,
      });
      if (error) throw error;
      showToast(`${recipe.name} added to tracker!`);
      // Navigate to Tracker tab after a brief delay
      setTimeout(() => {
        navigation.navigate('Main', { screen: 'Tracker' });
      }, 1800);
    } catch (error: any) {
      console.error('Error logging meal:', error);
      Alert.alert('Error', error.message || 'Failed to log meal');
    } finally {
      setIsEating(false);
    }
  };

  if (isLoading || !recipe) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const timing = recipe.mealTiming ? MEAL_TIMING_CONFIG[recipe.mealTiming] : null;
  const healthScore = recipe.healthScore;
  const healthColor = healthScore
    ? healthScore >= 7 ? colors.success : healthScore >= 4 ? colors.warning : colors.error
    : colors.gray[300];

  return (
    <View style={styles.container}>
      {/* Toast */}
      {toastVisible && (
        <Animated.View style={[styles.toast, { opacity: toastOpacity }]}>
          <Text style={styles.toastText}>{'\u2705'} {toastMessage}</Text>
        </Animated.View>
      )}

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Full-width hero image */}
        <Image
            source={{ uri: recipe.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop' }}
            style={styles.heroImage}
            resizeMode="cover"
          />

        <View style={styles.innerContent}>
          {timing && (
            <View style={[styles.timingBanner, { backgroundColor: timing.color + '15' }]}>
              <Text style={styles.timingEmoji}>{timing.emoji}</Text>
              <Text style={[styles.timingLabel, { color: timing.color }]}>{timing.label}</Text>
              {recipe.matchScore !== undefined && (
                <View style={styles.matchScoreBadge}>
                  <Text style={styles.matchScoreText}>{recipe.matchScore}% match</Text>
                </View>
              )}
            </View>
          )}

          <View style={styles.header}>
            <Text style={styles.title}>{recipe.name}</Text>
            <View style={styles.headerActions}>
              {isFavorite && (
                <TouchableOpacity style={styles.favoriteButton} onPress={toggleFavorite}>
                  <Text style={styles.favoriteIcon}>{'\u2764\uFE0F'}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <Text style={styles.description}>{recipe.description}</Text>

          {/* Health Score */}
          {healthScore !== undefined && healthScore !== null && (
            <View style={styles.healthScoreCard}>
              <Text style={styles.healthScoreTitle}>Health Score</Text>
              <View style={styles.healthScoreRow}>
                <Text style={[styles.healthScoreValue, { color: healthColor }]}>{healthScore}/10</Text>
                <View style={styles.healthBarBg}>
                  <View style={[styles.healthBarFill, { width: `${healthScore * 10}%`, backgroundColor: healthColor }]} />
                </View>
              </View>
            </View>
          )}

          {/* Action buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.eatButton, isEating && styles.eatButtonDisabled]}
              onPress={handleEatRecipe}
              disabled={isEating}
            >
              <Text style={styles.eatButtonText}>
                {isEating ? 'Logging...' : '\uD83C\uDF7D\uFE0F Eat this recipe'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareButton} onPress={() => setShareModalVisible(true)}>
              <Text style={styles.shareButtonText}>{'\uD83D\uDCE4'}</Text>
            </TouchableOpacity>
          </View>

          {/* Share Modal */}
          <Modal visible={shareModalVisible} transparent animationType="slide">
            <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Share to Community</Text>
                <Text style={styles.modalSubtitle}>Write your recommendation for "{recipe.name}"</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Why do you recommend this recipe?"
                  placeholderTextColor={colors.text.light}
                  multiline
                  maxLength={200}
                  value={shareCaption}
                  onChangeText={setShareCaption}
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.modalCancel}
                    onPress={() => { setShareModalVisible(false); setShareCaption(''); }}
                  >
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalShare, !shareCaption.trim() && { opacity: 0.4 }]}
                    onPress={handleShareToCommunity}
                    disabled={!shareCaption.trim()}
                  >
                    <Text style={styles.modalShareText}>Share</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </Modal>

          {recipe.ingredientsUsed !== undefined && totalIngredients > 0 && (
            <View style={styles.ingredientsUsedCard}>
              <Text style={styles.ingredientsUsedText}>
                Uses {recipe.ingredientsUsed} of {totalIngredients} scanned ingredients
              </Text>
            </View>
          )}

          {recipe.tags && recipe.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {recipe.tags.map((tag, index) => (
                <View key={index} style={styles.tagBadge}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {recipe.whyItFits && (
            <View style={styles.fitCard}>
              <Text style={styles.fitTitle}>Why this fits your goal</Text>
              <Text style={styles.fitText}>{recipe.whyItFits}</Text>
            </View>
          )}

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Prep</Text>
              <Text style={styles.metaValue}>{recipe.prepTime} min</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Cook</Text>
              <Text style={styles.metaValue}>{recipe.cookTime} min</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Servings</Text>
              <Text style={styles.metaValue}>{recipe.servings}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Macros (per serving)</Text>
            <View style={styles.macrosGrid}>
              <View style={styles.macroCard}>
                <Text style={styles.macroValue}>{recipe.macros?.calories ?? 0}</Text>
                <Text style={styles.macroLabel}>Calories</Text>
              </View>
              <View style={styles.macroCard}>
                <Text style={styles.macroValue}>{recipe.macros?.protein ?? 0}g</Text>
                <Text style={styles.macroLabel}>Protein</Text>
              </View>
              <View style={styles.macroCard}>
                <Text style={styles.macroValue}>{recipe.macros?.carbs ?? 0}g</Text>
                <Text style={styles.macroLabel}>Carbs</Text>
              </View>
              <View style={styles.macroCard}>
                <Text style={styles.macroValue}>{recipe.macros?.fat ?? 0}g</Text>
                <Text style={styles.macroLabel}>Fat</Text>
              </View>
            </View>
          </View>

          {recipe.micros && Object.keys(recipe.micros).length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Key Micronutrients</Text>
              <View style={styles.microsContainer}>
                {Object.entries(recipe.micros).map(([key, value]) => (
                  <View key={key} style={styles.microItem}>
                    <Text style={styles.microLabel}>
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </Text>
                    <Text style={styles.microValue}>{value}mg</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            {recipe.ingredients.map((ingredient, index) => (
              <View key={index} style={styles.ingredientItem}>
                <Text style={styles.ingredientBullet}>{'\u2022'}</Text>
                <Text style={styles.ingredientText}>
                  {ingredient.quantity} {ingredient.unit} {ingredient.name}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            {recipe.steps.map((step, index) => (
              <View key={index} style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
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
  },
  toast: {
    position: 'absolute',
    top: 50,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.success,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borders.radius.lg,
    zIndex: 100,
    alignItems: 'center',
    ...shadows.lg,
  },
  toastText: {
    color: colors.white,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  heroImage: {
    width: '100%',
    height: 260,
    backgroundColor: colors.gray[200],
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing['2xl'],
  },
  innerContent: {
    padding: spacing.lg,
  },
  timingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.base,
    borderRadius: borders.radius.lg,
    marginBottom: spacing.lg,
  },
  timingEmoji: {
    fontSize: typography.sizes['2xl'],
    marginRight: spacing.md,
  },
  timingLabel: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.heavy,
    flex: 1,
  },
  matchScoreBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borders.radius.md,
  },
  matchScoreText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  title: {
    flex: 1,
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.heavy,
    color: colors.text.primary,
    lineHeight: typography.sizes['3xl'] * typography.lineHeights.tight,
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  favoriteButton: {
    padding: spacing.sm,
  },
  favoriteIcon: {
    fontSize: typography.sizes['2xl'],
  },
  description: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
    lineHeight: typography.sizes.md * typography.lineHeights.relaxed,
  },
  // Health Score
  healthScoreCard: {
    padding: spacing.base,
    borderRadius: borders.radius.lg,
    backgroundColor: colors.gray[50],
    marginBottom: spacing.lg,
  },
  healthScoreTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  healthScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  healthScoreValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.heavy,
  },
  healthBarBg: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gray[200],
  },
  healthBarFill: {
    height: 8,
    borderRadius: 4,
  },
  // Action row
  actionRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  eatButton: {
    flex: 1,
    backgroundColor: colors.success,
    borderRadius: borders.radius.lg,
    padding: spacing.base,
    alignItems: 'center',
  },
  eatButtonDisabled: {
    opacity: 0.6,
  },
  eatButtonText: {
    color: colors.white,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  shareButton: {
    width: 52,
    height: 52,
    borderRadius: borders.radius.lg,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButtonText: {
    fontSize: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borders.radius['2xl'],
    borderTopRightRadius: borders.radius['2xl'],
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  modalTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.heavy,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  modalSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    marginBottom: spacing.lg,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: borders.radius.lg,
    padding: spacing.base,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalCancel: {
    flex: 1,
    padding: spacing.base,
    borderRadius: borders.radius.lg,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
  },
  modalShare: {
    flex: 1,
    padding: spacing.base,
    borderRadius: borders.radius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  modalShareText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.white,
  },
  ingredientsUsedCard: {
    backgroundColor: colors.accentLight,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderRadius: borders.radius.md,
    marginBottom: spacing.lg,
  },
  ingredientsUsedText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.accent,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  tagBadge: {
    backgroundColor: colors.gray[100],
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: borders.radius.lg,
  },
  tagText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
  },
  fitCard: {
    padding: spacing.lg,
    borderRadius: borders.radius.lg,
    backgroundColor: colors.accentLight,
    marginBottom: spacing.xl,
  },
  fitTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.heavy,
    color: colors.accent,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  fitText: {
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    lineHeight: typography.sizes.base * typography.lineHeights.relaxed,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: spacing.lg,
    borderRadius: borders.radius.lg,
    backgroundColor: colors.gray[50],
    marginBottom: spacing.xl,
  },
  metaItem: {
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.heavy,
    color: colors.text.primary,
  },
  section: {
    marginBottom: spacing['2xl'],
  },
  sectionTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.heavy,
    color: colors.text.primary,
    marginBottom: spacing.lg,
    letterSpacing: -0.3,
  },
  macrosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  macroCard: {
    flex: 1,
    minWidth: '45%',
    padding: spacing.lg,
    borderRadius: borders.radius.lg,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
  },
  macroValue: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.heavy,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  macroLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  microsContainer: {
    gap: spacing.md,
  },
  microItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.base,
    borderRadius: borders.radius.md,
    backgroundColor: colors.gray[50],
  },
  microLabel: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
    textTransform: 'capitalize',
  },
  microValue: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.accent,
  },
  ingredientItem: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  ingredientBullet: {
    fontSize: typography.sizes.md,
    color: colors.accent,
    marginRight: spacing.md,
    fontWeight: typography.weights.heavy,
  },
  ingredientText: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    lineHeight: typography.sizes.md * typography.lineHeights.normal,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.base,
  },
  stepNumberText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.heavy,
    color: colors.white,
  },
  stepText: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    lineHeight: typography.sizes.md * typography.lineHeights.relaxed,
  },
});
