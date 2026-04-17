import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  FlatList,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeScreen } from '../../components/layout/SafeScreen';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { storyController, StoryItem, StoryStats } from './controller/story/controller';
import { ThreeDotMenu } from './components/ThreeDotMenu';

// Story Item Component with Image/Video
const StoryListItem = ({ item, onDelete }: { item: StoryItem; onDelete?: () => void }) => {
  const [imageError, setImageError] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);

  const isVideo = item.story_type === 'video';

  // Extract key from URL for deletion
  const getItemKey = () => {
    if (!item.url) return '';
    const urlParts = item.url.split('/');
    return urlParts[urlParts.length - 1] || '';
  };

  return (
    <View style={styles.storyItem}>
      <View style={styles.storyImageContainer}>
        {item.url && !imageError ? (
          <>
            <Image 
              source={{ uri: item.url }} 
              style={styles.storyImage} 
              contentFit="cover"
              onError={() => setImageError(true)}
            />
            {isVideo && (
              <View style={styles.videoOverlay}>
                <MaterialIcons name="play-circle-filled" size={30} color="#fff" />
              </View>
            )}
          </>
        ) : (
          <View style={styles.storyImagePlaceholder}>
            <MaterialIcons name={isVideo ? "videocam" : "book"} size={30} color="#666" />
          </View>
        )}
      </View>
      <View style={styles.storyInfo}>
        <Text style={styles.storyTitle} numberOfLines={1} ellipsizeMode="tail">{item.title}</Text>
        <View style={styles.storyStats}>
          <Text style={styles.statText}>⭐ {item.stars}</Text>
          <Text style={styles.statText}>💬 {item.comments}</Text>
          <Text style={styles.statText}>📤 {item.shares}</Text>
          <Text style={styles.statText}>👁️ {item.views}</Text>
        </View>
      </View>
      <ThreeDotMenu
        itemId={item.id}
        itemKey={item.key || ''}
        type="story"
        onDeleteSuccess={onDelete}
        isPrivate={isPrivate}
        onPrivacyChange={setIsPrivate}
      />
    </View>
  );
};

export default function StoryToolScreen() {

  const router = useRouter();

  const { title, stats } = useLocalSearchParams<{

    title?: string;

    stats?: string;

  }>();



  const initialStats = stats ? JSON.parse(stats) : {};

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [stories, setStories] = useState<StoryItem[]>([]);
  const [summary, setSummary] = useState<StoryStats>({

    total: initialStats?.total || 0,

    stars: initialStats?.stars || 0,

    comments: initialStats?.comments || 0,

    shares: initialStats?.shares || 0,

    views: initialStats?.views || 0,

    expires: initialStats?.expires || '24h',

  });



  useEffect(() => {

    loadStories();

  }, []);



  const onRefresh = async () => {

    setRefreshing(true);

    await loadStories();

    setRefreshing(false);

  };



  const loadStories = async () => {
    try {
      setLoading(true);
      const stories = await storyController.getStories();
      setStories(stories);
      const newSummary = storyController.getStats(stories);
      setSummary(newSummary);
    } catch (error) {
      console.error('Error loading stories:', error);
    } finally {
      setLoading(false);
    }
  };



  const renderStoryItem = ({ item }: { item: StoryItem }) => (
    <StoryListItem item={item} onDelete={loadStories} />
  );



  if (loading) {

    return (

      <SafeScreen>

        <View style={styles.loadingContainer}>

          <ActivityIndicator size="large" color="#fff" />

          <Text style={styles.loadingText}>Loading Stories...</Text>

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

          <Text style={styles.headerTitle}>{title || 'Story Tool'}</Text>

          <View style={{ width: 40 }} />

        </View>



        {/* Summary Stats */}

        <View style={styles.summaryContainer}>

          <View style={styles.summaryItem}>

            <Text style={styles.summaryValue}>{summary.total}</Text>

            <Text style={styles.summaryLabel}>Total Stories</Text>

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



        {/* Stories List */}

        <FlatList
          data={stories}
          keyExtractor={(item) => item.id}
          renderItem={renderStoryItem}
          scrollEnabled={true}
          nestedScrollEnabled={true}
          style={{ flex: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="auto-stories" size={48} color="#666" />
              <Text style={styles.emptyText}>No stories found</Text>
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

  storyItem: {

    flexDirection: 'row',

    alignItems: 'center',

    padding: 15,

    borderBottomWidth: 1,

    borderBottomColor: '#222',

  },

  storyInfo: {

    flex: 1,

    marginLeft: 15,

  },

  storyTitle: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },

  storyImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#333',
  },

  storyImageContainer: {
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

  storyImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
  },

  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  storyStats: {
    flexDirection: 'row',
    marginTop: 5,
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
