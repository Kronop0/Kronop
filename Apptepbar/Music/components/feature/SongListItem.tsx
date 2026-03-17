import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Song } from '../../types';
import { colors, spacing, typography, borderRadius, shadows } from '../../constants/theme';

interface SongListItemProps {
  song: Song;
  isPlaying: boolean;
  isFavorite: boolean;
  onPlayPress: () => void;
  onFavoritePress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function SongListItem({ song, isPlaying, isFavorite, onPlayPress, onFavoritePress }: SongListItemProps) {
  const scale = useSharedValue(1);
  const starScale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const starAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: starScale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handleFavoritePress = () => {
    starScale.value = withSpring(1.3, {}, () => {
      starScale.value = withSpring(1);
    });
    onFavoritePress();
  };

  return (
    <AnimatedPressable
      onPress={onPlayPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.container, animatedStyle]}
    >
      {/* Album Art */}
      <View style={styles.artContainer}>
        <Image
          source={{ uri: song.albumArt }}
          style={styles.albumArt}
          contentFit="cover"
          transition={200}
        />
        {isPlaying && (
          <View style={styles.playingIndicator}>
            <View style={styles.playingDot} />
          </View>
        )}
      </View>

      {/* Song Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {song.title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {song.artist}
        </Text>
      </View>

      {/* Play/Pause Button */}
      <Pressable
        onPress={onPlayPress}
        style={styles.playButton}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <MaterialIcons
          name={isPlaying ? 'pause-circle-filled' : 'play-circle-filled'}
          size={36}
          color={colors.primary}
        />
      </Pressable>

      {/* Favorite Button */}
      <Animated.View style={starAnimatedStyle}>
        <Pressable
          onPress={handleFavoritePress}
          style={styles.favoriteButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <MaterialIcons
            name={isFavorite ? 'star' : 'star-border'}
            size={24}
            color={isFavorite ? colors.primary : colors.textSecondary}
          />
        </Pressable>
      </Animated.View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.glassBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
  },

  artContainer: {
    position: 'relative',
    width: 48,
    height: 48,
    marginRight: spacing.sm,
  },

  albumArt: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.md,
    backgroundColor: '#1a1a1a',
    ...shadows.small,
  },

  playingIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  playingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },

  infoContainer: {
    flex: 1,
    marginRight: spacing.md,
    justifyContent: 'center',
  },

  title: {
    fontSize: 15,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: 2,
  },

  artist: {
    fontSize: 12,
    fontWeight: typography.medium,
    color: colors.textSecondary,
  },

  playButton: {
    marginRight: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },

  favoriteButton: {
    padding: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
