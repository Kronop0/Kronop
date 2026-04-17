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
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import StarButton from '../StarButton';
import { API_BASE_URL } from '../../../../constants/network';

// Story View Service for API calls
class StoryViewService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL.replace(/\/api$/, '');
  }

  // Record a story view
  async recordStoryView(storyId: string, userId: string): Promise<boolean> {
    try {
      console.log(`[KRONOP-DEBUG] 👀 Recording story view: storyId=${storyId}, userId=${userId}`);
      
      const response = await fetch(`${this.baseUrl}/api/stories/${storyId}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          viewedAt: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`[KRONOP-DEBUG] ✅ Story view recorded:`, data);
        return true;
      } else {
        console.error(`[KRONOP-DEBUG] ❌ Failed to record story view: ${response.status}`);
        return false;
      }
    } catch (error) {
      console.error('[KRONOP-DEBUG] ❌ Error recording story view:', error);
      return false;
    }
  }

  // Get story views with user details
  async getStoryViews(storyId: string): Promise<StoryView[]> {
    try {
      console.log(`[KRONOP-DEBUG] 📊 Fetching story views for: ${storyId}`);
      
      const response = await fetch(`${this.baseUrl}/api/stories/${storyId}/views`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`[KRONOP-DEBUG] ✅ Retrieved ${data.views?.length || 0} story views`);
        return data.views || [];
      } else {
        console.error(`[KRONOP-DEBUG] ❌ Failed to fetch story views: ${response.status}`);
        return [];
      }
    } catch (error) {
      console.error('[KRONOP-DEBUG] ❌ Error fetching story views:', error);
      return [];
    }
  }

  // Toggle star on story view
  async toggleStoryStar(storyId: string, userId: string, hasStarred: boolean): Promise<boolean> {
    try {
      console.log(`[KRONOP-DEBUG] ⭐ Toggling story star: storyId=${storyId}, userId=${userId}, hasStarred=${hasStarred}`);
      
      const response = await fetch(`${this.baseUrl}/api/stories/${storyId}/star`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          hasStarred: hasStarred,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`[KRONOP-DEBUG] ✅ Story star updated:`, data);
        return true;
      } else {
        console.error(`[KRONOP-DEBUG] ❌ Failed to update story star: ${response.status}`);
        return false;
      }
    } catch (error) {
      console.error('[KRONOP-DEBUG] ❌ Error updating story star:', error);
      return false;
    }
  }
}

const storyViewService = new StoryViewService();

// View count interface
interface StoryView {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  viewedAt: Date;
  storyId: string;
  hasStarred?: boolean;
}

interface StoryViewCounterProps {
  visible: boolean;
  onClose: () => void;
  storyId: string;
  storyOwnerId: string;
  currentUserId?: string; // Current user ID
  isStoryOwner?: boolean; // Is current user the story owner
}

// Mock view data - in real app, this would come from your backend
const mockViewData: StoryView[] = [
  {
    id: '1',
    userId: 'user1',
    userName: 'rajesh_kumar',
    userAvatar: 'https://picsum.photos/40/40?random=1',
    viewedAt: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    storyId: 'story1',
    hasStarred: true
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'priya_sharma',
    userAvatar: 'https://picsum.photos/40/40?random=2',
    viewedAt: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    storyId: 'story1',
    hasStarred: false
  },
  {
    id: '3',
    userId: 'user3',
    userName: 'amit_singh',
    userAvatar: 'https://picsum.photos/40/40?random=3',
    viewedAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    storyId: 'story1',
    hasStarred: true
  },
  {
    id: '4',
    userId: 'user4',
    userName: 'neha_patel',
    userAvatar: 'https://picsum.photos/40/40?random=4',
    viewedAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    storyId: 'story1',
    hasStarred: false
  },
  {
    id: '5',
    userId: 'user5',
    userName: 'vijay_malhotra',
    userAvatar: 'https://picsum.photos/40/40?random=5',
    viewedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    storyId: 'story1',
    hasStarred: true
  }
];

export default function StoryViewCounter({ visible, onClose, storyId, storyOwnerId, currentUserId, isStoryOwner = false }: StoryViewCounterProps) {
  const [viewData, setViewData] = useState<StoryView[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const [starCount, setStarCount] = useState(0);
  const [hasViewed, setHasViewed] = useState(false);
  const [hasStarred, setHasStarred] = useState(false);

  useEffect(() => {
    if (visible && storyId && currentUserId) {
      // Record the view when modal opens
      recordView();
      loadViewData();
    }
  }, [visible, storyId, currentUserId]);

  // Record story view in database
  const recordView = async () => {
    if (!currentUserId || !storyId) return;
    
    try {
      const success = await storyViewService.recordStoryView(storyId, currentUserId);
      if (success) {
        setHasViewed(true);
        console.log(`[KRONOP-DEBUG] ✅ Story view recorded for user ${currentUserId}`);
      }
    } catch (error) {
      console.error('[KRONOP-DEBUG] ❌ Error recording view:', error);
    }
  };

  const loadViewData = async () => {
    setLoading(true);
    try {
      // Fetch real view data from backend
      const views = await storyViewService.getStoryViews(storyId);
      
      setViewData(views);
      setViewCount(views.length);
      
      // Count stars
      const starredCount = views.filter(view => view.hasStarred).length;
      setStarCount(starredCount);
      
      // Check if current user has starred this story
      const currentUserView = views.find(view => view.userId === currentUserId);
      setHasStarred(currentUserView?.hasStarred || false);
      
      console.log(`[KRONOP-DEBUG] 📊 Story view count loaded: ${views.length} views, ${starredCount} stars`);
    } catch (error) {
      console.error('[KRONOP-DEBUG] ❌ Error loading view data:', error);
      
      // Fallback to mock data for demo purposes
      console.log('[KRONOP-DEBUG] 🔄 Using fallback mock data...');
      const filteredViews = mockViewData.filter(view => view.storyId === storyId);
      setViewData(filteredViews);
      setViewCount(filteredViews.length);
      
      const starredCount = filteredViews.filter(view => view.hasStarred).length;
      setStarCount(starredCount);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (timestamp: Date | string) => {
    const now = new Date();
    const time = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    const diffMs = now.getTime() - time.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  // Handle star toggle
  const handleStarToggle = async () => {
    if (!currentUserId || !storyId) return;
    
    const newStarState = !hasStarred;
    
    try {
      const success = await storyViewService.toggleStoryStar(storyId, currentUserId, newStarState);
      
      if (success) {
        setHasStarred(newStarState);
        // Update local view data
        setViewData(prevData => 
          prevData.map(view => 
            view.userId === currentUserId 
              ? { ...view, hasStarred: newStarState }
              : view
          )
        );
        // Update star count
        setStarCount(prev => newStarState ? prev + 1 : prev - 1);
        
        console.log(`[KRONOP-DEBUG] ⭐ Star ${newStarState ? 'added' : 'removed'} successfully`);
      } else {
        Alert.alert('Error', 'Failed to update star. Please try again.');
      }
    } catch (error) {
      console.error('[KRONOP-DEBUG] ❌ Error toggling star:', error);
      Alert.alert('Error', 'Failed to update star. Please try again.');
    }
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
      
      {/* Star Icon - Only for story owner to see who starred */}
      {isStoryOwner && item.hasStarred && (
        <View style={styles.starIndicator}>
          <MaterialIcons name="star" size={16} color="#FFD700" />
        </View>
      )}
      
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
        {/* Modal Header */}
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Story Views</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <MaterialIcons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* View and Star Counts */}
        <View style={styles.viewCountContainer}>
          <MaterialIcons name="visibility" size={20} color="#FFFFFF" />
          <Text style={styles.viewCountText}>{viewCount} {viewCount === 1 ? 'View' : 'Views'}</Text>
        </View>
        
        <View style={styles.starCountContainer}>
          <MaterialIcons name="star" size={20} color="#FFD700" />
          <Text style={styles.starCountText}>{starCount} {starCount === 1 ? 'Star' : 'Stars'}</Text>
          
          {/* Star Button for Current User */}
          {currentUserId && !isStoryOwner && (
            <TouchableOpacity 
              style={[styles.starButton, hasStarred && styles.starButtonActive]}
              onPress={handleStarToggle}
              activeOpacity={0.7}
            >
              <MaterialIcons 
                name={hasStarred ? 'star' : 'star-border'} 
                size={16} 
                color={hasStarred ? '#FFFFFF' : '#FFD700'} 
              />
              <Text style={[styles.starButtonText, hasStarred && styles.starButtonTextActive]}>
                {hasStarred ? 'Starred' : 'Star'}
              </Text>
            </TouchableOpacity>
          )}
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
  starCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  viewCountText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  starCountText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFD700',
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
  starIndicator: {
    padding: 4,
    marginRight: 4,
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
  starButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
    marginLeft: 'auto',
  },
  starButtonActive: {
    backgroundColor: '#FFD700',
  },
  starButtonText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '600',
  },
  starButtonTextActive: {
    color: '#FFFFFF',
  },
});
