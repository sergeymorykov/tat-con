import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Bell, BellOff, Clock, Calendar as CalendarIcon } from 'lucide-react-native';
import EventNotificationSettings from './EventNotificationSettings';

// Интерфейс для настроек уведомлений
interface NotificationSettings {
  enabled: boolean;
  reminders: {
    days: number[];
    hours: number[];
  };
}

// Интерфейс для события
interface Event {
  id: string;
  title: string;
  date: Date;
}

// Демо-функция для запроса разрешений на уведомления
const requestNotificationPermissions = async (): Promise<boolean> => {
  // В реальном приложении здесь должен быть код для запроса разрешений
  // через Expo Notifications или другую библиотеку
  console.log('Requesting notification permissions...');
  
  // Имитация успешного запроса разрешений
  return true;
};

// Демо-функция для планирования уведомления
const scheduleNotification = async (event: Event, minutesBefore: number): Promise<string> => {
  // В реальном приложении здесь должен быть код для планирования уведомления
  console.log(`Scheduling notification for event "${event.title}" ${minutesBefore} minutes before`);
  
  // Имитация успешного планирования, возвращаем ID уведомления
  return `notification_${event.id}_${minutesBefore}`;
};

// Демо-функция для отмены уведомления по ID
const cancelNotification = async (notificationId: string): Promise<void> => {
  // В реальном приложении здесь должен быть код для отмены уведомления
  console.log(`Cancelling notification with ID: ${notificationId}`);
};

interface EventNotificationsProps {
  event: {
    id: string;
    title: string;
    date: Date;
  };
}

export default function EventNotifications({ event }: EventNotificationsProps) {
  const { t } = useTranslation();
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    enabled: false,
    reminders: {
      days: [1], // По умолчанию напоминание за 1 день
      hours: [1], // По умолчанию напоминание за 1 час
    },
  });

  // Эффект для инициализации настроек уведомлений
  useEffect(() => {
    const initNotifications = async () => {
      // Запрашиваем разрешения при первой загрузке
      const hasPermission = await requestNotificationPermissions();
      if (!hasPermission) {
        // Если разрешения не получены, отключаем уведомления
        setNotificationSettings(prev => ({ ...prev, enabled: false }));
      }
    };

    initNotifications();

    // В реальном приложении здесь можно загрузить сохраненные настройки из хранилища
  }, []);

  // Эффект для обновления уведомлений при изменении настроек или события
  useEffect(() => {
    if (!event) return;

    const updateNotifications = async () => {
      if (notificationSettings.enabled) {
        // Планируем уведомления для дней
        for (const day of notificationSettings.reminders.days) {
          await scheduleNotification(event, day * 24 * 60);
        }
        
        // Планируем уведомления для часов
        for (const hour of notificationSettings.reminders.hours) {
          await scheduleNotification(event, hour * 60);
        }
      }
    };

    updateNotifications();

    // Очистка уведомлений при размонтировании компонента
    return () => {
      if (event) {
        // Отменяем все уведомления для события
        for (const day of notificationSettings.reminders.days) {
          cancelNotification(`notification_${event.id}_${day * 24 * 60}`);
        }
        for (const hour of notificationSettings.reminders.hours) {
          cancelNotification(`notification_${event.id}_${hour * 60}`);
        }
      }
    };
  }, [event, notificationSettings]);

  // Обработчик переключения уведомлений
  const toggleNotifications = () => {
    setNotificationSettings(prev => ({ ...prev, enabled: !prev.enabled }));
  };

  // Обработчик добавления напоминания за день
  const toggleDayReminder = (days: number) => {
    setNotificationSettings(prev => {
      const currentDays = prev.reminders.days;
      const updatedDays = currentDays.includes(days)
        ? currentDays.filter(d => d !== days)
        : [...currentDays, days];
      
      return {
        ...prev,
        reminders: {
          ...prev.reminders,
          days: updatedDays
        }
      };
    });
  };

  // Обработчик добавления напоминания за час
  const toggleHourReminder = (hours: number) => {
    setNotificationSettings(prev => {
      const currentHours = prev.reminders.hours;
      const updatedHours = currentHours.includes(hours)
        ? currentHours.filter(h => h !== hours)
        : [...currentHours, hours];
      
      return {
        ...prev,
        reminders: {
          ...prev.reminders,
          hours: updatedHours
        }
      };
    });
  };

  return (
    <View style={styles.container}>
      <EventNotificationSettings event={event} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    marginBottom: 16,
  },
}); 