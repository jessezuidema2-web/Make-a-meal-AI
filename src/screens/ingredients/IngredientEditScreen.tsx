import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  LayoutAnimation,
  UIManager,
  findNodeHandle,
} from 'react-native';
import { supabase } from '../../config/supabase';
import { Ingredient, Scan } from '../../types';
import { suggestExtraIngredients } from '../../services/aiService';
import { useAuth } from '../../contexts/AuthContext';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Default keyboard offset - accounts for navigation header on iOS
const KEYBOARD_OFFSET = Platform.OS === 'ios' ? 90 : 0;

export const IngredientEditScreen = ({ route, navigation }: any) => {
  const { scanId } = route.params;
  const { user } = useAuth();
  const [scan, setScan] = useState<Scan | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<Ingredient[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const inputRefs = useRef<{ [key: string]: View | null }>({});

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => { setKeyboardVisible(true); }
    );
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => { setKeyboardVisible(false); }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  useEffect(() => {
    loadScan();
  }, []);

  const loadScan = async () => {
    try {
      const { data, error } = await supabase
        .from('scans')
        .select('*')
        .eq('id', scanId)
        .single();

      if (error) throw error;
      setScan(data);
      setIngredients(data.ingredients || []);
    } catch (error) {
      console.error('Error loading scan:', error);
      Alert.alert('Error', 'Failed to load ingredients');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddIngredient = () => {
    const newIngredient: Ingredient = {
      id: Date.now().toString(),
      name: '',
      quantity: 0,
      unit: 'g',
    };
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIngredients([...ingredients, newIngredient]);
    setEditingId(newIngredient.id);
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const scrollToInput = (ingredientId: string) => {
    const inputRef = inputRefs.current[ingredientId];
    if (inputRef && scrollViewRef.current) {
      inputRef.measureLayout(
        findNodeHandle(scrollViewRef.current) as number,
        (x: number, y: number, width: number, height: number) => {
          scrollViewRef.current?.scrollTo({
            y: Math.max(0, y - 100),
            animated: true,
          });
        },
        () => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }
      );
    }
  };

  const handleUpdateIngredient = (id: string, field: keyof Ingredient, value: any) => {
    setIngredients(prev =>
      prev.map(ing =>
        ing.id === id ? { ...ing, [field]: value } : ing
      )
    );
  };

  const handleDeleteIngredient = (id: string) => {
    setIngredients(prev => prev.filter(ing => ing.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const handleSave = async () => {
    const validIngredients = ingredients.filter(
      ing => ing.name.trim() !== '' && ing.quantity > 0
    );

    if (validIngredients.length === 0) {
      Alert.alert('Error', 'Please add at least one ingredient');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('scans')
        .update({ ingredients: validIngredients })
        .eq('id', scanId);

      if (error) throw error;
      navigation.navigate('RecipeFilters', { scanId });
    } catch (error) {
      console.error('Error saving ingredients:', error);
      Alert.alert('Error', 'Failed to save ingredients');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAISuggest = async () => {
    const currentNames = ingredients
      .filter(i => i.name.trim() !== '')
      .map(i => i.name.trim());

    if (currentNames.length === 0) {
      Alert.alert('Error', 'Add at least one ingredient first');
      return;
    }

    setIsSuggesting(true);
    setSuggestions([]);
    try {
      const result = await suggestExtraIngredients(currentNames, {
        cuisinePreferences: user?.cuisine_preferences,
        tastePreferences: user?.taste_preferences,
        fitnessGoal: user?.fitness_goal,
      });
      setSuggestions(result);
    } catch (error: any) {
      console.error('Error getting suggestions:', error);
      Alert.alert('Error', error.message || 'Failed to get suggestions');
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleAddSuggestion = (suggestion: Ingredient) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIngredients(prev => [...prev, suggestion]);
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
  };

  const renderIngredient = (item: Ingredient) => {
    const isEditing = editingId === item.id;

    const handleFocus = () => {
      setEditingId(item.id);
      setTimeout(() => { scrollToInput(item.id); }, 150);
    };

    return (
      <View
        key={item.id}
        ref={(ref) => { inputRefs.current[item.id] = ref; }}
        style={styles.ingredientCard}
      >
        <View style={styles.ingredientMain}>
          <TextInput
            style={[styles.ingredientName, isEditing && styles.inputEditing]}
            value={item.name}
            onChangeText={value => handleUpdateIngredient(item.id, 'name', value)}
            placeholder="Ingredient name"
            placeholderTextColor="#999"
            onFocus={handleFocus}
            onBlur={() => setEditingId(null)}
            returnKeyType="next"
          />
          <View style={styles.quantityRow}>
            <TextInput
              style={[styles.quantityInput, isEditing && styles.inputEditing]}
              value={item.quantity.toString()}
              onChangeText={value => {
                const num = parseFloat(value) || 0;
                handleUpdateIngredient(item.id, 'quantity', num);
              }}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#999"
              onFocus={handleFocus}
              onBlur={() => setEditingId(null)}
              returnKeyType="next"
            />
            <TextInput
              style={[styles.unitInput, isEditing && styles.inputEditing]}
              value={item.unit}
              onChangeText={value => handleUpdateIngredient(item.id, 'unit', value)}
              placeholder="unit"
              placeholderTextColor="#999"
              onFocus={handleFocus}
              onBlur={() => setEditingId(null)}
              returnKeyType="done"
              onSubmitEditing={() => Keyboard.dismiss()}
            />
          </View>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteIngredient(item.id)}
        >
          <Text style={styles.deleteButtonText}>x</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={KEYBOARD_OFFSET}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Edit Ingredients</Text>
        <Text style={styles.subtitle}>
          Review and adjust the detected ingredients
        </Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={true}
        automaticallyAdjustKeyboardInsets={true}
      >
        {ingredients.map(item => renderIngredient(item))}

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.addButton} onPress={handleAddIngredient}>
            <Text style={styles.addButtonText}>+ Add Ingredient</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.aiButton, isSuggesting && styles.aiButtonDisabled]}
            onPress={handleAISuggest}
            disabled={isSuggesting}
          >
            <Text style={styles.aiButtonText}>
              {isSuggesting ? 'Thinking...' : '\u2728 AI Suggestions'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* AI Suggestions */}
        {suggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>Suggested Ingredients</Text>
            <View style={styles.suggestionsChips}>
              {suggestions.map(s => (
                <TouchableOpacity
                  key={s.id}
                  style={styles.suggestionChip}
                  onPress={() => handleAddSuggestion(s)}
                >
                  <Text style={styles.suggestionChipText}>
                    + {s.name} ({s.quantity} {s.unit})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {!keyboardVisible && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? 'Saving...' : 'Continue to Recipes'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {keyboardVisible && (
        <TouchableOpacity
          style={styles.keyboardDismissButton}
          onPress={() => Keyboard.dismiss()}
        >
          <Text style={styles.keyboardDismissText}>Done</Text>
        </TouchableOpacity>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    padding: 24,
    paddingTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  list: {
    padding: 24,
    paddingTop: 0,
    paddingBottom: 20,
  },
  bottomSpacer: {
    height: 120,
  },
  ingredientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    marginBottom: 12,
  },
  ingredientMain: {
    flex: 1,
  },
  ingredientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
    padding: 8,
    borderRadius: 8,
  },
  quantityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  quantityInput: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    padding: 8,
    borderRadius: 8,
  },
  unitInput: {
    width: 60,
    fontSize: 14,
    color: '#666',
    padding: 8,
    borderRadius: 8,
  },
  inputEditing: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ff3b30',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  deleteButtonText: {
    fontSize: 24,
    color: '#fff',
    lineHeight: 24,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  addButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  aiButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  aiButtonDisabled: {
    opacity: 0.6,
  },
  aiButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  suggestionsContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 122, 255, 0.08)',
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 12,
  },
  suggestionsChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#007AFF',
  },
  suggestionChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  keyboardDismissButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  keyboardDismissText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
