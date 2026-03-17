import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { colors, spacing, typography } from '../../constants/theme';

interface ProgressBarProps {
  duration: number;
  position: number;
  onSeek: (value: number) => void;
}

export function ProgressBar({ duration, position, onSeek }: ProgressBarProps) {
  const formatTime = (millis: number): string => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={duration}
        value={position}
        onSlidingComplete={onSeek}
        minimumTrackTintColor={colors.progressFill}
        maximumTrackTintColor={colors.progressBackground}
        thumbTintColor={colors.primary}
      />
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>{formatTime(position)}</Text>
        <Text style={styles.timeText}>{formatTime(duration)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  
  slider: {
    width: '100%',
    height: 40,
  },
  
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
    marginTop: -spacing.sm,
  },
  
  timeText: {
    fontSize: typography.small,
    color: colors.textSecondary,
    fontWeight: typography.medium,
  },
});
