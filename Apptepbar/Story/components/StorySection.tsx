import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../../constants/theme';

// [KRONOP-DEBUG] StorySection component initialized
console.log('[KRONOP-DEBUG] 📱 StorySection component loading...');

// Simple Story interface
interface Story {
  id: string;
  imageUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  type: 'image' | 'video';
  story_type: 'image' | 'video';
  timestamp: Date;
  url?: string; // Main URL from R2 service
  useLocalAsset?: boolean; // Add this for local asset fallback
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const STORY_BOX_WIDTH = 78;
const STORY_BOX_HEIGHT = 110;

interface GroupedStory {
  userId: string;
  userName: string;
  userAvatar: string;
  stories: Story[];
  latestTimestamp: string;
}

interface StorySectionProps {
  stories: GroupedStory[];
  loading?: boolean;
  onStoryPress: (storyGroup: GroupedStory, storyIndex?: number) => void;
}

export function StorySection({ 
  stories, 
  loading = false, 
  onStoryPress
}: StorySectionProps) {
  
  // [KRONOP-DEBUG] Log received props
  console.log('[KRONOP-DEBUG] 📥 StorySection props received:');
  console.log('[KRONOP-DEBUG]   - Stories count:', stories.length);
  console.log('[KRONOP-DEBUG]   - Loading state:', loading);
  console.log('[KRONOP-DEBUG]   - onStoryPress function:', typeof onStoryPress);

  // Simple sorting by latest timestamp
  const sortedStories = [...stories].sort((a, b) => {
    return new Date(b.latestTimestamp).getTime() - new Date(a.latestTimestamp).getTime();
  });

  // [KRONOP-DEBUG] Log sorting result
  console.log('[KRONOP-DEBUG] 🔄 Stories sorted by timestamp:');
  sortedStories.forEach((story, index) => {
    console.log(`[KRONOP-DEBUG]   ${index + 1}. ${story.userName} - ${story.stories.length} stories`);
  });

  const renderStoryItem = ({ item, index }: { item: GroupedStory; index: number }) => {
    const latestStory = item.stories[item.stories.length - 1];

    // [KRONOP-DEBUG] Log individual story item rendering
    console.log(`[KRONOP-DEBUG] 🎨 Rendering story item ${index + 1}: ${item.userName}`);
    console.log(`[KRONOP-DEBUG]   - User ID: ${item.userId}`);
    console.log(`[KRONOP-DEBUG]   - Stories in group: ${item.stories.length}`);
    console.log(`[KRONOP-DEBUG]   - Latest story type: ${latestStory?.type || latestStory?.story_type}`);
    console.log(`[KRONOP-DEBUG]   - Latest story imageUrl: ${latestStory?.imageUrl}`);
    console.log(`[KRONOP-DEBUG]   - Latest story videoUrl: ${latestStory?.videoUrl}`);
    console.log(`[KRONOP-DEBUG]   - Latest story thumbnailUrl: ${latestStory?.thumbnailUrl}`);
    console.log(`[KRONOP-DEBUG]   - Latest story url: ${latestStory?.url}`);

    // Determine the correct URL to display for thumbnail
    const getDisplayUrl = () => {
      // Check if story uses local asset
      if (latestStory?.useLocalAsset) {
        return require('../../../assets/images/logo.png');
      }
      if (latestStory?.thumbnailUrl) return latestStory.thumbnailUrl;
      if (latestStory?.imageUrl) return latestStory.imageUrl;
      if (latestStory?.videoUrl) return latestStory.videoUrl;
      if (latestStory?.url) return latestStory.url;
      return item.userAvatar; // Fallback to user avatar
    };

    const displayUrl = getDisplayUrl();
    console.log(`[KRONOP-DEBUG]   - Final display URL: ${displayUrl}`);

    const handleStoryPress = () => {
      console.log(`[KRONOP-DEBUG] 👆 Story pressed: ${item.userName}`);
      console.log(`[KRONOP-DEBUG]   - Story group ID: ${item.userId}`);
      console.log(`[KRONOP-DEBUG]   - Total stories in group: ${item.stories.length}`);
      onStoryPress(item);
    };

    return (
      <TouchableOpacity
        style={styles.storyBox}
        onPress={handleStoryPress}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: displayUrl }}
          style={styles.storyImage}
          contentFit="cover"
          onLoad={() => console.log(`[KRONOP-DEBUG] 🖼️ Story image loaded successfully for ${item.userName}`)}
          onError={(error) => {
            console.log(`[KRONOP-DEBUG] ❌ Story image failed to load for ${item.userName}:`, error);
            console.log(`[KRONOP-DEBUG]   - Attempted URL: ${displayUrl}`);
          }}
        />
      </TouchableOpacity>
    );
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  if (loading) {
    console.log('[KRONOP-DEBUG] ⏳ StorySection showing loading state...');
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary.main} />
          <Text style={styles.loadingText}>Loading stories...</Text>
        </View>
      </View>
    );
  }

  if (stories.length === 0) {
    console.log('[KRONOP-DEBUG] 📭 StorySection showing empty state...');
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <MaterialIcons name="photo-library" size={40} color={theme.colors.text.tertiary} />
          <Text style={styles.emptyTitle}>Stories Coming Soon!</Text>
          <Text style={styles.emptySubtitle}>Share your moments with friends</Text>
        </View>
      </View>
    );
  }

  console.log('[KRONOP-DEBUG] 📱 StorySection rendering with stories...');
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.storiesContainer}
      >
        {sortedStories.map((item, index) => (
          <View key={item.userId} style={styles.storyWrapper}>
            {renderStoryItem({ item, index })}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: STORY_BOX_HEIGHT + 12, // Fixed height container
    paddingVertical: 6,
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderColor: 'transparent',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    margin: 0,
    zIndex: 1,
  },
  storiesContainer: {
    paddingHorizontal: theme.spacing.sm,
    gap: 1,
  },
  storyWrapper: {
    marginRight: 1,
  },
  storyBox: {
    width: STORY_BOX_WIDTH,
    height: STORY_BOX_HEIGHT,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#e9ecef',
    borderWidth: 1,
    borderColor: '#8B00FF',
    position: 'relative',
    padding: 1,
  },
  storyImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  loadingContainer: {
    paddingVertical: theme.spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.xs,
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  emptyContainer: {
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
});
