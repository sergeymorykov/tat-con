import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { scheduleEventReminder, cancelEventReminder } from '../utils/notifications';
import { useColorScheme } from '../hooks/useColorScheme';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

// Опции времени напоминания
const reminderOptions = [
  { label: 'За 15 минут', value: 15 },
  { label: 'За 30 минут', value: 30 },
  { label: 'За 1 час', value: 60 },
  { label: 'За 3 часа', value: 180 },
  { label: 'За 1 день', value: 1440 },
];

interface EventReminderSettingsProps {
  event: {
    id: string;
    title: string;
    date: Date;
  };
  defaultReminderTime?: number;
}

export default function EventNotificationSettings({ 
  event, 
  defaultReminderTime = 30 
}: EventReminderSettingsProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  
  const [activeReminder, setActiveReminder] = useState<{
    time: number;
    notificationId: string | null;
  } | null>(null);
  
  // Установить уведомление
  const handleSetReminder = async (reminderTime: number) => {
    try {
      // Сначала отменяем текущее уведомление, если оно есть
      if (activeReminder?.notificationId) {
        await cancelEventReminder(activeReminder.notificationId);
      }
      
      // Планируем новое уведомление
      const notificationId = await scheduleEventReminder(event, reminderTime);
      
      if (notificationId) {
        setActiveReminder({
          time: reminderTime,
          notificationId,
        });
        
        Alert.alert(
          'Уведомление установлено',
          `Вы получите уведомление за ${formatReminderTime(reminderTime)} до начала события.`
        );
      } else {
        Alert.alert(
          'Ошибка',
          'Не удалось установить уведомление. Возможно, дата события уже прошла.'
        );
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось установить уведомление.');
      console.error('Error setting reminder:', error);
    }
  };
  
  // Отменить уведомление
  const handleCancelReminder = async () => {
    if (!activeReminder?.notificationId) return;
    
    try {
      const success = await cancelEventReminder(activeReminder.notificationId);
      
      if (success) {
        setActiveReminder(null);
        Alert.alert('Готово', 'Уведомление отменено');
      } else {
        Alert.alert('Ошибка', 'Не удалось отменить уведомление');
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось отменить уведомление');
      console.error('Error canceling reminder:', error);
    }
  };
  
  // Форматирование времени напоминания для отображения
  const formatReminderTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} минут`;
    } else if (minutes < 60 * 24) {
      const hours = Math.floor(minutes / 60);
      return `${hours} ${pluralize(hours, 'час', 'часа', 'часов')}`;
    } else {
      const days = Math.floor(minutes / (60 * 24));
      return `${days} ${pluralize(days, 'день', 'дня', 'дней')}`;
    }
  };
  
  // Функция для правильного склонения слов
  const pluralize = (count: number, one: string, few: string, many: string): string => {
    const mod10 = count % 10;
    const mod100 = count % 100;
    
    if (mod10 === 1 && mod100 !== 11) {
      return one;
    } else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
      return few;
    } else {
      return many;
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>
        Напоминание о событии
      </Text>
      
      <View style={styles.reminderOptions}>
        {reminderOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.reminderOption,
              activeReminder?.time === option.value && {
                backgroundColor: colors.primaryLight,
                borderColor: colors.primary,
              },
            ]}
            onPress={() => handleSetReminder(option.value)}
          >
            <Text
              style={[
                styles.reminderOptionText,
                { color: activeReminder?.time === option.value ? colors.primary : colors.text },
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {activeReminder && (
        <TouchableOpacity
          style={[styles.cancelButton, { borderColor: colors.error }]}
          onPress={handleCancelReminder}
        >
          <Ionicons name="close-circle-outline" size={18} color={colors.error} />
          <Text style={[styles.cancelButtonText, { color: colors.error }]}>
            Отменить напоминание
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
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
    minWidth: '30%',
  },
  reminderOptionText: {
    textAlign: 'center',
    fontSize: 14,
  },
  cancelButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontWeight: '500',
    marginLeft: 8,
  },
}); 