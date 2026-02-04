import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../config/supabase';
import { analyzeIngredients, checkCanPerformAction, AIServiceError } from '../../services/aiService';

export const CameraScreen = ({ navigation }: any) => {
  const { user, session } = useAuth();
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const ensureValidSession = useCallback(async (): Promise<boolean> => {
    if (!session || !session.access_token) {
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      if (error || !currentSession) {
        Alert.alert('Session Expired', 'Please log in again to continue.', [
          { text: 'OK', onPress: () => navigation.navigate('Login') }
        ]);
        return false;
      }
    }

    const currentSession = session || (await supabase.auth.getSession()).data.session;
    if (currentSession?.expires_at) {
      const bufferTime = 60 * 1000;
      const isExpiring = (currentSession.expires_at * 1000 - bufferTime) < Date.now();
      if (isExpiring) {
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError || !refreshData.session) {
          Alert.alert('Session Expired', 'Please log in again to continue.', [
            { text: 'OK', onPress: () => navigation.navigate('Login') }
          ]);
          return false;
        }
      }
    }
    return true;
  }, [session, navigation]);

  const requestPermissions = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (cameraPermission.status !== 'granted' || mediaLibraryPermission.status !== 'granted') {
      Alert.alert('Permissions Required', 'Camera and photo library access are required to scan ingredients.');
      return false;
    }
    return true;
  };

  const updateStreak = async () => {
    if (!user) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('users')
        .select('current_streak, last_scan_date')
        .eq('id', user.id)
        .single();

      if (!data) return;

      const lastDate = data.last_scan_date;
      let newStreak = data.current_streak || 0;

      if (lastDate === today) {
        // Already scanned today, no change
        return;
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastDate === yesterdayStr) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }

      await supabase
        .from('users')
        .update({ current_streak: newStreak, last_scan_date: today })
        .eq('id', user.id);
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  };

  const handleTakePhoto = async () => {
    try {
      const isSessionValid = await ensureValidSession();
      if (!isSessionValid) return;

      const limitCheck = await checkCanPerformAction('scan');
      if (!limitCheck.allowed) {
        Alert.alert('Scan Limit Reached', limitCheck.message || 'Please upgrade to continue');
        navigation.goBack();
        return;
      }

      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImage(result.assets[0].uri);
        await analyzeImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to open camera');
    }
  };

  const handlePickImage = async () => {
    try {
      const isSessionValid = await ensureValidSession();
      if (!isSessionValid) return;

      const limitCheck = await checkCanPerformAction('scan');
      if (!limitCheck.allowed) {
        Alert.alert('Scan Limit Reached', limitCheck.message || 'Please upgrade to continue');
        navigation.goBack();
        return;
      }

      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImage(result.assets[0].uri);
        await analyzeImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('Error', 'Failed to open gallery');
    }
  };

  const analyzeImage = async (imageUri: string) => {
    if (!user) {
      Alert.alert('Not Logged In', 'Please log in to scan ingredients.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const isSessionValid = await ensureValidSession();
      if (!isSessionValid) {
        setIsAnalyzing(false);
        return;
      }

      const response = await fetch(imageUri);
      const blob = await response.blob();

      const imagePath = `${user.id}/${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('ingredient-scans')
        .upload(imagePath, blob, { contentType: 'image/jpeg', upsert: false });

      let imageUrl = '';
      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from('ingredient-scans')
          .getPublicUrl(imagePath);
        imageUrl = urlData.publicUrl;
      }

      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          const base64Data = result.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const { data: scanData, error: scanError } = await supabase
        .from('scans')
        .insert({
          user_id: user.id,
          image_url: imageUrl,
          ingredients: [],
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (scanError) {
        throw new Error(`Failed to create scan record: ${scanError.message}`);
      }

      await analyzeIngredients(base64, scanData.id, true);

      // Update streak after successful scan
      await updateStreak();

      navigation.navigate('IngredientEdit', { scanId: scanData.id });
    } catch (error: any) {
      console.error('Error:', error?.message);

      let errorMessage = 'Failed to analyze the image. Please try again.';
      let errorTitle = 'Analysis Failed';

      if (error instanceof AIServiceError) {
        errorMessage = error.message;
        if (error.statusCode === 401 || error.code === 'AUTH_FAILED' || error.code === 'SESSION_EXPIRED') {
          errorTitle = 'Session Expired';
          errorMessage = 'Your session has expired. Please log in again.';
          Alert.alert(errorTitle, errorMessage, [
            { text: 'Log In', onPress: () => navigation.navigate('Login') }
          ]);
          return;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }

      Alert.alert(errorTitle, errorMessage, [{ text: 'OK' }], { cancelable: false });
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isAnalyzing) {
    return (
      <View style={styles.loadingContainer}>
        {image && <Image source={{ uri: image }} style={styles.analyzingImage} />}
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
        <Text style={styles.loadingText}>Analyzing ingredients...</Text>
        <Text style={styles.loadingSubtext}>This may take a moment</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Scan Ingredients</Text>
        <Text style={styles.subtitle}>
          Take a photo or choose from your gallery
        </Text>
      </View>

      <View style={styles.optionsContainer}>
        <TouchableOpacity style={styles.optionCard} onPress={handleTakePhoto}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{'\uD83D\uDCF8'}</Text>
          </View>
          <Text style={styles.optionTitle}>Take Photo</Text>
          <Text style={styles.optionDescription}>
            Use your camera to scan ingredients
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionCard} onPress={handlePickImage}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{'\uD83D\uDDBC\uFE0F'}</Text>
          </View>
          <Text style={styles.optionTitle}>Choose from Gallery</Text>
          <Text style={styles.optionDescription}>
            Select an existing photo
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
  },
  header: {
    marginTop: 60,
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  optionsContainer: {
    gap: 16,
  },
  optionCard: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 40,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  cancelButton: {
    marginTop: 24,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  analyzingImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 32,
  },
  loader: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#666',
  },
});
