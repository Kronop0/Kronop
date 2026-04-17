import React, { useState } from 'react';
import { Pressable, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../constants/theme';

interface StarButtonProps {
  isFavorite: boolean;
  onPress: () => void;
  size?: number;
}

export function StarButton({ isFavorite, onPress, size = 24 }: StarButtonProps) {
  const [scale] = useState(new Animated.Value(1));

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scale, {
        toValue: 1.4,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable onPress={handlePress} hitSlop={12}>
        <MaterialIcons
          name={isFavorite ? 'star' : 'star-border'}
          size={size}
          color={isFavorite ? colors.primaryLight : colors.iconInactive}
        />
      </Pressable>
    </Animated.View>
  );
}
