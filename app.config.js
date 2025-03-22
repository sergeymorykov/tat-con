// Базовая конфигурация для управления настройками Expo
module.exports = {
  name: "Ваше Приложение",
  slug: "ваше-приложение",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  updates: {
    fallbackToCacheTimeout: 0
  },
  assetBundlePatterns: [
    "**/*"
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.yourcompany.yourappname"
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#FFFFFF"
    },
    package: "com.yourcompany.yourappname"
  },
  web: {
    favicon: "./assets/favicon.png"
  },
  // Отключение новой архитектуры для совместимости с неподдерживаемыми библиотеками
  plugins: [
    [
      "expo-build-properties",
      {
        android: {
          newArchEnabled: false,
        },
        ios: {
          newArchEnabled: false,
        },
      },
    ],
  ],
  extra: {
    eas: {
      projectId: "ваш-eas-project-id"
    }
  }
}; 