import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { ActivityLevel } from '../../types';
import { calculateDailyCalorieGoal, ACTIVITY_LEVEL_LABELS } from '../../utils/calorieCalculator';

const CUISINE_OPTIONS = [
  'Italian', 'Asian', 'Mexican', 'Mediterranean', 'American',
  'Indian', 'Middle Eastern', 'French', 'Japanese', 'Thai',
];

const TASTE_OPTIONS = ['sweet', 'spicy', 'salty', 'sour', 'umami'] as const;

const ACTIVITY_LEVELS: { value: ActivityLevel; label: string }[] = [
  { value: 'sedentary', label: 'Sedentary' },
  { value: 'lightly_active', label: 'Lightly Active' },
  { value: 'moderately_active', label: 'Moderately Active' },
  { value: 'very_active', label: 'Very Active' },
  { value: 'extremely_active', label: 'Extremely Active' },
];

export const ProfileScreen = () => {
  const { user, signOut, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Editable fields
  const [name, setName] = useState(user?.name || '');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>(user?.gender || 'male');
  const [height, setHeight] = useState(user?.height.toString() || '');
  const [weight, setWeight] = useState(user?.weight.toString() || '');
  const [fitnessGoal, setFitnessGoal] = useState<'gym' | 'lose_weight' | 'gain_weight' | 'maintain_weight'>(
    user?.fitness_goal || 'gym'
  );
  const [cuisinePreferences, setCuisinePreferences] = useState<string[]>(
    user?.cuisine_preferences || []
  );
  const [tastePreferences, setTastePreferences] = useState<typeof TASTE_OPTIONS[number][]>(
    user?.taste_preferences || []
  );
  const [birthDate, setBirthDate] = useState(user?.birth_date || '');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(
    user?.activity_level || 'moderately_active'
  );
  const [targetWeight, setTargetWeight] = useState(user?.target_weight?.toString() || '');
  const [targetWeeks, setTargetWeeks] = useState(user?.target_weeks?.toString() || '');

  const handleSave = async () => {
    if (!height || !weight) {
      Alert.alert('Error', 'Please fill in height and weight');
      return;
    }

    setIsSaving(true);
    try {
      const weightNum = parseFloat(weight);
      const heightNum = parseFloat(height);
      const targetWeightNum = targetWeight ? parseFloat(targetWeight) : undefined;
      const targetWeeksNum = targetWeeks ? parseInt(targetWeeks, 10) : undefined;

      let dailyCalorieGoal: number | undefined;
      if (birthDate && activityLevel) {
        dailyCalorieGoal = calculateDailyCalorieGoal(
          gender,
          weightNum,
          heightNum,
          birthDate,
          activityLevel,
          fitnessGoal,
          targetWeightNum,
          targetWeeksNum
        );
      }

      await updateProfile({
        name,
        gender,
        height: heightNum,
        weight: weightNum,
        fitness_goal: fitnessGoal,
        cuisine_preferences: cuisinePreferences,
        taste_preferences: tastePreferences,
        birth_date: birthDate || undefined,
        activity_level: activityLevel,
        target_weight: targetWeightNum,
        target_weeks: targetWeeksNum,
        daily_calorie_goal: dailyCalorieGoal,
      });
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setName(user?.name || '');
    setGender(user?.gender || 'male');
    setHeight(user?.height.toString() || '');
    setWeight(user?.weight.toString() || '');
    setFitnessGoal(user?.fitness_goal || 'gym');
    setCuisinePreferences(user?.cuisine_preferences || []);
    setTastePreferences(user?.taste_preferences || []);
    setBirthDate(user?.birth_date || '');
    setActivityLevel(user?.activity_level || 'moderately_active');
    setTargetWeight(user?.target_weight?.toString() || '');
    setTargetWeeks(user?.target_weeks?.toString() || '');
    setIsEditing(false);
  };

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to sign out');
          }
        },
      },
    ]);
  };

  const toggleCuisine = (cuisine: string) => {
    setCuisinePreferences(prev =>
      prev.includes(cuisine) ? prev.filter(c => c !== cuisine) : [...prev, cuisine]
    );
  };

  const toggleTaste = (taste: typeof TASTE_OPTIONS[number]) => {
    setTastePreferences(prev =>
      prev.includes(taste) ? prev.filter(t => t !== taste) : [...prev, taste]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        {!isEditing ? (
          <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.editActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, isSaving && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={isSaving}
            >
              <Text style={styles.saveButtonText}>
                {isSaving ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Info</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={[styles.input, !isEditing && styles.inputDisabled]}
            value={name}
            onChangeText={setName}
            editable={isEditing}
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.valueText}>{user?.email}</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Gender</Text>
          {isEditing ? (
            <View style={styles.optionRow}>
              {(['male', 'female', 'other'] as const).map(g => (
                <TouchableOpacity
                  key={g}
                  style={[styles.optionButton, gender === g && styles.optionButtonSelected]}
                  onPress={() => setGender(g)}
                >
                  <Text
                    style={[styles.optionText, gender === g && styles.optionTextSelected]}
                  >
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={styles.valueText}>
              {gender.charAt(0).toUpperCase() + gender.slice(1)}
            </Text>
          )}
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Height (cm)</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={height}
              onChangeText={setHeight}
              keyboardType="numeric"
              editable={isEditing}
              placeholderTextColor="#999"
            />
          </View>

          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Weight (kg)</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
              editable={isEditing}
              placeholderTextColor="#999"
            />
          </View>
        </View>
      </View>

      {/* Health Details Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Health Details</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Birth Date (YYYY-MM-DD)</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={birthDate}
              onChangeText={setBirthDate}
              placeholder="e.g., 1995-06-15"
              placeholderTextColor="#999"
            />
          ) : (
            <Text style={styles.valueText}>{birthDate || 'Not set'}</Text>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Activity Level</Text>
          {isEditing ? (
            <View style={styles.activityContainer}>
              {ACTIVITY_LEVELS.map(level => (
                <TouchableOpacity
                  key={level.value}
                  style={[
                    styles.activityOption,
                    activityLevel === level.value && styles.activityOptionSelected,
                  ]}
                  onPress={() => setActivityLevel(level.value)}
                >
                  <Text style={[
                    styles.activityOptionText,
                    activityLevel === level.value && styles.activityOptionTextSelected,
                  ]}>
                    {level.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={styles.valueText}>
              {ACTIVITY_LEVEL_LABELS[activityLevel] || 'Not set'}
            </Text>
          )}
        </View>

        {(fitnessGoal === 'lose_weight' || fitnessGoal === 'gain_weight') && (
          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Target Weight (kg)</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={targetWeight}
                  onChangeText={setTargetWeight}
                  keyboardType="numeric"
                  placeholder="e.g., 65"
                  placeholderTextColor="#999"
                />
              ) : (
                <Text style={styles.valueText}>{targetWeight || 'Not set'}</Text>
              )}
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Target Weeks</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={targetWeeks}
                  onChangeText={setTargetWeeks}
                  keyboardType="numeric"
                  placeholder="e.g., 12"
                  placeholderTextColor="#999"
                />
              ) : (
                <Text style={styles.valueText}>{targetWeeks || 'Not set'}</Text>
              )}
            </View>
          </View>
        )}

        {user?.daily_calorie_goal && (
          <View style={styles.calorieGoalCard}>
            <Text style={styles.calorieGoalLabel}>Daily Calorie Goal</Text>
            <Text style={styles.calorieGoalValue}>{user.daily_calorie_goal} kcal</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fitness Goal</Text>
        {isEditing ? (
          <View style={styles.goalContainer}>
            {[
              { value: 'gym', label: 'Build Muscle', emoji: '\uD83D\uDCAA' },
              { value: 'lose_weight', label: 'Lose Weight', emoji: '\uD83D\uDD25' },
              { value: 'gain_weight', label: 'Gain Weight', emoji: '\uD83D\uDCC8' },
              { value: 'maintain_weight', label: 'Maintain Weight', emoji: '\u2696\uFE0F' },
            ].map(goal => (
              <TouchableOpacity
                key={goal.value}
                style={[
                  styles.goalCard,
                  fitnessGoal === goal.value && styles.goalCardSelected,
                ]}
                onPress={() => setFitnessGoal(goal.value as any)}
              >
                <Text style={styles.goalEmoji}>{goal.emoji}</Text>
                <Text
                  style={[
                    styles.goalLabel,
                    fitnessGoal === goal.value && styles.goalLabelSelected,
                  ]}
                >
                  {goal.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Text style={styles.valueText}>
            {fitnessGoal === 'gym' && '\uD83D\uDCAA Build Muscle'}
            {fitnessGoal === 'lose_weight' && '\uD83D\uDD25 Lose Weight'}
            {fitnessGoal === 'gain_weight' && '\uD83D\uDCC8 Gain Weight'}
            {fitnessGoal === 'maintain_weight' && '\u2696\uFE0F Maintain Weight'}
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cuisine Preferences</Text>
        {isEditing ? (
          <View style={styles.chipsContainer}>
            {CUISINE_OPTIONS.map(cuisine => (
              <TouchableOpacity
                key={cuisine}
                style={[
                  styles.chip,
                  cuisinePreferences.includes(cuisine) && styles.chipSelected,
                ]}
                onPress={() => toggleCuisine(cuisine)}
              >
                <Text
                  style={[
                    styles.chipText,
                    cuisinePreferences.includes(cuisine) && styles.chipTextSelected,
                  ]}
                >
                  {cuisine}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.chipsContainer}>
            {cuisinePreferences.map(cuisine => (
              <View key={cuisine} style={[styles.chip, styles.chipSelected]}>
                <Text style={[styles.chipText, styles.chipTextSelected]}>{cuisine}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Taste Preferences</Text>
        {isEditing ? (
          <View style={styles.chipsContainer}>
            {TASTE_OPTIONS.map(taste => (
              <TouchableOpacity
                key={taste}
                style={[
                  styles.chip,
                  tastePreferences.includes(taste) && styles.chipSelected,
                ]}
                onPress={() => toggleTaste(taste)}
              >
                <Text
                  style={[
                    styles.chipText,
                    tastePreferences.includes(taste) && styles.chipTextSelected,
                  ]}
                >
                  {taste.charAt(0).toUpperCase() + taste.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.chipsContainer}>
            {tastePreferences.map(taste => (
              <View key={taste} style={[styles.chip, styles.chipSelected]}>
                <Text style={[styles.chipText, styles.chipTextSelected]}>
                  {taste.charAt(0).toUpperCase() + taste.slice(1)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutButtonText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 24,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  editButton: {
    padding: 8,
  },
  editButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#007AFF',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  field: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  inputDisabled: {
    backgroundColor: '#fafafa',
    color: '#999',
  },
  valueText: {
    fontSize: 16,
    color: '#1a1a1a',
    paddingVertical: 8,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  optionButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  optionTextSelected: {
    color: '#fff',
  },
  activityContainer: {
    gap: 8,
  },
  activityOption: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  activityOptionSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  activityOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activityOptionTextSelected: {
    color: '#fff',
  },
  calorieGoalCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  calorieGoalLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  calorieGoalValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
  },
  goalContainer: {
    gap: 12,
  },
  goalCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  goalCardSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  goalEmoji: {
    fontSize: 24,
  },
  goalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  goalLabelSelected: {
    color: '#fff',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  chipSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  chipTextSelected: {
    color: '#fff',
  },
  signOutButton: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#ff3b30',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 40,
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
