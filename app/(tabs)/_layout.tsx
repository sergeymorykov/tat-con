import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Chrome as HomeIcon, Users as UsersIcon, Calendar as CalendarIcon, Coffee as CoffeeIcon, User as UserIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '@/components/LanguageSelector';

export default function TabLayout() {
  const { t } = useTranslation();

  // Platform-specific icon props
  const getIconProps = (size: number, color: string) => {
    return Platform.select({
      web: { size, color },
      default: { 
        size, 
        color,
        accessibilityHint: 'Tab icon',
        accessibilityLabel: 'Navigation tab icon'
      },
    });
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e5e5e5',
        },
        tabBarActiveTintColor: '#6366f1',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('discover'),
          tabBarIcon: ({ size, color }) => (
            <HomeIcon {...getIconProps(size, color)} />
          ),
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          title: t('matches'),
          tabBarIcon: ({ size, color }) => (
            <UsersIcon {...getIconProps(size, color)} />
          ),
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: t('events'),
          tabBarIcon: ({ size, color }) => (
            <CalendarIcon {...getIconProps(size, color)} />
          ),
        }}
      />
      <Tabs.Screen
        name="coffee"
        options={{
          title: t('coffee'),
          tabBarIcon: ({ size, color }) => (
            <CoffeeIcon {...getIconProps(size, color)} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('profile'),
          tabBarIcon: ({ size, color }) => (
            <UserIcon {...getIconProps(size, color)} />
          ),
        }}
      />
    </Tabs>
  );
}