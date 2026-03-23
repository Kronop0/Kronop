import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Alert, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { videoUploadStyles } from '../rajasthani-layout/VideoUploadStyles';

interface ThumbnailHandlerProps {
  thumbnail: string | null;
  onThumbnailChange: (thumbnail: string | null) => void;
}

export default function ThumbnailHandler({ thumbnail, onThumbnailChange }: ThumbnailHandlerProps) {
  const pickThumbnail = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false, // No editing, direct upload
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        
        // Check file size (max 5MB for thumbnail)
        if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
          // Terminal error print
          const errorMsg = `❌ THUMBNAIL UPLOAD FAILED: File too large (${(asset.fileSize / 1024 / 1024).toFixed(2)}MB). Max allowed: 5MB`;
          console.error(errorMsg);
          console.log('==========================================');
          Alert.alert('File Too Large', `Thumbnail must be less than 5MB. Selected file is ${(asset.fileSize / 1024 / 1024).toFixed(2)}MB`);
          return;
        }

        // Store local URI for now - upload will happen after video upload
        console.log('📱 THUMBNAIL SELECTED: Storing local URI for post-video upload...');
        console.log(`🔗 THUMBNAIL LOCAL URI: ${asset.uri}`);
        console.log('==========================================');
        
        // Return local URI instead of uploading immediately
        onThumbnailChange(asset.uri);
      }
    } catch (error) {
      // Terminal error print
      const errorMsg = `❌ THUMBNAIL PICK FAILED: ${error.message}`;
      console.error(errorMsg);
      console.log('==========================================');
      Alert.alert('Error', 'Failed to pick thumbnail');
    }
  };

  const removeThumbnail = () => {
    const successMsg = `✅ THUMBNAIL REMOVED: User removed thumbnail successfully`;
    console.log(successMsg);
    console.log('==========================================');
    onThumbnailChange(null);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.thumbnailButton}
        onPress={pickThumbnail}
      >
        {thumbnail ? (
          <Image source={{ uri: thumbnail }} style={styles.thumbnailImage} />
        ) : (
          <View style={styles.thumbnailPlaceholder}>
            <MaterialIcons name="image" size={32} color="#8B00FF" />
          </View>
        )}
      </TouchableOpacity>

      {thumbnail && (
        <TouchableOpacity 
          style={styles.removeButton}
          onPress={removeThumbnail}
        >
          <MaterialIcons name="close" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  thumbnailButton: {
    width: '100%',
    height: 60, // Even smaller (90 -> 60)
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#8B00FF',
    backgroundColor: '#1A1A1A',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(139, 0, 255, 0.8)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
