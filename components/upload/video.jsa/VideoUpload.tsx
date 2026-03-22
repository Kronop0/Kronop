import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import TitleHandler from './video-details/TitleHandler';
import DescriptionHandler from './video-details/DescriptionHandler';
import CategoryHandler from './video-details/CategoryHandler';
import TagsHandler from './video-details/TagsHandler';
import ThumbnailHandler from './video-details/ThumbnailHandler';
import { UserInfoHandler } from './video-details/UserInfoHandler';
import VideoDetailsIndex, { VideoDetailsHandlers } from './video-details';
import { videoUploadStyles } from './rajasthani-layout/VideoUploadStyles';

interface ReelsUploadProps {
  onClose: () => void;
  onUpload?: (fileUri: string, metadata: any) => Promise<void>;
  uploading?: boolean;
  uploadProgress?: number;
}

export default function VideoUpload({ 
  onClose, 
  onUpload, 
  uploading = false, 
  uploadProgress = 0 
}: ReelsUploadProps) {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<any>(null);
  
  // Use VideoDetailsHandlers interface for strict data handling
  const [videoDetails, setVideoDetails] = useState<VideoDetailsHandlers>({
    title: '',
    onTitleChange: (title) => setVideoDetails(prev => ({ ...prev, title })),
    description: '',
    onDescriptionChange: (description) => setVideoDetails(prev => ({ ...prev, description })),
    thumbnail: null,
    onThumbnailChange: (thumbnail) => setVideoDetails(prev => ({ ...prev, thumbnail })),
    tags: [],
    onTagsChange: (tags) => setVideoDetails(prev => ({ ...prev, tags })),
    category: '',
    onCategoryChange: (category) => setVideoDetails(prev => ({ ...prev, category })),
    userInfo: { userId: 'user123', username: 'demo_user' },
    onUserInfoChange: (userInfo) => setVideoDetails(prev => ({ ...prev, userInfo }))
  });

  const pickReel = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['video/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        
        const MAX_SIZE = 100 * 1024 * 1024; // 100MB
        if (file.size && file.size > MAX_SIZE) {
          Alert.alert('File Too Large', 'Video files must be less than 100MB');
          return;
        }

        setSelectedFile(file);
        if (!videoDetails.title) {
          videoDetails.onTitleChange(file.name.split('.')[0]);
        }
      }
    } catch (error) {
      console.error('Error picking reel:', error);
      Alert.alert('Error', 'Failed to pick video file');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      Alert.alert('No File Selected', 'Please select a video file');
      return;
    }

    if (!videoDetails.title.trim()) {
      Alert.alert('Missing Title', 'Please enter a title for your reel');
      return;
    }

    try {
      // Collect clean video details using VideoDetailsIndex
      const cleanVideoDetails = VideoDetailsIndex.collectVideoDetails(videoDetails);
      
      // Handover clean data to r2Server metadata
      const cleanMetadata = await VideoDetailsIndex.handoverToR2Server(cleanVideoDetails, {
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.mimeType || 'video/mp4'
      });

      // Clean connection - send to Traffic Police (index.js)
      const chunkingTrafficPolice = require('./chunking-logic').default;
      const result = await chunkingTrafficPolice.routeVideoUpload(selectedFile.uri, cleanMetadata);
      
      if (result.success) {
        if (result.isDemo) {
          Alert.alert('Demo Mode', result.message + '\n\nNote: This is a demo upload. No actual file was uploaded to cloud.');
        } else {
          Alert.alert('Success', result.message);
        }
        onClose();
        router.replace('/');
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Upload failed for Reels');
    }
  };

  return (
    <ScrollView style={videoUploadStyles.container} showsVerticalScrollIndicator={false}>
      <View style={videoUploadStyles.uploadArea}>
        <TouchableOpacity 
          style={videoUploadStyles.uploadButton}
          onPress={pickReel}
          disabled={uploading}
        >
          <MaterialIcons name="videocam" size={32} color="#8B00FF" />
          <Text style={videoUploadStyles.uploadButtonText}>Choose Video</Text>
          <Text style={videoUploadStyles.uploadButtonSubtext}>Select MP4, MOV, AVI</Text>
        </TouchableOpacity>

        {selectedFile && (
          <View style={videoUploadStyles.selectedFileContainer}>
            <Text style={videoUploadStyles.selectedFileName}>{selectedFile.name}</Text>
            <Text style={videoUploadStyles.selectedFileSize}>
              {selectedFile.size ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'}
            </Text>
          </View>
        )}

        {/* Thumbnail Button - Just below video select, half height */}
        <ThumbnailHandler 
          thumbnail={videoDetails.thumbnail}
          onThumbnailChange={videoDetails.onThumbnailChange}
        />
      </View>

      <View style={videoUploadStyles.formSection}>
        <TitleHandler 
          title={videoDetails.title}
          onTitleChange={videoDetails.onTitleChange}
        />
        
        <DescriptionHandler 
          description={videoDetails.description}
          onDescriptionChange={videoDetails.onDescriptionChange}
        />
        
        <CategoryHandler 
          category={videoDetails.category}
          onCategoryChange={videoDetails.onCategoryChange}
        />
        
        <TagsHandler 
          tags={videoDetails.tags}
          onTagsChange={videoDetails.onTagsChange}
        />
        
        {/* UserInfoHandler - Not rendered, works in background only */}
      </View>

      <TouchableOpacity 
        style={[videoUploadStyles.uploadButtonMain, uploading && videoUploadStyles.uploadButtonDisabled]}
        onPress={handleUpload}
        disabled={uploading || !selectedFile}
      >
        {uploading ? (
          <>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <View style={{ width: 8 }} />
            <Text style={videoUploadStyles.uploadButtonMainText}>
              Uploading... {uploadProgress}%
            </Text>
          </>
        ) : (
          <>
            <MaterialIcons name="upload" size={24} color="#FFFFFF" />
            <View style={{ width: 8 }} />
            <Text style={videoUploadStyles.uploadButtonMainText}>Upload Reel</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}