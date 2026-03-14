import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  TextInput,
  StatusBar,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera';

const { width, height } = Dimensions.get('window');

interface Comment {
  id: string;
  message: string;
}

export default function BroadcasterView() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('front');
  const [isLive, setIsLive] = useState(true);
  const [timer, setTimer] = useState(0);
  const [comments, setComments] = useState<Comment[]>([
    { id: '1', message: '🔥🔥 OP gameplay!' },
    { id: '2', message: 'Maza aa gaya!' },
    { id: '3', message: 'First time here!' },
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    (async () => {
      if (!permission?.granted) {
        await requestPermission();
      }
    })();
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
    setFacing(current => (current === 'back' ? 'front' : 'back') as CameraType);
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const newComment: Comment = {
        id: Date.now().toString(),
        message: newMessage.trim(),
      };
      setComments(prev => [...prev, newComment]);
      setNewMessage('');
    }
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
      <StatusBar hidden />
      
      <CameraView 
        ref={null}
        style={styles.camera}
        facing={facing}
        mode="video"
        autofocus="on"
        active={isLive}
      >
        {/* SIRF YAHI HAI - KOI EXTRA NAHI */}
        
        {/* LIVE indicator - bilkul upar left me, black bar ke bina */}
        <View style={styles.liveContainer}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE {formatTime(timer)}</Text>
        </View>

        {/* END button - bilkul upar right me */}
        <TouchableOpacity onPress={handleEndStream} style={styles.endButton}>
          <MaterialIcons name="stop" size={16} color="#FFF" />
        </TouchableOpacity>

        {/* FLIP camera button - right side me */}
        <TouchableOpacity onPress={toggleCameraFacing} style={styles.flipButton}>
          <MaterialIcons name="flip-camera-android" size={24} color="#FFF" />
        </TouchableOpacity>

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

        {/* INPUT - bottom me */}
        <View style={styles.inputArea}>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Comment..."
              placeholderTextColor="#999"
              onSubmitEditing={handleSendMessage}
            />
            <TouchableOpacity onPress={handleSendMessage} style={styles.sendBox}>
              <MaterialIcons name="send" size={18} color="#6A5ACD" />
            </TouchableOpacity>
          </View>
        </View>

      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
    width: width,
    height: height,
  },
  // LIVE indicator - bilkul upar, koi background nahi
  liveContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF0000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 10,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFF',
    marginRight: 4,
  },
  liveText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  // END button - bilkul simple
  endButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FF0000',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  // FLIP button - right side
  flipButton: {
    position: 'absolute',
    right: 10,
    top: height / 2,
    backgroundColor: 'rgba(0,0,0,0.4)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  // COMMENTS area - left side
  commentsArea: {
    position: 'absolute',
    bottom: 70,
    left: 10,
    right: 60,
    maxHeight: height * 0.3,
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
  // INPUT area - bottom
  inputArea: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    zIndex: 10,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
    paddingLeft: 12,
    paddingRight: 4,
    paddingVertical: 4,
  },
  input: {
    flex: 1,
    color: '#FFF',
    fontSize: 13,
    paddingVertical: 6,
  },
  sendBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
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