import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { CameraType } from 'expo-camera';
import CameraComponent from './CameraComponent';
import UserAccount from './UserAccount';

const { width, height } = Dimensions.get('window');

interface Comment {
  id: string;
  message: string;
}

export default function BroadcasterView() {
  const router = useRouter();
  const [facing, setFacing] = useState<CameraType>('front');
  const [isLive, setIsLive] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [timer, setTimer] = useState(0);
  const [viewerCount, setViewerCount] = useState(1247);
  const [comments, setComments] = useState<Comment[]>([
    { id: '1', message: '🔥🔥 OP gameplay!' },
    { id: '2', message: 'Maza aa gaya!' },
    { id: '3', message: 'First time here!' },
  ]);
  
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Simulate viewer count changes
  useEffect(() => {
    const viewerInterval = setInterval(() => {
      setViewerCount(prev => {
        const change = Math.floor(Math.random() * 21) - 10; // Random change between -10 and +10
        const newCount = prev + change;
        return Math.max(1, newCount); // Minimum 1 viewer
      });
    }, 3000); // Update every 3 seconds
    return () => clearInterval(viewerInterval);
  }, []);

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

  return (
    <CameraComponent
      facing={facing}
      isLive={isLive}
      isMicOn={isMicOn}
      onToggleCamera={toggleCameraFacing}
      onToggleMic={toggleMic}
      onEndStream={handleEndStream}
    >
      {/* User Account Component - LIVE indicator with viewer count */}
      <UserAccount 
        viewerCount={viewerCount} 
        liveDuration={timer} 
      />

      {/* COMMENTS - left side me, bilkul simple */}
      <View style={styles.commentsArea}>
        <FlatList
          ref={flatListRef}
          data={comments}
          keyExtractor={(item) => item.id}
          renderItem={renderComment}
          showsVerticalScrollIndicator={false}
        />
      </View>

    </CameraComponent>
  );
}

const styles = StyleSheet.create({
  // COMMENTS area - left side
  commentsArea: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    right: 60,
    maxHeight: height * 0.4,
    zIndex: 10,
  },
  commentItem: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 5,
    alignSelf: 'flex-start',
  },
  commentMessage: {
    color: '#FFF',
    fontSize: 12,
  },
});