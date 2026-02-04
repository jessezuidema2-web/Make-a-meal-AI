import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { Scan, MealConsumed } from '../../types';
import { supabase } from '../../config/supabase';
import { colors, typography, spacing, borders, shadows } from '../../constants/designSystem';

export const HomeScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [recentScans, setRecentScans] = useState<Scan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [todayMeals, setTodayMeals] = useState<MealConsumed[]>([]);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    loadRecentScans();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTodayMeals();
      loadStreak();
    }, [])
  );

  const loadRecentScans = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('scans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      setRecentScans(data || []);
    } catch (error) {
      console.error('Error loading scans:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTodayMeals = async () => {
    if (!user) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    try {
      const { data, error } = await supabase
        .from('meals_consumed')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', today.toISOString())
        .order('created_at', { ascending: false });
      if (error) throw error;
      setTodayMeals(data || []);
    } catch (error) {
      console.error('Error loading today meals:', error);
    }
  };

  const loadStreak = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('users')
        .select('current_streak')
        .eq('id', user.id)
        .single();
      if (!error && data) {
        setStreak(data.current_streak || 0);
      }
    } catch (error) {
      console.error('Error loading streak:', error);
    }
  };

  const handleDeleteMeal = async (mealId: string) => {
    Alert.alert('Remove Meal', 'Remove this meal from today?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            const { error } = await supabase
              .from('meals_consumed')
              .delete()
              .eq('id', mealId);
            if (error) throw error;
            setTodayMeals(prev => prev.filter(m => m.id !== mealId));
          } catch (error) {
            console.error('Error deleting meal:', error);
          }
        },
      },
    ]);
  };

  const handleScanPress = () => navigation.navigate('Camera');
  const handleScanItemPress = (scan: Scan) => navigation.navigate('IngredientEdit', { scanId: scan.id });

  const totalCalories = todayMeals.reduce((sum, m) => sum + m.calories, 0);
  const totalProtein = todayMeals.reduce((sum, m) => sum + m.protein, 0);
  const totalCarbs = todayMeals.reduce((sum, m) => sum + m.carbs, 0);
  const totalFat = todayMeals.reduce((sum, m) => sum + m.fat, 0);
  const goal = user?.daily_calorie_goal || 2000;
  const progress = Math.min(totalCalories / goal, 1);

  const renderHeader = () => (
    <>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>
              Hey {user?.name || 'there'}! {'\uD83D\uDC4B'}
            </Text>
            <Text style={styles.subtitle}>
              Ready to find your perfect meal?
            </Text>
          </View>
          {streak > 0 && (
            <View style={styles.streakBadge}>
              <Text style={styles.streakText}>{'\uD83D\uDD25'} {streak}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Calorie tracker card */}
      <View style={styles.calorieCard}>
        <View style={styles.calorieHeader}>
          <Text style={styles.calorieTitle}>Today's Calories</Text>
          <Text style={styles.calorieCount}>
            {totalCalories} <Text style={styles.calorieGoal}>/ {goal}</Text>
          </Text>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[
            styles.progressBarFill,
            { width: `${progress * 100}%` },
            progress >= 1 && styles.progressBarOver,
          ]} />
        </View>
        <View style={styles.macroRow}>
          <Text style={styles.macroText}>P: {totalProtein}g</Text>
          <Text style={styles.macroText}>C: {totalCarbs}g</Text>
          <Text style={styles.macroText}>F: {totalFat}g</Text>
        </View>

        {todayMeals.length > 0 && (
          <View style={styles.todayMealsList}>
            <Text style={styles.todayMealsTitle}>Today's Meals</Text>
            {todayMeals.map(meal => (
              <View key={meal.id} style={styles.todayMealItem}>
                <View style={styles.todayMealInfo}>
                  <Text style={styles.todayMealName}>{meal.recipe_name}</Text>
                  <Text style={styles.todayMealCal}>{meal.calories} kcal</Text>
                </View>
                <TouchableOpacity onPress={() => handleDeleteMeal(meal.id)}>
                  <Text style={styles.todayMealDelete}>x</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.scanButton} onPress={handleScanPress}>
        <View style={styles.scanButtonIcon}>
          <Text style={styles.scanButtonIconText}>{'\uD83D\uDCF8'}</Text>
        </View>
        <Text style={styles.scanButtonText}>Scan Ingredients</Text>
        <Text style={styles.scanButtonSubtext}>Take a photo of your fridge</Text>
      </TouchableOpacity>

      {/* Horizontal Recent Scans */}
      {recentScans.length > 0 && (
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recent Scans</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={recentScans}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.horizontalScansContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.horizontalScanCard}
                onPress={() => handleScanItemPress(item)}
              >
                {item.image_url ? (
                  <Image source={{ uri: item.image_url }} style={styles.horizontalScanImage} />
                ) : (
                  <View style={[styles.horizontalScanImage, { backgroundColor: colors.gray[200], alignItems: 'center', justifyContent: 'center' }]}>
                    <Text style={{ fontSize: 24 }}>{'\uD83D\uDCF7'}</Text>
                  </View>
                )}
                <Text style={styles.horizontalScanDate}>
                  {new Date(item.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </>
  );

  return (
    <FlatList
      style={styles.container}
      data={[]}
      renderItem={null}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={
        !isLoading && recentScans.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>{'\uD83D\uDD0D'}</Text>
            <Text style={styles.emptyText}>No scans yet</Text>
            <Text style={styles.emptySubtext}>
              Tap the button above to start scanning
            </Text>
          </View>
        ) : null
      }
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  listContent: {
    paddingBottom: spacing.lg,
  },
  header: {
    padding: spacing.lg,
    paddingTop: spacing['3xl'] + spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.heavy,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    lineHeight: typography.sizes.md * typography.lineHeights.normal,
  },
  streakBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: borders.radius.lg,
  },
  streakText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.heavy,
    color: '#E65100',
  },
  calorieCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.base,
    padding: spacing.lg,
    borderRadius: borders.radius.xl,
    backgroundColor: colors.white,
    ...shadows.md,
  },
  calorieHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  calorieTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  calorieCount: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.heavy,
    color: colors.text.primary,
  },
  calorieGoal: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.normal,
    color: colors.text.light,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.gray[200],
    marginBottom: spacing.md,
  },
  progressBarFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  progressBarOver: {
    backgroundColor: colors.warning,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  macroText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    fontWeight: typography.weights.semibold,
  },
  todayMealsList: {
    marginTop: spacing.base,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    paddingTop: spacing.md,
  },
  todayMealsTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text.light,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  todayMealItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  todayMealInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  todayMealName: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    flex: 1,
  },
  todayMealCal: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    marginLeft: spacing.sm,
  },
  todayMealDelete: {
    fontSize: 16,
    color: colors.text.light,
    paddingLeft: spacing.md,
  },
  scanButton: {
    margin: spacing.lg,
    marginTop: spacing.base,
    padding: spacing.xl,
    borderRadius: borders.radius.xl,
    backgroundColor: colors.primary,
    alignItems: 'center',
    ...shadows.lg,
  },
  scanButtonIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  scanButtonIconText: {
    fontSize: typography.sizes['3xl'],
  },
  scanButtonText: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.heavy,
    color: colors.white,
    marginBottom: spacing.xs,
    letterSpacing: -0.3,
  },
  scanButtonSubtext: {
    fontSize: typography.sizes.base,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  // Horizontal recent scans
  recentSection: {
    paddingTop: spacing.base,
  },
  sectionTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.heavy,
    color: colors.text.primary,
    marginBottom: spacing.base,
    paddingHorizontal: spacing.lg,
    letterSpacing: -0.3,
  },
  horizontalScansContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  horizontalScanCard: {
    width: 120,
    borderRadius: borders.radius.lg,
    backgroundColor: colors.white,
    ...shadows.md,
    overflow: 'hidden',
  },
  horizontalScanImage: {
    width: 120,
    height: 100,
    backgroundColor: colors.gray[200],
  },
  horizontalScanDate: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text.tertiary,
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyEmoji: {
    fontSize: typography.sizes['4xl'],
    marginBottom: spacing.lg,
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
    textAlign: 'center',
  },
});
