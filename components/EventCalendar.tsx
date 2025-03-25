import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  FlatList,
  Platform,
  Dimensions
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Calendar } from 'react-native-calendars';
import { useRouter } from 'expo-router';
import { 
  CalendarDays, 
  Calendar as CalendarIcon, 
  Filter, 
  MapPin, 
  Tag, 
  Clock, 
  Bell, 
  Check
} from 'lucide-react-native';

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
}

// Возможные виды отображения календаря
type CalendarView = 'day' | 'week' | 'month';

// Интерфейс для фильтров
interface Filters {
  categories: string[];
  timeOfDay: string[];
  location: 'all' | 'online' | 'offline';
  userInterests: boolean;
}

// Демо-данные для событий
const DUMMY_EVENTS: Event[] = [
  {
    id: '1',
    title: 'Web Development Workshop',
    description: 'Узнайте основы веб-разработки на этом практическом семинаре',
    date: new Date(2025, 3, 15, 14, 0), // 15 апреля 2025, 14:00
    endDate: new Date(2025, 3, 15, 16, 0), // 15 апреля 2025, 16:00
    location: 'Tech Lab 101',
    isOnline: false,
    categories: ['Programming', 'Web Development'],
    attendees: 24,
  },
  {
    id: '2',
    title: 'AI Conference',
    description: 'Конференция по искусственному интеллекту с ведущими экспертами',
    date: new Date(2025, 3, 22, 10, 0), // 22 апреля 2025, 10:00
    endDate: new Date(2025, 3, 22, 18, 0), // 22 апреля 2025, 18:00
    location: 'Online Zoom Meeting',
    isOnline: true,
    categories: ['AI', 'Machine Learning', 'Technology'],
    attendees: 78,
  },
  {
    id: '3',
    title: 'Mobile Development Meetup',
    description: 'Встреча для разработчиков мобильных приложений',
    date: new Date(2025, 3, 5, 18, 30), // 5 апреля 2025, 18:30
    endDate: new Date(2025, 3, 5, 20, 0), // 5 апреля 2025, 20:00
    location: 'Digital Hub',
    isOnline: false,
    categories: ['Mobile', 'iOS', 'Android'],
    attendees: 42,
  },
  {
    id: '4',
    title: 'UX/UI Design Workshop',
    description: 'Практический семинар по дизайну пользовательского интерфейса',
    date: new Date(2025, 3, 10, 15, 0), // 10 апреля 2025, 15:00
    endDate: new Date(2025, 3, 10, 17, 0), // 10 апреля 2025, 17:00
    location: 'Design Studio',
    isOnline: false,
    categories: ['Design', 'UI/UX'],
    attendees: 30,
  },
  {
    id: '5',
    title: 'Data Science Webinar',
    description: 'Онлайн вебинар по анализу данных и машинному обучению',
    date: new Date(2025, 3, 18, 12, 0), // 18 апреля 2025, 12:00
    endDate: new Date(2025, 3, 18, 13, 30), // 18 апреля 2025, 13:30
    location: 'Online Streaming',
    isOnline: true,
    categories: ['Data Science', 'Statistics'],
    attendees: 65,
  },
];

// Все возможные категории событий
const ALL_CATEGORIES = [
  'Programming', 
  'Web Development', 
  'AI', 
  'Machine Learning', 
  'Technology', 
  'Mobile', 
  'iOS', 
  'Android',
  'Design',
  'UI/UX',
  'Data Science',
  'Statistics'
];

// Опции времени суток
const TIME_OPTIONS = ['Morning', 'Afternoon', 'Evening'];

// Форматирование даты для отображения
const formatEventDate = (date: Date, endDate?: Date): string => {
  const options: Intl.DateTimeFormatOptions = { 
    hour: '2-digit', 
    minute: '2-digit',
    month: 'short',
    day: 'numeric'
  };
  
  const formattedStart = date.toLocaleTimeString(undefined, options);
  
  if (endDate) {
    const formattedEnd = endDate.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    });
    return `${formattedStart} - ${formattedEnd}`;
  }
  
  return formattedStart;
};

