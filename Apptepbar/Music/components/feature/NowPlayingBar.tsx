import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { Song } from '../../types';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import { StarButton } from './StarButton';

interface NowPlayingBarProps {
  song: Song;
  isPlaying: boolean;
  isFavorite: boolean;
  position: number;
  duration: number;
  onPlayPress: () => void;
  onFavoritePress: () => void;
  bottomInset?: number;
}

export function NowPlayingBar({
  song, isPlaying, isFavorite, position, duration,
  onPlayPress, onFavoritePress, bottomInset = 0,
}: NowPlayingBarProps) {
  const progress = duration > 0 ? Math.min(position / duration, 1) : 0;
  const progressWidth = `${Math.round(progress * 100)}%` as `${number}%`;

  return (
    <View style={[styles.wrapper, { paddingBottom: bottomInset }]}>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: progressWidth }]} />
      </View>
      <View style={styles.row}>
        <Image
          source={song.albumArt && typeof song.albumArt === 'string' ? { uri: song.albumArt } : require('../../../../assets/images/logo.png')}
          style={styles.art}
          contentFit="cover"
          transition={200}
        />
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>{song.title}</Text>
          <Text style={styles.artist} numberOfLines={1}>{song.artist}</Text>
        </View>
        <Pressable onPress={onPlayPress} style={styles.btn} hitSlop={12}>
          <MaterialIcons
            name={isPlaying ? 'pause-circle-filled' : 'play-circle-filled'}
            size={42}
            color={colors.primary}
          />
        </Pressable>
        <StarButton isFavorite={isFavorite} onPress={onFavoritePress} size={26} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
  },
  progressTrack: { height: 2, backgroundColor: 'rgba(255,255,255,0.12)', width: '100%' },
  progressFill: { height: 2, backgroundColor: '#ffffff' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  art: {
    width: 46,
    height: 46,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceElevated,
    marginRight: spacing.sm,
  },
  info: { flex: 1, marginRight: spacing.sm },
  title: { fontSize: 14, fontWeight: typography.semibold, color: colors.textPrimary, marginBottom: 2 },
  artist: { fontSize: 12, fontWeight: typography.regular, color: colors.textSecondary },
  btn: { justifyContent: 'center', alignItems: 'center', marginLeft: spacing.xs },
});
