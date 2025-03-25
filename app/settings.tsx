import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import NotificationSettings, { NotificationSettings as NotificationSettingsType } from '@/components/NotificationSettings';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Ключ для хранения настроек в AsyncStorage
const NOTIFICATION_SETTINGS_KEY = 'notification_settings';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettingsType>({
    enabled: false,
    defaultReminderTime: 30,
  });
  
  // Загрузка настроек при монтировании компонента
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settingsJson = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
        
        if (settingsJson) {
          const savedSettings = JSON.parse(settingsJson);
          setNotificationSettings(savedSettings);
        }
      } catch (error) {
        console.error('Ошибка при загрузке настроек:', error);
      }
    };
    
    loadSettings();
  }, []);
  
  // Обработчик сохранения настроек уведомлений
  const handleSaveNotificationSettings = async (settings: NotificationSettingsType) => {
    try {
      // Сохраняем настройки локально
      setNotificationSettings(settings);
      
      // Сохраняем настройки в AsyncStorage
      await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Ошибка при сохранении настроек:', error);
    }
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: t('settings.title', 'Настройки'),
          headerTitleAlign: 'center',
        }}
      />
      
      <ScrollView style={styles.content}>
        <NotificationSettings 
          onSave={handleSaveNotificationSettings} 
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
}); 