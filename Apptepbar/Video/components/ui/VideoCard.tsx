import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { colors, spacing, typography, borderRadius } from '../../ThemeConstants';
import { Video } from '../../services/videoService';

interface VideoCardProps {
  video: Video;
  onPress: () => void;
  onLike: () => void;
}

export function VideoCard({ video, onPress, onLike }: VideoCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Debug: Log thumbnail URL
  console.log(`[VideoCard] Video: ${video.title}, Thumbnail URL: ${video.thumbnail}`);

  return (
    <Pressable 
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={onPress}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
    >
      <View style={styles.thumbnailContainer}>
        {!imageError ? (
          <Image 
            source={{ uri: video.thumbnail }}
            style={styles.thumbnail}
            contentFit="cover"
            transition={200}
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={styles.thumbnailPlaceholder}>
            <MaterialIcons name="videocam" size={48} color="#666" />
            <Text style={styles.placeholderText}>No Thumbnail</Text>
          </View>
        )}
        <View style={styles.durationBadge}>
          <Text style={styles.duration}>{video.duration}</Text>
        </View>
        
        {/* YouTube-style Preview Overlay */}
        <View style={[styles.previewOverlay, isHovered && styles.previewOverlayVisible]}>
          <View style={styles.playButton}>
            <MaterialIcons name="play-arrow" size={24} color={colors.text} />
          </View>
        </View>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {video.title}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  pressed: {
    opacity: 0.8,
  },
  thumbnailContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: colors.surfaceLight,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#666',
    fontSize: 12,
    marginTop: 8,
  },
  durationBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.overlayDark,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  duration: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  previewOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0,
  },
  previewOverlayVisible: {
    opacity: 1,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingVertical: spacing.sm,
  },
  title: {
    ...typography.body,
    color: colors.text,
  },
});
