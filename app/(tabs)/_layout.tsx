import { Platform, View } from 'react-native';
import { Tabs } from 'expo-router';
import { Chrome as HomeIcon, Users as UsersIcon, Coffee as CoffeeIcon, User as UserIcon, Calendar as CalendarIcon, Film as VideoIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

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
    <View style={{ flex: 1 }}>
      <Tabs
        initialRouteName="index"
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
            title: t('tabs.discover'),
            tabBarIcon: ({ size, color }) => (
              <HomeIcon {...getIconProps(size, color)} />
            ),
          }}
        />
        <Tabs.Screen
          name="matches"
          options={{
            title: t('tabs.matches'),
            tabBarIcon: ({ size, color }) => (
              <UsersIcon {...getIconProps(size, color)} />
            ),
          }}
        />
        <Tabs.Screen
          name="shorts"
          options={{
            title: t('tabs.shorts'),
            tabBarIcon: ({ size, color }) => (
              <VideoIcon {...getIconProps(size, color)} />
            ),
          }}
        />
        <Tabs.Screen
          name="events"
          options={{
            title: t('tabs.events'),
            tabBarIcon: ({ size, color }) => (
              <CalendarIcon {...getIconProps(size, color)} />
            ),
          }}
        />
        <Tabs.Screen
          name="coffee"
          options={{
            title: t('tabs.coffee'),
            tabBarIcon: ({ size, color }) => (
              <CoffeeIcon {...getIconProps(size, color)} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: t('tabs.profile'),
            tabBarIcon: ({ size, color }) => (
              <UserIcon {...getIconProps(size, color)} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}