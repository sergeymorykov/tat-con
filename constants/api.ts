// URL для Backend API
export const API_URL = 'https://api.tatcon.com/api';

// Типы запросов к API
export enum ApiEndpoints {
  AUTH = '/auth',
  PROFILE = '/profile',
  EVENTS = '/events',
  MATCHES = '/matches',
  MESSAGES = '/messages',
}

// Конфигурация для OAuth
export const OAUTH_CONFIG = {
  GOOGLE: {
    EXPO_CLIENT_ID: 'YOUR_EXPO_CLIENT_ID',
    IOS_CLIENT_ID: 'YOUR_IOS_CLIENT_ID',
    ANDROID_CLIENT_ID: 'YOUR_ANDROID_CLIENT_ID', 
    WEB_CLIENT_ID: 'YOUR_WEB_CLIENT_ID',
  },
  FACEBOOK: {
    APP_ID: 'YOUR_FACEBOOK_APP_ID',
  },
  VK: {
    CLIENT_ID: 'YOUR_VK_CLIENT_ID',
    REDIRECT_URI: 'YOUR_REDIRECT_URI',
  }
}; 