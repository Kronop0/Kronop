import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { Song } from '../../types';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import { StarButton } from './StarButton';

interface SongListItemProps {
  song: Song;
  isPlaying: boolean;
  isFavorite: boolean;
  onPlayPress: () => void;
  onFavoritePress: () => void;
}

export function SongListItem({ song, isPlaying, isFavorite, onPlayPress, onFavoritePress }: SongListItemProps) {
  return (
    <View style={styles.container}>
      <View style={styles.artContainer}>
        <Image 
          source={song.albumArt && typeof song.albumArt === 'string' ? { uri: song.albumArt } : require('../../../../assets/images/logo.png')} 
          style={styles.albumArt} 
          contentFit="cover" 
          transition={200} 
        />
        {isPlaying ? <View style={styles.playingDot} /> : null}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={1}>{song.title}</Text>
        <Text style={styles.artist} numberOfLines={1}>{song.artist}</Text>
      </View>

      <Pressable onPress={onPlayPress} style={styles.playButton} hitSlop={12}>
        <MaterialIcons
          name={isPlaying ? 'pause-circle-filled' : 'play-circle-filled'}
          size={40}
          color={colors.primary}
        />
      </Pressable>

      <StarButton isFavorite={isFavorite} onPress={onFavoritePress} size={24} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
    backgroundColor: colors.background,
  },
  artContainer: {
    position: 'relative',
    width: 52,
    height: 52,
    marginRight: spacing.sm,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  albumArt: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
  },
  playingDot: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.playButton,
  },
  infoContainer: {
    flex: 1,
    marginRight: spacing.sm,
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: 3,
  },
  artist: {
    fontSize: 13,
    fontWeight: typography.regular,
    color: colors.textSecondary,
  },
  playButton: {
    marginRight: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
