import { useColorScheme as _useColorScheme } from 'react-native';

export type ColorScheme = 'light' | 'dark';

export function useColorScheme(): ColorScheme {
  const colorScheme = _useColorScheme();
  return colorScheme === 'dark' ? 'dark' : 'light';
} 