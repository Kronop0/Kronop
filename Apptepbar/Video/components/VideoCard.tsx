import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Video } from '../types';
import { spacing, typography } from '../constants/theme';

const { width } = Dimensions.get('window');
const PURPLE = '#8B00FF';

interface VideoCardProps {
  video: Video;
  onLike: (videoId: string) => void;
  onSave: (videoId: string) => void;
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

export function VideoCard({ video, onLike, onSave }: VideoCardProps) {
  const router = useRouter();
  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.92}
      onPress={() => router.push(`/video-player?videoId=${video.id}`)}
    >
      <View style={styles.thumbWrap}>
        {video.thumbnailUrl ? (
          <Image source={{ uri: video.thumbnailUrl }} style={styles.thumb} contentFit="cover" transition={200} />
        ) : (
          <View style={styles.thumbPlaceholder}>
            <Ionicons name="videocam" size={56} color="#333333" />
          </View>
        )}
        <View style={styles.playOverlay}>
          <Ionicons name="play-circle" size={48} color="rgba(255,255,255,0.9)" />
        </View>
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{video.duration}</Text>
        </View>
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{video.title}</Text>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Ionicons name="eye-outline" size={15} color="#888888" />
            <Text style={styles.statText}>{formatNumber(video.views)} views</Text>
          </View>
          <Text style={styles.dot}>•</Text>
          <TouchableOpacity style={styles.stat} onPress={() => onLike(video.id)}>
            <Ionicons name={video.isLiked ? 'star' : 'star-outline'} size={15} color={video.isLiked ? PURPLE : '#888888'} />
            <Text style={styles.statText}>{formatNumber(video.likes)}</Text>
          </TouchableOpacity>
          <Text style={styles.dot}>•</Text>
          <View style={styles.stat}>
            <Ionicons name="chatbubble-outline" size={15} color="#888888" />
            <Text style={styles.statText}>{formatNumber(video.comments)}</Text>
          </View>
        </View>
      </View>
      <View style={styles.separator} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { width, backgroundColor: '#000000' },
  thumbWrap: { width, aspectRatio: 16 / 9, position: 'relative', backgroundColor: '#111111' },
  thumb: { width: '100%', height: '100%' },
  thumbPlaceholder: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: '#111111' },
  playOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.15)' },
  durationBadge: { position: 'absolute', bottom: spacing.xs, right: spacing.xs, backgroundColor: 'rgba(0,0,0,0.88)', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 4 },
  durationText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  info: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: 6, backgroundColor: '#000000' },
  title: { fontSize: typography.body, fontWeight: '700', color: '#FFFFFF', lineHeight: 22 },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  statText: { fontSize: 12, color: '#888888' },
  dot: { color: '#444444', fontSize: 10 },
  separator: { height: 1, backgroundColor: '#1A1A1A', marginTop: spacing.xs },
});
