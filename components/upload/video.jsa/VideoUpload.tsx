import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import { Video } from 'expo-av';
import { TitleHandler, DescriptionHandler, CategoryHandler, TagsHandler, ThumbnailHandler, UserInfoHandler } from './video-details/components';
import VideoDetailsIndex, { VideoDetailsHandlers } from './video-details/index';
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
    userInfo: {
      userId: 'user123',
      username: 'demo_user',
      email: 'demo@example.com'
    },
    onUserInfoChange: (userInfo) => setVideoDetails(prev => ({ ...prev, userInfo }))
  });

  // Function to extract video duration
  const getVideoDuration = async (videoUri: string): Promise<number> => {
    try {
      console.log('🔍 Extracting video duration for:', videoUri);
      
      // Simple approach: use file size as a rough estimate
      // This avoids expo-av API complexity and TypeScript issues
      const fileInfo = await FileSystem.getInfoAsync(videoUri);
      const fileSize = (fileInfo as any).size || 0;
      
      // Rough estimate: 1MB ≈ 8 seconds of video (average compression)
      const estimatedDuration = (fileSize / (1024 * 1024)) * 8 * 1000; // Convert to milliseconds
      
      console.log(`📊 Estimated duration: ${(estimatedDuration / 1000).toFixed(2)}s based on ${fileSize} bytes`);
      return estimatedDuration;
      
    } catch (error) {
      console.error('❌ Failed to get video duration:', error);
      
      // Default fallback: assume 10 seconds for unknown videos
      console.log('📊 Using default duration: 10s');
      return 10 * 1000; // 10 seconds in milliseconds
    }
  };

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

        // DEBUG: Log file properties
        console.log('🔍 FILE DEBUG:', {
          name: file.name,
          size: file.size,
          sizeMB: (file.size / 1024 / 1024).toFixed(2) + 'MB',
          mimeType: file.mimeType,
          uri: file.uri
        });

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
      Alert.alert('No File Selected', 'Please select a video file to upload');
      return;
    }

    if (!videoDetails.title) {
      Alert.alert('Missing Title', 'Please add a title for your video');
      return;
    }

    try {
      // Extract video duration first
      const videoDuration = await getVideoDuration(selectedFile.uri);
      
      // Collect clean video details using VideoDetailsIndex
      const cleanVideoDetails = VideoDetailsIndex.collectVideoDetails(videoDetails);
      
      // Handover clean data to r2Server metadata
      const cleanMetadata = await VideoDetailsIndex.handoverToR2Server(cleanVideoDetails, {
        name: selectedFile.name,
        size: selectedFile.size || 0, // Ensure size is properly passed
        type: selectedFile.mimeType || 'video/mp4',
        duration: videoDuration, // Use extracted duration
        uri: selectedFile.uri // Add URI for potential duration extraction
      });

      // DEBUG: Log file properties for routing decision
      console.log('🔍 UPLOAD ROUTING DEBUG:', {
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileSizeMB: (selectedFile.size / 1024 / 1024).toFixed(2) + 'MB',
        fileDuration: videoDuration,
        durationSeconds: (videoDuration / 1000).toFixed(2) + 's',
        cleanMetadataSize: cleanMetadata.fileSize
      });

      // Clean connection - send to Traffic Police (index.js)
      const chunkingTrafficPolice = require('./chunking-logic').default;
      const result = await chunkingTrafficPolice.routeVideoUpload(selectedFile.uri, cleanMetadata);
      
      if (result.success) {
        let thumbnailUrl = null;
        
        // Upload thumbnail ONLY after video upload succeeds
        if (videoDetails.thumbnail) {
          console.log('🖼️ Uploading thumbnail after successful video upload...');
          
          // Check if thumbnail is local file or already uploaded
          if (videoDetails.thumbnail.startsWith('file://') || !videoDetails.thumbnail.startsWith('https://')) {
            // Local file - upload now
            const uniqueId = `thumb_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
            const thumbnailResult = await require('./R2Thumbnail').default.uploadThumbnail(videoDetails.thumbnail, uniqueId);
            
            if (thumbnailResult.success) {
              thumbnailUrl = thumbnailResult.url;
              console.log('✅ Thumbnail uploaded successfully:', thumbnailUrl);
            } else {
              console.warn('⚠️ Thumbnail upload failed, but video succeeded:', thumbnailResult.message);
            }
          } else {
            // Already uploaded - use as-is
            thumbnailUrl = videoDetails.thumbnail;
            console.log('✅ Using existing thumbnail URL:', thumbnailUrl);
          }
        }
        
        // Update video metadata with thumbnail URL
        if (thumbnailUrl) {
          // Here you could update the video's metadata in your database
          console.log('🔗 Linking thumbnail to video:', thumbnailUrl);
        }
        
        if (result.isDemo) {
          Alert.alert('Demo Mode', result.message + '\n\nNote: This is a demo upload. No actual file was uploaded to cloud.');
        } else {
          Alert.alert('Success', result.message + (thumbnailUrl ? '\n\nThumbnail uploaded successfully!' : ''));
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