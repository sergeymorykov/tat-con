import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  Platform, 
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Stack, useRouter } from 'expo-router';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  ArrowLeft, 
  Share2,
  Tag
} from 'lucide-react-native';
import EventNotifications from './EventNotifications';

// Интерфейс для события
interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  endDate?: Date;
  location: string;
  isOnline: boolean;
  categories: string[];
  attendees: number;
  image?: string;
  organizer?: string;
}

// Функция для форматирования даты
const formatEventDate = (date: Date, endDate?: Date): string => {
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  };
  
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit'
  };
  
  const dateStr = date.toLocaleDateString(undefined, options);
  const timeStr = date.toLocaleTimeString(undefined, timeOptions);
  
  if (endDate) {
    const endTimeStr = endDate.toLocaleTimeString(undefined, timeOptions);
    return `${dateStr}, ${timeStr} - ${endTimeStr}`;
  }
  
  return `${dateStr}, ${timeStr}`;
};

interface EventDetailProps {
  event?: Event;
  onClose?: () => void;
}

const EventDetailScreen: React.FC<EventDetailProps> = ({ 
  event, 
  onClose 
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);

  // Если событие не передано, показываем заглушку
  if (!event) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            title: t('events.details.title'),
            headerShown: true,
          }}
        />
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            {t('events.details.noEvent')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Обработчик нажатия кнопки "Поделиться"
  const handleShare = () => {
    // В реальном приложении здесь будет код для шаринга события
    console.log(`Sharing event: ${event.title}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#6366f1"
      />
      
      {/* Заголовок */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={onClose || (() => router.back())}
        >
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('events.details.title')}</Text>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Share2 size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView}>
        {/* Изображение события */}
        <Image 
          source={{ 
            uri: event.image || 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=1470&auto=format&fit=crop' 
          }} 
          style={styles.eventImage} 
        />
        
        {/* Основная информация */}
        <View style={styles.contentContainer}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          
          <View style={styles.infoRow}>
            <Calendar size={20} color="#6366f1" style={styles.infoIcon} />
            <Text style={styles.infoText}>
              {formatEventDate(event.date, event.endDate)}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <MapPin size={20} color="#6366f1" style={styles.infoIcon} />
            <Text style={styles.infoText}>
              {event.location} {event.isOnline ? `(${t('events.details.online')})` : ''}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Users size={20} color="#6366f1" style={styles.infoIcon} />
            <Text style={styles.infoText}>
              {t('events.attending', { count: event.attendees })}
            </Text>
          </View>
          
          {event.organizer && (
            <View style={styles.organizerContainer}>
              <Text style={styles.organizerLabel}>{t('events.details.organizer')}:</Text>
              <Text style={styles.organizerName}>{event.organizer}</Text>
            </View>
          )}
          
          {/* Категории */}
          <View style={styles.categoriesContainer}>
            {event.categories.map((category, index) => (
              <View key={index} style={styles.categoryTag}>
                <Tag size={14} color="#6366f1" style={styles.categoryIcon} />
                <Text style={styles.categoryText}>{category}</Text>
              </View>
            ))}
          </View>
          
          {/* Описание */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('events.details.about')}</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>
          
          {/* Кнопка для показа настройки уведомлений */}
          <TouchableOpacity 
            style={styles.notificationsButton}
            onPress={() => setShowNotificationSettings(!showNotificationSettings)}
          >
            <Text style={styles.notificationsButtonText}>
              {showNotificationSettings 
                ? t('events.details.hideNotifications')
                : t('events.details.setReminder')
              }
            </Text>
          </TouchableOpacity>
          
          {/* Компонент настройки уведомлений */}
          {showNotificationSettings && (
            <EventNotifications event={event} />
          )}
          
          {/* Кнопка участия */}
          <TouchableOpacity style={styles.attendButton}>
            <Text style={styles.attendButtonText}>
              {t('events.details.attend')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  backButton: {
    padding: 8,
  },
  shareButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  eventImage: {
    width: '100%',
    height: 220,
    resizeMode: 'cover',
  },
  contentContainer: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoIcon: {
    marginRight: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#4b5563',
  },
  organizerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  organizerLabel: {
    fontSize: 16,
    color: '#6b7280',
    marginRight: 6,
  },
  organizerName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    marginTop: 8,
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eef2ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryIcon: {
    marginRight: 4,
  },
  categoryText: {
    fontSize: 14,
    color: '#6366f1',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4b5563',
  },
  notificationsButton: {
    backgroundColor: '#eef2ff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  notificationsButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6366f1',
  },
  attendButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  attendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
});

export default EventDetailScreen; 