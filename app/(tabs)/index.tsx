import React, { useEffect, useState, useMemo, useCallback, memo, useRef } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Platform, Modal, Dimensions, TextInput, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { StoryViewer, StorySection } from '../../Apptepbar/Story';
import ProfileScreen from '../../Apptepbar/Story/components/profile';
import storyDataService from '../../Apptepbar/Story/services/storyDataService';
import PhotoSection from '../../Apptepbar/photos';
import { theme } from '../../constants/theme';
import { useAlert } from '../../template';
import { API_BASE_URL } from '../../constants/network';
// import { Story } from '../../types/story'; // Removed - types folder deleted
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { StreamLogic } from '../../Apptepbar/reels/chunking/StreamLogic';
import StatusBarOverlay from '../../components/common/StatusBarOverlay';
import AppLogo from '../../components/common/AppLogo';
import HeaderButton from '../../components/common/HeaderButton';
import StoryUpload from '../../components/upload/story.jsa/StoryUpload.tsx';
import VideoUpload from '../../components/upload/video.jsa/VideoUpload.tsx';
import ReelsUpload from '../../components/upload/reels.jsa/ReelsUpload.tsx';
import LiveUpload from '../../components/upload/live.jsa/app/index';
import SongUpload from '../../components/upload/song.jsa/SongUpload.tsx';

// Removed photo categories - no longer needed

// Individual story item
interface StoryItem {
  id: string;
  userId?: string;
  userName?: string;
  userAvatar?: string;
  imageUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  fallbackUrl?: string;
  duration?: number;
  type: 'image' | 'video';
  story_type: 'image' | 'video';
  timestamp: Date;
  url?: string;
  useLocalAsset?: boolean;
}

