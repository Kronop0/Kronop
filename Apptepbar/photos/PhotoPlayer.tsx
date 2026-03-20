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
import { Star, MessageCircle, Share2, Heart } from 'lucide-react-native';

// Import R2 photo service for real data
import { photoService, type Photo } from './r2_service';

// Import actual button components from local photo folder
import StarButton from './components/StarButton';

const { width } = Dimensions.get('window');

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
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  console.log(`[LOG-PHOTO-PLAYER] Component initialized with category: ${category}`);

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
      aspectRatio: 1.6, // More portrait aspect ratio for taller photos
      margin: 4,
      borderRadius: 0, // Sharp corners
      overflow: 'hidden' as const,
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
    return (
      <View style={styles.fullscreenContainer}>
        <Image source={{ uri: selectedPhoto.url }} style={styles.fullscreenImage} />
        <View style={styles.kronopBar}>
          {/* User Profile Photo and Name */}
          <View style={styles.userInfo}>
            <View style={styles.profilePhoto}>
              <Text style={styles.profileInitial}>{selectedPhoto.user?.name?.charAt(0) || 'U'}</Text>
            </View>
            <Text style={styles.username}>{selectedPhoto.user?.name || 'User'}</Text>
          </View>
          
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
          
          <View style={styles.buttonGap} />
          
          {/* Action Buttons Group */}
          <View style={styles.actionButtonsGroup}>
            <StarButton 
              videoId={selectedPhoto.id} 
              initialCount={selectedPhoto.likes || 0}
              initiallyLiked={false}
            />
            
            <TouchableOpacity style={styles.actionButton}>
              <MessageCircle size={24} color="#FFFFFF" strokeWidth={1.5} />
              <Text style={styles.actionText}>{selectedPhoto.comments || 0}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Share2 size={24} color="#FFFFFF" strokeWidth={1.5} />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
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
    padding: 8,
  },
  gridPhoto: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
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
    justifyContent: 'center',
  },
  fullscreenImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  // Kronop Bar Styles - Transparent Overlay
  kronopBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent', // Transparent background
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  profilePhoto: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.3)', // Semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  profileInitial: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  username: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.8)', // Shadow for visibility
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  supportButtonWide: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  supportText: {
    color: '#FFFFFF',
    fontSize: 10,
    marginLeft: 6,
    fontWeight: '500',
  },
  buttonGap: {
    width: 16, // Gap between Support and action buttons
  },
  actionButtonsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Equal spacing
    minWidth: 120, // Minimum width for proper spacing
  },
  actionButton: {
    alignItems: 'center',
    marginVertical: 8,
    flex: 1, // Equal width for all buttons
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 10,
    marginTop: 2,
    fontWeight: '300',
    opacity: 0.8,
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
