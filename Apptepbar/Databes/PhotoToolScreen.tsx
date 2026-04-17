import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  Image,
} from 'react-native';
import { SafeScreen } from '../../components/layout/SafeScreen';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import { photoController, PhotoItem, PhotoStats } from './controller/photo/controller';
import { ThreeDotMenu } from './components/ThreeDotMenu';

// Photo Item Component with Image
const PhotoListItem = ({ item, onDelete }: { item: PhotoItem; onDelete?: () => void }) => {
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);

  // Extract key from URL for deletion
  const getItemKey = () => {
    if (!item.url) return '';
    const urlParts = item.url.split('/');
    return urlParts[urlParts.length - 1] || '';
  };

  return (
    <View style={styles.photoItem}>
      <View style={styles.photoImageContainer}>
        {item.url && !imageError ? (
          <>
            <Image 
              source={{ uri: item.url }} 
              style={styles.photoImage} 
              resizeMode="cover"
              onLoadStart={() => setLoading(true)}
              onLoadEnd={() => setLoading(false)}
              onError={(e) => {
                console.log('[PhotoTool] Image load error:', e.nativeEvent.error);
                console.log('[PhotoTool] Failed URL:', item.url);
                setImageError(true);
                setLoading(false);
              }}
            />
            {loading && (
              <View style={styles.imageLoadingOverlay}>
                <ActivityIndicator size="small" color="#fff" />
              </View>
            )}
          </>
        ) : (
          <View style={styles.photoImagePlaceholder}>
            <MaterialIcons name="photo" size={30} color="#666" />
          </View>
        )}
      </View>
      <View style={styles.photoInfo}>
        <Text style={styles.photoTitle} numberOfLines={1} ellipsizeMode="tail">{item.title}</Text>
        <View style={styles.photoStats}>
          <Text style={styles.statText}>⭐ {item.stars}</Text>
          <Text style={styles.statText}>💬 {item.comments}</Text>
          <Text style={styles.statText}>📤 {item.shares}</Text>
          <Text style={styles.statText}>👁️ {item.views}</Text>
        </View>
      </View>
      <ThreeDotMenu
        itemId={item.id}
        itemKey={item.key || ''}
        type="photo"
        onDeleteSuccess={onDelete}
        isPrivate={isPrivate}
        onPrivacyChange={setIsPrivate}
      />
    </View>
  );
};

export default function PhotoToolScreen() {
  const router = useRouter();
  const { title, stats } = useLocalSearchParams<{
    title?: string;
    stats?: string;
  }>();

  const initialStats = stats ? JSON.parse(stats) : {};
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [summary, setSummary] = useState<PhotoStats>({
    total: initialStats?.total || 0,
    stars: initialStats?.stars || 0,
    comments: initialStats?.comments || 0,
    shares: initialStats?.shares || 0,
    views: initialStats?.views || 0,
  });

  useEffect(() => {
    loadPhotos();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPhotos();
    setRefreshing(false);
  };

  const loadPhotos = async () => {
    try {
      setLoading(true);
      const photos = await photoController.getPhotos();
      setPhotos(photos);
      const newSummary = photoController.getStats(photos);
      setSummary(newSummary);
    } catch (error) {
      console.error('Error loading photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderPhotoItem = ({ item }: { item: PhotoItem }) => (
    <PhotoListItem item={item} onDelete={loadPhotos} />
  );



  if (loading) {

    return (

      <SafeScreen>

        <View style={styles.loadingContainer}>

          <ActivityIndicator size="large" color="#fff" />

          <Text style={styles.loadingText}>Loading Photos...</Text>

        </View>

      </SafeScreen>

    );

  }



  return (

    <SafeScreen>

      <View style={styles.container}>

        {/* Header */}

        <View style={styles.header}>

          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>

            <Ionicons name="arrow-back" size={24} color="#fff" />

          </TouchableOpacity>

          <Text style={styles.headerTitle}>{title || 'Photo Tool'}</Text>

          <View style={{ width: 40 }} />

        </View>



        {/* Summary Stats */}

        <View style={styles.summaryContainer}>

          <View style={styles.summaryItem}>

            <Text style={styles.summaryValue}>{summary.total}</Text>

            <Text style={styles.summaryLabel}>Total Photos</Text>

          </View>

          <View style={styles.summaryItem}>

            <Text style={styles.summaryValue}>{summary.stars}</Text>

            <Text style={styles.summaryLabel}>Stars</Text>

          </View>

          <View style={styles.summaryItem}>

            <Text style={styles.summaryValue}>{summary.comments}</Text>

            <Text style={styles.summaryLabel}>Comments</Text>

          </View>

          <View style={styles.summaryItem}>

            <Text style={styles.summaryValue}>{summary.shares}</Text>

            <Text style={styles.summaryLabel}>Shares</Text>

          </View>

          <View style={styles.summaryItem}>

            <Text style={styles.summaryValue}>{summary.views}</Text>

            <Text style={styles.summaryLabel}>Views</Text>

          </View>

        </View>



        {/* Photos List */}

        <FlatList
          data={photos}
          keyExtractor={(item) => item.id}
          renderItem={renderPhotoItem}
          scrollEnabled={true}
          nestedScrollEnabled={true}
          style={{ flex: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="photo-library" size={48} color="#666" />
              <Text style={styles.emptyText}>No photos found</Text>
            </View>
          }
          contentContainerStyle={styles.listContainer}
        />

      </View>

    </SafeScreen>

  );

}



const styles = StyleSheet.create({

  container: {

    flex: 1,

    backgroundColor: '#000',

  },

  loadingContainer: {

    flex: 1,

    justifyContent: 'center',

    alignItems: 'center',

    backgroundColor: '#000',

  },

  loadingText: {

    color: '#fff',

    marginTop: 10,

    fontSize: 16,

  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },

  backButton: {

    width: 40,

    height: 40,

    borderRadius: 20,

    backgroundColor: 'rgba(255,255,255,0.1)',

    justifyContent: 'center',

    alignItems: 'center',

  },

  headerTitle: {

    fontSize: 18,

    fontWeight: 'bold',

    color: '#fff',

  },

  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },

  summaryItem: {

    alignItems: 'center',

  },

  summaryValue: {

    fontSize: 18,

    fontWeight: 'bold',

    color: '#fff',

  },

  summaryLabel: {

    fontSize: 12,

    color: '#666',

    marginTop: 5,

  },

  listContainer: {
    paddingBottom: 20,
    flexGrow: 1,
  },

  photoItem: {

    flexDirection: 'row',

    alignItems: 'center',

    padding: 15,

    borderBottomWidth: 1,

    borderBottomColor: '#222',

  },

  photoInfo: {

    flex: 1,

    marginLeft: 15,

  },

  photoTitle: {

    fontSize: 16,

    color: '#fff',

    fontWeight: '500',

  },

  photoImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#333',
  },

  photoImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },

  imageLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  photoImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
  },

  photoStats: {
    flexDirection: 'row',
    marginTop: 5,
  },

  urlDebug: {
    fontSize: 10,
    color: '#444',
    marginTop: 2,
  },

  statText: {
    fontSize: 12,
    color: '#666',
    marginRight: 15,
  },

  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 50,
  },

  emptyText: {
    color: '#666',
    marginTop: 10,
    fontSize: 16,
  },

});
