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



// Live API

const liveApi = {

  getLiveStreams: async () => {

    try {

      const response = await fetch(`${process.env.KOYEB_API_URL || process.env.EXPO_PUBLIC_API_URL}/content/live`);

      return response.json();

    } catch (error) {

      console.error('Error:', error);

      return { data: [] };

    }

  }

};



interface LiveItem {

  id: string;

  title: string;

  stars: number;

  comments: number;

  shares: number;

  viewers: number;

  status: 'live' | 'ended';

}



export default function LiveToolScreen() {

  const router = useRouter();

  const { title, stats } = useLocalSearchParams<{

    title?: string;

    stats?: string;

  }>();



  const initialStats = stats ? JSON.parse(stats) : {};

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [liveStreams, setLiveStreams] = useState<LiveItem[]>([]);

  const [summary, setSummary] = useState({

    total: initialStats?.total || 0,

    stars: initialStats?.stars || 0,

    comments: initialStats?.comments || 0,

    shares: initialStats?.shares || 0,

    viewers: initialStats?.viewers || 0,

  });



  useEffect(() => {

    loadLiveStreams();

  }, []);



  const onRefresh = async () => {

    setRefreshing(true);

    await loadLiveStreams();

    setRefreshing(false);

  };



  const loadLiveStreams = async () => {

    try {

      setLoading(true);

      const response = await liveApi.getLiveStreams();

      const data = Array.isArray(response) ? response : response.data || [];



      const processedLiveStreams = data.map((item: any, index: number) => ({

        id: item.id || `live_${index}`,

        title: item.title || `Live Stream ${index + 1}`,

        stars: item.stars || Math.floor(Math.random() * 100),

        comments: item.comments || Math.floor(Math.random() * 50),

        shares: item.shares || Math.floor(Math.random() * 30),

        viewers: item.viewers || Math.floor(Math.random() * 1000),

        status: item.status || 'live',

      }));



      setLiveStreams(processedLiveStreams);



      const newSummary = processedLiveStreams.reduce(

        (acc: { total: number; stars: number; comments: number; shares: number; viewers: number }, live: LiveItem) => {

          acc.stars += live.stars;

          acc.comments += live.comments;

          acc.shares += live.shares;

          acc.viewers += live.viewers;

          return acc;

        },

        { total: processedLiveStreams.length, stars: 0, comments: 0, shares: 0, viewers: 0 }

      );



      setSummary(newSummary);

    } catch (error) {

      console.error('Error loading live streams:', error);

    } finally {

      setLoading(false);

    }

  };



  const renderLiveItem = ({ item }: { item: LiveItem }) => (

    <View style={styles.liveItem}>

      <MaterialIcons name="live-tv" size={40} color={item.status === 'live' ? '#ff4444' : '#666'} />

      <View style={styles.liveInfo}>

        <Text style={styles.liveTitle}>{item.title}</Text>

        <Text style={[styles.statusText, { color: item.status === 'live' ? '#ff4444' : '#888' }]}>{item.status === 'live' ? '🔴 LIVE' : '⚫ Ended'}</Text>

        <View style={styles.liveStats}>

          <Text style={styles.statText}>⭐ {item.stars}</Text>

          <Text style={styles.statText}>💬 {item.comments}</Text>

          <Text style={styles.statText}>📤 {item.shares}</Text>

          <Text style={styles.statText}>� {item.viewers}</Text>

        </View>

      </View>

    </View>

  );



  if (loading) {

    return (

      <SafeScreen>

        <View style={styles.loadingContainer}>

          <ActivityIndicator size="large" color="#fff" />

          <Text style={styles.loadingText}>Loading Live Streams...</Text>

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

          <Text style={styles.headerTitle}>{title || 'Live Tool'}</Text>

          <View style={{ width: 40 }} />

        </View>



        {/* Summary Stats */}

        <View style={styles.summaryContainer}>

          <View style={styles.summaryItem}>

            <Text style={styles.summaryValue}>{summary.total}</Text>

            <Text style={styles.summaryLabel}>Total Live</Text>

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

            <Text style={styles.summaryValue}>{summary.viewers}</Text>

            <Text style={styles.summaryLabel}>Viewers</Text>

          </View>

        </View>



        {/* Live Streams List */}

        <FlatList

          data={liveStreams}

          keyExtractor={(item) => item.id}

          renderItem={renderLiveItem}

          refreshControl={

            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />

          }

          ListEmptyComponent={

            <View style={styles.emptyContainer}>

              <MaterialIcons name="live-tv" size={48} color="#666" />

              <Text style={styles.emptyText}>No live streams found</Text>

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

  liveItem: {

    flexDirection: 'row',

    alignItems: 'center',

    padding: 15,

    borderBottomWidth: 1,

    borderBottomColor: '#222',

  },

  liveInfo: {

    flex: 1,

    marginLeft: 15,

  },

  liveTitle: {

    fontSize: 16,

    color: '#fff',

    fontWeight: '500',

  },

  statusText: {

    fontSize: 12,

    color: '#ff4444',

    marginTop: 2,

    fontWeight: 'bold',

  },

  liveStats: {

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
