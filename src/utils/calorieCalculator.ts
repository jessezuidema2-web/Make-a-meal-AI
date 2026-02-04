import { ActivityLevel } from '../types';

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extremely_active: 1.9,
};

export function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function calculateBMR(
  gender: 'male' | 'female' | 'other',
  weightKg: number,
  heightCm: number,
  age: number
): number {
  if (gender === 'male' || gender === 'other') {
    return 88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * age;
  }
  return 447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.330 * age;
}

export function calculateDailyCalorieGoal(
  gender: 'male' | 'female' | 'other',
  weightKg: number,
  heightCm: number,
  birthDate: string,
  activityLevel: ActivityLevel,
  fitnessGoal: 'gym' | 'lose_weight' | 'gain_weight' | 'maintain_weight',
  targetWeight?: number,
  targetWeeks?: number
): number {
  const age = calculateAge(birthDate);
  const bmr = calculateBMR(gender, weightKg, heightCm, age);
  const tdee = bmr * ACTIVITY_MULTIPLIERS[activityLevel];

  // For gym/muscle building: ensure at least 'moderately_active' multiplier
  // since gym-goers train regularly, then add a surplus
  let effectiveTdee = tdee;
  if (fitnessGoal === 'gym' && ACTIVITY_MULTIPLIERS[activityLevel] < 1.55) {
    effectiveTdee = bmr * 1.55;
  }

  let adjustment = 0;
  if (fitnessGoal === 'gym') {
    // Muscle building surplus of 300-500 based on body weight
    adjustment = weightKg >= 75 ? 400 : 300;
  } else if (fitnessGoal === 'maintain_weight') {
    // For maintain + gym-goers, still use effective TDEE but no surplus
    adjustment = 0;
  } else if (targetWeight && targetWeeks && targetWeeks > 0) {
    // 7700 kcal per kg of body weight
    const dailyChange = ((targetWeight - weightKg) * 7700) / (targetWeeks * 7);
    if (fitnessGoal === 'lose_weight') {
      adjustment = -Math.abs(dailyChange);
    } else if (fitnessGoal === 'gain_weight') {
      adjustment = Math.abs(dailyChange);
    }
  }

  // Clamp to reasonable minimum
  return Math.max(1200, Math.round(effectiveTdee + adjustment));
}

export const ACTIVITY_LEVEL_LABELS: Record<ActivityLevel, string> = {
  sedentary: 'Sedentary',
  lightly_active: 'Lightly Active',
  moderately_active: 'Moderately Active',
  very_active: 'Very Active',
  extremely_active: 'Extremely Active',
};
