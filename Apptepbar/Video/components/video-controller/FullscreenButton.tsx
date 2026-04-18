import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FullscreenButtonProps {
  color?: string;
  size?: number;
  onPress: () => void;
}

export function FullscreenButton({ color = '#FFFFFF', size = 22, onPress }: FullscreenButtonProps) {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      activeOpacity={0.7}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Ionicons name="expand-outline" size={size} color={color} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
});
