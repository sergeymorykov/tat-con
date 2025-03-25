import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity, 
  Animated,
  ActivityIndicator 
} from 'react-native';
import { useEvent } from 'expo';
import { useVideoPlayer, VideoView, VideoPlayerStatus } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import Carousel from 'react-native-snap-carousel';
import * as Haptics from 'expo-haptics';

// Типы для Carousel
type CarouselRef = any; // Тип для ссылки на карусель

// Получаем размер экрана
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Тип данных для события
interface EventData {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  registeredUsers: number;
  votes: number;
  tags: string[];
}

// Компонент для отдельного видео
const EventVideoItem = ({ item, isActive }: { item: EventData, isActive: boolean }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(-50)).current;
  const descriptionAnim = useRef(new Animated.Value(-30)).current;
  const tagsAnim = useRef(new Animated.Value(30)).current;
  const statsAnim = useRef(new Animated.Value(30)).current;
  const [loading, setLoading] = useState(true);

  // Создаем плеер для видео
  const player = useVideoPlayer(require('../assets/videos/coding_background.mp4'), player => {
    player.loop = true;
    if (isActive) {
      player.play();
    }
  });

  // Отслеживаем изменения состояния воспроизведения
  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });
  
  // Отслеживаем загрузку видео
  const { status } = useEvent(player, 'statusChange', { status: player.status });
  
  // Обновляем статус загрузки
  useEffect(() => {
    if (status === 'readyToPlay') {
      setLoading(false);
    }
  }, [status]);

  // Управляем воспроизведением при изменении активности
  useEffect(() => {
    if (isActive) {
      player.play();
      
      // Анимация появления элементов
      Animated.stagger(200, [
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(titleAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(descriptionAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(tagsAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(statsAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      player.pause();
      
      // Сбрасываем анимации
      fadeAnim.setValue(0);
      titleAnim.setValue(-50);
      descriptionAnim.setValue(-30);
      tagsAnim.setValue(30);
      statsAnim.setValue(30);
    }
  }, [isActive, player]);

  return (
    <View style={styles.videoContainer}>
      {/* Фоновое видео */}
      <VideoView
        player={player}
        style={styles.video}
        contentFit="cover"
      />
      
      {/* Затемнение для лучшей читаемости текста */}
      <View style={styles.overlay} />
      
      {/* Индикатор загрузки */}
      {loading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
      
      {/* Контент */}
      <Animated.View 
        style={[
          styles.contentContainer, 
          { opacity: fadeAnim }
        ]}
      >
        {/* Заголовок */}
        <Animated.Text 
          style={[
            styles.title, 
            { transform: [{ translateY: titleAnim }] }
          ]}
        >
          {item.title}
        </Animated.Text>
        
        {/* Описание */}
        <Animated.Text 
          style={[
            styles.description, 
            { transform: [{ translateY: descriptionAnim }] }
          ]}
          numberOfLines={4}
        >
          {item.description}
        </Animated.Text>
        
        {/* Теги */}
        <Animated.View 
          style={[
            styles.tagsContainer, 
            { transform: [{ translateX: tagsAnim }] }
          ]}
        >
          {item.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </Animated.View>
        
        {/* Статистика */}
        <Animated.View 
          style={[
            styles.statsContainer, 
            { transform: [{ translateX: statsAnim }] }
          ]}
        >
          <View style={styles.statItem}>
            <Ionicons name="people-outline" size={18} color="#fff" />
            <Text style={styles.statText}>{item.registeredUsers} участников</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="heart-outline" size={18} color="#fff" />
            <Text style={styles.statText}>{item.votes} голосов</Text>
          </View>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

// Основной компонент карусели видео
const EventShortVideo = () => {
  const carouselRef = useRef<CarouselRef>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Демо-данные для карусели
  const events: EventData[] = [
    {
      id: '1',
      title: 'Web Development Workshop',
      description: 'Присоединяйтесь к нашему мастер-классу по веб-разработке, который пройдет 15 февраля 2024 года в Tech Lab 101. Это мероприятие идеально подходит для тех, кто интересуется программированием и созданием веб-приложений.',
      date: '15 февраля 2024',
      location: 'Tech Lab 101',
      registeredUsers: 24,
      votes: 45,
      tags: ['Programming', 'Web Dev'],
    },
    {
      id: '2',
      title: 'AI Conference',
      description: 'Изучите будущее искусственного интеллекта на нашей конференции. Ведущие эксперты расскажут о последних достижениях в области машинного обучения и нейронных сетей.',
      date: '22 марта 2024',
      location: 'Innovation Center',
      registeredUsers: 78,
      votes: 120,
      tags: ['AI', 'Machine Learning'],
    },
    {
      id: '3',
      title: 'Mobile Dev Meetup',
      description: 'Встреча для разработчиков мобильных приложений. Обсудим новые тренды, фреймворки и поделимся опытом создания успешных приложений для iOS и Android.',
      date: '5 апреля 2024',
      location: 'Digital Hub',
      registeredUsers: 42,
      votes: 67,
      tags: ['Mobile', 'iOS', 'Android'],
    },
  ];

  // Рендер отдельного элемента карусели
  const renderItem = ({ item, index }: { item: EventData, index: number }) => {
    return <EventVideoItem item={item} isActive={index === activeIndex} />;
  };

  // Обработка смены активного слайда
  const onSnapToItem = (index: number) => {
    setActiveIndex(index);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); // Тактильный отклик
  };

  return (
    <View style={styles.container}>
      <Carousel
        ref={carouselRef}
        data={events}
        renderItem={renderItem}
        sliderHeight={screenHeight}
        itemHeight={screenHeight}
        vertical={true}
        onSnapToItem={onSnapToItem}
        inactiveSlideOpacity={1}
        inactiveSlideScale={1}
        activeSlideAlignment={'center'}
        windowSize={1}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    width: screenWidth,
    height: screenHeight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Полупрозрачное затемнение
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    position: 'absolute',
    padding: 20,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  description: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 5,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 7,
    margin: 5,
  },
  tagText: {
    color: '#fff',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statText: {
    color: '#fff',
    marginLeft: 5,
    fontWeight: '500',
  },
});

export default EventShortVideo; 