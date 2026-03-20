import React, { useState, useEffect } from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  Modal,
  Text,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { VideoView, useVideoPlayer } from 'expo-video';
import { theme } from '../../../constants/theme';
import StoryViewCounter from './StoryViewCounter';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OwnerStoryBoxProps {
  ownerId?: string;
  storyId?: string;
  onPress?: () => void;
  onProfilePress?: () => void;
}

const STORY_BOX_WIDTH = 78;
const STORY_BOX_HEIGHT = 110;

export function OwnerStoryBox({ 
  ownerId = 'owner123',
  storyId = 'owner-story',
  onPress,
  onProfilePress
}: OwnerStoryBoxProps) {
  const [storyVisible, setStoryVisible] = useState(false);
  const [viewCounterVisible, setViewCounterVisible] = useState(false);
  const [mediaError, setMediaError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  
  // Owner story data
  const ownerStory = {
    id: 'owner-story',
    userId: 'owner123',
    userName: 'You',
    userAvatar: 'https://picsum.photos/40/40?random=owner',
    imageUrl: undefined, // No image, using video
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: 'https://picsum.photos/78/110?random=owner',
    duration: 60,
    type: 'video' as 'image' | 'video',
    story_type: 'video' as 'image' | 'video',
    timestamp: new Date(),
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    fallbackUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    useLocalAsset: false,
  };
  
  const handleStoryPress = () => {
    console.log('[KRONOP-DEBUG] 👑 Owner story box pressed');
    if (onPress) {
      onPress();
    } else {
      setStoryVisible(true);
    }
  };

  const handleProfilePress = () => {
    console.log('[KRONOP-DEBUG] 👤 Owner profile pressed');
    if (onProfilePress) {
      onProfilePress();
    }
    // Handle profile press if needed
  };

  // Enhanced isVideo detection from StoryViewer
  const isVideo = ownerStory.story_type === 'video' || 
                   ownerStory.type === 'video' ||
                   !!ownerStory.videoUrl || 
                   (ownerStory.imageUrl && (ownerStory.imageUrl.includes('.mp4') || ownerStory.imageUrl.includes('.mov') || ownerStory.imageUrl.includes('.avi'))) ||
                   (ownerStory.url && (ownerStory.url.includes('.mp4') || ownerStory.url.includes('.mov') || ownerStory.url.includes('.avi')));
  
  const mediaUrl = isVideo 
    ? (ownerStory.videoUrl || ownerStory.imageUrl || ownerStory.url) 
    : (ownerStory.imageUrl || ownerStory.url);
  
  // Get media source from StoryViewer
  const getMediaSource = () => {
    if (mediaError && ownerStory.fallbackUrl) {
      return { uri: ownerStory.fallbackUrl };
    }
    
    // URL validation for videos
    let finalUrl = mediaUrl;
    if (isVideo && mediaUrl) {
      // Ensure URL starts with https
      if (!mediaUrl.startsWith('https://')) {
        console.log('[KRONOP-DEBUG] 🔧 Fixing URL - adding https prefix');
        finalUrl = 'https://' + mediaUrl;
      }
      
      // Ensure complete R2 URL if it's a partial path
      if (finalUrl.startsWith('https://') && !finalUrl.includes('r2.dev')) {
        console.log('[KRONOP-DEBUG] 🔧 Completing R2 URL');
        finalUrl = 'https://pub-a59d5a6739a14835816a2c0d2e12fc46.r2.dev/' + finalUrl.replace('https://', '');
      }
      
      console.log('[KRONOP-DEBUG] ✅ Validated video URL:', finalUrl);
    }
    
    return { uri: finalUrl };
  };
  
  // Video component from StoryViewer
  const SimpleVideoStory = ({ videoUrl, style }: { videoUrl: string; style: any }) => {
    const player = useVideoPlayer(videoUrl, (player) => {
      player.play();
      player.loop = true;
    });
    
    useEffect(() => {
      console.log('[KRONOP-DEBUG] ▶️ Owner video player effect triggered - starting auto-play');
      // Muted auto-play when component mounts
      if (player) {
        player.muted = true;
        player.play();
      }
    }, [player]);
    
    return (
      <VideoView
        style={style}
        player={player}
        allowsFullscreen={false}
        allowsPictureInPicture={false}
        contentFit="contain"
      />
    );
  };
  
  // Error placeholder from StoryViewer
  const ErrorPlaceholder = ({ type, onRetry }: { type: 'image' | 'video'; onRetry: () => void }) => {
    return (
      <View style={styles.errorPlaceholder}>
        <MaterialIcons 
          name={type === 'video' ? 'videocam-off' : 'image-not-supported'} 
          size={64} 
          color="#666" 
        />
        <Text style={styles.errorText}>Failed to load {type}</Text>
        <TouchableOpacity onPress={onRetry} style={styles.retryButton}>
          <MaterialIcons name="refresh" size={20} color="#8B00FF" />
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={styles.ownerStoryBox}
      onPress={handleStoryPress}
      activeOpacity={0.8}
    >
      <View style={styles.ownerBoxContent}>
        {/* Story Thumbnail Image */}
        <Image
          source={{ uri: 'https://picsum.photos/78/110?random=owner' }}
          style={styles.ownerStoryImage}
          contentFit="cover"
          onLoad={() => console.log('[KRONOP-DEBUG] 🖼️ Owner story image loaded successfully')}
          onError={(error) => {
            console.log('[KRONOP-DEBUG] ❌ Owner story image failed to load:', error);
          }}
        />
        
        {/* User Avatar Overlay - Top Left (Profile pe click) */}
        <TouchableOpacity 
          style={styles.ownerAvatarContainer}
          onPress={handleProfilePress}
          activeOpacity={0.7}
        >
          <Image
            source={{ uri: 'https://picsum.photos/60/60?random=owner' }}
            style={styles.ownerAvatar}
            contentFit="cover"
          />
        </TouchableOpacity>
      </View>
      
      {/* Story View Counter Modal */}
      <StoryViewCounter
        visible={viewCounterVisible}
        onClose={() => setViewCounterVisible(false)}
        storyId={storyId}
        storyOwnerId={ownerId}
        currentUserId={ownerId}
        isStoryOwner={true}
      />
      
      {/* Owner Story Viewer Modal */}
      <Modal
        visible={storyVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setStoryVisible(false)}
      >
        <View style={styles.container}>
          {/* Story Background - Image or Video */}
          <View style={styles.storyMedia}>
            {ownerStory.story_type === 'video' ? (
              mediaError ? (
                <ErrorPlaceholder type="video" onRetry={() => setMediaError(false)} />
              ) : (
                <SimpleVideoStory 
                  videoUrl={getMediaSource().uri}
                  style={styles.storyMedia}
                />
              )
            ) : (
              mediaError ? (
                <ErrorPlaceholder type="image" onRetry={() => setMediaError(false)} />
              ) : (
                <Image
                  source={getMediaSource()}
                  style={styles.storyMedia}
                  contentFit="cover"
                  onLoad={() => console.log('[KRONOP-DEBUG] 🖼️ Owner story image loaded successfully')}
                  onError={(error) => {
                    console.log('[KRONOP-DEBUG] ❌ Owner story image failed to load:', error);
                    console.log('[KRONOP-DEBUG]   - Attempted URL:', getMediaSource().uri);
                    if (!mediaError) {
                      setMediaError(true);
                    }
                  }}
                />
              )
            )}
          </View>
          
          {/* Header */}
          <View style={styles.storyHeader}>
            <TouchableOpacity 
              style={styles.avatarContainer}
              onPress={handleProfilePress}
            >
              <Image
                source={{ uri: 'https://picsum.photos/40/40?random=owner' }}
                style={styles.avatar}
                contentFit="cover"
              />
            </TouchableOpacity>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>You</Text>
            </View>
          </View>
          
          {/* View Counter Arrow - Bottom Right */}
          <TouchableOpacity 
            style={styles.viewCounterButton}
            onPress={() => setViewCounterVisible(true)}
            activeOpacity={0.7}
          >
            <MaterialIcons 
              name="arrow-upward" 
              size={20} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>
          
          {/* Close Button */}
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setStoryVisible(false)}
          >
            <MaterialIcons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          {/* Story View Counter Modal */}
          <StoryViewCounter
            visible={viewCounterVisible}
            onClose={() => setViewCounterVisible(false)}
            storyId={storyId}
            storyOwnerId={ownerId}
            currentUserId={ownerId}
            isStoryOwner={true}
          />
        </View>
      </Modal>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // StoryViewer container styles
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyMedia: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT - 120,
    position: 'absolute',
    top: 1,
    alignSelf: 'center',
    backgroundColor: '#000',
  },
  // Owner box styles
  ownerStoryBox: {
    width: STORY_BOX_WIDTH,
    height: STORY_BOX_HEIGHT,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: '#8B00FF',
    position: 'relative',
    padding: 1,
  },
  ownerBoxContent: {
    flex: 1,
    position: 'relative',
  },
  ownerStoryImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  ownerAvatarContainer: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#000',
    borderWidth: 2,
    borderColor: '#8B00FF',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ownerAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  // Story Modal Styles
  storyModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyModalContent: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 0,
    overflow: 'hidden',
    position: 'relative',
  },
  storyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 40,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#8B00FF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorPlaceholder: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT - 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    position: 'absolute',
    top: 5,
    alignSelf: 'center',
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#8B00FF',
    borderRadius: 20,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 8,
  },
  viewCounterButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default OwnerStoryBox;
