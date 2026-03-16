import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  StatusBar,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system/legacy';
import { Audio } from 'expo-av';

const { width, height } = Dimensions.get('window');

interface CameraComponentProps {
  facing: CameraType;
  isLive: boolean;
  isMicOn: boolean;
  onToggleCamera: () => void;
  onToggleMic: () => void;
  onEndStream: () => void;
  streamId?: string | null;
  onSegmentUpload?: (segmentData: any) => Promise<void>;
  children?: React.ReactNode;
}

export default function CameraComponent({ 
  facing, 
  isLive, 
  isMicOn,
  onToggleCamera, 
  onToggleMic,
  onEndStream, 
  streamId,
  onSegmentUpload,
  children 
}: CameraComponentProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [audioPermission, requestAudioPermission] = Audio.usePermissions();
  const insets = useSafeAreaInsets();
  const recordingInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const segmentIndex = useRef(0);
  const cameraRef = useRef<any>(null);
  const mediaRecorderRef = useRef<any>(null);
  const chunksRef = useRef<Blob[]>([]);
  const isRecordingRef = useRef(false);
  const currentRecordingRef = useRef<any>(null);
  const videoStreamRef = useRef<Buffer[]>([]); // For continuous video stream

  // Request both camera and audio permissions
  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
    if (!audioPermission?.granted) {
      requestAudioPermission();
    }
  }, [permission, audioPermission]);

  // Start REAL MediaRecorder streaming when live
  useEffect(() => {
    if (isLive && streamId && onSegmentUpload && !recordingInterval.current && permission?.granted && audioPermission?.granted) {
      console.log('🎥 Starting DIRECT video stream...');
      
      // Start single continuous recording
      startContinuousRecording();
      
      // Upload video data periodically
      recordingInterval.current = setInterval(async () => {
        try {
          // Upload accumulated video data
          if (videoStreamRef.current.length > 0 && onSegmentUpload) {
            const combinedBuffer = Buffer.concat(videoStreamRef.current);
            await onSegmentUpload(combinedBuffer);
            console.log(`📹 Video stream uploaded: ${combinedBuffer.length} bytes`);
            
            // Clear after upload
            videoStreamRef.current = [];
          }
        } catch (error) {
          console.error('Failed to upload video stream:', error);
        }
      }, 3000); // Upload every 3 seconds
    }

    return () => {
      // Cleanup
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
        recordingInterval.current = null;
        console.log('🛑 Upload interval cleared');
      }
      stopContinuousRecording();
    };
  }, [isLive, streamId, onSegmentUpload, permission, audioPermission]);

  // Start single continuous recording
  const startContinuousRecording = async () => {
    try {
      if (!cameraRef.current || !permission?.granted || !audioPermission?.granted) {
        throw new Error('Camera or audio permission not granted');
      }

      if (isRecordingRef.current) {
        console.log('🔄 Already recording, skipping...');
        return;
      }

      console.log('🎥 Starting CONTINUOUS video recording...');
      isRecordingRef.current = true;
      
      // Start one long recording
      currentRecordingRef.current = await cameraRef.current.recordAsync({
        quality: '1080p',
        codec: 'h264',
        mute: !isMicOn,
        // NO maxDuration - continuous recording
      });
      
      if (currentRecordingRef.current && currentRecordingRef.current.uri) {
        console.log(`📹 Continuous recording started: ${currentRecordingRef.current.uri}`);
        
        // Start processing the continuous recording
        processContinuousRecording();
      }
      
    } catch (error) {
      console.error('Failed to start continuous recording:', error);
      isRecordingRef.current = false;
      currentRecordingRef.current = null;
    }
  };

  // Process continuous recording
  const processContinuousRecording = async () => {
    try {
      if (!currentRecordingRef.current || !currentRecordingRef.current.uri) {
        return;
      }

      // Read the current recording data
      const videoBuffer = await readVideoFileToBuffer(currentRecordingRef.current.uri);
      if (videoBuffer) {
        videoStreamRef.current.push(videoBuffer);
        console.log(`� Video chunk added to stream: ${videoBuffer.length} bytes`);
      }
      
      // Continue processing
      setTimeout(() => {
        if (isLive && isRecordingRef.current) {
          processContinuousRecording();
        }
      }, 2000); // Process every 2 seconds
      
    } catch (error) {
      console.error('Failed to process continuous recording:', error);
    }
  };

  // Stop continuous recording
  const stopContinuousRecording = async () => {
    try {
      if (cameraRef.current && isRecordingRef.current) {
        await cameraRef.current.stopRecording();
        console.log('🛑 Continuous recording stopped');
      }
      isRecordingRef.current = false;
      currentRecordingRef.current = null;
    } catch (error) {
      console.warn('Failed to stop continuous recording:', error);
    }
  };

  // Initialize MediaRecorder for REAL video streaming
  const initializeMediaRecorder = async () => {
    try {
      if (!cameraRef.current) {
        console.warn('Camera reference not available, retrying...');
        setTimeout(() => initializeMediaRecorder(), 500);
        return;
      }

      console.log('🎥 Initializing REAL MediaRecorder...');
      
      // Use expo-camera's recordAsync directly since MediaRecorder API is not available in React Native
      console.log('🔄 Using expo-camera recordAsync for REAL video...');
      await startExpoRecording();
      
    } catch (error) {
      console.error('Failed to initialize MediaRecorder:', error);
      // Fallback to expo-camera recordAsync
      console.log('🔄 Falling back to expo-camera recordAsync...');
      await startExpoRecording();
    }
  };

  // Use expo-camera recording for DIRECT VIDEO STREAM
  const startExpoRecording = async () => {
    try {
      if (!cameraRef.current || !permission?.granted || !audioPermission?.granted) {
        throw new Error('Camera or audio permission not granted');
      }

      // IMPORTANT: Only start if not already recording
      if (isRecordingRef.current) {
        console.log('� Already recording, skipping...');
        return;
      }

      console.log('🎥 Starting DIRECT video stream recording...');
      isRecordingRef.current = true;
      
      // Start continuous recording with proper error handling
      try {
        currentRecordingRef.current = await cameraRef.current.recordAsync({
          quality: '1080p',
          codec: 'h264',
          mute: !isMicOn,
          maxDuration: 10, // 10 seconds chunks to avoid conflicts
        });
        
        if (currentRecordingRef.current && currentRecordingRef.current.uri) {
          console.log(`📹 Video chunk recorded: ${currentRecordingRef.current.uri}`);
          
          // Read video data and add to stream
          const videoBuffer = await readVideoFileToBuffer(currentRecordingRef.current.uri);
          if (videoBuffer) {
            videoStreamRef.current.push(videoBuffer);
            
            // Upload combined video stream periodically
            if (videoStreamRef.current.length > 0 && onSegmentUpload) {
              const combinedBuffer = Buffer.concat(videoStreamRef.current);
              await onSegmentUpload(combinedBuffer);
              console.log(`📹 Direct video stream uploaded: ${combinedBuffer.length} bytes`);
              
              // Clear stream after upload
              videoStreamRef.current = [];
            }
          }
          
          // Reset recording state
          isRecordingRef.current = false;
          currentRecordingRef.current = null;
          
          // Schedule next recording chunk with delay
          setTimeout(() => {
            if (isLive && !isRecordingRef.current) {
              startExpoRecording();
            }
          }, 1000); // 1 second delay between chunks
        }
        
      } catch (recordError) {
        console.error('Recording failed:', recordError);
        isRecordingRef.current = false;
        currentRecordingRef.current = null;
        
        // Try to stop any existing recording
        try {
          await cameraRef.current.stopRecording();
        } catch (stopError) {
          console.warn('Failed to stop recording:', stopError);
        }
      }
      
    } catch (error) {
      console.error('Direct video stream recording failed:', error);
      isRecordingRef.current = false;
      currentRecordingRef.current = null;
      
      // Check if it's a permission error
      if ((error as any).message?.includes('permission')) {
        console.warn('Permission error - requesting again...');
        if (!permission?.granted) {
          await requestPermission();
        }
        if (!audioPermission?.granted) {
          await requestAudioPermission();
        }
      }
    }
  };

  // Process MediaRecorder chunks
  const processMediaChunks = async (): Promise<Buffer | null> => {
    try {
      if (chunksRef.current.length === 0) {
        return null;
      }

      // Get the latest chunk
      const chunk = chunksRef.current.pop();
      if (!chunk) return null;

      // Convert Blob to Buffer
      const arrayBuffer = await chunk.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      console.log(`📹 MediaRecorder chunk processed: ${buffer.length} bytes`);
      return buffer;
      
    } catch (error) {
      console.error('Failed to process MediaRecorder chunk:', error);
      return null;
    }
  };

  // Stop MediaRecorder
  const stopMediaRecorder = () => {
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        console.log('🛑 MediaRecorder stopped');
      }
    } catch (error) {
      console.warn('Failed to stop MediaRecorder:', error);
    }
  };

  // Read video file to Buffer (fallback)
  const readVideoFileToBuffer = async (videoUri: string): Promise<Buffer> => {
    try {
      console.log(`📱 Reading video file: ${videoUri}`);
      
      const base64Data = await FileSystem.readAsStringAsync(videoUri, {
        encoding: 'base64',
      });
      
      const buffer = Buffer.from(base64Data, 'base64');
      console.log(`📹 Video buffer created: ${buffer.length} bytes`);
      
      return buffer;
    } catch (error) {
      console.error('Failed to read video file:', error);
      throw error;
    }
  };

  // Handle End Stream - CONTINUOUS RECORDING FINALIZATION
  const handleEndStreamInternal = async () => {
    try {
      console.log('🛑 END STREAM TRIGGERED - Finalizing continuous recording...');
      
      // 1. Stop upload interval
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
        recordingInterval.current = null;
        console.log('🛑 Upload interval stopped');
      }
      
      // 2. Stop continuous recording
      await stopContinuousRecording();
      
      // 3. Upload final video stream data
      if (videoStreamRef.current.length > 0 && onSegmentUpload && streamId) {
        const finalBuffer = Buffer.concat(videoStreamRef.current);
        await onSegmentUpload(finalBuffer);
        console.log(`📹 Final video stream uploaded: ${finalBuffer.length} bytes`);
        videoStreamRef.current = [];
      }
      
      // 4. Finalize stream in R2
      if (streamId) {
        try {
          const r2Server = require('./r2Server');
          await r2Server.finalizeStream(streamId);
          console.log('🎯 Continuous video stream finalized in R2');
        } catch (error) {
          console.error('Failed to finalize stream:', error);
        }
      }
      
      // 5. Reset all states
      segmentIndex.current = 0;
      chunksRef.current = [];
      videoStreamRef.current = [];
      
      // 6. Call parent's onEndStream
      if (onEndStream) {
        onEndStream();
      }
      
      console.log('✅ Continuous video stream ended successfully');
      
    } catch (error) {
      console.error('Error during stream end:', error);
      if (onEndStream) {
        onEndStream();
      }
    }
  };

  if (!permission?.granted) {
    return (
      <View style={styles.permissionContainer}>
        <MaterialIcons name="videocam-off" size={50} color="#FF4444" />
        <Text style={styles.permissionText}>Camera permission needed</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Allow Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} translucent={true} barStyle="light-content" />
      
      {/* Camera View - No children to avoid warning */}
      <CameraView 
        ref={cameraRef}
        style={[styles.camera, { marginTop: -insets.top - 30 }]}
        facing={facing}
        mode="video"
        autofocus="on"
        active={isLive}
      />

      {/* UI Controls - Absolute positioned over camera */}
      {/* FLIP camera button - right side */}
      <TouchableOpacity onPress={onToggleCamera} style={styles.flipButton}>
        <MaterialIcons name="flip-camera-android" size={24} color="#FFF" />
      </TouchableOpacity>

      {/* MICROPHONE button - right side, adjusted spacing */}
      <TouchableOpacity onPress={onToggleMic} style={styles.micButton}>
        <MaterialIcons 
          name={isMicOn ? "mic" : "mic-off"} 
          size={20} 
          color={isMicOn ? "#FFF" : "#FF4444"} 
        />
      </TouchableOpacity>

      {/* END button - bilkul upar right me */}
      <TouchableOpacity onPress={handleEndStreamInternal} style={styles.endButton}>
        <MaterialIcons name="stop" size={16} color="#FFF" />
      </TouchableOpacity>

      {/* Children components (comments, input, etc.) - Absolute positioned */}
      {children && (
        <View style={styles.childrenContainer}>
          {children}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  camera: {
    flex: 1,
    width: width,
    height: height + 100, // More extra height to push video further up
  },
  childrenContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'box-none', // Allow touch events to pass through
  },
  endButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#ff3c3c',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  flipButton: {
    position: 'absolute',
    right: 10,
    bottom: 155, // Reduced spacing
    backgroundColor: 'rgba(0,0,0,0.4)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  micButton: {
    position: 'absolute',
    right: 10,
    bottom: 105, // Reduced spacing
    backgroundColor: 'rgba(0,0,0,0.4)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    color: '#FFF',
    fontSize: 16,
    marginTop: 20,
    marginBottom: 30,
  },
  permissionButton: {
    backgroundColor: '#6A5ACD',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  permissionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
