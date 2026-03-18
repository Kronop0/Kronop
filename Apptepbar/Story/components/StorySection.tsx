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
import OwnerStoryBox from './OwnerStoryBox';

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

interface StoryItem {
  id: string;
  userId?: string;
  userName?: string;
  userAvatar?: string;
  channelName?: string;
  supporters?: number;
  isVerified?: boolean;
  imageUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  type: 'image' | 'video';
  story_type: 'image' | 'video';
  timestamp: Date;
  url?: string;
  useLocalAsset?: boolean;
}

interface StorySectionProps {
  stories: StoryItem[];
  loading?: boolean;
  onStoryPress: (story: StoryItem) => void;
  onProfilePress?: (story: StoryItem) => void;
  currentUserId?: string; // Current user ID
  ownerId?: string; // Owner ID (first box)
  onOwnerStoryPress?: () => void; // Owner story press handler
  onOwnerProfilePress?: () => void; // Owner profile press handler
}

export function StorySection({ 
  stories, 
  loading = false, 
  onStoryPress,
  onProfilePress,
  currentUserId,
  ownerId = 'owner123',
  onOwnerStoryPress,
  onOwnerProfilePress
}: StorySectionProps) {
  
  // [KRONOP-DEBUG] Log received props
  console.log('[KRONOP-DEBUG] 📥 StorySection props received:');
  console.log('[KRONOP-DEBUG]   - Stories count:', stories.length);
  console.log('[KRONOP-DEBUG]   - Loading state:', loading);
  console.log('[KRONOP-DEBUG]   - onStoryPress function:', typeof onStoryPress);

  // Filter stories - only show other users' stories, not owner's
  const otherUserStories = stories.filter(story => story.userId !== ownerId);
  
  // Simple sorting by timestamp (newest first)
  const sortedStories = [...otherUserStories].sort((a, b) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  // [KRONOP-DEBUG] Log sorting result
  console.log('[KRONOP-DEBUG] 🔄 Stories sorted by timestamp:');
  sortedStories.forEach((story, index) => {
    console.log(`[KRONOP-DEBUG]   ${index + 1}. ${story.id} - ${story.type}`);
  });

  const renderStoryItem = (item: StoryItem, index: number) => {
    // [KRONOP-DEBUG] Log individual story item rendering
    console.log(`[KRONOP-DEBUG] 🎨 Rendering story item ${index + 1}: ${item.id}`);
    console.log(`[KRONOP-DEBUG]   - Story type: ${item.type || item.story_type}`);
    console.log(`[KRONOP-DEBUG]   - Story imageUrl: ${item.imageUrl}`);
    console.log(`[KRONOP-DEBUG]   - Story videoUrl: ${item.videoUrl}`);
    console.log(`[KRONOP-DEBUG]   - Story thumbnailUrl: ${item.thumbnailUrl}`);
    console.log(`[KRONOP-DEBUG]   - Story url: ${item.url}`);

    // Determine the correct URL to display for thumbnail
    const getDisplayUrl = () => {
      // Check if story uses local asset
      if (item?.useLocalAsset) {
        return require('../../../assets/images/logo.png');
      }
      if (item?.thumbnailUrl) return item.thumbnailUrl;
      if (item?.imageUrl) return item.imageUrl;
      if (item?.videoUrl) return item.videoUrl;
      if (item?.url) return item.url;
      return item.userAvatar; // Fallback to user avatar
    };

    const displayUrl = getDisplayUrl();
    console.log(`[KRONOP-DEBUG]   - Final display URL: ${displayUrl}`);

    const handleStoryPress = () => {
      console.log(`[KRONOP-DEBUG] 👆 Story pressed: ${item.id}`);
      onStoryPress(item);
    };

    const handleProfilePress = () => {
      console.log(`[KRONOP-DEBUG] 👤 Profile pressed for: ${item.userName}`);
      if (onProfilePress) {
        onProfilePress(item);
      }
    };

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.storyBox}
        onPress={handleStoryPress}
        activeOpacity={0.8}
      >
        {/* Story Thumbnail Image */}
        <Image
          source={{ uri: displayUrl }}
          style={styles.storyImage}
          contentFit="cover"
          onLoad={() => console.log(`[KRONOP-DEBUG] 🖼️ Story image loaded successfully for ${item.id}`)}
          onError={(error) => {
            console.log(`[KRONOP-DEBUG] ❌ Story image failed to load for ${item.id}:`, error);
            console.log(`[KRONOP-DEBUG]   - Attempted URL: ${displayUrl}`);
          }}
        />
        
        {/* User Avatar Overlay - Top Left (Profile pe click) */}
        <TouchableOpacity 
          style={styles.userAvatarContainer}
          onPress={handleProfilePress}
          activeOpacity={0.7}
        >
          <Image
            source={{ 
              uri: item.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.userName || 'User')}&background=8B00FF&color=fff&size=32`
            }}
            style={styles.userAvatar}
            contentFit="cover"
          />
        </TouchableOpacity>
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
        {/* Owner Story Box - Always First */}
        <View style={styles.storyWrapper}>
          <OwnerStoryBox
            onPress={() => {
              if (onOwnerStoryPress) {
                onOwnerStoryPress();
              }
            }}
            onProfilePress={() => {
              if (onOwnerProfilePress) {
                onOwnerProfilePress();
              }
            }}
            ownerId={ownerId}
          />
        </View>
        
        {/* Other Users' Stories */}
        {sortedStories.map((item, index) => (
          <View key={item.id} style={styles.storyWrapper}>
            {renderStoryItem(item, index)}
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
    position: 'relative',
    padding: 1,
  },
  storyImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  // User Avatar Overlay Styles
  userAvatarContainer: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#000',
    borderWidth: 1.5,
    borderColor: '#8B00FF',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
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
