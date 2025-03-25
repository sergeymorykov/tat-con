import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { setupNotifications, getAllScheduledNotifications, cancelAllEventReminders } from '../utils/notifications';
import { useColorScheme } from '../hooks/useColorScheme';
import { Colors } from '../constants/Colors';
import { FontAwesome } from '@expo/vector-icons';

// Опции времени напоминания
const reminderOptions = [
  { label: 'За 15 минут', value: 15 },
  { label: 'За 30 минут', value: 30 },
  { label: 'За 1 час', value: 60 },
  { label: 'За 3 часа', value: 180 },
  { label: 'За 1 день', value: 1440 },
  { label: 'За 2 дня', value: 2880 },
];

interface NotificationSettingsProps {
  onSave?: (settings: NotificationSettings) => void;
}

export interface NotificationSettings {
  enabled: boolean;
  defaultReminderTime: number;
}

export default function NotificationSettings({ onSave }: NotificationSettingsProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  
  // Состояние настроек уведомлений
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [defaultReminderTime, setDefaultReminderTime] = useState(30); // По умолчанию за 30 минут
  const [activeNotifications, setActiveNotifications] = useState<any[]>([]);
  
  // Получение текущего состояния разрешений и настроек при загрузке компонента
  useEffect(() => {
    const checkPermissions = async () => {
      const granted = await setupNotifications();
      setPermissionGranted(granted);
      if (granted) {
        setNotificationsEnabled(true);
        refreshActiveNotifications();
      }
    };
    
    checkPermissions();
  }, []);
  
  // Обновление списка активных уведомлений
  const refreshActiveNotifications = async () => {
    const notifications = await getAllScheduledNotifications();
    setActiveNotifications(notifications);
  };
  
  // Обработчик изменения настроек уведомлений
  const handleToggleNotifications = async (value: boolean) => {
    if (value && !permissionGranted) {
      // Если пользователь хочет включить уведомления, но разрешение не получено
      const granted = await setupNotifications();
      setPermissionGranted(granted);
      
      if (!granted) {
        Alert.alert(
          'Разрешение не получено',
          'Пожалуйста, разрешите уведомления в настройках устройства.',
          [{ text: 'OK' }]
        );
        return;
      }
    }
    
    setNotificationsEnabled(value);
    
    // Сохраняем настройки, если предоставлен колбэк onSave
    if (onSave) {
      onSave({
        enabled: value,
        defaultReminderTime: defaultReminderTime,
      });
    }
  };
  
  // Обработчик выбора времени напоминания по умолчанию
  const handleSelectReminderTime = (time: number) => {
    setDefaultReminderTime(time);
    
    // Сохраняем настройки, если предоставлен колбэк onSave
    if (onSave) {
      onSave({
        enabled: notificationsEnabled,
        defaultReminderTime: time,
      });
    }
  };
  
  // Обработчик отмены всех уведомлений
  const handleCancelAllNotifications = async () => {
    Alert.alert(
      'Отменить все уведомления',
      'Вы уверены, что хотите отменить все запланированные уведомления?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Да',
          style: 'destructive',
          onPress: async () => {
            await cancelAllEventReminders();
            refreshActiveNotifications();
            Alert.alert('Готово', 'Все уведомления отменены');
          },
        },
      ]
    );
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Уведомления</Text>
        
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: colors.text }]}>
            Разрешить уведомления
          </Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={handleToggleNotifications}
            trackColor={{ false: '#767577', true: colors.primary }}
            thumbColor={notificationsEnabled ? colors.primaryLight : '#f4f3f4'}
          />
        </View>
        
        {!permissionGranted && (
          <Text style={[styles.permissionWarning, { color: colors.error }]}>
            Требуется разрешение на отправку уведомлений
          </Text>
        )}
      </View>
      
      {notificationsEnabled && (
        <>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Время напоминания по умолчанию
            </Text>
            <View style={styles.reminderOptions}>
              {reminderOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.reminderOption,
                    defaultReminderTime === option.value && {
                      backgroundColor: colors.primaryLight,
                      borderColor: colors.primary,
                    },
                  ]}
                  onPress={() => handleSelectReminderTime(option.value)}
                >
                  <Text
                    style={[
                      styles.reminderOptionText,
                      { color: defaultReminderTime === option.value ? colors.primary : colors.text },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Активные уведомления ({activeNotifications.length})
              </Text>
              <TouchableOpacity style={styles.refreshButton} onPress={refreshActiveNotifications}>
                <FontAwesome name="refresh" size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
            
            {activeNotifications.length > 0 ? (
              <View>
                {activeNotifications.map((notification, index) => (
                  <View key={index} style={styles.notificationItem}>
                    <Text style={[styles.notificationText, { color: colors.text }]}>
                      {notification.content?.title || 'Уведомление'}
                    </Text>
                    <Text style={[styles.notificationSubText, { color: colors.textDim }]}>
                      {new Date(notification.trigger?.date || Date.now()).toLocaleString()}
                    </Text>
                  </View>
                ))}
                
                <TouchableOpacity
                  style={[styles.cancelButton, { borderColor: colors.error }]}
                  onPress={handleCancelAllNotifications}
                >
                  <Text style={[styles.cancelButtonText, { color: colors.error }]}>
                    Отменить все уведомления
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={[styles.emptyText, { color: colors.textDim }]}>
                Нет запланированных уведомлений
              </Text>
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingLabel: {
    fontSize: 16,
  },
  permissionWarning: {
    fontSize: 14,
    marginTop: 8,
  },
  reminderOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  reminderOption: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    margin: 4,
    minWidth: '45%',
  },
  reminderOptionText: {
    textAlign: 'center',
    fontSize: 14,
  },
  refreshButton: {
    padding: 8,
  },
  notificationItem: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    marginBottom: 8,
  },
  notificationText: {
    fontSize: 14,
    fontWeight: '500',
  },
  notificationSubText: {
    fontSize: 12,
    marginTop: 4,
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 16,
  },
  cancelButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelButtonText: {
    fontWeight: '500',
  },
}); 