import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../../constants/theme';

// [KRONOP-DEBUG] StoryViewer component initialized
console.log('[KRONOP-DEBUG] 🎬 StoryViewer component loading...');

// Simple Story interface
interface Story {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  imageUrl?: string;
  videoUrl?: string;
  url?: string; // Main URL from R2
  fallbackUrl?: string; // Fallback URL for errors
  story_type: 'image' | 'video';
  type?: 'image' | 'video'; // Add type for compatibility
  useLocalAsset?: boolean; // Add this for local asset fallback
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface StoryViewerProps {
  visible: boolean;
  stories: Story[];
  initialIndex: number;
  onClose: () => void;
}

// Error Placeholder Component
function ErrorPlaceholder({ type, onRetry }: { type: 'image' | 'video'; onRetry: () => void }) {
  return (
    <View style={styles.errorPlaceholder}>
      <MaterialIcons 
        name={type === 'video' ? 'videocam-off' : 'image-not-supported'} 
        size={64} 
        color="#666" 
      />
      <Text style={styles.errorText}>Loading Failed</Text>
      <Text style={styles.errorSubtext}>
        {type === 'video' ? 'Video could not be loaded' : 'Image could not be loaded'}
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <MaterialIcons name="refresh" size={20} color="#fff" />
        <Text style={styles.retryButtonText}>Reload</Text>
      </TouchableOpacity>
    </View>
  );
}

// Simple video component with increased timeout
function SimpleVideoStory({ videoUrl, style }: { videoUrl: string; style: any }) {
  // [KRONOP-DEBUG] Video component initialization
  console.log('[KRONOP-DEBUG] 🎥 SimpleVideoStory component initializing...');
  console.log('[KRONOP-DEBUG]   - Video URL:', videoUrl);

  const player = useVideoPlayer(videoUrl, (player) => {
    console.log('[KRONOP-DEBUG] 🔧 Video player configured');
    player.loop = false;
    player.muted = true;
    // Increased timeout to 30 seconds for slow networks
    player.timeUpdateEventInterval = 1000;
  });

  useEffect(() => {
    console.log('[KRONOP-DEBUG] ▶️ Video player effect triggered');
    // Video will auto-play when component mounts
  }, []);

  return (
    <VideoView 
      player={player} 
      style={style}
      contentFit="cover"
      nativeControls={false}
      fullscreenOptions={{
        enable: false
      }}
      allowsPictureInPicture={false}
    />
  );
}

export function StoryViewer({ visible, stories, initialIndex, onClose }: StoryViewerProps) {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(initialIndex);
  const [mediaError, setMediaError] = React.useState(false);
  const [avatarError, setAvatarError] = React.useState(false);
  const currentStory = stories[currentStoryIndex];

  // Reset error states when story changes
  useEffect(() => {
    setMediaError(false);
    setAvatarError(false);
  }, [currentStoryIndex]);

  // [KRONOP-DEBUG] Add useEffect to monitor props and state changes
  useEffect(() => {
    console.log('[KRONOP-DEBUG] 🔄 StoryViewer useEffect triggered:');
    console.log('[KRONOP-DEBUG]   - Visible:', visible);
    console.log('[KRONOP-DEBUG]   - Stories count:', stories.length);
    console.log('[KRONOP-DEBUG]   - Initial index:', initialIndex);
    console.log('[KRONOP-DEBUG]   - Current story index:', currentStoryIndex);
    console.log('[KRONOP-DEBUG]   - Current story exists:', !!currentStory);
    
    // Only render if we have stories and viewer is visible
    if (visible && stories.length > 0) {
      console.log('[KRONOP-DEBUG] ✅ StoryViewer should render - conditions met');
    } else if (visible && stories.length === 0) {
      console.log('[KRONOP-DEBUG] ❌ StoryViewer cannot render - no stories available');
    } else if (!visible) {
      console.log('[KRONOP-DEBUG] 🚫 StoryViewer hidden - visible is false');
    }
  }, [visible, stories.length, initialIndex, currentStoryIndex, currentStory]);

  // [KRONOP-DEBUG] Log StoryViewer props and state
  console.log('[KRONOP-DEBUG] 📱 StoryViewer props received:');
  console.log('[KRONOP-DEBUG]   - Visible:', visible);
  console.log('[KRONOP-DEBUG]   - Stories count:', stories.length);
  console.log('[KRONOP-DEBUG]   - Initial index:', initialIndex);
  console.log('[KRONOP-DEBUG]   - Current story index:', currentStoryIndex);

  // [KRONOP-DEBUG] Log current story details
  if (currentStory) {
    console.log('[KRONOP-DEBUG] 📖 Current story details:');
    console.log('[KRONOP-DEBUG]   - Story ID:', currentStory.id);
    console.log('[KRONOP-DEBUG]   - User Name:', currentStory.userName);
    console.log('[KRONOP-DEBUG]   - Story Type:', currentStory.story_type);
    console.log('[KRONOP-DEBUG]   - Image URL:', currentStory.imageUrl);
    console.log('[KRONOP-DEBUG]   - Video URL:', currentStory.videoUrl);
    console.log('[KRONOP-DEBUG]   - Fallback URL:', currentStory.fallbackUrl);
  }

  const goToNext = () => {
    console.log('[KRONOP-DEBUG] ➡️ Going to next story...');
    if (currentStoryIndex < stories.length - 1) {
      const nextIndex = currentStoryIndex + 1;
      console.log(`[KRONOP-DEBUG]   - Moving from index ${currentStoryIndex} to ${nextIndex}`);
      setCurrentStoryIndex(nextIndex);
    } else {
      console.log('[KRONOP-DEBUG] 🏁 Reached last story, closing viewer');
      onClose();
    }
  };

  const goToPrevious = () => {
    console.log('[KRONOP-DEBUG] ⬅️ Going to previous story...');
    if (currentStoryIndex > 0) {
      const prevIndex = currentStoryIndex - 1;
      console.log(`[KRONOP-DEBUG]   - Moving from index ${currentStoryIndex} to ${prevIndex}`);
      setCurrentStoryIndex(prevIndex);
    } else {
      console.log('[KRONOP-DEBUG] 🚫 Already at first story, cannot go back');
    }
  };

  // Add proper conditional rendering check
  if (!visible || stories.length === 0) {
    console.log('[KRONOP-DEBUG] ❌ StoryViewer: Not rendering -', {
      visible,
      storiesCount: stories.length,
      reason: !visible ? 'Viewer not visible' : 'No stories available'
    });
    return null;
  }

  if (!currentStory) {
    console.log('[KRONOP-DEBUG] ❌ No current story available, returning null');
    return null;
  }

  // Enhanced isVideo detection with multiple fallbacks and better logging
  const isVideo = currentStory.story_type === 'video' || 
                   currentStory.type === 'video' ||
                   !!currentStory.videoUrl || 
                   (currentStory.imageUrl && (currentStory.imageUrl.includes('.mp4') || currentStory.imageUrl.includes('.mov') || currentStory.imageUrl.includes('.avi'))) ||
                   (currentStory.url && (currentStory.url.includes('.mp4') || currentStory.url.includes('.mov') || currentStory.url.includes('.avi'))) ||
                   (currentStory.fallbackUrl && currentStory.fallbackUrl.includes('.mp4'));

  // [KRONOP-DEBUG] Enhanced logging for isVideo detection
  console.log('[KRONOP-DEBUG] 🎯 Enhanced isVideo detection:');
  console.log(`[KRONOP-DEBUG]   - story_type: ${currentStory.story_type}`);
  console.log(`[KRONOP-DEBUG]   - type: ${currentStory.type}`);
  console.log(`[KRONOP-DEBUG]   - videoUrl: ${currentStory.videoUrl}`);
  console.log(`[KRONOP-DEBUG]   - imageUrl contains mp4: ${currentStory.imageUrl?.includes('.mp4')}`);
  console.log(`[KRONOP-DEBUG]   - url contains mp4: ${currentStory.url?.includes('.mp4')}`);
  console.log(`[KRONOP-DEBUG]   - fallbackUrl contains mp4: ${currentStory.fallbackUrl?.includes('.mp4')}`);
  console.log(`[KRONOP-DEBUG]   - Final isVideo result: ${isVideo}`);
  
  const mediaUrl = isVideo 
    ? (currentStory.videoUrl || currentStory.imageUrl || currentStory.url) 
    : (currentStory.imageUrl || currentStory.url);
  
  // Get fallback URL if media failed to load
  const getMediaSource = () => {
    // Check if story uses local asset
    if (currentStory.useLocalAsset) {
      return require('../../../assets/images/logo.png');
    }
    if (mediaError && currentStory.fallbackUrl) {
      return { uri: currentStory.fallbackUrl };
    }
    return { uri: mediaUrl };
  };

  const getAvatarSource = () => {
    // Check if story uses local asset
    if (currentStory.useLocalAsset) {
      return require('../../../assets/images/logo.png');
    }
    if (avatarError && currentStory.fallbackUrl) {
      return { uri: currentStory.fallbackUrl };
    }
    return { uri: currentStory.userAvatar };
  };

  // Retry function to reset error state and try again
  const handleRetry = () => {
    console.log('[KRONOP-DEBUG] 🔄 User pressed retry - resetting error state');
    setMediaError(false);
    setAvatarError(false);
  };

  console.log('[KRONOP-DEBUG] 🎯 Media URL determined:');
  console.log('[KRONOP-DEBUG]   - Is Video:', isVideo);
  console.log('[KRONOP-DEBUG]   - Final Media URL:', mediaUrl);

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={false}
      onRequestClose={() => {
        console.log('[KRONOP-DEBUG] 🚪 Modal close requested');
        onClose();
      }}
    >
      <View style={styles.container}>
        {/* Story Background - Image or Video */}
        <View style={styles.storyMedia}>
          {isVideo ? (
            mediaError ? (
              <ErrorPlaceholder type="video" onRetry={handleRetry} />
            ) : (
              <SimpleVideoStory 
                videoUrl={getMediaSource().uri}
                style={styles.storyMedia}
              />
            )
          ) : (
            mediaError ? (
              <ErrorPlaceholder type="image" onRetry={handleRetry} />
            ) : (
              <Image
                source={getMediaSource()}
                style={styles.storyMedia}
                contentFit="cover"
                onLoad={() => console.log('[KRONOP-DEBUG] 🖼️ Story image loaded successfully')}
                onError={(error) => {
                  console.log('[KRONOP-DEBUG] ❌ Story image failed to load:', error);
                  console.log('[KRONOP-DEBUG]   - Attempted URL:', getMediaSource().uri);
                  if (!mediaError) {
                    setMediaError(true);
                  }
                }}
              />
            )
          )}
        </View>

        {/* Simple Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Image
              source={getAvatarSource()}
              style={styles.userAvatar}
              contentFit="cover"
              onLoad={() => console.log('[KRONOP-DEBUG] 👤 User avatar loaded successfully')}
              onError={(error) => {
                console.log('[KRONOP-DEBUG] ❌ User avatar failed to load:', error);
                console.log('[KRONOP-DEBUG]   - Attempted URL:', getAvatarSource().uri);
                if (!avatarError) {
                  setAvatarError(true);
                }
              }}
            />
            <Text style={styles.userName}>{currentStory.userName}</Text>
          </View>
          
          <TouchableOpacity 
            onPress={() => {
              console.log('[KRONOP-DEBUG] ❌ Close button pressed');
              onClose();
            }} 
            style={styles.closeButton}
          >
            <MaterialIcons name="close" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Simple Navigation */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={goToPrevious}
            disabled={currentStoryIndex === 0}
          >
            <MaterialIcons 
              name="chevron-left" 
              size={32} 
              color={currentStoryIndex === 0 ? "rgba(255,255,255,0.3)" : "#fff"} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.navButton}
            onPress={goToNext}
            disabled={currentStoryIndex === stories.length - 1}
          >
            <MaterialIcons 
              name="chevron-right" 
              size={32} 
              color={currentStoryIndex === stories.length - 1 ? "rgba(255,255,255,0.3)" : "#fff"} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  storyMedia: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    position: 'absolute',
  },
  errorPlaceholder: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  errorSubtext: {
    color: '#999',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 20,
    gap: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    zIndex: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flex: 1,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
  },
  userName: {
    color: '#fff',
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navigationContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    zIndex: 10,
  },
  navButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
