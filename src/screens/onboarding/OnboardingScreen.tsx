import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import { ActivityLevel } from '../../types';
import { calculateDailyCalorieGoal, ACTIVITY_LEVEL_LABELS } from '../../utils/calorieCalculator';

type OnboardingStep = 'basic' | 'fitness' | 'health' | 'cuisine' | 'taste';

const CUISINE_OPTIONS = [
  'Italian',
  'Asian',
  'Mexican',
  'Mediterranean',
  'American',
  'Indian',
  'Middle Eastern',
  'French',
  'Japanese',
  'Thai',
];

const TASTE_OPTIONS = ['sweet', 'spicy', 'salty', 'sour', 'umami'] as const;

const ACTIVITY_LEVELS: { value: ActivityLevel; label: string }[] = [
  { value: 'sedentary', label: 'Sedentary' },
  { value: 'lightly_active', label: 'Lightly Active' },
  { value: 'moderately_active', label: 'Moderately Active' },
  { value: 'very_active', label: 'Very Active' },
  { value: 'extremely_active', label: 'Extremely Active' },
];

export const OnboardingScreen = () => {
  const { session, refreshProfile } = useAuth();
  const [step, setStep] = useState<OnboardingStep>('basic');
  const [isLoading, setIsLoading] = useState(false);

  // Basic info
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  // Fitness goal
  const [fitnessGoal, setFitnessGoal] = useState<'gym' | 'lose_weight' | 'gain_weight' | 'maintain_weight'>('gym');

  // Health details
  const [birthDate, setBirthDate] = useState('');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderately_active');
  const [targetWeight, setTargetWeight] = useState('');
  const [targetWeeks, setTargetWeeks] = useState('');

  // Preferences
  const [cuisinePreferences, setCuisinePreferences] = useState<string[]>([]);
  const [tastePreferences, setTastePreferences] = useState<typeof TASTE_OPTIONS[number][]>([]);

  const toggleCuisine = (cuisine: string) => {
    setCuisinePreferences(prev =>
      prev.includes(cuisine)
        ? prev.filter(c => c !== cuisine)
        : [...prev, cuisine]
    );
  };

  const toggleTaste = (taste: typeof TASTE_OPTIONS[number]) => {
    setTastePreferences(prev =>
      prev.includes(taste)
        ? prev.filter(t => t !== taste)
        : [...prev, taste]
    );
  };

  const handleNext = () => {
    if (step === 'basic') {
      if (!height || !weight) {
        Alert.alert('Error', 'Please fill in your height and weight');
        return;
      }
      setStep('fitness');
    } else if (step === 'fitness') {
      setStep('health');
    } else if (step === 'health') {
      if (!birthDate) {
        Alert.alert('Error', 'Please enter your birth date (YYYY-MM-DD)');
        return;
      }
      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(birthDate) || isNaN(new Date(birthDate).getTime())) {
        Alert.alert('Error', 'Please enter a valid date in YYYY-MM-DD format');
        return;
      }
      if (fitnessGoal === 'lose_weight' || fitnessGoal === 'gain_weight') {
        if (!targetWeight || !targetWeeks) {
          Alert.alert('Error', 'Please fill in your target weight and timeframe');
          return;
        }
      }
      setStep('cuisine');
    } else if (step === 'cuisine') {
      if (cuisinePreferences.length === 0) {
        Alert.alert('Error', 'Please select at least one cuisine preference');
        return;
      }
      setStep('taste');
    }
  };

  const handleBack = () => {
    if (step === 'fitness') setStep('basic');
    else if (step === 'health') setStep('fitness');
    else if (step === 'cuisine') setStep('health');
    else if (step === 'taste') setStep('cuisine');
  };

  const handleComplete = async () => {
    if (tastePreferences.length === 0) {
      Alert.alert('Error', 'Please select at least one taste preference');
      return;
    }

    if (!session?.user) return;

    setIsLoading(true);
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

      const newProfile = await authService.createUserProfile(session.user.id, {
        email: session.user.email!,
        name: session.user.user_metadata?.name || 'User',
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

      console.log('Profile created successfully:', newProfile);
      await refreshProfile();
    } catch (error: any) {
      console.error('Failed to create profile:', error);
      Alert.alert('Error', error.message || 'Failed to save profile');
      setIsLoading(false);
    }
  };

  const renderBasicInfo = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Let's get started</Text>
      <Text style={styles.stepSubtitle}>Tell us about yourself</Text>

      <Text style={styles.label}>Gender</Text>
      <View style={styles.optionRow}>
        {(['male', 'female', 'other'] as const).map(g => (
          <TouchableOpacity
            key={g}
            style={[styles.optionButton, gender === g && styles.optionButtonSelected]}
            onPress={() => setGender(g)}
          >
            <Text style={[styles.optionText, gender === g && styles.optionTextSelected]}>
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Height (cm)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., 175"
        value={height}
        onChangeText={setHeight}
        keyboardType="numeric"
        placeholderTextColor="#999"
      />

      <Text style={styles.label}>Weight (kg)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., 70"
        value={weight}
        onChangeText={setWeight}
        keyboardType="numeric"
        placeholderTextColor="#999"
      />

      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFitnessGoal = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Your fitness goal</Text>
      <Text style={styles.stepSubtitle}>What are you working towards?</Text>

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
            <Text style={[
              styles.goalLabel,
              fitnessGoal === goal.value && styles.goalLabelSelected,
            ]}>
              {goal.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHealthDetails = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Health Details</Text>
      <Text style={styles.stepSubtitle}>Help us calculate your calorie needs</Text>

      <Text style={styles.label}>Birth Date (YYYY-MM-DD)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., 1995-06-15"
        value={birthDate}
        onChangeText={setBirthDate}
        placeholderTextColor="#999"
      />

      <Text style={styles.label}>Activity Level</Text>
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

      {(fitnessGoal === 'lose_weight' || fitnessGoal === 'gain_weight') && (
        <>
          <Text style={styles.label}>Target Weight (kg)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 65"
            value={targetWeight}
            onChangeText={setTargetWeight}
            keyboardType="numeric"
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>In how many weeks?</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 12"
            value={targetWeeks}
            onChangeText={setTargetWeeks}
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
        </>
      )}

      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCuisinePreferences = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Cuisine Preferences</Text>
      <Text style={styles.stepSubtitle}>Select your favorite cuisines</Text>

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
            <Text style={[
              styles.chipText,
              cuisinePreferences.includes(cuisine) && styles.chipTextSelected,
            ]}>
              {cuisine}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );

  const renderTastePreferences = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Taste Preferences</Text>
      <Text style={styles.stepSubtitle}>What flavors do you enjoy?</Text>

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
            <Text style={[
              styles.chipText,
              tastePreferences.includes(taste) && styles.chipTextSelected,
            ]}>
              {taste.charAt(0).toUpperCase() + taste.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleComplete}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Saving...' : 'Complete'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {step === 'basic' && renderBasicInfo()}
      {step === 'fitness' && renderFitnessGoal()}
      {step === 'health' && renderHealthDetails()}
      {step === 'cuisine' && renderCuisinePreferences()}
      {step === 'taste' && renderTastePreferences()}
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
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  optionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
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
  goalContainer: {
    gap: 16,
    marginBottom: 32,
  },
  goalCard: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  goalCardSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  goalEmoji: {
    fontSize: 32,
  },
  goalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  goalLabelSelected: {
    color: '#fff',
  },
  activityContainer: {
    gap: 8,
    marginBottom: 16,
  },
  activityOption: {
    padding: 14,
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
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  activityOptionTextSelected: {
    color: '#fff',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
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
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    marginTop: 12,
    alignItems: 'center',
    padding: 12,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 14,
  },
});
