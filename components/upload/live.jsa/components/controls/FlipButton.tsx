// Powered by OnSpace.AI
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { FontSize } from '@/constants/theme';

interface FlipButtonProps {
  onFlip: () => void;
}

export default function FlipButton({ onFlip }: FlipButtonProps) {
  return (
    <TouchableOpacity style={styles.btn} onPress={onFlip} activeOpacity={0.8}>
      <MaterialIcons name="flip-camera-ios" size={28} color="#fff" />
      <Text style={styles.label}>Flip</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { alignItems: 'center', justifyContent: 'center', gap: 4, width: 52, minHeight: 44 },
  label: { fontSize: FontSize.xs, color: '#ffffffBB', fontWeight: '500' },
});
