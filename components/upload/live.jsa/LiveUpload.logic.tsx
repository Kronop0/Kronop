import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import r2Server from './r2Server';
import BroadcasterView from './BroadcasterView';

interface LiveData {
  title: string;
  category: string;
  audienceType: string;
}

interface LiveUploadLogicProps {
  onClose: () => void;
}

export function useLiveUploadLogic({ onClose }: LiveUploadLogicProps) {
  const router = useRouter();
  const [liveData, setLiveData] = useState<LiveData>({
    title: '',
    category: '',
    audienceType: ''
  });
  const [isSetup, setIsSetup] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [showBroadcaster, setShowBroadcaster] = useState(false);
  const [currentStreamId, setCurrentStreamId] = useState<string | null>(null);
  const [streamData, setStreamData] = useState<any>(null);

  const categories = [
    'Gaming', 'Music', 'Talk Show', 'Education', 'Entertainment',
    'Sports', 'News', 'Cooking', 'Travel', 'Lifestyle', 'Other'
  ];

  const startLiveStream = async () => {
    if (!liveData.title.trim()) {
      Alert.alert('Missing Title', 'Please enter a title for your live stream');
      return;
    }

    if (!liveData.category.trim()) {
      Alert.alert('Missing Category', 'Please select a category for your live stream');
      return;
    }

    if (!liveData.audienceType.trim()) {
      Alert.alert('Missing Audience', 'Please select audience type for your live stream');
      return;
    }

    try {
      // Generate unique stream ID
      const streamId = `live_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setCurrentStreamId(streamId);

      // Initialize real stream using r2Server
      const initializedStream = await r2Server.initializeStream(streamId, liveData);
      setStreamData(initializedStream);

      // Initialize WebRTC configuration
      await r2Server.initializeWebRTCStream(streamId, liveData);

      console.log('🔴 Live Stream Started:', initializedStream);
      setIsLive(true);
      setIsSetup(false);
      setShowBroadcaster(true);

    } catch (error: any) {
      console.error('Failed to start live stream:', error);
      Alert.alert('Stream Error', error.message || 'Failed to start live stream');
    }
  };

  const endLiveStream = async () => {
    try {
      setIsLive(false);
      setShowBroadcaster(false);
      setIsSetup(true);
      
      // Finalize stream using r2Server
      if (currentStreamId) {
        const finalizedData = await r2Server.finalizeStream(currentStreamId);
        console.log('📹 Stream Finalized:', finalizedData);
      }
      
      Alert.alert('Live Ended', 'Your live stream has been saved successfully.');
      
      // Reset form
      setLiveData({ title: '', category: '', audienceType: '' });
      setCurrentStreamId(null);
      setStreamData(null);
      
      onClose();
      router.replace('/');
      
    } catch (error: any) {
      console.error('Failed to end live stream:', error);
      Alert.alert('Error', error.message || 'Failed to end live stream');
    }
  };

  const renderBroadcaster = () => {
    if (showBroadcaster) {
      return (
        <BroadcasterView 
          streamTitle={liveData.title}
          streamCategory={liveData.category}
          streamAudience={liveData.audienceType}
          streamId={currentStreamId}
          streamData={streamData}
          onEndStream={endLiveStream}
        />
      );
    }
    return null;
  };

  return {
    liveData,
    setLiveData,
    isSetup,
    isLive,
    showBroadcaster,
    currentStreamId,
    streamData,
    categories,
    startLiveStream,
    endLiveStream,
    renderBroadcaster
  };
}
