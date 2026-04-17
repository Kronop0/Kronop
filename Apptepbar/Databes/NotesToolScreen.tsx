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
import { notesController, NoteItem, NoteStats } from './controller/Notes/controller';
import { ThreeDotMenu } from './components/ThreeDotMenu';

// Note Item Component
const NoteListItem = ({ item, onDelete }: { item: NoteItem; onDelete?: () => void }) => {
  const [isPrivate, setIsPrivate] = useState(false);

  // Extract key from URL for deletion
  const getItemKey = () => {
    if (!item.url) return '';
    const urlParts = item.url.split('/');
    return urlParts[urlParts.length - 1] || '';
  };

  return (
    <View style={styles.noteItem}>
      <View style={styles.noteContent}>
        <Text style={styles.noteTitle} numberOfLines={1} ellipsizeMode="tail">{item.title}</Text>
        {item.content ? (
          <Text style={styles.noteText} numberOfLines={2}>{item.content}</Text>
        ) : null}
        <View style={styles.noteStats}>
          <Text style={styles.statText}>⭐ {item.stars}</Text>
          <Text style={styles.statText}>💬 {item.comments}</Text>
          <Text style={styles.statText}>📤 {item.shares}</Text>
          <Text style={styles.statText}>👁️ {item.views}</Text>
        </View>
      </View>
      <ThreeDotMenu
        itemId={item.id}
        itemKey={item.key || ''}
        type="notes"
        onDeleteSuccess={onDelete}
        isPrivate={isPrivate}
        onPrivacyChange={setIsPrivate}
      />
    </View>
  );
};

export default function NotesToolScreen() {
  const router = useRouter();
  const { title, stats } = useLocalSearchParams<{
    title?: string;
    stats?: string;
  }>();

  const initialStats = stats ? JSON.parse(stats) : {};
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [summary, setSummary] = useState<NoteStats>({
    total: initialStats?.total || 0,
    stars: initialStats?.stars || 0,
    comments: initialStats?.comments || 0,
    shares: initialStats?.shares || 0,
    views: initialStats?.views || 0,
  });

  useEffect(() => {
    loadNotes();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotes();
    setRefreshing(false);
  };

  const loadNotes = async () => {
    try {
      setLoading(true);
      const notes = await notesController.getNotes();
      setNotes(notes);
      const newSummary = notesController.getStats(notes);
      setSummary(newSummary);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderNoteItem = ({ item }: { item: NoteItem }) => (
    <NoteListItem item={item} onDelete={loadNotes} />
  );

  if (loading) {
    return (
      <SafeScreen>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Loading Notes...</Text>
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
          <Text style={styles.headerTitle}>{title || 'Notes Tool'}</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Summary Stats */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{summary.total}</Text>
            <Text style={styles.summaryLabel}>Total Notes</Text>
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

        {/* Notes List */}
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          renderItem={renderNoteItem}
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

  // Note-specific styles
  noteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },

  noteContent: {
    flex: 1,
    marginRight: 10,
  },

  noteTitle: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
    marginBottom: 4,
  },

  noteText: {
    fontSize: 13,
    color: '#999',
    marginBottom: 8,
  },

  noteStats: {
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
