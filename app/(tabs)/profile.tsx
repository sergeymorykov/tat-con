import { EditIcon, SettingsIcon, StarIcon, LogOutIcon } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator,
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

import { API_URL } from '../../constants/api';

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

// Временные данные для статистики
const INTEREST_STATS = [
  { name: 'Tech', percent: 40, color: '#6366f1' },
  { name: 'Arts', percent: 25, color: '#8b5cf6' },
  { name: 'Sports', percent: 20, color: '#d946ef' },
  { name: 'Other', percent: 15, color: '#f43f5e' },
];

const CONNECTIONS_DATA = [
  { week: 1, count: 5 },
  { week: 2, count: 12 },
  { week: 3, count: 25 },
  { week: 4, count: 35 },
  { week: 5, count: 45 },
];

export default function ProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);

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
        setUser(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert(t('profile.error'), t('profile.fetchError'));
      router.replace('/auth');
    } finally {
      setIsLoading(false);
    }
  };

  // Функция выхода из аккаунта
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      router.replace('/auth');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Переход на экран редактирования профиля
  const goToEditProfile = () => {
    router.push('/edit-profile');
  };

  // Переход на экран настроек
  const goToSettings = () => {
    router.push('/settings');
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{t('profile.userNotFound')}</Text>
        <TouchableOpacity style={styles.loginButton} onPress={() => router.replace('/auth')}>
          <Text style={styles.loginButtonText}>{t('auth.login')}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity style={styles.settingsButton} onPress={goToSettings}>
            <SettingsIcon size={24} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOutIcon size={24} color="#666" />
          </TouchableOpacity>
          <View style={styles.profileHeader}>
            <Image source={{ uri: user.photo }} style={styles.profileImage} />
            <TouchableOpacity style={styles.editButton} onPress={goToEditProfile}>
              <EditIcon size={16} color="white" />
            </TouchableOpacity>
          </View>
          <Text style={styles.name}>{user.name}</Text>
          {user.isNewUser && (
            <View style={styles.newUserBadge}>
              <Text style={styles.newUserText}>{t('profile.newUser')}</Text>
            </View>
          )}
          
          {/* Рейтинг пользователя */}
          <View style={styles.ratingContainer}>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon 
                  key={star} 
                  size={20} 
                  color={star <= Math.round(user.rating) ? '#f59e0b' : '#d1d5db'} 
                  fill={star <= Math.round(user.rating) ? '#f59e0b' : 'none'}
                />
              ))}
            </View>
            <Text style={styles.ratingText}>
              {user.rating.toFixed(1)} ({user.ratingCount} {t('profile.ratings')})
            </Text>
          </View>
        </View>

        {/* Интересы пользователя */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.interests')}</Text>
          <View style={styles.interests}>
            {user.interests.length > 0 ? (
              user.interests.map((interest, index) => (
                <View key={index} style={styles.interestTag}>
                  <Text style={styles.interestText}>{interest}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>{t('profile.noInterests')}</Text>
            )}
          </View>
        </View>

        {/* Описание пользователя */}
        {user.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('profile.aboutMe')}</Text>
            <Text style={styles.descriptionText}>{user.description}</Text>
          </View>
        )}

        {/* Цель встречи */}
        {user.meetingGoal && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('profile.meetingGoal')}</Text>
            <Text style={styles.descriptionText}>{user.meetingGoal}</Text>
          </View>
        )}

        {/* Статистика */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.interestDistribution')}</Text>
          <View style={styles.pieChartContainer}>
            {INTEREST_STATS.map((stat, index) => (
              <View key={index} style={styles.pieChartItem}>
                <View style={[styles.pieChartBar, { width: `${stat.percent}%`, backgroundColor: stat.color }]} />
                <Text style={styles.pieChartLabel}>{stat.name}: {stat.percent}%</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.connectionGrowth')}</Text>
          <View style={styles.graphContainer}>
            {CONNECTIONS_DATA.map((data, index) => (
              <View key={index} style={styles.graphItem}>
                <View style={[styles.graphBar, { height: data.count * 2 }]} />
                <Text style={styles.graphLabel}>{t('profile.week')} {data.week}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f3f4f6',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  settingsButton: {
    position: 'absolute',
    top: 40,
    right: 20,
  },
  logoutButton: {
    position: 'absolute',
    top: 40,
    left: 20,
  },
  profileHeader: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#6366f1',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  newUserBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  newUserText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  ratingContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  ratingText: {
    color: '#666',
    fontSize: 14,
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  interests: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTag: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  interestText: {
    color: '#6366f1',
    fontSize: 14,
  },
  emptyText: {
    color: '#666',
    fontStyle: 'italic',
  },
  descriptionText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  pieChartContainer: {
    marginTop: 10,
  },
  pieChartItem: {
    marginBottom: 10,
  },
  pieChartBar: {
    height: 20,
    borderRadius: 10,
  },
  pieChartLabel: {
    marginTop: 5,
    fontSize: 12,
    color: '#666',
  },
  graphContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 200,
    marginTop: 16,
  },
  graphItem: {
    alignItems: 'center',
    flex: 1,
  },
  graphBar: {
    width: 20,
    backgroundColor: '#6366f1',
    borderRadius: 10,
  },
  graphLabel: {
    marginTop: 5,
    fontSize: 12,
    color: '#666',
  },
});