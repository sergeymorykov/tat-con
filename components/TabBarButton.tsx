import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, ViewStyle, StyleProp } from 'react-native';
import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';

// Компонент кнопки для таб-бара с возможностью переопределения onPress
export const TabBarButton = (props: BottomTabBarButtonProps & { 
  onPress?: () => void 
}) => {
  // Используем переданный onPress вместо стандартного, если он определен
  const handlePress = () => {
    if (props.onPress) {
      props.onPress();
    } else if (props.onPress) {
      props.onPress();
    }
  };

  return (
    <TouchableOpacity
      {...props}
      onPress={handlePress}
      style={props.style as StyleProp<ViewStyle>}
    >
      {props.children}
    </TouchableOpacity>
  );
}; 