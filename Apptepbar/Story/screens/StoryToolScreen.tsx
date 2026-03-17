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
import { SafeScreen } from '../../../components/layout/SafeScreen';
import { MaterialIcons } from '@expo/vector-icons';
import { storiesApi } from '../../../services/api';
import { useLocalSearchParams, useRouter } from 'expo-router';

interface StoryItem {
  id: string;
  title: string;
  created_at: string;
  story_type: 'image' | 'video';
}

export default function StoryToolScreen() {
  const router = useRouter();
  const { title } = useLocalSearchParams<{
    title?: string;
  }>();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stories, setStories] = useState<StoryItem[]>([]);

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
      const response: any = await storiesApi.getStories();
      const data = Array.isArray(response) ? response : response?.data || [];

      const processedStories = data.map((item: any, index: number) => ({
        id: item.id || `story_${index}`,
        title: item.title || `Story ${index + 1}`,
        created_at: item.created_at || new Date().toISOString(),
        story_type: item.story_type || 'video',
      }));

      setStories(processedStories);
    } catch (error) {
      console.error('Error loading stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStoryItem = ({ item }: { item: StoryItem }) => (
    <TouchableOpacity style={styles.storyCard}>
      <View style={styles.storyHeader}>
        <MaterialIcons name="auto-stories" size={20} color="#4CAF50" />
        <Text style={styles.storyTitle}>{item.title}</Text>
      </View>

      <View style={styles.storyMeta}>
        <View style={styles.metaItem}>
          <MaterialIcons name={item.story_type === 'video' ? 'videocam' : 'image'} size={14} color="#8B00FF" />
          <Text style={styles.metaText}>{item.story_type}</Text>
        </View>
        <View style={styles.metaItem}>
          <MaterialIcons name="schedule" size={14} color="#666" />
          <Text style={styles.metaText}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <SafeScreen>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B00FF" />
          <Text style={styles.loadingText}>Loading stories...</Text>
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{title || 'Story Tools'}</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Story Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Stories</Text>
              <Text style={styles.summaryValue}>{stories.length}</Text>
            </View>
          </View>
        </View>

        <FlatList
          data={stories}
          renderItem={renderStoryItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#8B00FF']} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="auto-stories" size={48} color="#333" />
              <Text style={styles.emptyText}>No stories found</Text>
            </View>
          }
        />
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0A0A0A',
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  placeholder: {
    width: 32,
  },
  summaryCard: {
    backgroundColor: '#0A0A0A',
    margin: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8B00FF',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B00FF',
    marginBottom: 12,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  summaryItem: {
    width: '33.33%',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  listContainer: {
    padding: 12,
    paddingTop: 0,
  },
  storyCard: {
    backgroundColor: '#0A0A0A',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  storyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  storyTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#fff',
    marginLeft: 8,
  },
  storyMeta: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 13,
    color: '#fff',
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
});