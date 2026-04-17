// Cover Photo Handler for Video Upload

import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

interface CoverPhotoData {
  uri: string;
  name: string;
  size?: number;
  type?: string;
}

export const pickCoverPhoto = async (): Promise<CoverPhotoData | null> => {
  try {
    // Request media library permissions
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photos to select a cover photo.');
      return null;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9], // 16:9 aspect ratio for video covers
      quality: 0.8,
      allowsMultipleSelection: false,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      
      // Validate file
      const fileName = asset.fileName || 'cover_photo.jpg';
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
      const extension = fileName.split('.').pop()?.toLowerCase();
      
      if (!extension || !allowedExtensions.includes(extension)) {
        Alert.alert('Invalid File', 'Please select a valid image file (JPG, PNG, WEBP).');
        return null;
      }

      // Check file size (max 5MB for cover photos)
      const MAX_SIZE = 5 * 1024 * 1024; // 5MB
      if (asset.fileSize && asset.fileSize > MAX_SIZE) {
        Alert.alert('File Too Large', 'Cover photo must be less than 5MB');
        return null;
      }

      return {
        uri: asset.uri,
        name: fileName,
        size: asset.fileSize,
        type: asset.mimeType || 'image/jpeg'
      };
    }

    return null;
  } catch (error) {
    console.error('Error picking cover photo:', error);
    Alert.alert('Error', 'Failed to pick cover photo');
    return null;
  }
};

export const validateCoverPhoto = (coverPhoto: CoverPhotoData | null): boolean => {
  if (!coverPhoto) return false;
  
  // Basic validation
  return !!(coverPhoto.uri && coverPhoto.name);
};

export default {
  pickCoverPhoto,
  validateCoverPhoto
};
