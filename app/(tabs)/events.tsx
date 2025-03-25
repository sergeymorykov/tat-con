import React from 'react';
import { View, StyleSheet, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import EventCalendar from '@/components/EventCalendar';

export default function EventsScreen() {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#f3f4f6"
      />
      
      <Stack.Screen
        options={{
          title: t('events.title'),
          headerStyle: {
            backgroundColor: '#f3f4f6',
          },
          headerShadowVisible: false,
          headerBackVisible: false,
        }}
      />
      
      <View style={styles.content}>
        <EventCalendar />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  content: {
    flex: 1,
  },
}); 