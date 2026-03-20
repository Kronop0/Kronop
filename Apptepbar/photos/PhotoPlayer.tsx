import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Image,
  Text,
  RefreshControl,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Star, MessageCircle, Heart } from 'lucide-react-native';

// Import R2 photo service for real data
import { photoService, type Photo } from './r2_service';

// Import actual button components from local photo folder
import StarButton from './components/StarButton';

const { width } = Dimensions.get('window');

// Define navigation type
type RootStackParamList = {
  'photos/profile': { userId: string };
};

type ProfileNavigationProp = StackNavigationProp<RootStackParamList, 'photos/profile'>;

interface PhotoPlayerProps {
  category: string;
  photos?: Photo[];
  textStyles?: {
    titleFontSize: number;
    subtitleFontSize: number;
    categoryFontSize: number;
  };
}

export const PhotoPlayer = ({ category, photos: categoryPhotos, textStyles }: PhotoPlayerProps) => {
  const navigation = useNavigation<ProfileNavigationProp>();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [nextPhotoUrl, setNextPhotoUrl] = useState<string | null>(null);
  const [prevPhotoUrl, setPrevPhotoUrl] = useState<string | null>(null);

  console.log(`[LOG-PHOTO-PLAYER] Component initialized with category: ${category}`);
  console.log(`[KRONOP-UX] Full-screen touch navigation enabled.`);

  // Prefetch next and previous photos for smooth transitions
  useEffect(() => {
    if (selectedPhoto && photos.length > 0) {
      const currentIndex = photos.findIndex(photo => photo.id === selectedPhoto.id);
      
      // Prefetch next photo
      if (currentIndex < photos.length - 1) {
        setNextPhotoUrl(photos[currentIndex + 1].url);
        Image.prefetch(photos[currentIndex + 1].url);
      } else {
        setNextPhotoUrl(null);
      }
      
      // Prefetch previous photo
      if (currentIndex > 0) {
        setPrevPhotoUrl(photos[currentIndex - 1].url);
        Image.prefetch(photos[currentIndex - 1].url);
      } else {
        setPrevPhotoUrl(null);
      }
    }
  }, [selectedPhoto, photos]);

  // Fetch real photos from R2 service
  const fetchPhotosFromR2 = async () => {
    console.log(`[PhotoPlayer.tsx] STEP 3: Starting photo fetch from r2_service.ts - Category: ${category}`);
    try {
      setLoading(true);
      const realPhotos = await photoService.getPhotosByCategory(category.toLowerCase(), 20, 0);
      console.log(`[PhotoPlayer.tsx] STEP 3: ✓ Received data from r2_service.ts - ${realPhotos.length} photos`);
      console.log(`[PhotoPlayer.tsx] STEP 3: Photo URLs received:`, realPhotos.map(p => p.url));
      setPhotos(realPhotos);
      console.log(`[PhotoPlayer.tsx] STEP 3: COMPLETED - Final state has ${realPhotos.length} photos`);
    } catch (error) {
      console.error(`[PhotoPlayer.tsx] STEP 3: ❌ Error: Failed to receive data from r2_service.ts - ${error}`);
      console.log(`[LOG-PHOTO-PLAYER] Falling back to categoryPhotos: ${categoryPhotos?.length || 0} photos`);
      setPhotos(categoryPhotos || []);
      console.log(`[PhotoPlayer.tsx] STEP 3: FALLBACK - Using categoryPhotos with ${categoryPhotos?.length || 0} photos`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    console.log(`[LOG-PHOTO-PLAYER] useEffect triggered - fetching photos for category: ${category}`);
    fetchPhotosFromR2();
  }, [category]);

  const onRefresh = () => {
    console.log(`[LOG-PHOTO-PLAYER] Pull-to-refresh triggered`);
    setRefreshing(true);
    fetchPhotosFromR2();
  };

  const renderPhotoItem = ({ item }: { item: Photo }) => {
    console.log(`[LOG-PHOTO-PLAYER] Rendering photo item: ${item.id}`);

    const photoContainerStyle = {
      flex: 1,
      aspectRatio: 1, // Fixed square aspect ratio for uniform grid
      margin: 0.5, // Minimal gap - 0.5px on each side = 1px total
      borderRadius: 0, // Sharp corners
      overflow: 'hidden' as const,
      backgroundColor: '#1A1A1A', // Background for loading state
    };

    return (
      <TouchableOpacity style={photoContainerStyle} onPress={() => {
        console.log(`[LOG-PHOTO-PLAYER] Photo clicked: ${item.id}`);
        setSelectedPhoto(item);
      }}>
        <Image source={{ uri: item.url }} style={styles.gridPhoto} />
      </TouchableOpacity>
    );
  };

  const renderFullscreenPhoto = () => {
    if (!selectedPhoto) {
      console.log(`[LOG-PHOTO-PLAYER] No selected photo for fullscreen`);
      return null;
    }

    console.log(`[LOG-PHOTO-PLAYER] Rendering fullscreen photo: ${selectedPhoto.id}`);
    
    // Find current photo index
    const currentIndex = photos.findIndex(photo => photo.id === selectedPhoto.id);
    
    return (
      <View style={styles.fullscreenContainer}>
        {/* Smooth photo transition with prefetch */}
        <Image 
          source={{ uri: selectedPhoto.url }} 
          style={styles.fullscreenImage}
          fadeDuration={0}
          onLoad={() => {
            console.log(`[LOG-PHOTO-PLAYER] Photo loaded: ${selectedPhoto.id}`);
          }}
        />
        
        {/* Invisible Touch Navigation - Behind UI */}
        <TouchableOpacity 
          style={styles.leftTouchZone}
          onPress={() => {
            if (currentIndex > 0 && prevPhotoUrl) {
              const prevPhoto = photos[currentIndex - 1];
              setSelectedPhoto(prevPhoto); // Immediate switch to prefetched photo
              console.log(`[LOG-PHOTO-PLAYER] Previous photo: ${prevPhoto.id}`);
            }
          }}
        />
        
        <TouchableOpacity 
          style={styles.rightTouchZone}
          onPress={() => {
            if (currentIndex < photos.length - 1 && nextPhotoUrl) {
              const nextPhoto = photos[currentIndex + 1];
              setSelectedPhoto(nextPhoto); // Immediate switch to prefetched photo
              console.log(`[LOG-PHOTO-PLAYER] Next photo: ${nextPhoto.id}`);
            }
          }}
        />

        {/* Restore All UI Elements */}
        <View style={styles.kronopBar}>
          {/* Single Horizontal Row - All Elements */}
          <View style={styles.horizontalRow}>
            {/* User Logo */}
            <View style={styles.profilePhoto}>
              <Text style={styles.profileInitial}>{selectedPhoto.user?.name?.charAt(0) || 'U'}</Text>
            </View>
            
            {/* Username */}
            <TouchableOpacity 
              style={styles.usernameContainer}
              onPress={() => {
                console.log(`[KRONOP-NAV] Navigate to profile: ${selectedPhoto.user?.name || 'User'}`);
                navigation.navigate('photos/profile', { userId: selectedPhoto.user?.id || 'unknown' });
              }}
            >
              <Text style={styles.username}>{selectedPhoto.user?.name || 'User'}</Text>
            </TouchableOpacity>

            {/* Support Button */}
            <TouchableOpacity style={styles.supportButtonWide}>
              <Heart 
                size={16} 
                fill="none"
                color="#FFFFFF" 
                strokeWidth={1.5}
              />
              <Text style={styles.supportText}>Support</Text>
            </TouchableOpacity>

            {/* Star Button */}
            <StarButton 
              videoId={selectedPhoto.id} 
              initialCount={selectedPhoto.likes || 0}
              initiallyLiked={false}
            />
            
            {/* Comment Button */}
            <TouchableOpacity style={styles.actionButton}>
              <MessageCircle size={24} color="#FFFFFF" strokeWidth={1.5} />
              <Text style={styles.actionText}>{selectedPhoto.comments || 0}</Text>
            </TouchableOpacity>
          </View>

          {/* Photo Title - Below the row */}
          <View style={styles.photoTitleContainer}>
            <Text style={styles.photoTitle}>{selectedPhoto.caption || 'Untitled'}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading {category} Photos...</Text>
      </View>
    );
  }

  if (photos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No Photo Available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={photos}
        renderItem={renderPhotoItem}
        keyExtractor={(item) => item.id}
        numColumns={2} // 2-column grid
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gridContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#007AFF"
            colors={["#007AFF"]}
          />
        }
      />

      {/* Fullscreen Modal */}
      <Modal visible={!!selectedPhoto} animationType="fade" transparent>
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedPhoto(null)}
          >
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          {renderFullscreenPhoto()}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  gridContainer: {
    padding: 1, // Minimal padding - 1px total gap
  },
  gridPhoto: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover', // Cover mode for uniform display
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover', // Ensures photo covers container without stretching
  },
  // Fullscreen Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  fullscreenContainer: {
    flex: 1,
    width: width,
    height: '100%', // Fixed height
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: '100%',
    height: '80%', // Fixed height - 80% of screen
    resizeMode: 'cover', // Cover mode for uniform display
  },
  // Invisible Touch Navigation Zones - Behind UI
  leftTouchZone: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '50%',
    height: '100%',
    backgroundColor: 'transparent',
    zIndex: 0, // Behind UI elements
  },
  rightTouchZone: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '50%',
    height: '100%',
    backgroundColor: 'transparent',
    zIndex: 0, // Behind UI elements
  },
  // Restore All UI Styles
  kronopBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 16,
    zIndex: 1, // Above touch zones
  },
  // Single Horizontal Row - All Elements
  horizontalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  // User Logo
  profilePhoto: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  profileInitial: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  // Username Container
  usernameContainer: {
    flex: 0.8, // Reduce flex to prevent excessive spacing
    marginRight: 8, // Reduce margin
  },
  username: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  // Support Button
  supportButtonWide: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginRight: 6, // Reduce margin
  },
  supportText: {
    color: '#FFFFFF',
    fontSize: 10,
    marginLeft: 6,
    fontWeight: '500',
  },
  // Action Buttons
  actionButton: {
    alignItems: 'center',
    marginHorizontal: 2, // Reduce horizontal margin
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 10,
    marginTop: 2,
    fontWeight: '300',
    opacity: 0.8,
  },
  // Photo Title - Below Row
  photoTitleContainer: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  photoTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'left',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
    textAlign: 'center',
  },
});
