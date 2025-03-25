import React, { useMemo, useEffect } from 'react';
import { StatusBar } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import EventDetailScreen from '@/components/EventDetailScreen';
import { setupNotifications } from '@/utils/notifications';

// Демо-данные для событий - в реальном приложении будут загружаться с сервера
const DUMMY_EVENTS = [
  {
    id: '1',
    title: 'Web Development Workshop',
    description: 'Узнайте основы веб-разработки на этом практическом семинаре. Мы рассмотрим HTML, CSS и основы JavaScript. Это мероприятие идеально подходит для начинающих разработчиков, которые хотят улучшить свои навыки создания веб-страниц. \n\nПринесите свой ноутбук, чтобы следовать за инструктором. Будет предоставлен доступ к Wi-Fi и розеткам.',
    date: new Date(2025, 3, 15, 14, 0), // 15 апреля 2025, 14:00
    endDate: new Date(2025, 3, 15, 16, 0), // 15 апреля 2025, 16:00
    location: 'Tech Lab 101',
    isOnline: false,
    categories: ['Programming', 'Web Development'],
    attendees: 24,
    organizer: 'IT Student Association',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=500&auto=format&fit=crop'
  },
  {
    id: '2',
    title: 'AI Conference',
    description: 'Конференция по искусственному интеллекту с ведущими экспертами. Узнайте о последних достижениях в области машинного обучения, нейронных сетей и применении ИИ в различных отраслях. Конференция включает в себя презентации, панельные дискуссии и возможности для нетворкинга.\n\nМероприятие проводится онлайн, ссылка для подключения будет отправлена зарегистрированным участникам за час до начала.',
    date: new Date(2025, 3, 22, 10, 0), // 22 апреля 2025, 10:00
    endDate: new Date(2025, 3, 22, 18, 0), // 22 апреля 2025, 18:00
    location: 'Online Zoom Meeting',
    isOnline: true,
    categories: ['AI', 'Machine Learning', 'Technology'],
    attendees: 78,
    organizer: 'Research Lab',
    image: 'https://images.unsplash.com/photo-1591453089816-0fbb971b454c?w=500&auto=format&fit=crop'
  },
  {
    id: '3',
    title: 'Mobile Development Meetup',
    description: 'Встреча для разработчиков мобильных приложений. Обсудим последние тренды, фреймворки и поделимся опытом создания успешных приложений для iOS и Android. В программе: доклады от опытных разработчиков, демонстрации проектов и неформальное общение.\n\nПосле основной части мероприятия будет организована нетворкинг-сессия с легкими закусками и напитками.',
    date: new Date(2025, 3, 5, 18, 30), // 5 апреля 2025, 18:30
    endDate: new Date(2025, 3, 5, 20, 0), // 5 апреля 2025, 20:00
    location: 'Digital Hub',
    isOnline: false,
    categories: ['Mobile', 'iOS', 'Android'],
    attendees: 42,
    organizer: 'Mobile Developers Community',
    image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=500&auto=format&fit=crop'
  },
  {
    id: '4',
    title: 'UX/UI Design Workshop',
    description: 'Практический семинар по дизайну пользовательского интерфейса. Научитесь создавать привлекательные и удобные интерфейсы, которые улучшают пользовательский опыт. Мы рассмотрим принципы UX/UI дизайна, работу с Figma и процесс создания прототипов.\n\nВо время семинара будут практические задания, которые помогут закрепить полученные знания.',
    date: new Date(2025, 3, 10, 15, 0), // 10 апреля 2025, 15:00
    endDate: new Date(2025, 3, 10, 17, 0), // 10 апреля 2025, 17:00
    location: 'Design Studio',
    isOnline: false,
    categories: ['Design', 'UI/UX'],
    attendees: 30,
    organizer: 'Creative Design Club',
    image: 'https://images.unsplash.com/photo-1587440871875-191322ee64b0?w=500&auto=format&fit=crop'
  },
  {
    id: '5',
    title: 'Data Science Webinar',
    description: 'Онлайн вебинар по анализу данных и машинному обучению. В программе: основы статистического анализа, работа с библиотеками Python для обработки данных, визуализация результатов и введение в алгоритмы машинного обучения.\n\nДля участия необходимы базовые знания программирования. Запись вебинара будет доступна всем зарегистрированным участникам.',
    date: new Date(2025, 3, 18, 12, 0), // 18 апреля 2025, 12:00
    endDate: new Date(2025, 3, 18, 13, 30), // 18 апреля 2025, 13:30
    location: 'Online Streaming',
    isOnline: true,
    categories: ['Data Science', 'Statistics'],
    attendees: 65,
    organizer: 'Data Science Hub',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&auto=format&fit=crop'
  },
];

export default function EventDetailsPage() {
  // Получаем id события из параметров URL
  const { id } = useLocalSearchParams<{ id: string }>();
  
  // Находим событие по id
  const event = useMemo(() => {
    return DUMMY_EVENTS.find(event => event.id === id);
  }, [id]);
  
  // Инициализируем уведомления при загрузке страницы
  useEffect(() => {
    const initNotifications = async () => {
      await setupNotifications();
    };
    
    initNotifications();
  }, []);

  return (
    <>
      <StatusBar barStyle="light-content" />
      <EventDetailScreen event={event} />
    </>
  );
} 