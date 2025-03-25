import React from 'react';
import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

export default function NotFoundScreen() {
  const { t } = useTranslation();
  
  return (
    <>
      <Stack.Screen options={{ title: t('common.error') }} />
      <View style={styles.container}>
        <Text style={styles.text}>{t('common.notFound')}</Text>
        <Link href="/" style={styles.link}>
          <Text>{t('common.goToHome')}</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  text: {
    fontSize: 20,
    fontWeight: '600',
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
