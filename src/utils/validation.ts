// Input Validation & Sanitization Utilities

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

// Password validation
export const isValidPassword = (password: string): { valid: boolean; error?: string } => {
  if (password.length < 6) {
    return { valid: false, error: 'Password must be at least 6 characters' };
  }
  if (password.length > 128) {
    return { valid: false, error: 'Password is too long' };
  }
  // Add more rules as needed (uppercase, numbers, special chars, etc.)
  return { valid: true };
};

// Name validation (no special characters that could be used for injection)
export const isValidName = (name: string): boolean => {
  const nameRegex = /^[a-zA-Z\s'-]+$/;
  return nameRegex.test(name) && name.trim().length >= 2 && name.trim().length <= 50;
};

// Number validation with range
export const isValidNumber = (
  value: string,
  min: number,
  max: number
): { valid: boolean; error?: string } => {
  const num = parseFloat(value);

  if (isNaN(num)) {
    return { valid: false, error: 'Must be a valid number' };
  }

  if (num < min || num > max) {
    return { valid: false, error: `Must be between ${min} and ${max}` };
  }

  return { valid: true };
};

// Height validation (cm)
export const isValidHeight = (height: string): { valid: boolean; error?: string } => {
  return isValidNumber(height, 100, 250);
};

// Weight validation (kg)
export const isValidWeight = (weight: string): { valid: boolean; error?: string } => {
  return isValidNumber(weight, 20, 300);
};

// Sanitize string (remove potentially dangerous characters)
export const sanitizeString = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
    .replace(/[{}]/g, '') // Remove curly braces
    .slice(0, 500); // Limit length
};

// Sanitize ingredient name
export const sanitizeIngredientName = (name: string): string => {
  return name
    .trim()
    .replace(/[^a-zA-Z0-9\s\-,'()]/g, '') // Only allow alphanumeric and common food chars
    .slice(0, 100);
};

// Validate ingredient quantity
export const isValidQuantity = (quantity: number): boolean => {
  return !isNaN(quantity) && quantity > 0 && quantity <= 10000;
};

// Validate ingredient unit
export const isValidUnit = (unit: string): boolean => {
  const validUnits = ['g', 'kg', 'ml', 'l', 'oz', 'lb', 'cup', 'tbsp', 'tsp', 'pcs', 'piece', 'pieces'];
  return validUnits.includes(unit.toLowerCase().trim());
};

// Validate image file
export const isValidImageFile = (uri: string, maxSizeBytes: number = 10 * 1024 * 1024): { valid: boolean; error?: string } => {
  // Check file extension
  const validExtensions = ['.jpg', '.jpeg', '.png', '.heic', '.webp'];
  const hasValidExtension = validExtensions.some(ext => uri.toLowerCase().endsWith(ext));

  if (!hasValidExtension) {
    return { valid: false, error: 'Invalid image format. Use JPG, PNG, or HEIC.' };
  }

  // Note: Size checking needs to be done after loading the file
  // This is a basic URI check only

  return { valid: true };
};

// Validate array of preferences
export const isValidPreferencesArray = (arr: unknown): boolean => {
  if (!Array.isArray(arr)) return false;
  if (arr.length === 0) return false;
  if (arr.length > 20) return false; // Reasonable limit

  return arr.every(item => typeof item === 'string' && item.length > 0 && item.length < 50);
};

// Validate JSON structure (prevent injection)
export const isValidJSONStructure = (data: unknown): boolean => {
  try {
    // Check if it can be stringified and parsed back
    const stringified = JSON.stringify(data);
    JSON.parse(stringified);

    // Check size (prevent DoS with huge JSON)
    if (stringified.length > 1024 * 1024) { // 1MB limit
      return false;
    }

    return true;
  } catch {
    return false;
  }
};

// Rate limiting helper (client-side check, server should enforce)
export const checkClientRateLimit = (
  lastActionTime: number | null,
  minIntervalMs: number
): { allowed: boolean; waitTime?: number } => {
  if (!lastActionTime) {
    return { allowed: true };
  }

  const now = Date.now();
  const timeSinceLastAction = now - lastActionTime;

  if (timeSinceLastAction < minIntervalMs) {
    const waitTime = Math.ceil((minIntervalMs - timeSinceLastAction) / 1000);
    return { allowed: false, waitTime };
  }

  return { allowed: true };
};

// Sanitize error messages (don't leak sensitive info)
export const sanitizeErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    // Remove stack traces and sensitive info
    const message = error.message;

    // Common sensitive patterns to remove
    const sensitivePatterns = [
      /Bearer\s+[^\s]+/gi,
      /token[:\s]+[^\s]+/gi,
      /key[:\s]+[^\s]+/gi,
      /password[:\s]+[^\s]+/gi,
      /\/\/[^/]+@/g, // URLs with credentials
    ];

    let sanitized = message;
    sensitivePatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '[REDACTED]');
    });

    return sanitized.slice(0, 200); // Limit length
  }

  return 'An unexpected error occurred';
};

// Validate onboarding data
export const validateOnboardingData = (data: {
  name: string;
  gender: string;
  height: string;
  weight: string;
  fitnessGoal: string;
  cuisinePreferences: string[];
  tastePreferences: string[];
}): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  if (!isValidName(data.name)) {
    errors.name = 'Name must be 2-50 characters and contain only letters';
  }

  if (!['male', 'female', 'other'].includes(data.gender)) {
    errors.gender = 'Invalid gender selection';
  }

  const heightValidation = isValidHeight(data.height);
  if (!heightValidation.valid) {
    errors.height = heightValidation.error || 'Invalid height';
  }

  const weightValidation = isValidWeight(data.weight);
  if (!weightValidation.valid) {
    errors.weight = weightValidation.error || 'Invalid weight';
  }

  if (!['gym', 'lose_weight', 'gain_weight'].includes(data.fitnessGoal)) {
    errors.fitnessGoal = 'Invalid fitness goal';
  }

  if (!isValidPreferencesArray(data.cuisinePreferences)) {
    errors.cuisinePreferences = 'Invalid cuisine preferences';
  }

  if (!isValidPreferencesArray(data.tastePreferences)) {
    errors.tastePreferences = 'Invalid taste preferences';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

// Validate ingredient data
export const validateIngredient = (ingredient: {
  name: string;
  quantity: number;
  unit: string;
}): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  const sanitizedName = sanitizeIngredientName(ingredient.name);
  if (!sanitizedName || sanitizedName.length < 2) {
    errors.name = 'Ingredient name must be at least 2 characters';
  }

  if (!isValidQuantity(ingredient.quantity)) {
    errors.quantity = 'Quantity must be between 0 and 10000';
  }

  if (!isValidUnit(ingredient.unit)) {
    errors.unit = 'Invalid unit of measurement';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

// Prevent XSS in user-generated content
export const escapeHtml = (text: string): string => {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, char => map[char]);
};

// Deep sanitize object (recursive)
export const deepSanitize = (obj: any): any => {
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(deepSanitize);
  }

  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        sanitized[key] = deepSanitize(obj[key]);
      }
    }
    return sanitized;
  }

  return obj;
};
