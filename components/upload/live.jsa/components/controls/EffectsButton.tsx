// Powered by OnSpace.AI
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize } from '@/constants/theme';
import { CameraEffect } from '@/constants/effectsData';

interface EffectsButtonProps {
  selectedEffect: CameraEffect;
  onPress: () => void;
}

export default function EffectsButton({ selectedEffect, onPress }: EffectsButtonProps) {
  const isActive = selectedEffect.id !== 'none';
  return (
    <TouchableOpacity style={styles.btn} onPress={onPress} activeOpacity={0.8}>
      <Ionicons
        name="sparkles-outline"
        size={24}
        color={isActive ? Colors.primary : '#fff'}
      />
      <Text style={[styles.label, isActive && styles.labelActive]}>
        {isActive ? selectedEffect.name : 'Effects'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { alignItems: 'center', gap: 4, width: 52, minHeight: 44 },
  label: { fontSize: FontSize.xs, color: '#ffffffBB', fontWeight: '500' },
  labelActive: { color: Colors.primary },
});
