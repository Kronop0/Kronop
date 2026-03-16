import React, { useState, useEffect, useRef } from 'react';
import { Alert, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { CameraType } from 'expo-camera';
import r2Server from './r2Server';

interface Comment {
  id: string;
  message: string;
}

interface BroadcasterViewLogicProps {
  streamId?: string | null;
  onEndStream: () => void;
}

export function useBroadcasterLogic({ streamId, onEndStream }: BroadcasterViewLogicProps) {
  const router = useRouter();
  const [facing, setFacing] = useState<CameraType>('front');
  const [isLive, setIsLive] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [timer, setTimer] = useState(0);
  const [viewerCount, setViewerCount] = useState(0);
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [comments, setComments] = useState<Comment[]>([
    { id: '1', message: '🔥🔥 OP gameplay!' },
    { id: '2', message: 'Maza aa gaya!' },
    { id: '3', message: 'First time here!' },
  ]);
  
  const flatListRef = useRef<any>(null);
  const recordingInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Start recording and uploading segments when stream starts
  useEffect(() => {
    if (isLive && streamId && !isRecording) {
      startSegmentUpload();
    }
    return () => {
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
    };
  }, [isLive, streamId]);

  // Simulate viewer count changes
  useEffect(() => {
    const viewerInterval = setInterval(() => {
      setViewerCount(prev => {
        const change = Math.floor(Math.random() * 21) - 10; // Random change between -10 and +10
        const newCount = prev + change;
        const finalCount = Math.max(1, newCount); // Minimum 1 viewer
        
        // Update viewer count in r2Server
        if (streamId) {
          (r2Server as any).updateViewerCount(streamId, finalCount);
        }
        
        return finalCount;
      });
    }, 3000); // Update every 3 seconds
    return () => clearInterval(viewerInterval);
  }, [streamId]);

  // Start segment upload process - REMOVED MOCK DATA
  const startSegmentUpload = () => {
    setIsRecording(true);
    console.log('🎥 Starting REAL segment upload process...');
    
    // NOTE: Real segment upload is now handled by CameraComponent
    // This function is just for state management
    // CameraComponent will capture and upload REAL video segments
    
    console.log('📹 CameraComponent will handle REAL video capture and upload');
  };

  // Generate REAL video segment data (replace with real camera data)
  const generateRealSegmentData = () => {
    // This will be replaced by actual camera data from CameraComponent
    // For now, this is just a placeholder - CameraComponent will provide real data
    console.log('📹 Waiting for REAL camera data from CameraComponent...');
    return null; // CameraComponent will handle real data
  };

  useEffect(() => {
    if (flatListRef.current && comments.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [comments]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleCameraFacing = () => {
    setFacing((current: CameraType) => (current === 'back' ? 'front' : 'back') as CameraType);
  };

  const toggleMic = () => {
    setIsMicOn(prev => !prev);
  };

  const handleEndStream = () => {
    Alert.alert(
      'End Stream',
      'Are you sure?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes', 
          style: 'destructive',
          onPress: () => {
            setIsLive(false);
            router.back();
          }
        }
      ]
    );
  };

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.commentItem}>
      <Text style={styles.commentMessage}>{item.message}</Text>
    </View>
  );

  return {
    facing,
    isLive,
    isMicOn,
    timer,
    viewerCount,
    comments,
    flatListRef,
    formatTime,
    toggleCameraFacing,
    toggleMic,
    handleEndStream,
    renderComment
  };
}

const styles = {
  commentItem: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 5,
    alignSelf: 'flex-start' as const,
  },
  commentMessage: {
    color: '#FFF',
    fontSize: 12,
  },
};
