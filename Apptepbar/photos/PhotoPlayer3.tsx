import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Star, Heart } from 'lucide-react-native';

// Import R2 photo service for real data
import { photoService, type Photo } from './r2_service';

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

// [KRONOP-DEBUG] PhotoPlayer3 component loading...
console.log('[KRONOP-DEBUG] 📸 PhotoPlayer3 component loading...');

// Photo prefetch logic
export const usePhotoPrefetch = (selectedPhoto: Photo | null, photos: Photo[]) => {
  const [nextPhotoUrl, setNextPhotoUrl] = useState<string | null>(null);
  const [prevPhotoUrl, setPrevPhotoUrl] = useState<string | null>(null);

  // Prefetch next and previous photos for smooth transitions
  useEffect(() => {
    if (selectedPhoto && photos.length > 0) {
      const currentIndex = photos.findIndex(photo => photo.id === selectedPhoto.id);
      
      // Prefetch next photo
      if (currentIndex < photos.length - 1) {
        const nextUrl = photos[currentIndex + 1].url;
        setNextPhotoUrl(nextUrl);
        // Preload image using Image from expo-image
        Image.prefetch(nextUrl).catch(() => {});
      } else {
        setNextPhotoUrl(null);
      }
      
      // Prefetch previous photo
      if (currentIndex > 0) {
        const prevUrl = photos[currentIndex - 1].url;
        setPrevPhotoUrl(prevUrl);
        Image.prefetch(prevUrl).catch(() => {});
      } else {
        setPrevPhotoUrl(null);
      }
    }
  }, [selectedPhoto, photos]);

  return { nextPhotoUrl, prevPhotoUrl };
};

// Photo fetching logic
export const usePhotoFetching = (category: string, photos: Photo[] | undefined, setPhotos: React.Dispatch<React.SetStateAction<Photo[]>>, setLoading: React.Dispatch<React.SetStateAction<boolean>>, setRefreshing: React.Dispatch<React.SetStateAction<boolean>>) => {
  // Fetch real photos from R2 service
  const fetchPhotosFromR2 = async () => {
    console.log(`[PhotoPlayer.tsx] STEP 3: Starting photo fetch from r2_service.ts - Category: ${category}`);
    try {
      setLoading(true);
      const realPhotos = await photoService.getPhotosByCategory(category.toLowerCase(), 20, 0);
      console.log(`[PhotoPlayer.tsx] STEP 3: ✓ Received data from r2_service.ts - ${realPhotos.length} photos`);
      console.log(`[PhotoPlayer.tsx] STEP 3: Photo URLs received:`, realPhotos.map(p => p.url));
      setPhotos(realPhotos);
      console.log(`[PhotoPlayer.tsx] STEP 3: COMPLETED - Final state has ${realPhotos.length} photos`);
    } catch (error) {
      console.error(`[PhotoPlayer.tsx] STEP 3: ❌ Error: Failed to receive data from r2_service.ts - ${error}`);
      console.log(`[LOG-PHOTO-PLAYER] Falling back to categoryPhotos: ${photos?.length || 0} photos`);
      setPhotos(photos || []);
      console.log(`[PhotoPlayer.tsx] STEP 3: FALLBACK - Using categoryPhotos with ${photos?.length || 0} photos`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  return { fetchPhotosFromR2 };
};
