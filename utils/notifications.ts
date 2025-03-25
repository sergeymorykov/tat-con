import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Интерфейс для события
interface Event {
  id: string;
  title: string;
  date: Date;
}

// Настройка уведомлений при старте приложения
export async function setupNotifications() {
  // Настраиваем как будут показываться уведомления
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
  
  // Запрашиваем разрешения на показ уведомлений
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  // Если разрешения еще нет, запрашиваем его
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  // Если разрешение не получено, возвращаем false
  if (finalStatus !== 'granted') {
    console.log('Permission for notifications was denied');
    return false;
  }
  
  // Для iOS нужны дополнительные настройки
  if (Platform.OS === 'ios') {
    await Notifications.setNotificationCategoryAsync('event', [
      {
        identifier: 'view',
        buttonTitle: 'View',
        options: {
          opensAppToForeground: true,
        },
      },
    ]);
  }
  
  return true;
}

// Планирование уведомления за определенное время до события
export async function scheduleEventReminder(
  event: Event,
  minutesBefore: number
): Promise<string | null> {
  try {
    // Рассчитываем время, когда должно прийти уведомление
    const triggerDate = new Date(event.date.getTime() - minutesBefore * 60 * 1000);
    
    // Если время уведомления уже прошло, не планируем его
    if (triggerDate <= new Date()) {
      console.log('Notification time already passed');
      return null;
    }
    
    // Планируем уведомление
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Напоминание о событии',
        body: `${event.title} начнется через ${formatReminderTime(minutesBefore)}`,
        data: { eventId: event.id },
        sound: true,
        badge: 1,
      },
      trigger: {
        date: triggerDate,
      },
    });
    
    return identifier;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
}

// Отмена уведомления по идентификатору
export async function cancelEventReminder(identifier: string): Promise<boolean> {
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
    return true;
  } catch (error) {
    console.error('Error canceling notification:', error);
    return false;
  }
}

// Отмена всех уведомлений для события
export async function cancelAllEventReminders(): Promise<boolean> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    return true;
  } catch (error) {
    console.error('Error canceling all notifications:', error);
    return false;
  }
}

// Получение всех запланированных уведомлений
export async function getAllScheduledNotifications() {
  return await Notifications.getAllScheduledNotificationsAsync();
}

// Форматирование времени напоминания для отображения
function formatReminderTime(minutesBefore: number): string {
  if (minutesBefore < 60) {
    return `${minutesBefore} минут`;
  } else if (minutesBefore < 60 * 24) {
    const hours = Math.floor(minutesBefore / 60);
    return `${hours} ${pluralize(hours, 'час', 'часа', 'часов')}`;
  } else {
    const days = Math.floor(minutesBefore / (60 * 24));
    return `${days} ${pluralize(days, 'день', 'дня', 'дней')}`;
  }
}

// Функция для правильного склонения слов
function pluralize(count: number, one: string, few: string, many: string): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  
  if (mod10 === 1 && mod100 !== 11) {
    return one;
  } else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return few;
  } else {
    return many;
  }
} 