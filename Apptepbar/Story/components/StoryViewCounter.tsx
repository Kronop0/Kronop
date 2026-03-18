import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';

// View count interface
interface StoryView {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  viewedAt: Date;
  storyId: string;
}

interface StoryViewCounterProps {
  visible: boolean;
  onClose: () => void;
  storyId: string;
  storyOwnerId: string;
}

// Mock view data - in real app, this would come from your backend
const mockViewData: StoryView[] = [
  {
    id: '1',
    userId: 'user1',
    userName: 'rajesh_kumar',
    userAvatar: 'https://picsum.photos/40/40?random=1',
    viewedAt: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    storyId: 'story1'
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'priya_sharma',
    userAvatar: 'https://picsum.photos/40/40?random=2',
    viewedAt: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    storyId: 'story1'
  },
  {
    id: '3',
    userId: 'user3',
    userName: 'amit_singh',
    userAvatar: 'https://picsum.photos/40/40?random=3',
    viewedAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    storyId: 'story1'
  },
  {
    id: '4',
    userId: 'user4',
    userName: 'neha_patel',
    userAvatar: 'https://picsum.photos/40/40?random=4',
    viewedAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    storyId: 'story1'
  },
  {
    id: '5',
    userId: 'user5',
    userName: 'vijay_malhotra',
    userAvatar: 'https://picsum.photos/40/40?random=5',
    viewedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    storyId: 'story1'
  }
];

export default function StoryViewCounter({ visible, onClose, storyId, storyOwnerId }: StoryViewCounterProps) {
  const [viewData, setViewData] = useState<StoryView[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewCount, setViewCount] = useState(0);

  useEffect(() => {
    if (visible) {
      loadViewData();
    }
  }, [visible, storyId]);

  const loadViewData = async () => {
    setLoading(true);
    try {
      // Simulate API call to fetch view data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In real app, you would fetch from your backend
      // const response = await fetch(`/api/stories/${storyId}/views`);
      // const data = await response.json();
      
      // For now, use mock data
      const filteredViews = mockViewData.filter(view => view.storyId === storyId);
      setViewData(filteredViews);
      setViewCount(filteredViews.length);
      
      console.log(`[KRONOP-DEBUG] 📊 Story view count loaded: ${filteredViews.length} views`);
    } catch (error) {
      console.error('Error loading view data:', error);
      setViewData([]);
      setViewCount(0);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const renderViewItem = ({ item }: { item: StoryView }) => (
    <View style={styles.viewItem}>
      <Image
        source={{ uri: item.userAvatar }}
        style={styles.userAvatar}
        contentFit="cover"
      />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.userName}</Text>
        <Text style={styles.viewTime}>{formatTimeAgo(item.viewedAt)}</Text>
      </View>
      <View style={styles.viewIndicator}>
        <MaterialIcons name="visibility" size={16} color="#666" />
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.halfScreenModal}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Story Views</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* View Count */}
        <View style={styles.viewCountContainer}>
          <MaterialIcons name="visibility" size={24} color="#8B00FF" />
          <Text style={styles.viewCountText}>{viewCount} views</Text>
        </View>

        {/* Views List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8B00FF" />
            <Text style={styles.loadingText}>Loading views...</Text>
          </View>
        ) : (
          <FlatList
            data={viewData}
            renderItem={renderViewItem}
            keyExtractor={(item) => item.id}
            style={styles.viewsList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialIcons name="visibility-off" size={48} color="#666" />
                <Text style={styles.emptyText}>No views yet</Text>
                <Text style={styles.emptySubtext}>Be the first to view this story!</Text>
              </View>
            }
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  halfScreenModal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%', // Half screen
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  viewCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  viewCountText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 16,
    fontSize: 14,
  },
  viewsList: {
    flex: 1,
  },
  viewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  viewTime: {
    color: '#666666',
    fontSize: 12,
    marginTop: 2,
  },
  viewIndicator: {
    padding: 4,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
  },
  emptySubtext: {
    color: '#666666',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});
