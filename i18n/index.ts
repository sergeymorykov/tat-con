import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import en from './locales/en';
import ru from './locales/ru';
import tt from './locales/tt';

// Ресурсы для локализации
const resources = {
  ru: {
    translation: ru
  },
  en: {
    translation: en
  },
  tt: {
    translation: tt
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: Localization.getLocales()[0]?.languageCode || 'ru',
    fallbackLng: 'ru',
    interpolation: {
      escapeValue: false
    },
    compatibilityJSON: 'v4'
  });

export default i18n;