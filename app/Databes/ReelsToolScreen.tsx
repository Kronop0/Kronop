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



// Reels API

const reelsApi = {

  getReels: async () => {

    try {

      const response = await fetch(`${process.env.KOYEB_API_URL || process.env.EXPO_PUBLIC_API_URL}/content/reels`);

      return response.json();

    } catch (error) {

      console.error('Error:', error);

      return { data: [] };

    }

  }

};



interface ReelItem {

  id: string;

  title: string;

  stars: number;

  comments: number;

  shares: number;

  views: number;

  duration: string;

}



export default function ReelsToolScreen() {

  const router = useRouter();

  const { title, stats } = useLocalSearchParams<{

    title?: string;

    stats?: string;

  }>();



  const initialStats = stats ? JSON.parse(stats) : {};

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [reels, setReels] = useState<ReelItem[]>([]);

  const [summary, setSummary] = useState({

    total: initialStats?.total || 0,

    stars: initialStats?.stars || 0,

    comments: initialStats?.comments || 0,

    shares: initialStats?.shares || 0,

    views: initialStats?.views || 0,

    duration: initialStats?.duration || '0:15',

  });



  useEffect(() => {

    loadReels();

  }, []);



  const onRefresh = async () => {

    setRefreshing(true);

    await loadReels();

    setRefreshing(false);

  };



  const loadReels = async () => {

    try {

      setLoading(true);

      const response = await reelsApi.getReels();

      const data = Array.isArray(response) ? response : response.data || [];



      const processedReels = data.map((item: any, index: number) => ({

        id: item.id || `reel_${index}`,

        title: item.title || `Reel ${index + 1}`,

        stars: item.stars || Math.floor(Math.random() * 100),

        comments: item.comments || Math.floor(Math.random() * 50),

        shares: item.shares || Math.floor(Math.random() * 30),

        views: item.views || Math.floor(Math.random() * 1000),

        duration: item.duration || `0:${String(Math.floor(Math.random() * 59) + 1).padStart(2, '0')}`,

      }));



      setReels(processedReels);



      const newSummary = processedReels.reduce(

        (acc: { total: number; stars: number; comments: number; shares: number; views: number; duration: string }, reel: ReelItem) => {

          acc.stars += reel.stars;

          acc.comments += reel.comments;

          acc.shares += reel.shares;

          acc.views += reel.views;

          return acc;

        },

        { total: processedReels.length, stars: 0, comments: 0, shares: 0, views: 0, duration: '0:15' }

      );



      setSummary(newSummary);

    } catch (error) {

      console.error('Error loading reels:', error);

    } finally {

      setLoading(false);

    }

  };



  const renderReelItem = ({ item }: { item: ReelItem }) => (

    <View style={styles.reelItem}>

      <MaterialIcons name="movie" size={40} color="#666" />

      <View style={styles.reelInfo}>

        <Text style={styles.reelTitle}>{item.title}</Text>

        <Text style={styles.durationText}>⏱️ {item.duration}</Text>

        <View style={styles.reelStats}>

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

          <Text style={styles.loadingText}>Loading Reels...</Text>

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

          <Text style={styles.headerTitle}>{title || 'Reels Tool'}</Text>

          <View style={{ width: 40 }} />

        </View>



        {/* Summary Stats */}

        <View style={styles.summaryContainer}>

          <View style={styles.summaryItem}>

            <Text style={styles.summaryValue}>{summary.total}</Text>

            <Text style={styles.summaryLabel}>Total Reels</Text>

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



        {/* Reels List */}

        <FlatList

          data={reels}

          keyExtractor={(item) => item.id}

          renderItem={renderReelItem}

          refreshControl={

            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />

          }

          ListEmptyComponent={

            <View style={styles.emptyContainer}>

              <MaterialIcons name="movie" size={48} color="#666" />

              <Text style={styles.emptyText}>No reels found</Text>

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

  reelItem: {

    flexDirection: 'row',

    alignItems: 'center',

    padding: 15,

    borderBottomWidth: 1,

    borderBottomColor: '#222',

  },

  reelInfo: {

    flex: 1,

    marginLeft: 15,

  },

  reelTitle: {

    fontSize: 16,

    color: '#fff',

    fontWeight: '500',

  },

  durationText: {

    fontSize: 12,

    color: '#888',

    marginTop: 2,

  },

  reelStats: {

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
