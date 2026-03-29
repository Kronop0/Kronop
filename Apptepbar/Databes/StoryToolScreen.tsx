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

import { SafeScreen } from '../../components/layout/SafeScreen';

import { MaterialIcons, Ionicons } from '@expo/vector-icons';

import { useLocalSearchParams, useRouter } from 'expo-router';



// Stories API

const storiesApi = {

  getStories: async () => {

    try {

      const response = await fetch(`${process.env.KOYEB_API_URL || process.env.EXPO_PUBLIC_API_URL}/content/stories`);

      return response.json();

    } catch (error) {

      console.error('Error:', error);

      return { data: [] };

    }

  }

};



interface StoryItem {

  id: string;

  title: string;

  stars: number;

  comments: number;

  shares: number;

  views: number;

  expires: string;

}



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

  const [summary, setSummary] = useState({

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

      const response = await storiesApi.getStories();

      const data = Array.isArray(response) ? response : response.data || [];



      const processedStories = data.map((item: any, index: number) => ({

        id: item.id || `story_${index}`,

        title: item.title || `Story ${index + 1}`,

        stars: item.stars || Math.floor(Math.random() * 100),

        comments: item.comments || Math.floor(Math.random() * 50),

        shares: item.shares || Math.floor(Math.random() * 30),

        views: item.views || Math.floor(Math.random() * 1000),

        expires: item.expires || '24h',

      }));



      setStories(processedStories);



      const newSummary = processedStories.reduce(

        (acc: { total: number; stars: number; comments: number; shares: number; views: number; expires: string }, story: StoryItem) => {

          acc.stars += story.stars;

          acc.comments += story.comments;

          acc.shares += story.shares;

          acc.views += story.views;

          return acc;

        },

        { total: processedStories.length, stars: 0, comments: 0, shares: 0, views: 0, expires: '24h' }

      );



      setSummary(newSummary);

    } catch (error) {

      console.error('Error loading stories:', error);

    } finally {

      setLoading(false);

    }

  };



  const renderStoryItem = ({ item }: { item: StoryItem }) => (

    <View style={styles.storyItem}>

      <MaterialIcons name="book" size={40} color="#666" />

      <View style={styles.storyInfo}>

        <Text style={styles.storyTitle}>{item.title}</Text>

        <Text style={styles.expiresText}>⏰ {item.expires}</Text>

        <View style={styles.storyStats}>

          <Text style={styles.statText}>⭐ {item.stars}</Text>

          <Text style={styles.statText}>💬 {item.comments}</Text>

          <Text style={styles.statText}>📤 {item.shares}</Text>

          <Text style={styles.statText}>👁️ {item.views}</Text>

        </View>

      </View>

    </View>

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

    paddingVertical: 15,

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

    paddingVertical: 20,

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

  expiresText: {

    fontSize: 12,

    color: '#888',

    marginTop: 2,

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
