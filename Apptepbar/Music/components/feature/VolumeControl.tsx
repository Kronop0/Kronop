import React from 'react';
import { View, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing } from '../../constants/theme';

interface VolumeControlProps {
  volume: number;
  onVolumeChange: (value: number) => void;
}

export function VolumeControl({ volume, onVolumeChange }: VolumeControlProps) {
  return (
    <View style={styles.container}>
      <MaterialIcons name="volume-down" size={24} color={colors.textSecondary} />
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={1}
        value={volume}
        onSlidingComplete={onVolumeChange}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.progressBackground}
        thumbTintColor={colors.primary}
      />
      <MaterialIcons name="volume-up" size={24} color={colors.textSecondary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  
  slider: {
    flex: 1,
    height: 40,
  },
});
