import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { ControlButton } from '../ui/ControlButton';
import { colors, spacing } from '../../constants/theme';
import { RepeatMode } from '../../hooks/useAudioPlayer';

interface PlayerControlsProps {
  isPlaying: boolean;
  isLoading: boolean;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
}

export function PlayerControls({
  isPlaying,
  isLoading,
  isShuffle,
  repeatMode,
  onPlayPause,
  onNext,
  onPrevious,
  onToggleShuffle,
  onToggleRepeat,
}: PlayerControlsProps) {
  const getRepeatIcon = () => {
    if (repeatMode === RepeatMode.ONE) return 'repeat-one';
    return 'repeat';
  };

  return (
    <View style={styles.container}>
      {/* Top row: Shuffle and Repeat */}
      <View style={styles.topRow}>
        <ControlButton
          icon="shuffle"
          size={24}
          onPress={onToggleShuffle}
          isActive={isShuffle}
        />
        <ControlButton
          icon={getRepeatIcon()}
          size={24}
          onPress={onToggleRepeat}
          isActive={repeatMode !== RepeatMode.OFF}
        />
      </View>

      {/* Main controls */}
      <View style={styles.mainControls}>
        <ControlButton
          icon="skip-previous"
          size={40}
          onPress={onPrevious}
          disabled={isLoading}
        />

        <View style={styles.playButton}>
          {isLoading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <ControlButton
              icon={isPlaying ? 'pause-circle-filled' : 'play-circle-filled'}
              size={72}
              onPress={onPlayPause}
              color={colors.primary}
            />
          )}
        </View>

        <ControlButton
          icon="skip-next"
          size={40}
          onPress={onNext}
          disabled={isLoading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: spacing.md,
  },
  
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
  },
  
  mainControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  
  playButton: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
