import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { ChunkedStoryVideo } from '../StoryPlayer/StoryPlayer2';
import { storyViewerStyles as styles } from './StoryViewer2';

interface Story { id: string; userId: string; userName: string; userAvatar: string; imageUrl?: string; videoUrl?: string; url?: string; fallbackUrl?: string; story_type: 'image' | 'video'; type?: 'image' | 'video'; useLocalAsset?: boolean; timestamp?: Date; thumbnailUrl?: string; duration?: number; _preloadUri?: string | null; }
interface Props { visible: boolean; stories: Story[]; initialIndex: number; onClose: () => void; onProfilePress?: (s: Story) => void; currentUserId?: string; preloadedVideoUri?: string | null; }

export const StoryViewerComponent = ({ visible, stories, initialIndex, onClose, onProfilePress, currentUserId, preloadedVideoUri }: Props) => {
  const [idx, setIdx] = useState(initialIndex);
  const [err, setErr] = useState(false);
  const [prog, setProg] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [supported, setSupported] = useState(false);
  const interval = useRef<NodeJS.Timeout | null>(null);
  const prevUrl = useRef<string | null>(null);
  const story = stories[idx];
  const isVideo = story?.story_type === 'video' || story?.type === 'video' || !!story?.videoUrl || (story?.url?.includes('.mp4'));

  // Use preloaded URI if available AND it's a remote URL (not local file://)
  const getVideoUrl = () => {
    if (preloadedVideoUri && (preloadedVideoUri.startsWith('http://') || preloadedVideoUri.startsWith('https://'))) {
      return preloadedVideoUri;
    }
    return story?.videoUrl || story?.imageUrl || story?.url || '';
  };

  useEffect(() => { setErr(false); setProg(0); setPlaying(false); interval.current && clearInterval(interval.current); }, [idx]);
  useEffect(() => { if (visible && story && !err) { setPlaying(true); setProg(0); interval.current = setInterval(() => setProg(p => { if (p >= 100) { clearInterval(interval.current!); setPlaying(false); idx < stories.length - 1 ? (setIdx(i => i + 1), setProg(0)) : setTimeout(() => onClose(), 0); return 100; } return p + (100 / 90); }), 100); } else { interval.current && clearInterval(interval.current); } return () => interval.current && clearInterval(interval.current); }, [visible, story, err, idx]);

  const getUrl = () => { if (!story) return { uri: '' }; const u = story.videoUrl || story.imageUrl || story.url || ''; if (!u.startsWith('https://')) return { uri: 'https://' + u }; if (!u.includes('r2.dev')) return { uri: process.env.EXPO_PUBLIC_R2_PUBLIC_URL + '/' + u.replace('https://', '') }; return { uri: u }; };
  const getAvatar = () => story?.userAvatar ? { uri: story.userAvatar } : require('../../../../assets/images/logo.png');
  const getNextUrl = () => idx + 1 < stories.length ? (stories[idx + 1].videoUrl || stories[idx + 1].imageUrl || stories[idx + 1].url || '') : undefined;

  if (!visible || !story) return null;

  return (
    <Modal visible={visible} animationType="none" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.progressContainer}>{stories.map((_, i) => <View key={i} style={styles.progressBarContainer}><View style={[styles.progressBar, { flex: i < idx ? 1 : i === idx ? prog / 100 : 0 }]} /></View>)}</View>
        <TouchableOpacity activeOpacity={1} style={styles.storyMedia} onPress={(e) => { const x = e.nativeEvent.locationX; x < 150 ? idx > 0 && setIdx(i => i - 1) : idx < stories.length - 1 ? (setIdx(i => i + 1), setProg(0)) : onClose(); }}>
          {isVideo ? <ChunkedStoryVideo videoUrl={getVideoUrl()} nextVideoUrl={getNextUrl()} style={styles.storyMedia} onVideoEnd={() => {}} /> : <Image source={getUrl()} style={styles.storyMedia} contentFit="cover" />}
        </TouchableOpacity>
        <View style={styles.header}>
          <TouchableOpacity style={styles.userInfo} onPress={() => onProfilePress?.(story)}>
            <Image source={getAvatar()} style={styles.userAvatar} contentFit="cover" />
            <Text style={styles.userName}>{story.userName}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.supportButton, supported && styles.supportedButton]} onPress={() => setSupported(!supported)}>
            <MaterialIcons name={supported ? 'check' : 'add'} size={14} color={supported ? '#8B00FF' : '#FFFFFF'} />
            <Text style={[styles.supportButtonText, supported && styles.supportedButtonText]}>{supported ? 'Supported' : 'Support'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose}><Text style={styles.closeButtonText}>×</Text></TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
