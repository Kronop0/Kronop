import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Text,
  RefreshControl,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Star, MessageCircle, Heart } from 'lucide-react-native';

// Import R2 photo service for real data
import { photoService, type Photo } from './r2_service';

const { width } = Dimensions.get('window');

// Define navigation type
type RootStackParamList = {
  'photos/profile': { userId: string };
};

type ProfileNavigationProp = StackNavigationProp<RootStackParamList, 'photos/profile'>;

interface PhotoPlayerProps {
  category: string;
  photos?: Photo[];
  textStyles?: {
    titleFontSize: number;
    subtitleFontSize: number;
    categoryFontSize: number;
  };
}

// [KRONOP-DEBUG] PhotoPlayer2 component loading...
console.log('[KRONOP-DEBUG] 📸 PhotoPlayer2 component loading...');

// Photo item component
export const PhotoItemComponent = ({ 
  item, 
  isSelected, 
  onPress, 
  textStyles 
}: { 
  item: Photo; 
  isSelected: boolean; 
  onPress: (photo: Photo) => void; 
  textStyles?: any 
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.photoItem,
        isSelected && styles.selectedPhotoItem
      ]}
      onPress={() => onPress(item)}
      activeOpacity={isSelected ? 0.7 : 1}
    >
      <Image
        source={{ uri: item.url }}
        style={styles.photoImage}
        contentFit="cover"
      />
      <View style={styles.photoInfo}>
        <Text style={[styles.photoTitle, { fontSize: textStyles?.titleFontSize || 16 }]}>
          {item.caption || item.id}
        </Text>
        <Text style={[styles.photoSubtitle, { fontSize: textStyles?.subtitleFontSize || 14 }]}>
          {item.category || 'General'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// Loading component
export const LoadingSpinner = () => {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.loadingText}>Loading photos...</Text>
    </View>
  );
};

// Empty state component
export const EmptyState = ({ onRefresh }: { onRefresh: () => void }) => {
  return (
    <View style={styles.emptyContainer}>
      <MessageCircle size={48} color="#999" style={styles.emptyIcon} />
      <Text style={styles.emptyText}>No photos found</Text>
      <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
        <Text style={styles.refreshButtonText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  photoItem: {
    width: (width - 32) / 3,
    height: (width - 32) / 3,
    margin: 4,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    overflow: 'hidden',
  },
  selectedPhotoItem: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  photoInfo: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  photoTitle: {
    color: '#fff',
    fontWeight: '600',
    marginBottom: 2,
  },
  photoSubtitle: {
    color: '#ccc',
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: 40,
  },
  emptyIcon: {
    marginBottom: 10,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
  refreshButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 15,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
