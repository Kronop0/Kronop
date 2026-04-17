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
import { songController, SongItem, SongStats } from './controller/song/controller';
import { ThreeDotMenu } from './components/ThreeDotMenu';

export default function SongToolScreen() {

  const router = useRouter();

  const { title, stats } = useLocalSearchParams<{

    title?: string;

    stats?: string;

  }>();



  const initialStats = stats ? JSON.parse(stats) : {};

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [songs, setSongs] = useState<SongItem[]>([]);
  const [summary, setSummary] = useState<SongStats>({

    total: initialStats?.total || 0,

    stars: initialStats?.stars || 0,

    comments: initialStats?.comments || 0,

    shares: initialStats?.shares || 0,

    plays: initialStats?.plays || 0,

  });



  useEffect(() => {

    loadSongs();

  }, []);



  const onRefresh = async () => {

    setRefreshing(true);

    await loadSongs();

    setRefreshing(false);

  };



  const loadSongs = async () => {
    try {
      setLoading(true);
      const songs = await songController.getSongs();
      setSongs(songs);
      const newSummary = songController.getStats(songs);
      setSummary(newSummary);
    } catch (error) {
      console.error('Error loading songs:', error);
    } finally {
      setLoading(false);
    }
  };



  const renderSongItem = ({ item }: { item: SongItem }) => {
    const getItemKey = () => {
      if (!item.url) return '';
      const urlParts = item.url.split('/');
      return urlParts[urlParts.length - 1] || '';
    };

    return (
      <View style={styles.songItem}>
        <MaterialIcons name="music-note" size={40} color="#666" />
        <View style={styles.songInfo}>
          <Text style={styles.songTitle} numberOfLines={1} ellipsizeMode="tail">{item.title}</Text>
          <View style={styles.songStats}>
            <Text style={styles.statText}>⭐ {item.stars}</Text>
            <Text style={styles.statText}>💬 {item.comments}</Text>
            <Text style={styles.statText}>📤 {item.shares}</Text>
            <Text style={styles.statText}>▶️ {item.plays}</Text>
            <Text style={styles.statText}>⏱️ {item.duration}</Text>
          </View>
        </View>
        <ThreeDotMenu
          itemId={item.id}
          itemKey={item.key || ''}
          type="song"
          onDeleteSuccess={loadSongs}
        />
      </View>
    );
  };



  if (loading) {

    return (

      <SafeScreen>

        <View style={styles.loadingContainer}>

          <ActivityIndicator size="large" color="#fff" />

          <Text style={styles.loadingText}>Loading Songs...</Text>

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

          <Text style={styles.headerTitle}>{title || 'Song Tool'}</Text>

          <View style={{ width: 40 }} />

        </View>



        {/* Summary Stats */}

        <View style={styles.summaryContainer}>

          <View style={styles.summaryItem}>

            <Text style={styles.summaryValue}>{summary.total}</Text>

            <Text style={styles.summaryLabel}>Total Songs</Text>

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

            <Text style={styles.summaryValue}>{summary.plays}</Text>

            <Text style={styles.summaryLabel}>Plays</Text>

          </View>

        </View>



        {/* Songs List */}

        <FlatList
          data={songs}
          keyExtractor={(item) => item.id}
          renderItem={renderSongItem}
          scrollEnabled={true}
          nestedScrollEnabled={true}
          style={{ flex: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="library-music" size={48} color="#666" />
              <Text style={styles.emptyText}>No songs found</Text>
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

  songItem: {

    flexDirection: 'row',

    alignItems: 'center',

    padding: 15,

    borderBottomWidth: 1,

    borderBottomColor: '#222',

  },

  songInfo: {

    flex: 1,

    marginLeft: 15,

  },

  songTitle: {

    fontSize: 16,

    color: '#fff',

    fontWeight: '500',

  },

  artistText: {

    fontSize: 12,

    color: '#888',

    marginTop: 2,

  },

  durationText: {

    fontSize: 12,

    color: '#888',

    marginTop: 2,

  },

  songStats: {

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
