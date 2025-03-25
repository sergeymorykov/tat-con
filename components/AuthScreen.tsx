import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { AntDesign, FontAwesome } from '@expo/vector-icons';

// Импортируем константы с URL API
import { API_URL } from '../constants/api';

WebBrowser.maybeCompleteAuthSession();

const AuthScreen = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState('https://via.placeholder.com/150');

  // Конфигурация для Google OAuth
  const [googleRequest, googleResponse, googlePromptAsync] = Google.useAuthRequest({
    clientId: 'YOUR_EXPO_CLIENT_ID',
    iosClientId: 'YOUR_IOS_CLIENT_ID',
    androidClientId: 'YOUR_ANDROID_CLIENT_ID',
    webClientId: 'YOUR_WEB_CLIENT_ID',
  });

  // Конфигурация для Facebook OAuth
  const [fbRequest, fbResponse, fbPromptAsync] = Facebook.useAuthRequest({
    clientId: 'YOUR_FACEBOOK_APP_ID',
  });

  // Функция для обработки VK OAuth
  const handleVKAuth = async () => {
    try {
      setIsLoading(true);
      const result = await WebBrowser.openAuthSessionAsync(
        `https://oauth.vk.com/authorize?client_id=YOUR_VK_CLIENT_ID&display=mobile&redirect_uri=${encodeURIComponent(
          'YOUR_REDIRECT_URI'
        )}&scope=email&response_type=code`,
        'YOUR_REDIRECT_URI'
      );

      if (result.type === 'success' && result.url) {
        const code = result.url.split('code=')[1].split('&')[0];
        // Отправляем код на сервер для обмена на токен
        const response = await axios.post(`${API_URL}/auth/vk`, { code });
        
        if (response.data.token) {
          await AsyncStorage.setItem('token', response.data.token);
          router.replace('/(tabs)');
        }
      }
    } catch (error) {
      console.error('VK OAuth Error:', error);
      Alert.alert(t('auth.error'), t('auth.vkAuthError'));
    } finally {
      setIsLoading(false);
    }
  };

  // Обработка ответа от Google OAuth
  React.useEffect(() => {
    if (googleResponse?.type === 'success') {
      const { id_token } = googleResponse.params;
      handleGoogleToken(id_token);
    }
  }, [googleResponse]);

  // Обработка ответа от Facebook OAuth
  React.useEffect(() => {
    if (fbResponse?.type === 'success') {
      const { access_token } = fbResponse.params;
      handleFacebookToken(access_token);
    }
  }, [fbResponse]);

  // Отправка Google токена на сервер
  const handleGoogleToken = async (idToken: string) => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_URL}/auth/google`, { idToken });
      
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Google Auth Error:', error);
      Alert.alert(t('auth.error'), t('auth.googleAuthError'));
    } finally {
      setIsLoading(false);
    }
  };

  // Отправка Facebook токена на сервер
  const handleFacebookToken = async (accessToken: string) => {
    try {
      setIsLoading(true);
      // Получаем userID с Facebook Graph API
      const userInfoResponse = await axios.get(
        `https://graph.facebook.com/me?access_token=${accessToken}`
      );
      const userID = userInfoResponse.data.id;
      
      const response = await axios.post(`${API_URL}/auth/facebook`, {
        accessToken,
        userID,
      });
      
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Facebook Auth Error:', error);
      Alert.alert(t('auth.error'), t('auth.facebookAuthError'));
    } finally {
      setIsLoading(false);
    }
  };

  // Обработка входа через Email
  const handleEmailLogin = async () => {
    if (!email || !password) {
      return Alert.alert(t('auth.error'), t('auth.emptyFields'));
    }
    
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });
      
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Login Error:', error);
      Alert.alert(t('auth.error'), t('auth.loginError'));
    } finally {
      setIsLoading(false);
    }
  };

  // Обработка регистрации через Email
  const handleEmailRegister = async () => {
    if (!email || !password || !name || !photo) {
      return Alert.alert(t('auth.error'), t('auth.allFieldsRequired'));
    }
    
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_URL}/auth/register`, {
        email,
        password,
        name,
        photo,
      });
      
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Register Error:', error);
      Alert.alert(t('auth.error'), t('auth.registerError'));
    } finally {
      setIsLoading(false);
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    // Сбрасываем поля при переключении форм
    setEmail('');
    setPassword('');
    setName('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/logo.png')}
            style={styles.logo}
          />
          <Text style={styles.title}>TatCon</Text>
          <Text style={styles.subtitle}>
            {t(isLogin ? 'auth.welcomeBack' : 'auth.createAccount')}
          </Text>
        </View>

        <View style={styles.formContainer}>
          {!isLogin && (
            <TextInput
              style={styles.input}
              placeholder={t('auth.name')}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          )}
          
          <TextInput
            style={styles.input}
            placeholder={t('auth.email')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <TextInput
            style={styles.input}
            placeholder={t('auth.password')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={isLogin ? handleEmailLogin : handleEmailRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {t(isLogin ? 'auth.login' : 'auth.register')}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkButton} onPress={toggleForm}>
            <Text style={styles.linkButtonText}>
              {t(isLogin ? 'auth.noAccount' : 'auth.haveAccount')}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>{t('auth.orContinueWith')}</Text>
          <View style={styles.divider} />
        </View>

        <View style={styles.socialButtons}>
          <TouchableOpacity
            style={[styles.socialButton, styles.googleButton]}
            onPress={() => googlePromptAsync()}
            disabled={isLoading}
          >
            <AntDesign name="google" size={24} color="#4285F4" style={styles.socialIcon} />
            <Text style={styles.socialButtonText}>{t('auth.google')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.socialButton, styles.facebookButton]}
            onPress={() => fbPromptAsync()}
            disabled={isLoading}
          >
            <FontAwesome name="facebook" size={24} color="#1877F2" style={styles.socialIcon} />
            <Text style={styles.socialButtonText}>{t('auth.facebook')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.socialButton, styles.vkButton]}
            onPress={handleVKAuth}
            disabled={isLoading}
          >
            <FontAwesome name="vk" size={24} color="#4A76A8" style={styles.socialIcon} />
            <Text style={styles.socialButtonText}>{t('auth.vk')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6366f1',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  formContainer: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: '#6366f1',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    alignItems: 'center',
    padding: 10,
  },
  linkButtonText: {
    color: '#6366f1',
    fontSize: 14,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#666',
    fontSize: 14,
  },
  socialButtons: {
    gap: 15,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
  },
  googleButton: {
    borderColor: '#4285F4',
  },
  facebookButton: {
    borderColor: '#1877F2',
  },
  vkButton: {
    borderColor: '#4A76A8',
  },
  socialIcon: {
    marginRight: 10,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default AuthScreen; 