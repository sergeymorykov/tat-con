import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity, 
  Animated, 
  FlatList,
  Image,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEventListener } from 'expo';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  Heart, 
  Share, 
  Calendar, 
  MapPin, 
  Users,
  ChevronUp,
  ChevronDown
} from 'lucide-react-native';
import { useColorScheme } from '../hooks/useColorScheme';
import { Colors } from '../constants/Colors';

// Интерфейс для данных короткого ролика
interface EventShort {
  id: string;
  eventId: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  date: Date;
  location: string;
  isOnline: boolean;
  attendees: number;
  likes: number;
  categories: string[];
}

// Демо-данные для роликов
const DEMO_SHORTS: EventShort[] = [
  {
    id: 'short1',
    eventId: '1',
    title: 'Web Development Workshop',
    description: 'Научитесь создавать современные веб-приложения под руководством опытных профессионалов. Идеально для начинающих!',
    videoUrl: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=500&auto=format&fit=crop',
    date: new Date(2025, 3, 15, 14, 0),
    location: 'Tech Lab 101',
    isOnline: false,
    attendees: 24,
    likes: 45,
    categories: ['Programming', 'Web Development'],
  },
  {
    id: 'short2',
    eventId: '2',
    title: 'AI Conference',
    description: 'Погрузитесь в мир искусственного интеллекта! Уникальная возможность узнать о последних достижениях от ведущих экспертов.',
    videoUrl: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1591453089816-0fbb971b454c?w=500&auto=format&fit=crop',
    date: new Date(2025, 3, 22, 10, 0),
    location: 'Online Zoom Meeting',
    isOnline: true,
    attendees: 78,
    likes: 120,
    categories: ['AI', 'Machine Learning'],
  },
  {
    id: 'short3',
    eventId: '3',
    title: 'Mobile Development Meetup',
    description: 'Встреча для разработчиков мобильных приложений. Реальные кейсы, нетворкинг и обмен опытом в дружеской атмосфере.',
    videoUrl: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=500&auto=format&fit=crop',
    date: new Date(2025, 3, 5, 18, 30),
    location: 'Digital Hub',
    isOnline: false,
    attendees: 42,
    likes: 37,
    categories: ['Mobile', 'iOS', 'Android'],
  },
  {
    id: 'short4',
    eventId: '4',
    title: 'UX/UI Design Workshop',
    description: 'Ваш шанс освоить практические навыки дизайна интерфейсов! Создавайте привлекательные и удобные продукты с первого раза.',
    videoUrl: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1587440871875-191322ee64b0?w=500&auto=format&fit=crop',
    date: new Date(2025, 3, 10, 15, 0),
    location: 'Design Studio',
    isOnline: false,
    attendees: 30,
    likes: 62,
    categories: ['Design', 'UI/UX'],
  },
  {
    id: 'short5',
    eventId: '5',
    title: 'Data Science Webinar',
    description: 'Станьте экспертом в области анализа данных! Практические примеры и техники, которые сразу можно применить в работе.',
    videoUrl: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&auto=format&fit=crop',
    date: new Date(2025, 3, 18, 12, 0),
    location: 'Online Streaming',
    isOnline: true,
    attendees: 65,
    likes: 53,
    categories: ['Data Science', 'Statistics'],
  },
];

// Ключ для хранения лайков
const LIKED_SHORTS_STORAGE_KEY = 'user_liked_shorts';

// Формат даты для отображения
const formatDate = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = { 
    day: 'numeric', 
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  };
  return date.toLocaleDateString(undefined, options);
};