// Форматирование даты для react-native-calendars
const formatCalendarDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const EventCalendar: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  
  const [currentView, setCurrentView] = useState<CalendarView>('month');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [events, setEvents] = useState<Event[]>(DUMMY_EVENTS);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>(DUMMY_EVENTS);
  const [filters, setFilters] = useState<Filters>({
    categories: [],
    timeOfDay: [],
    location: 'all',
    userInterests: false,
  });

  // Получаем события для выбранной даты
  const getEventsForSelectedDate = (): Event[] => {
    return filteredEvents.filter(event => {
      if (currentView === 'day') {
        // Для дневного вида - только события на этот день
        return event.date.getDate() === selectedDate.getDate() &&
               event.date.getMonth() === selectedDate.getMonth() &&
               event.date.getFullYear() === selectedDate.getFullYear();
      } else if (currentView === 'week') {
        // Для недельного вида - события на этой неделе
        const eventDate = new Date(event.date);
        const weekStart = new Date(selectedDate);
        weekStart.setDate(selectedDate.getDate() - selectedDate.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        return eventDate >= weekStart && eventDate <= weekEnd;
      }
      // Для месячного вида - все события за месяц
      return event.date.getMonth() === selectedDate.getMonth() &&
             event.date.getFullYear() === selectedDate.getFullYear();
    });
  };

  // Применение фильтров
  useEffect(() => {
    let result = [...DUMMY_EVENTS];
    
    // Фильтрация по категориям
    if (filters.categories.length > 0) {
      result = result.filter(event => 
        event.categories.some(category => filters.categories.includes(category))
      );
    }
    
    // Фильтрация по времени суток
    if (filters.timeOfDay.length > 0) {
      result = result.filter(event => {
        const hour = event.date.getHours();
        
        return (
          (filters.timeOfDay.includes('Morning') && hour >= 6 && hour < 12) ||
          (filters.timeOfDay.includes('Afternoon') && hour >= 12 && hour < 18) ||
          (filters.timeOfDay.includes('Evening') && (hour >= 18 || hour < 6))
        );
      });
    }
    
    // Фильтрация по месту проведения
    if (filters.location !== 'all') {
      result = result.filter(event => 
        (filters.location === 'online' && event.isOnline) ||
        (filters.location === 'offline' && !event.isOnline)
      );
    }
    
    // TODO: Фильтрация по интересам пользователя
    // Требует интеграции с профилем пользователя
    
    setFilteredEvents(result);
  }, [filters]);

  // Подготавливаем данные для календаря
  const getMarkedDates = () => {
    const markedDates: any = {};
    
    filteredEvents.forEach(event => {
      const dateString = formatCalendarDate(event.date);
      markedDates[dateString] = { marked: true, dotColor: '#6366f1' };
    });
    
    // Добавляем выбранную дату
    const selectedDateStr = formatCalendarDate(selectedDate);
    markedDates[selectedDateStr] = { 
      ...(markedDates[selectedDateStr] || {}),
      selected: true,
      selectedColor: '#6366f1'
    };
    
    return markedDates;
  };

  // Создание напоминания
  const toggleReminder = (eventId: string) => {
    // TODO: Реализовать функционал напоминаний
    console.log(`Toggle reminder for event ${eventId}`);
  };

  // Переключение категории в фильтрах
  const toggleCategory = (category: string) => {
    setFilters(prevFilters => {
      const updatedCategories = prevFilters.categories.includes(category)
        ? prevFilters.categories.filter(c => c !== category)
        : [...prevFilters.categories, category];
      
      return { ...prevFilters, categories: updatedCategories };
    });
  };

  // Переключение времени в фильтрах
  const toggleTimeOfDay = (time: string) => {
    setFilters(prevFilters => {
      const updatedTimes = prevFilters.timeOfDay.includes(time)
        ? prevFilters.timeOfDay.filter(t => t !== time)
        : [...prevFilters.timeOfDay, time];
      
      return { ...prevFilters, timeOfDay: updatedTimes };
    });
  };

  // Навигация к деталям события
  const navigateToEventDetails = (eventId: string) => {
    router.push(`/event-details/${eventId}`);
  };

  // Рендер отдельного события
  const renderEvent = ({ item }: { item: Event }) => (
    <TouchableOpacity 
      style={styles.eventCard}
      onPress={() => navigateToEventDetails(item.id)}
    >
      <View style={styles.eventHeader}>
        <Text style={styles.eventTitle}>{item.title}</Text>
        <TouchableOpacity onPress={() => toggleReminder(item.id)}>
          <Bell size={20} color="#6366f1" />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.eventDate}>{formatEventDate(item.date, item.endDate)}</Text>
      
      <View style={styles.eventDetails}>
        <View style={styles.locationContainer}>
          <MapPin size={16} color="#4b5563" />
          <Text style={styles.eventLocation}>
            {item.location} {item.isOnline ? '(Online)' : '(Offline)'}
          </Text>
        </View>
        
        <View style={styles.attendeesContainer}>
          <Text style={styles.eventAttendees}>
            {t('events.attending', { count: item.attendees })}
          </Text>
        </View>
      </View>
      
      <View style={styles.categoriesContainer}>
        {item.categories.map((category, index) => (
          <View key={index} style={styles.categoryTag}>
            <Text style={styles.categoryText}>{category}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );

  // Рендер панели с фильтрами
  const renderFiltersPanel = () => (
    <View style={styles.filtersPanel}>
      <Text style={styles.filterTitle}>{t('events.filters.categories')}</Text>
      <View style={styles.filterOptions}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {ALL_CATEGORIES.map((category, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.filterOption,
                filters.categories.includes(category) && styles.filterOptionActive
              ]}
              onPress={() => toggleCategory(category)}
            >
              <Text 
                style={[
                  styles.filterOptionText,
                  filters.categories.includes(category) && styles.filterOptionTextActive
                ]}
              >
                {category}
              </Text>
              {filters.categories.includes(category) && (
                <Check size={14} color="#fff" style={styles.checkIcon} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      <Text style={styles.filterTitle}>{t('events.filters.time')}</Text>
      <View style={styles.filterOptions}>
        {TIME_OPTIONS.map((time, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.filterOption,
              filters.timeOfDay.includes(time) && styles.filterOptionActive
            ]}
            onPress={() => toggleTimeOfDay(time)}
          >
            <Text 
              style={[
                styles.filterOptionText,
                filters.timeOfDay.includes(time) && styles.filterOptionTextActive
              ]}
            >
              {t(`events.filters.timeOptions.${time.toLowerCase()}`)}
            </Text>
            {filters.timeOfDay.includes(time) && (
              <Check size={14} color="#fff" style={styles.checkIcon} />
            )}
          </TouchableOpacity>
        ))}
      </View>
      
      <Text style={styles.filterTitle}>{t('events.filters.location')}</Text>
      <View style={styles.filterOptions}>
        <TouchableOpacity
          style={[
            styles.filterOption,
            filters.location === 'all' && styles.filterOptionActive
          ]}
          onPress={() => setFilters({...filters, location: 'all'})}
        >
          <Text 
            style={[
              styles.filterOptionText,
              filters.location === 'all' && styles.filterOptionTextActive
            ]}
          >
            {t('events.filters.locationOptions.all')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterOption,
            filters.location === 'online' && styles.filterOptionActive
          ]}
          onPress={() => setFilters({...filters, location: 'online'})}
        >
          <Text 
            style={[
              styles.filterOptionText,
              filters.location === 'online' && styles.filterOptionTextActive
            ]}
          >
            {t('events.filters.locationOptions.online')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterOption,
            filters.location === 'offline' && styles.filterOptionActive
          ]}
          onPress={() => setFilters({...filters, location: 'offline'})}
        >
          <Text 
            style={[
              styles.filterOptionText,
              filters.location === 'offline' && styles.filterOptionTextActive
            ]}
          >
            {t('events.filters.locationOptions.offline')}
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.filterActions}>
        <TouchableOpacity 
          style={styles.closeFiltersButton}
          onPress={() => setShowFilters(false)}
        >
          <Text style={styles.closeFiltersButtonText}>
            {t('events.filters.apply')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Заголовок и переключатели вида */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('events.title')}</Text>
        
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[
              styles.viewButton,
              currentView === 'day' && styles.activeViewButton
            ]}
            onPress={() => setCurrentView('day')}
          >
            <CalendarIcon 
              size={18} 
              color={currentView === 'day' ? '#fff' : '#4b5563'} 
            />
            <Text 
              style={[
                styles.viewButtonText,
                currentView === 'day' && styles.activeViewButtonText
              ]}
            >
              {t('events.views.day')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.viewButton,
              currentView === 'week' && styles.activeViewButton
            ]}
            onPress={() => setCurrentView('week')}
          >
            <CalendarDays 
              size={18} 
              color={currentView === 'week' ? '#fff' : '#4b5563'} 
            />
            <Text 
              style={[
                styles.viewButtonText,
                currentView === 'week' && styles.activeViewButtonText
              ]}
            >
              {t('events.views.week')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.viewButton,
              currentView === 'month' && styles.activeViewButton
            ]}
            onPress={() => setCurrentView('month')}
          >
            <CalendarIcon 
              size={18} 
              color={currentView === 'month' ? '#fff' : '#4b5563'} 
            />
            <Text 
              style={[
                styles.viewButtonText,
                currentView === 'month' && styles.activeViewButtonText
              ]}
            >
              {t('events.views.month')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Кнопка фильтров */}
      <TouchableOpacity 
        style={styles.filtersButton}
        onPress={() => setShowFilters(!showFilters)}
      >
        <Filter size={18} color="#6366f1" />
        <Text style={styles.filtersButtonText}>
          {t('events.filters.title')}
        </Text>
      </TouchableOpacity>
      
      {/* Панель фильтров */}
      {showFilters && renderFiltersPanel()}
      
      {/* Календарь - отображается только в месячном виде */}
      {currentView === 'month' && (
        <Calendar
          style={styles.calendar}
          current={formatCalendarDate(selectedDate)}
          markedDates={getMarkedDates()}
          onDayPress={(day: { timestamp: number }) => {
            setSelectedDate(new Date(day.timestamp));
          }}
          theme={{
            todayTextColor: '#6366f1',
            selectedDayBackgroundColor: '#6366f1',
            dotColor: '#6366f1',
            arrowColor: '#6366f1',
          }}
        />
      )}
      
      {/* Список событий */}
      <View style={styles.eventsContainer}>
        <Text style={styles.eventsTitle}>
          {currentView === 'day' 
            ? t('events.eventsForDay') 
            : currentView === 'week'
              ? t('events.eventsForWeek')
              : t('events.eventsForMonth')
          }
        </Text>
        
        <FlatList
          data={getEventsForSelectedDate()}
          renderItem={renderEvent}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.noEventsText}>{t('events.noEvents')}</Text>
          }
          contentContainerStyle={styles.eventsList}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#e5e7eb',
    borderRadius: 24,
    padding: 4,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  activeViewButton: {
    backgroundColor: '#6366f1',
  },
  viewButtonText: {
    fontSize: 14,
    marginLeft: 4,
    color: '#4b5563',
  },
  activeViewButtonText: {
    color: '#fff',
  },
  filtersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  filtersButtonText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '500',
  },
  filtersPanel: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  filterOptionActive: {
    backgroundColor: '#6366f1',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#4b5563',
  },
  filterOptionTextActive: {
    color: '#fff',
  },
  checkIcon: {
    marginLeft: 4,
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  closeFiltersButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  closeFiltersButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  calendar: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  eventsContainer: {
    flex: 1,
  },
  eventsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  eventsList: {
    paddingBottom: 16,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  eventDate: {
    fontSize: 14,
    color: '#6366f1',
    marginBottom: 12,
  },
  eventDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventLocation: {
    fontSize: 14,
    color: '#4b5563',
    marginLeft: 4,
  },
  attendeesContainer: {},
  eventAttendees: {
    fontSize: 14,
    color: '#4b5563',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryTag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 12,
    color: '#4b5563',
  },
  noEventsText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 40,
  },
});

export default EventCalendar; 