export default function HomeScreen() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const insets = useSafeAreaInsets(); // Get safe area insets
  
  // Bottom sheet modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedUploadScreen, setSelectedUploadScreen] = useState<string | null>(null);
  

  // Stories state - Individual stories (each story = one box)
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [storiesLoading, setStoriesLoading] = useState(true);
  const [storyViewerVisible, setStoryViewerVisible] = useState(false);
  const [selectedStoryGroup, setSelectedStoryGroup] = useState<any[]>([]);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);
  const [preloadedVideoUri, setPreloadedVideoUri] = useState<string | null>(null);
  const preloadStreamRef = useRef<StreamLogic | null>(null);
  
  // Profile Modal State
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [selectedProfileUser, setSelectedProfileUser] = useState<StoryItem | null>(null);

  // [KRONOP-DEBUG] Add useEffect to track selectedStoryGroup changes
  useEffect(() => {
    console.log('[KRONOP-DEBUG] 🔄 selectedStoryGroup state changed:', {
      storiesCount: selectedStoryGroup.length,
      viewerVisible: storyViewerVisible,
      stories: selectedStoryGroup.map(s => ({ id: s.id, userName: s.userName, type: s.story_type }))
    });
  }, [selectedStoryGroup, storyViewerVisible]);

  
  // Story upload loading state
  const [uploadingStory, setUploadingStory] = useState(false);

  // Load individual stories
  const loadStories = async () => {
    setStoriesLoading(true);
    try {
      // Use the story data service for proper R2 integration
      console.log('[KRONOP-DEBUG] 🚀 HomeScreen: Loading stories with storyDataService...');
      const fetchedStories = await storyDataService.fetchStoriesForSection();
      console.log(`[KRONOP-DEBUG] 📊 HomeScreen: Received ${fetchedStories.length} individual stories`);
      setStories(fetchedStories);
    } catch (error) {
      console.error('[KRONOP-DEBUG] ❌ HomeScreen: Failed to load stories:', error);
      // Set empty array instead of mock data to avoid 404 errors
      setStories([]);
    } finally {
      setStoriesLoading(false);
    }
  };

  useEffect(() => {
    loadStories();
  }, []);


  const handleStoryPress = async (story: StoryItem) => {
    // 🚀 IMMEDIATE PLAY - Start streaming immediately on press
    const videoUrl = story.videoUrl || story.imageUrl || story.fallbackUrl;
    const isVideo = story.story_type === 'video' || story.type === 'video' || (videoUrl && videoUrl.includes('.mp4'));
    
    if (isVideo && videoUrl) {
      // Clean up previous stream
      if (preloadStreamRef.current) {
        preloadStreamRef.current.cleanup();
      }
      
      // Start streaming immediately - trigger onReady when first chunk arrives
      const streamLogic = new StreamLogic();
      preloadStreamRef.current = streamLogic;
      
      // Show viewer immediately, streaming will start in background
      const storyForViewer = [{
        id: story.id,
        userId: story.userId,
        userName: story.userName || 'User',
        userAvatar: story.userAvatar,
        imageUrl: story.imageUrl,
        videoUrl: story.videoUrl,
        fallbackUrl: story.fallbackUrl,
        story_type: story.story_type || story.type,
        _preloadUri: null as string | null
      }];
      
      setSelectedStoryGroup(storyForViewer);
      setSelectedStoryIndex(0);
      setPreloadedVideoUri(null);
      setStoryViewerVisible(true);
      
      // Start streaming in background - will call onReady on first chunk
      streamLogic.startStreaming(
        videoUrl,
        (fileUri) => {
          console.log('🚀 FIRST CHUNK READY - Updating player!');
          setPreloadedVideoUri(fileUri);
        },
        (progress) => {
          console.log(`📥 Preload progress: ${(progress * 100).toFixed(1)}%`);
        },
        (error) => {
          console.error('❌ Preload failed:', error);
        }
      );
    } else {
      // Image - show immediately
      const storyForViewer = [{
        id: story.id,
        userId: story.userId,
        userName: story.userName || 'User',
        userAvatar: story.userAvatar,
        imageUrl: story.imageUrl,
        videoUrl: story.videoUrl,
        fallbackUrl: story.fallbackUrl,
        story_type: story.story_type || story.type
      }];
      
      setSelectedStoryGroup(storyForViewer);
      setSelectedStoryIndex(0);
      setStoryViewerVisible(true);
    }
  };

  // Handle Profile Press - Open Profile Modal
  const handleProfilePress = (story: StoryItem) => {
    console.log('[KRONOP-DEBUG] 👤 Opening profile for:', story.userName);
    setSelectedProfileUser(story);
    setProfileModalVisible(true);
  };

  // Compressed header button handlers
  const handleNotificationPress = () => router.push('/notifications' as any);
  const handleSearchPress = () => router.push('/search-user' as any);
  const handleChatPress = () => router.push('/chat/app/index' as any);
  const handleMusicPress = () => router.push('/music' as any);
  const handleUploadPress = () => setShowUploadModal(true);

  const handleUploadOptionPress = (option: string) => {
    setShowUploadModal(false);
    setSelectedUploadScreen(option);
  };

  // Add Story Handler
  const handleAddStory = async () => {
    if (uploadingStory) return;
    
    try {
      setUploadingStory(true);
      
      // Request media library permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        showAlert('Permission Required', 'Media library permission is needed to upload stories');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
        aspect: [9, 16], // Story aspect ratio
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        // TODO: Upload to backend when ready
        showAlert('Success', 'Story selected! Upload functionality will be available when backend is ready.');
      }
      
    } catch (error: any) {
      console.error('Story upload error:', error);
      showAlert('Error', error.message || 'Failed to upload story');
    } finally {
      setUploadingStory(false);
    }
  };




  return (
    <View style={styles.container}>
      <StatusBarOverlay style="light" backgroundColor="#000000" />
      <View style={[styles.header, { paddingTop: 40 }]}>
        <Text style={styles.appTitle}>Kronop</Text>
        <View style={styles.headerActions}>
          <HeaderButton icon="bell-outline" onPress={handleNotificationPress} testID="notification-btn" />
          <HeaderButton icon="account-search" onPress={handleSearchPress} testID="search-btn" />
          <HeaderButton icon="chat-outline" onPress={handleChatPress} testID="chat-btn" />
          <HeaderButton icon="music-note-outline" onPress={handleMusicPress} testID="music-btn" />
        </View>
      </View>

      <FlatList
        data={[]}
        keyExtractor={() => ''}
        renderItem={() => null}
        ListHeaderComponent={
          <>
            {/* Stories Section - Simple Horizontal Boxes */}
            <StorySection
              stories={stories}
              loading={storiesLoading}
              onStoryPress={handleStoryPress}
              onProfilePress={handleProfilePress}
            />

            {/* Photo Section */}
            <PhotoSection />

          </>
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />

      {/* Story Viewer Modal */}
      <StoryViewer
        visible={storyViewerVisible}
        stories={selectedStoryGroup}
        initialIndex={selectedStoryIndex}
        preloadedVideoUri={preloadedVideoUri}
        onClose={() => setStoryViewerVisible(false)}
        onProfilePress={(story) => {
          console.log('[KRONOP-DEBUG] 👤 Profile pressed from StoryViewer for:', story.userName);
          setSelectedProfileUser({
            id: story.id,
            userId: story.userId,
            userName: story.userName,
            userAvatar: story.userAvatar,
            type: story.type,
            story_type: story.story_type,
            timestamp: story.timestamp,
            imageUrl: story.imageUrl,
            videoUrl: story.videoUrl,
            thumbnailUrl: story.thumbnailUrl,
            fallbackUrl: story.fallbackUrl,
            duration: story.duration,
          });
          setProfileModalVisible(true);
        }}
      />

      {/* Profile Modal */}
      <ProfileScreen
        visible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
        userData={selectedProfileUser}
      />

      {/* Upload Bottom Sheet Modal */}
      <Modal
        visible={showUploadModal}
        transparent={true}
        animationType="none"
        onRequestClose={() => setShowUploadModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowUploadModal(false)}
        >
          <View style={[styles.bottomSheet, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.bottomSheetHandle} />
            <Text style={styles.bottomSheetTitle}>Create</Text>
            
            <View style={styles.uploadOptions}>
              <TouchableOpacity 
                style={styles.uploadOption}
                onPress={() => handleUploadOptionPress('Story')}
              >
                <MaterialIcons name={"menu_book_outlined" as any} size={16} color="#6A5ACD" />
                <Text style={styles.uploadOptionText}>Story</Text>
              </TouchableOpacity>
              
              
              <TouchableOpacity 
                style={styles.uploadOption}
                onPress={() => handleUploadOptionPress('Reels')}
              >
                <MaterialIcons name={"movie_outlined" as any} size={16} color="#6A5ACD" />
                <Text style={styles.uploadOptionText}>Reels</Text>
              </TouchableOpacity>
              
                            <TouchableOpacity 
                style={styles.uploadOption}
                onPress={() => handleUploadOptionPress('Video')}
              >
                <MaterialIcons name={"videocam_outlined" as any} size={16} color="#6A5ACD" />
                <Text style={styles.uploadOptionText}>Video</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.uploadOption}
                onPress={() => handleUploadOptionPress('Live')}
              >
                <MaterialIcons name={"radio_outlined" as any} size={16} color="#6A5ACD" />
                <Text style={styles.uploadOptionText}>Live</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.uploadOption}
                onPress={() => handleUploadOptionPress('Song')}
              >
                <MaterialIcons name={"music_note_outlined" as any} size={16} color="#6A5ACD" />
                <Text style={styles.uploadOptionText}>Song</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>


      {/* Upload Screens Modal */}
      <Modal
        visible={!!selectedUploadScreen}
        animationType="none"
        onRequestClose={() => setSelectedUploadScreen(null)}
      >
        <View style={styles.fullScreenUploadContainer}>
          {/* Header with Close Button */}
          <View style={styles.uploadModalHeader}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setSelectedUploadScreen(null)}
              activeOpacity={0.7}
            >
              <MaterialIcons name="close" size={28} color="#fff" />
            </TouchableOpacity>
            
            <View style={styles.placeholder} />
          </View>
          
          {/* Upload Screen Content */}
          <View style={styles.uploadScreenContainer}>
            {selectedUploadScreen === 'Story' && <StoryUpload onClose={() => setSelectedUploadScreen(null)} />}
            {selectedUploadScreen === 'Reels' && <ReelsUpload onClose={() => setSelectedUploadScreen(null)} />}
            {selectedUploadScreen === 'Video' && <VideoUpload onClose={() => setSelectedUploadScreen(null)} />}
            {selectedUploadScreen === 'Live' && <LiveUpload onClose={() => setSelectedUploadScreen(null)} />}
            {selectedUploadScreen === 'Song' && <SongUpload onClose={() => setSelectedUploadScreen(null)} />}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.primary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm, // Increased from 2px to provide more spacing between buttons
  },
  sectionTitle: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xs,
  },

  inlinePhotosContainer: {
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  appTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  listContent: {
    paddingBottom: 90,
  },
  // Bottom Sheet Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#000000',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#666666',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 30,
  },
  uploadOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 25, // Increased from 15 to provide more spacing between options
  },
  uploadOption: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 15,
  },
  uploadOptionText: {
    fontSize: 12,
    color: '#FFFFFF',
    marginTop: 8,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  // Upload Modal Styles
  fullScreenUploadContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  uploadModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 8,
    paddingTop: 8, // Consistent with profile
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadModalTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  uploadScreenContainer: {
    flex: 1,
  },
});