export default function EventShorts() {
  const router = useRouter();
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  
  const [shorts, setShorts] = useState<EventShort[]>(DEMO_SHORTS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [userLiked, setUserLiked] = useState<Record<string, boolean>>({});
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<boolean>(true);
  
  // Создаем видео плеер для текущего видео
  const videoPlayer = useVideoPlayer(
    shorts[currentIndex]?.videoUrl, 
    (player) => {
      player.loop = false;
      if (isPlaying) {
        player.play();
      }
      // Установка интервала событий обновления времени
      player.timeUpdateEventInterval = 1;
    }
  );
  
  // Отслеживаем событие окончания видео
  useEventListener(videoPlayer, "playToEnd", () => {
    handleVideoEnd();
  });

  const flatListRef = useRef<FlatList>(null);
  const opacityAnim = useRef(new Animated.Value(1)).current;
  
  // Загрузка лайков из AsyncStorage при монтировании
  useEffect(() => {
    const loadLikedShorts = async () => {
      try {
        // Сначала имитируем загрузку для демонстрационных целей
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const likedShortsJson = await AsyncStorage.getItem(LIKED_SHORTS_STORAGE_KEY);
        if (likedShortsJson) {
          const likedShorts = JSON.parse(likedShortsJson);
          setUserLiked(likedShorts);
          
          // Обновляем счетчик лайков в зависимости от сохраненных лайков
          const updatedShorts = shorts.map(short => {
            if (likedShorts[short.id]) {
              // Если пользователь уже лайкнул это видео
              return { ...short };
            }
            return short;
          });
          
          setShorts(updatedShorts);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Ошибка при загрузке лайкнутых шортс:', error);
        setLoading(false);
      }
    };
    
    loadLikedShorts();
  }, []);
  
  // Обработчик по завершению видео
  const handleVideoEnd = () => {
    if (currentIndex < shorts.length - 1) {
      goToNextVideo();
    } else {
      // Если это последнее видео, начинаем сначала
      flatListRef.current?.scrollToIndex({ index: 0, animated: true });
    }
  };
  
  // Переход к следующему видео
  const goToNextVideo = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < shorts.length) {
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    }
  };
  
  // Переход к предыдущему видео
  const goToPrevVideo = () => {
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      flatListRef.current?.scrollToIndex({ index: prevIndex, animated: true });
    }
  };
  
  // Обработчик лайка с сохранением в AsyncStorage
  const handleLike = async (shortId: string) => {
    try {
      const newLiked = { ...userLiked };
      newLiked[shortId] = !newLiked[shortId];
      
      // Обновляем состояние
      setUserLiked(newLiked);
      
      // Обновляем счетчик лайков
      setShorts(prev => 
        prev.map(short => 
          short.id === shortId
            ? { 
                ...short, 
                likes: newLiked[shortId] ? short.likes + 1 : short.likes - 1 
              }
            : short
        )
      );
      
      // Сохраняем в AsyncStorage
      await AsyncStorage.setItem(LIKED_SHORTS_STORAGE_KEY, JSON.stringify(newLiked));
    } catch (error) {
      console.error('Ошибка при сохранении лайка:', error);
    }
  };
  
  // Переход к экрану деталей события
  const navigateToEventDetails = (eventId: string) => {
    setIsPlaying(false);
    videoPlayer.pause();
    router.push(`/event-details/${eventId}`);
  };
  
  // Поделиться событием
  const handleShare = (short: EventShort) => {
    // В реальном приложении здесь будет код для шаринга
    console.log(`Поделиться событием: ${short.title}`);
  };
  
  // Обработчик переключения отображения деталей
  const toggleDetails = (shortId: string) => {
    setShowDetails(prev => ({
      ...prev,
      [shortId]: !prev[shortId]
    }));
  };
  
  // Обработка паузы/воспроизведения видео
  const handlePlayPause = () => {
    if (isPlaying) {
      videoPlayer.pause();
    } else {
      videoPlayer.play();
    }
    setIsPlaying(!isPlaying);
  };
  
  // Анимация при скролле между видео
  const fadeInOut = () => {
    Animated.sequence([
      Animated.timing(opacityAnim, {
        toValue: 0.7,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };
  
  // Обработчик изменения видимого видео
  const handleViewableItemsChanged = ({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const index = viewableItems[0].index;
      if (index !== currentIndex) {
        setCurrentIndex(index);
        fadeInOut();
      }
    }
  };
  
  // Рендер отдельного видео
  const renderShort = ({ item, index }: { item: EventShort; index: number }) => {
    const isCurrentlyVisible = index === currentIndex;
    const isDetailVisible = showDetails[item.id] || false;
    
    return (
      <Animated.View 
        style={[
          styles.shortContainer, 
          { opacity: isCurrentlyVisible ? opacityAnim : 0.5 }
        ]}
      >
        <TouchableOpacity
          style={styles.videoWrapper}
          activeOpacity={0.9}
          onPress={handlePlayPause}
        >
          {!isCurrentlyVisible ? (
            <Image 
              source={{ uri: item.thumbnailUrl }} 
              style={styles.thumbnail}
              resizeMode="cover" 
            />
          ) : (
            <VideoView 
              style={styles.video}
              player={videoPlayer} 
            />
          )}
          
          {/* Оверлей с информацией о событии */}
          <View style={styles.overlay}>
            {/* Верхние кнопки навигации */}
            <View style={styles.navButtons}>
              {index > 0 && (
                <TouchableOpacity 
                  style={styles.navButton} 
                  onPress={goToPrevVideo}
                >
                  <ChevronUp size={24} color="#fff" />
                </TouchableOpacity>
              )}
              
              {index < shorts.length - 1 && (
                <TouchableOpacity 
                  style={styles.navButton} 
                  onPress={goToNextVideo}
                >
                  <ChevronDown size={24} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
            
            {/* Правая панель с кнопками действий */}
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleLike(item.id)}
              >
                <Heart 
                  size={28} 
                  color={userLiked[item.id] ? "#ff4d6d" : "#fff"} 
                  fill={userLiked[item.id] ? "#ff4d6d" : "transparent"} 
                />
                <Text style={styles.actionText}>
                  {item.likes + (userLiked[item.id] ? 1 : 0)}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleShare(item)}
              >
                <Share size={28} color="#fff" />
                <Text style={styles.actionText}>{t('events.shorts.share')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => navigateToEventDetails(item.eventId)}
              >
                <Calendar size={28} color="#fff" />
                <Text style={styles.actionText}>{t('events.shorts.attend')}</Text>
              </TouchableOpacity>
            </View>
            
            {/* Информация о событии */}
            <View style={styles.eventInfo}>
              <TouchableOpacity
                style={styles.detailsButton}
                onPress={() => toggleDetails(item.id)}
              >
                <Text style={styles.eventTitle}>{item.title}</Text>
                {isDetailVisible ? (
                  <ChevronUp size={20} color="#fff" />
                ) : (
                  <ChevronDown size={20} color="#fff" />
                )}
              </TouchableOpacity>
              
              {isDetailVisible ? (
                <View style={styles.eventDetails}>
                  <Text style={styles.eventDescription}>{item.description}</Text>
                  
                  <View style={styles.eventMeta}>
                    <View style={styles.metaItem}>
                      <Calendar size={16} color="#fff" style={styles.metaIcon} />
                      <Text style={styles.metaText}>{formatDate(item.date)}</Text>
                    </View>
                    
                    <View style={styles.metaItem}>
                      <MapPin size={16} color="#fff" style={styles.metaIcon} />
                      <Text style={styles.metaText}>
                        {item.location} {item.isOnline ? `(${t('events.details.online')})` : ''}
                      </Text>
                    </View>
                    
                    <View style={styles.metaItem}>
                      <Users size={16} color="#fff" style={styles.metaIcon} />
                      <Text style={styles.metaText}>
                        {t('events.attending', { count: item.attendees })}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.categories}>
                    {item.categories.map((category, idx) => (
                      <View key={idx} style={styles.category}>
                        <Text style={styles.categoryText}>{category}</Text>
                      </View>
                    ))}
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.attendButton}
                    onPress={() => navigateToEventDetails(item.eventId)}
                  >
                    <Text style={styles.attendButtonText}>
                      {t('events.shorts.learnMore')}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Text 
                  style={styles.eventDescription}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {item.description}
                </Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            {t('events.shorts.loading')}
          </Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={shorts}
          windowSize={4}
          initialNumToRender={1}
          disableIntervalMomentum={true}
          maxToRenderPerBatch={2}
          removeClippedSubviews={true}          
          renderItem={renderShort}
          viewabilityConfig={{
            itemVisiblePercentThreshold: 50
          }}
          keyExtractor={(item) => item.id}        
          snapToInterval={Dimensions.get('window').height}
          snapToAlignment="start"
          decelerationRate="normal"
          onViewableItemsChanged={handleViewableItemsChanged}
        />
      )}
    </View>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  shortContainer: {
    width,
    height,
  },
  videoWrapper: {
    flex: 1,
  },
  video: {
    flex: 1,
  },
  thumbnail: {
    flex: 1,
    backgroundColor: '#222',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  navButtons: {
    position: 'absolute',
    right: 16,
    top: 60,
    zIndex: 10,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionButtons: {
    position: 'absolute',
    right: 16,
    bottom: 140,
    alignItems: 'center',
  },
  actionButton: {
    alignItems: 'center',
    marginBottom: 16,
  },
  actionText: {
    color: '#fff',
    marginTop: 4,
    fontSize: 12,
  },
  eventInfo: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 76,
    justifyContent: 'flex-end',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  eventTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    flex: 1,
  },
  eventDescription: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 2,
  },
  eventDetails: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    padding: 12,
  },
  eventMeta: {
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  metaIcon: {
    marginRight: 8,
  },
  metaText: {
    color: '#fff',
    fontSize: 14,
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  category: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 6,
    marginBottom: 6,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
  },
  attendButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  attendButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
}); 