import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

export default function LanguageSelector() {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ru', name: 'Русский' },
    { code: 'tt', name: 'Татарча' },
  ];

  return (
    <View style={styles.container}>
      {languages.map((lang) => (
        <TouchableOpacity
          key={lang.code}
          style={[
            styles.button,
            i18n.language === lang.code && styles.activeButton,
          ]}
          onPress={() => i18n.changeLanguage(lang.code)}>
          <Text
            style={[
              styles.buttonText,
              i18n.language === lang.code && styles.activeButtonText,
            ]}>
            {lang.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    padding: 8,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  activeButton: {
    backgroundColor: '#6366f1',
  },
  buttonText: {
    fontSize: 14,
    color: '#4b5563',
  },
  activeButtonText: {
    color: 'white',
  },
});