import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../config/supabase';
import { MealConsumed, WaterIntake } from '../../types';
import { colors, typography, spacing, borders, shadows } from '../../constants/designSystem';

export const TrackerScreen = () => {
  const { user } = useAuth();
  const [meals, setMeals] = useState<MealConsumed[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekData, setWeekData] = useState<{ date: string; calories: number }[]>([]);
  const [waterGlasses, setWaterGlasses] = useState(0);

  useFocusEffect(
    useCallback(() => {
      loadMeals();
      loadWeekData();
      loadWater();
    }, [selectedDate])
  );

  const getStartOfDay = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  };

  const getEndOfDay = (date: Date) => {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d.toISOString();
  };

  const loadMeals = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('meals_consumed')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', getStartOfDay(selectedDate))
        .lte('created_at', getEndOfDay(selectedDate))
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMeals(data || []);
    } catch (error) {
      console.error('Error loading meals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadWeekData = async () => {
    if (!user) return;
    const weekStart = new Date(selectedDate);
    weekStart.setDate(weekStart.getDate() - 6);

    try {
      const { data, error } = await supabase
        .from('meals_consumed')
        .select('calories, created_at')
        .eq('user_id', user.id)
        .gte('created_at', getStartOfDay(weekStart))
        .lte('created_at', getEndOfDay(selectedDate));

      if (error) throw error;

      const dayMap: Record<string, number> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() - i);
        dayMap[d.toISOString().split('T')[0]] = 0;
      }

      (data || []).forEach((m: any) => {
        const day = new Date(m.created_at).toISOString().split('T')[0];
        if (dayMap[day] !== undefined) {
          dayMap[day] += m.calories;
        }
      });

      setWeekData(Object.entries(dayMap).map(([date, calories]) => ({ date, calories })));
    } catch (error) {
      console.error('Error loading week data:', error);
    }
  };

  const WATER_GOAL = 8;

  const loadWater = async () => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    try {
      const { data, error } = await supabase
        .from('water_intake')
        .select('glasses')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();
      if (!error && data) {
        setWaterGlasses(data.glasses);
      } else {
        setWaterGlasses(0);
      }
    } catch (error) {
      console.error('Error loading water:', error);
    }
  };

  const updateWater = async (delta: number) => {
    if (!user) return;
    const newGlasses = Math.max(0, waterGlasses + delta);
    setWaterGlasses(newGlasses);
    const today = new Date().toISOString().split('T')[0];
    try {
      const { data: existing } = await supabase
        .from('water_intake')
        .select('id')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();
      if (existing) {
        await supabase.from('water_intake').update({ glasses: newGlasses }).eq('id', existing.id);
      } else {
        await supabase.from('water_intake').insert({ user_id: user.id, glasses: newGlasses, date: today });
      }
    } catch (error) {
      console.error('Error updating water:', error);
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
            setMeals(prev => prev.filter(m => m.id !== mealId));
            loadWeekData();
          } catch (error) {
            console.error('Error deleting meal:', error);
            Alert.alert('Error', 'Failed to remove meal');
          }
        },
      },
    ]);
  };

  const navigateDay = (offset: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + offset);
    if (newDate <= new Date()) {
      setSelectedDate(newDate);
      setIsLoading(true);
    }
  };

  const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);
  const totalProtein = meals.reduce((sum, m) => sum + m.protein, 0);
  const totalCarbs = meals.reduce((sum, m) => sum + m.carbs, 0);
  const totalFat = meals.reduce((sum, m) => sum + m.fat, 0);
  const goal = user?.daily_calorie_goal || 2000;
  const progress = Math.min(totalCalories / goal, 1);
  const isToday = selectedDate.toDateString() === new Date().toDateString();

  const maxWeekCalories = Math.max(...weekData.map(d => d.calories), goal);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Calorie Tracker</Text>

      {/* Date navigation */}
      <View style={styles.dateNav}>
        <TouchableOpacity onPress={() => navigateDay(-1)} style={styles.dateNavButton}>
          <Text style={styles.dateNavText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.dateLabel}>
          {isToday ? 'Today' : selectedDate.toLocaleDateString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric',
          })}
        </Text>
        <TouchableOpacity
          onPress={() => navigateDay(1)}
          style={[styles.dateNavButton, isToday && styles.dateNavDisabled]}
          disabled={isToday}
        >
          <Text style={[styles.dateNavText, isToday && { color: colors.gray[300] }]}>{'>'}</Text>
        </TouchableOpacity>
      </View>

      {/* Calorie progress */}
      <View style={styles.progressCard}>
        <Text style={styles.progressTitle}>Daily Calories</Text>
        <Text style={styles.calorieText}>
          {totalCalories} <Text style={styles.calorieGoal}>/ {goal} kcal</Text>
        </Text>
        <View style={styles.progressBarBg}>
          <View style={[
            styles.progressBarFill,
            { width: `${progress * 100}%` },
            progress >= 1 && styles.progressBarOver,
          ]} />
        </View>
        <Text style={styles.remainingText}>
          {totalCalories >= goal
            ? `${totalCalories - goal} kcal over goal`
            : `${goal - totalCalories} kcal remaining`}
        </Text>

        <View style={styles.macroRow}>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{totalProtein}g</Text>
            <Text style={styles.macroLabel}>Protein</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{totalCarbs}g</Text>
            <Text style={styles.macroLabel}>Carbs</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{totalFat}g</Text>
            <Text style={styles.macroLabel}>Fat</Text>
          </View>
        </View>
      </View>

      {/* Week chart */}
      <View style={styles.weekCard}>
        <Text style={styles.sectionTitle}>This Week</Text>
        <View style={styles.chartContainer}>
          {weekData.map((day, index) => {
            const height = maxWeekCalories > 0 ? (day.calories / maxWeekCalories) * 100 : 0;
            const dayLabel = new Date(day.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'narrow' });
            const isSelected = day.date === selectedDate.toISOString().split('T')[0];
            return (
              <View key={index} style={styles.chartBar}>
                <Text style={styles.chartValue}>{day.calories > 0 ? day.calories : ''}</Text>
                <View style={styles.chartBarBg}>
                  <View style={[
                    styles.chartBarFill,
                    { height: `${Math.max(height, 2)}%` },
                    isSelected && styles.chartBarSelected,
                  ]} />
                </View>
                <Text style={[styles.chartLabel, isSelected && styles.chartLabelSelected]}>
                  {dayLabel}
                </Text>
              </View>
            );
          })}
        </View>
        {/* Goal line indicator */}
        <View style={styles.goalLineContainer}>
          <View style={styles.goalLine} />
          <Text style={styles.goalLineLabel}>Goal: {goal}</Text>
        </View>
      </View>

      {/* Water Tracker */}
      <View style={styles.waterCard}>
        <View style={styles.waterHeader}>
          <Text style={styles.waterTitle}>{'\uD83D\uDCA7'} Water</Text>
          <Text style={styles.waterCount}>{waterGlasses}/{WATER_GOAL}</Text>
        </View>
        <View style={styles.waterGlasses}>
          {Array.from({ length: WATER_GOAL }).map((_, i) => (
            <Text key={i} style={styles.waterGlass}>
              {i < waterGlasses ? '\uD83E\uDD64' : '\u25CB'}
            </Text>
          ))}
        </View>
        <View style={styles.waterButtons}>
          <TouchableOpacity style={styles.waterBtn} onPress={() => updateWater(-1)}>
            <Text style={styles.waterBtnText}>-</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.waterBtn, styles.waterBtnAdd]} onPress={() => updateWater(1)}>
            <Text style={[styles.waterBtnText, styles.waterBtnAddText]}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Meals list */}
      <View style={styles.mealsSection}>
        <Text style={styles.sectionTitle}>Meals Eaten</Text>
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : meals.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No meals logged for this day</Text>
          </View>
        ) : (
          meals.map(meal => (
            <View key={meal.id} style={styles.mealCard}>
              <View style={styles.mealInfo}>
                <Text style={styles.mealName}>{meal.recipe_name}</Text>
                <Text style={styles.mealMacros}>
                  {meal.calories} kcal | P: {meal.protein}g | C: {meal.carbs}g | F: {meal.fat}g
                </Text>
                <Text style={styles.mealTime}>
                  {new Date(meal.created_at).toLocaleTimeString('en-US', {
                    hour: '2-digit', minute: '2-digit',
                  })}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.deleteMealButton}
                onPress={() => handleDeleteMeal(meal.id)}
              >
                <Text style={styles.deleteMealText}>x</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    padding: spacing.lg,
    paddingTop: spacing['3xl'] + spacing.md,
    paddingBottom: spacing['3xl'],
  },
  title: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.heavy,
    color: colors.text.primary,
    marginBottom: spacing.lg,
    letterSpacing: -0.5,
  },
  dateNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    gap: spacing.lg,
  },
  dateNavButton: {
    padding: spacing.md,
  },
  dateNavDisabled: {
    opacity: 0.3,
  },
  dateNavText: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  dateLabel: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  progressCard: {
    padding: spacing.lg,
    borderRadius: borders.radius.xl,
    backgroundColor: colors.white,
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  progressTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  calorieText: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.heavy,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  calorieGoal: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.normal,
    color: colors.text.light,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gray[200],
    marginBottom: spacing.sm,
  },
  progressBarFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  progressBarOver: {
    backgroundColor: colors.warning,
  },
  remainingText: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    marginBottom: spacing.lg,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.heavy,
    color: colors.primary,
  },
  macroLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  weekCard: {
    padding: spacing.lg,
    borderRadius: borders.radius.xl,
    backgroundColor: colors.gray[50],
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.heavy,
    color: colors.text.primary,
    marginBottom: spacing.lg,
    letterSpacing: -0.3,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
  },
  chartValue: {
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },
  chartBarBg: {
    width: 24,
    height: 80,
    borderRadius: borders.radius.sm,
    backgroundColor: colors.gray[200],
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  chartBarFill: {
    width: '100%',
    borderRadius: borders.radius.sm,
    backgroundColor: colors.primary,
  },
  chartBarSelected: {
    backgroundColor: colors.accent,
  },
  chartLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  chartLabelSelected: {
    fontWeight: typography.weights.bold,
    color: colors.accent,
  },
  goalLineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  goalLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.gray[300],
    marginRight: spacing.sm,
  },
  goalLineLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
  },
  waterCard: {
    padding: spacing.lg,
    borderRadius: borders.radius.xl,
    backgroundColor: colors.white,
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  waterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  waterTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  waterCount: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.heavy,
    color: colors.primary,
  },
  waterGlasses: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  waterGlass: {
    fontSize: 22,
  },
  waterButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
  },
  waterBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  waterBtnAdd: {
    backgroundColor: colors.primary,
  },
  waterBtnText: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.heavy,
    color: colors.text.secondary,
  },
  waterBtnAddText: {
    color: colors.white,
  },
  mealsSection: {
    marginTop: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    fontSize: typography.sizes.base,
    color: colors.text.tertiary,
  },
  mealCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base,
    borderRadius: borders.radius.lg,
    backgroundColor: colors.white,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  mealMacros: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },
  mealTime: {
    fontSize: typography.sizes.xs,
    color: colors.text.light,
  },
  deleteMealButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.md,
  },
  deleteMealText: {
    fontSize: 18,
    color: colors.white,
    lineHeight: 20,
  },
});
