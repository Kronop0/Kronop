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
import { liveController, LiveItem, LiveStats } from './controller/live/controller';
import { ThreeDotMenu } from './components/ThreeDotMenu';

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
  const [summary, setSummary] = useState<LiveStats>({

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
      const liveStreams = await liveController.getLiveStreams();
      setLiveStreams(liveStreams);
      const newSummary = liveController.getStats(liveStreams);
      setSummary(newSummary);
    } catch (error) {
      console.error('Error loading live streams:', error);
    } finally {
      setLoading(false);
    }
  };



  const renderLiveItem = ({ item }: { item: LiveItem }) => {
    const getItemKey = () => {
      if (!item.url) return '';
      const urlParts = item.url.split('/');
      return urlParts[urlParts.length - 1] || '';
    };

    return (
      <View style={styles.liveItem}>
        <MaterialIcons name="live-tv" size={40} color={item.status === 'live' ? '#ff4444' : '#666'} />
        <View style={styles.liveInfo}>
          <Text style={styles.liveTitle} numberOfLines={1} ellipsizeMode="tail">{item.title}</Text>
          <View style={styles.liveStats}>
            <Text style={styles.statText}>⭐ {item.stars}</Text>
            <Text style={styles.statText}>💬 {item.comments}</Text>
            <Text style={styles.statText}>📤 {item.shares}</Text>
            <Text style={styles.statText}>👁️ {item.viewers}</Text>
            <Text style={[styles.statText, { color: item.status === 'live' ? '#ff4444' : '#888' }]}>{item.status === 'live' ? '🔴 LIVE' : '⚫ Ended'}</Text>
          </View>
        </View>
        <ThreeDotMenu
          itemId={item.id}
          itemKey={item.key || ''}
          type="live"
          onDeleteSuccess={loadLiveStreams}
        />
      </View>
    );
  };



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
          scrollEnabled={true}
          nestedScrollEnabled={true}
          style={{ flex: 1 }}
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
