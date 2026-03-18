import React, { useEffect, useState, useMemo, useCallback, memo } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Platform, Modal, Dimensions, TextInput, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { StoryViewer, StorySection } from '../../Apptepbar/Story';
import ProfileScreen from '../../Apptepbar/Story/components/profile';
import storyDataService from '../../Apptepbar/Story/services/storyDataService';
import { theme } from '../../constants/theme';
import { useAlert } from '../../template';
import { API_BASE_URL } from '../../constants/network';
// import { Story } from '../../types/story'; // Removed - types folder deleted
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import StatusBarOverlay from '../../components/common/StatusBarOverlay';
import AppLogo from '../../components/common/AppLogo';
import HeaderButton from '../../components/common/HeaderButton';
import StoryUpload from '../../components/upload/story.jsa/StoryUpload.tsx';
import PhotoUpload from '../../components/upload/photo.tsa/PhotoUpload.tsx';
import VideoUpload from '../../components/upload/video.jsa/VideoUpload.tsx';
import ReelsUpload from '../../components/upload/reels.jsa/ReelsUpload.tsx';
import LiveUpload from '../../components/upload/live.jsa/LiveUpload.tsx';
import SongUpload from '../../components/upload/song.jsa/SongUpload.tsx';

// Photo categories - TEXT ONLY, HORIZONTAL SCROLL WITH PROPER FILTERING
const PHOTO_CATEGORIES = [
  { id: 'all', name: 'All', keywords: [] },
  { id: 'girls', name: 'Girls', keywords: ['girl', 'girls', 'woman', 'women', 'female', 'lady'] },
  { id: 'boys', name: 'Boys', keywords: ['boy', 'boys', 'man', 'men', 'male', 'guy'] },
  { id: 'children', name: 'Children', keywords: ['child', 'children', 'kid', 'kids', 'baby', 'toddler'] },
  { id: 'family', name: 'Family', keywords: ['family', 'families', 'parents', 'relatives', 'together'] },
  { id: 'house', name: 'House', keywords: ['house', 'home', 'building', 'architecture', 'interior'] },
  { id: 'nature', name: 'Nature', keywords: ['nature', 'forest', 'tree', 'trees', 'landscape', 'outdoor'] },
  { id: 'animals', name: 'Animals', keywords: ['animal', 'animals', 'dog', 'cat', 'bird', 'pet', 'wildlife'] },
  { id: 'flowers', name: 'Flowers', keywords: ['flower', 'flowers', 'rose', 'bloom', 'garden', 'floral'] },
  { id: 'mountains', name: 'Mountains', keywords: ['mountain', 'mountains', 'hill', 'peak', 'summit'] },
  { id: 'food', name: 'Food', keywords: ['food', 'meal', 'dish', 'cuisine', 'cooking', 'restaurant'] },
  { id: 'travel', name: 'Travel', keywords: ['travel', 'vacation', 'trip', 'journey', 'destination'] },
  { id: 'sports', name: 'Sports', keywords: ['sport', 'sports', 'game', 'fitness', 'exercise', 'athlete'] },
  { id: 'fashion', name: 'Fashion', keywords: ['fashion', 'style', 'clothing', 'outfit', 'dress', 'designer'] },
  { id: 'cars', name: 'Cars', keywords: ['car', 'cars', 'vehicle', 'automobile', 'auto', 'driving'] },
  { id: 'technology', name: 'Technology', keywords: ['tech', 'technology', 'computer', 'phone', 'gadget', 'device'] },
];

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

  // Photo categories state - Vertical with infinite scroll
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryPhotos, setCategoryPhotos] = useState<any[]>([]);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [photosLoadingMore, setPhotosLoadingMore] = useState(false);
  const [photosPage, setPhotosPage] = useState(1);
  const [hasMorePhotos, setHasMorePhotos] = useState(false);
  
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
    // Load initial photos for "All" category
    loadInitialPhotos();
  }, []);

  // Load initial photos
  const loadInitialPhotos = async () => {
    setPhotosLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/photos`);
      const result = await response.json();
      const photos = result?.data || [];
      if (result && result.length > 0) {
        setCategoryPhotos(result);
        setHasMorePhotos(result.length > 20);
        setSelectedCategory('all'); // Default to "All" category
      }
    } catch (error) {
      console.error('Failed to load initial photos:', error);
      setCategoryPhotos([]);
    } finally {
      setPhotosLoading(false);
    }
  };

  const handleStoryPress = async (story: StoryItem) => {
    // View single story
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
    
    console.log('[KRONOP-DEBUG] 📱 Story prepared for StoryViewer:', {
      id: story.id,
      userName: story.userName,
      storyType: story.story_type,
      fallbackUrl: story.fallbackUrl
    });
    
    setSelectedStoryGroup(storyForViewer);
    setSelectedStoryIndex(0);
    setStoryViewerVisible(true);
  };

  // Handle Profile Press - Open Profile Modal
  const handleProfilePress = (story: StoryItem) => {
    console.log('[KRONOP-DEBUG] 👤 Opening profile for:', story.userName);
    setSelectedProfileUser(story);
    setProfileModalVisible(true);
  };

  // Compressed header button handlers
  const handleNotificationPress = () => router.push('/notifications' as any);
  const handleSearchPress = () => router.push('/search-user/index' as any);
  const handleChatPress = () => router.push('/chat' as any);
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

  const handleCategoryPress = async (categoryId: string) => {
    setSelectedCategory(categoryId);
    setPhotosPage(1);
    setPhotosLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/photos`);
      const result = await response.json();
      const photos = result?.data || [];
      if (result) {
        if (categoryId === 'all') {
          setCategoryPhotos(result);
          setHasMorePhotos(result.length > 20);
        } else {
          // Get keywords for selected category
          const category = PHOTO_CATEGORIES.find(cat => cat.id === categoryId);
          const keywords = category?.keywords || [categoryId];
          
          // Filter by category with keyword matching
          const filtered = result.filter((photo: any) => {
            const categoryMatch = photo.category?.toLowerCase() === categoryId.toLowerCase();
            const tagMatch = photo.tags?.some((tag: string) => 
              keywords.some(keyword => tag.toLowerCase().includes(keyword.toLowerCase()))
            );
            const titleMatch = keywords.some(keyword => 
              photo.title?.toLowerCase().includes(keyword.toLowerCase())
            );
            const descMatch = keywords.some(keyword => 
              photo.description?.toLowerCase().includes(keyword.toLowerCase())
            );
            
            return categoryMatch || tagMatch || titleMatch || descMatch;
          });
          
          setCategoryPhotos(filtered);
          setHasMorePhotos(filtered.length > 20);
        }
      }
    } catch (error) {
      console.error('Failed to load photos:', error);
    } finally {
      setPhotosLoading(false);
    }
  };

  const loadMorePhotos = async () => {
    if (!hasMorePhotos || photosLoading || !selectedCategory) return;
    
    // Simulated pagination - in real app, would fetch from backend
    setPhotosPage(prev => prev + 1);
  };

  // Memoized photo item renderer
  const PhotoItem = memo(({ item }: { item: any }) => (
    <TouchableOpacity style={styles.photoItem} activeOpacity={0.8}>
      <Image 
        source={{ uri: item.photo_url }} 
        style={styles.photoImage}
        contentFit="cover"
      />
      <View style={styles.photoOverlay}>
        <Text style={styles.photoTitle} numberOfLines={2}>{item.title}</Text>
        <View style={styles.photoMeta}>
          <View style={styles.photoStat}>
            <MaterialIcons name="favorite" size={14} color="#fff" />
            <Text style={styles.photoStatText}>{item.likes_count || 0}</Text>
          </View>
          <Text style={styles.photoUser}>{item.user_profiles?.username || 'Unknown'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  ));

  return (
    <View style={styles.container}>
      <StatusBarOverlay style="light" backgroundColor="#000000" />
      <View style={[styles.header, { paddingTop: 40 }]}>
        <Text style={styles.appTitle}>Kronop</Text>
        <View style={styles.headerActions}>
          <HeaderButton icon="bell-outline" onPress={handleNotificationPress} testID="notification-btn" />
          <HeaderButton icon="account-search-outline" onPress={handleSearchPress} testID="search-btn" />
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

            {/* Photo Categories Section - HORIZONTAL SCROLL, TEXT ONLY */}
            <View style={styles.photoCategoriesContainer}>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={PHOTO_CATEGORIES}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.categoryButton,
                      selectedCategory === item.id && styles.categoryButtonActive
                    ]}
                    onPress={() => handleCategoryPress(item.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.categoryButtonText,
                      selectedCategory === item.id && styles.categoryButtonTextActive
                    ]}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                )}
                contentContainerStyle={styles.categoriesScrollContainer}
              />
            </View>

            {/* Photos Section - Only Photos */}
            <View style={styles.photosSectionContainer}>
              <FlatList
                data={categoryPhotos}
                keyExtractor={(item, index) => `photo-${item.id || index}`}
                renderItem={({ item }) => <PhotoItem item={item} />}
                numColumns={3}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.photosGridContainer}
                onEndReached={loadMorePhotos}
                onEndReachedThreshold={0.5}
                ListFooterComponent={photosLoadingMore ? <ActivityIndicator color="#fff" style={{ marginTop: 20 }} /> : null}
                ListEmptyComponent={
                  !photosLoading ? (
                    <View style={styles.emptyPhotosContainer}>
                      <MaterialIcons name="photo-library" size={48} color="#666" />
                      <Text style={styles.emptyPhotosText}>No photos found</Text>
                    </View>
                  ) : null
                }
              />
            </View>
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
                onPress={() => handleUploadOptionPress('Photo')}
              >
                <MaterialIcons name={"image_outlined" as any} size={16} color="#6A5ACD" />
                <Text style={styles.uploadOptionText}>Photo</Text>
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
            {selectedUploadScreen === 'Photo' && <PhotoUpload onClose={() => setSelectedUploadScreen(null)} />}
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
  // Photo Categories - HORIZONTAL SCROLL, TEXT ONLY
  photoCategoriesContainer: {
    paddingVertical: theme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.primary,
  },
  sectionTitle: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xs,
  },
  categoriesScrollContainer: {
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  categoryButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    marginRight: theme.spacing.sm,
  },
  categoryButtonActive: {
    // No background, only text color will change
  },
  categoryButtonText: {
    fontSize: theme.typography.fontSize.md, // Increased from sm to md
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  categoryButtonTextActive: {
    color: '#8B00FF', // Purple color for selected category
    fontWeight: theme.typography.fontWeight.bold,
  },

  inlinePhotosContainer: {
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  photosLoadingContainer: {
    paddingVertical: theme.spacing.xl * 2,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  emptyPhotosContainer: {
    paddingVertical: theme.spacing.xl * 2,
    alignItems: 'center',
  },
  emptyPhotosText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  photosGrid: {
    paddingBottom: theme.spacing.md,
  },
  photoRow: {
    gap: theme.spacing.sm,
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
  // Photos Section Styles
  photosSectionContainer: {
    flex: 1,
    backgroundColor: '#000',
    minHeight: 400, // Increased height
  },
  photosGridContainer: {
    paddingVertical: theme.spacing.md, // Increased padding
    paddingHorizontal: theme.spacing.sm,
  },
  photoItem: {
    flex: 1,
    margin: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    aspectRatio: 1,
    position: 'relative',
    minHeight: 120, // Increased minimum height
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.xs,
    backgroundColor: 'transparent',
  },
  photoTitle: {
    color: '#fff',
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: 2,
  },
  photoMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  photoStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  photoStatText: {
    color: '#fff',
    fontSize: theme.typography.fontSize.xs,
    marginLeft: 4,
  },
  photoUser: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: theme.typography.fontSize.xs,
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
