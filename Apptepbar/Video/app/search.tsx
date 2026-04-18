import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { listR2Videos } from '../services/r2Service';
import { Video } from '../types';
import { spacing, typography, borderRadius } from '../constants/theme';

const { width } = Dimensions.get('window');
const PURPLE = '#8B00FF';

export default function SearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [allVideos, setAllVideos] = useState<any[]>([]);
  
  React.useEffect(() => {
    listR2Videos().then(setAllVideos);
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return allVideos.filter(
      (v: any) =>
        v.title.toLowerCase().includes(q) ||
        v.username.toLowerCase().includes(q) ||
        (v.category || '').toLowerCase().includes(q) ||
        (v.description || '').toLowerCase().includes(q)
    );
  }, [query, allVideos]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const avatarColor = (userId: string) =>
    `hsl(${(userId.charCodeAt(0) * 137) % 360}, 70%, 60%)`;

  const renderItem = ({ item }: { item: Video }) => (
    <TouchableOpacity
      style={styles.resultItem}
      activeOpacity={0.85}
      onPress={() => router.push(`/video-player?videoId=${item.id}`)}
    >
      <View style={styles.resultThumb}>
        {item.thumbnailUrl ? (
          <Image
            source={{ uri: item.thumbnailUrl }}
            style={styles.thumbImage}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={[styles.thumbImage, styles.thumbPlaceholder]}>
            <Ionicons name="videocam" size={24} color="#333" />
          </View>
        )}
        <View style={styles.thumbDuration}>
          <Text style={styles.durationText}>{item.duration}</Text>
        </View>
      </View>

      <View style={styles.resultInfo}>
        <Text style={styles.resultTitle} numberOfLines={2}>{item.title}</Text>
        <View style={styles.resultChannel}>
          <View style={[styles.miniAvatar, { backgroundColor: avatarColor(item.userId) }]}>
            <Text style={styles.miniAvatarText}>{item.username.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.resultUsername}>{item.username}</Text>
        </View>
        <View style={styles.resultStats}>
          <Ionicons name="eye-outline" size={12} color="#666" />
          <Text style={styles.resultStatText}>{formatNumber(item.views)} views</Text>
          {item.category ? (
            <View style={styles.categoryTag}>
              <Text style={styles.categoryTagText}>{item.category}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.inputWrapper}>
          <Ionicons name="search" size={18} color="#666666" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.input}
            placeholder="Search videos, channels..."
            placeholderTextColor="#555555"
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
          />
          {query.length > 0 ? (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color="#555555" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Results / Empty state */}
      {query.trim() === '' ? (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={72} color="#222222" />
          <Text style={styles.emptyTitle}>Search for videos</Text>
          <Text style={styles.emptySubtitle}>Find videos, channels, categories</Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="sad-outline" size={72} color="#222222" />
          <Text style={styles.emptyTitle}>No results found</Text>
          <Text style={styles.emptySubtitle}>Try different keywords</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  backBtn: {
    padding: spacing.xs,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    borderRadius: 24,
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  input: {
    flex: 1,
    fontSize: typography.caption,
    color: '#FFFFFF',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingBottom: 80,
  },
  emptyTitle: {
    fontSize: typography.h4,
    fontWeight: '700',
    color: '#333333',
  },
  emptySubtitle: {
    fontSize: typography.caption,
    color: '#333333',
  },
  list: {
    paddingVertical: spacing.sm,
  },
  resultItem: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#111111',
  },
  resultThumb: {
    width: 130,
    height: 76,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    backgroundColor: '#111111',
    position: 'relative',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  thumbPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
  },
  thumbDuration: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.85)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  resultInfo: {
    flex: 1,
    gap: 5,
    justifyContent: 'center',
  },
  resultTitle: {
    fontSize: typography.caption,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 18,
  },
  resultChannel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  miniAvatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniAvatarText: {
    color: 'white',
    fontSize: 9,
    fontWeight: '800',
  },
  resultUsername: {
    fontSize: 11,
    color: '#888888',
    fontWeight: '600',
  },
  resultStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resultStatText: {
    fontSize: 11,
    color: '#666666',
  },
  categoryTag: {
    backgroundColor: 'rgba(139,0,255,0.2)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 4,
  },
  categoryTagText: {
    fontSize: 10,
    color: PURPLE,
    fontWeight: '700',
  },
});
