import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

import { API_URL } from '../constants/api';

// Типы для данных пользователя
interface UserProfile {
  _id: string;
  name: string;
  email: string;
  photo: string;
  interests: string[];
  description: string;
  meetingGoal: string;
  isNewUser: boolean;
  rating: number;
  ratingCount: number;
  authProvider: string;
}

const ProfileEditScreen = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  
  // Состояния для полей формы
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState('');
  const [description, setDescription] = useState('');
  const [meetingGoal, setMeetingGoal] = useState('');
  const [isNewUser, setIsNewUser] = useState(true);

  // Получаем данные пользователя при загрузке компонента
  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Функция получения профиля пользователя
  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        router.replace('/auth');
        return;
      }
      
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        const userData = response.data.data;
        setUser(userData);
        
        // Заполняем состояния формы данными пользователя
        setName(userData.name || '');
        setPhoto(userData.photo || '');
        setInterests(userData.interests || []);
        setDescription(userData.description || '');
        setMeetingGoal(userData.meetingGoal || '');
        setIsNewUser(userData.isNewUser || false);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert(t('profile.error'), t('profile.fetchError'));
      router.replace('/auth');
    } finally {
      setIsLoading(false);
    }
  };

  // Выбор фото из галереи
  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert(t('profile.permissionDenied'), t('profile.photoPermission'));
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });
      
      if (!result.canceled) {
        // В реальном приложении здесь был бы загрузка фото на сервер
        // и получение URL. Для примера используем локальный URI.
        setPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert(t('profile.error'), t('profile.imagePickError'));
    }
  };

  // Добавление нового интереса
  const addInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  // Удаление интереса
  const removeInterest = (interest: string) => {
    setInterests(interests.filter(item => item !== interest));
  };

  // Сохранение профиля
  const saveProfile = async () => {
    // Валидация обязательных полей
    if (!name.trim() || !photo) {
      return Alert.alert(t('profile.error'), t('profile.requiredFields'));
    }
    
    try {
      setIsSaving(true);
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        router.replace('/auth');
        return;
      }
      
      const profileData = {
        name,
        photo,
        interests,
        description,
        meetingGoal,
        isNewUser
      };
      
      const response = await axios.put(`${API_URL}/profile`, profileData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        Alert.alert(t('profile.success'), t('profile.updateSuccess'));
        router.back();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert(t('profile.error'), t('profile.updateError'));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('profile.editProfile')}</Text>
          <TouchableOpacity 
            style={[styles.saveButton, isSaving && styles.disabledButton]} 
            onPress={saveProfile}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>{t('profile.save')}</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.photoSection}>
          <View style={styles.photoContainer}>
            {photo ? (
              <Image source={{ uri: photo }} style={styles.profilePhoto} />
            ) : (
              <View style={styles.placeholderPhoto}>
                <Ionicons name="person" size={50} color="#ccc" />
              </View>
            )}
          </View>
          <TouchableOpacity style={styles.changePhotoButton} onPress={pickImage}>
            <Text style={styles.changePhotoText}>{t('profile.changePhoto')}</Text>
          </TouchableOpacity>
          <Text style={styles.requiredText}>{t('profile.requiredPhoto')}</Text>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>{t('profile.name')}</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder={t('profile.enterName')}
          />

          <Text style={styles.label}>{t('profile.interests')}</Text>
          <View style={styles.interestsContainer}>
            {interests.map((interest, index) => (
              <View key={index} style={styles.interestTag}>
                <Text style={styles.interestText}>{interest}</Text>
                <TouchableOpacity onPress={() => removeInterest(interest)}>
                  <Ionicons name="close-circle" size={18} color="#6366f1" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          <View style={styles.addInterestRow}>
            <TextInput
              style={styles.interestInput}
              value={newInterest}
              onChangeText={setNewInterest}
              placeholder={t('profile.addInterest')}
              onSubmitEditing={addInterest}
              returnKeyType="done"
            />
            <TouchableOpacity style={styles.addButton} onPress={addInterest}>
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>{t('profile.description')}</Text>
          <TextInput
            style={styles.textArea}
            value={description}
            onChangeText={setDescription}
            placeholder={t('profile.descriptionPlaceholder')}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <Text style={styles.label}>{t('profile.meetingGoal')}</Text>
          <TextInput
            style={styles.textArea}
            value={meetingGoal}
            onChangeText={setMeetingGoal}
            placeholder={t('profile.meetingGoalPlaceholder')}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>{t('profile.newUserStatus')}</Text>
            <Switch
              value={isNewUser}
              onValueChange={setIsNewUser}
              trackColor={{ false: '#e0e0e0', true: '#a5b4fc' }}
              thumbColor={isNewUser ? '#6366f1' : '#f4f3f4'}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#a5b4fc',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  photoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  profilePhoto: {
    width: 120,
    height: 120,
  },
  placeholderPhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhotoButton: {
    paddingVertical: 8,
  },
  changePhotoText: {
    color: '#6366f1',
    fontWeight: '600',
  },
  requiredText: {
    color: '#f43f5e',
    fontSize: 12,
  },
  formSection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    minHeight: 100,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
    gap: 8,
  },
  interestTag: {
    backgroundColor: '#e0e7ff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  interestText: {
    color: '#6366f1',
    marginRight: 5,
  },
  addInterestRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  interestInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: '#6366f1',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
});

export default ProfileEditScreen; 