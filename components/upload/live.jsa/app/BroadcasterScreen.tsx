// Powered by kronop 
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/theme';
import { liveStyles as s } from '../constants/liveStyles';
import LiveComments from '../components/LiveComments';
import EffectsPanel, { CameraEffect, EFFECTS } from '../components/EffectsPanel';
import EndLiveModal from '../components/EndLiveModal';
import MicButton from '../components/controls/MicButton';
import FlipButton from '../components/controls/FlipButton';
import EffectsButton from '../components/controls/EffectsButton';
import ChatToggleButton from '../components/controls/ChatToggleButton';
import EndLiveButton from '../components/controls/EndLiveButton';
import LiveBadge from '../components/LiveBadge';
import LiveStats from '../components/LiveStats';
import { useLiveStream } from '../hooks/useLiveStream';
import { RTCView } from 'react-native-webrtc';

export default function BroadcasterScreen({ title, category }: { title: string; category: string }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // WebRTC Live Streaming Hook - Backend logic only, UI stays same
  const {
    isLive,
    localStream,
    stats,
    isConnecting,
    isCameraEnabled,
    isMicrophoneEnabled,
    isCameraFront,
    startStream,
    stopStream,
    toggleCamera,
    toggleMicrophone,
    switchCamera,
  } = useLiveStream({
    roomName: 'stream-room',
    participantName: 'broadcaster',
    onError: (error) => console.error('Stream error:', error),
  });

  const [showEndModal, setShowEndModal] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showEffects, setShowEffects] = useState(false);
  const [chatVisible, setChatVisible] = useState(true);
  const [selectedEffect, setSelectedEffect] = useState<CameraEffect>(EFFECTS[0]);

  const dotOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(dotOpacity, { toValue: 0.2, duration: 600, useNativeDriver: true }),
      Animated.timing(dotOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
    ])).start();
  }, []);

  // Wire up existing buttons to WebRTC backend
  const handleGoLive = useCallback(async () => {
    await startStream();
  }, [startStream]);

  const confirmEndLive = useCallback(() => {
    stopStream();
    router.back();
  }, [stopStream, router]);

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      {/* Camera Preview - Replaced expo-camera with RTCView but kept same styling */}
      {localStream ? (
        <RTCView
          streamURL={localStream.toURL()}
          style={s.camera}
          objectFit="cover"
          mirror={isCameraFront}
        />
      ) : (
        <View style={[s.camera, { backgroundColor: '#000' }]} />
      )}
      
      {/* Overlay UI - Same as before */}
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        {/* Top bar: badge + stats + end button */}
        <View style={[s.topBar, { paddingTop: insets.top + 8 }]}>
          <LiveBadge isLive={isLive} dotOpacity={dotOpacity} />
          {isLive ? (
            <LiveStats
              liveSeconds={stats.liveDuration}
              viewerCount={stats.viewerCount}
              connectionStatus={isConnecting ? 'connecting' : 'connected'}
              connectionStatusColor={isConnecting ? Colors.gold : '#22C55E'}
              connectionStatusLabel={isConnecting ? 'Connecting...' : '● LIVE'}
            />
          ) : null}
          <EndLiveButton onPress={() => setShowEndModal(true)} />
        </View>

        {/* Effect color overlay */}
        {selectedEffect.overlayOpacity > 0 ? (
          <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: selectedEffect.overlayColor, opacity: selectedEffect.overlayOpacity, zIndex: 1 }]} />
        ) : null}

        {/* Live comments */}
        <LiveComments isLive={isLive} chatVisible={chatVisible} />

        {/* Right-side vertical controls: Mic → Flip → Effects → Chat */}
        <View style={[s.rightControls, { bottom: insets.bottom + 24 }]}>
          <MicButton 
            isMuted={!isMicrophoneEnabled} 
            onToggle={() => { setIsMuted(!isMuted); toggleMicrophone(); }} 
          />
          <FlipButton 
            onFlip={() => { switchCamera(); }} 
          />
          <EffectsButton selectedEffect={selectedEffect} onPress={() => setShowEffects(true)} />
          <ChatToggleButton chatVisible={chatVisible} onToggle={() => setChatVisible((v) => !v)} />
        </View>

        {/* Start Live button — bottom center, hidden after going live */}
        {!isLive ? (
          <View style={[s.startLiveBar, { bottom: insets.bottom + 24 }]}>
            <TouchableOpacity style={s.goLiveBtn} onPress={handleGoLive} activeOpacity={0.85}>
              <View style={s.goLiveDot} />
              <Text style={s.goLiveBtnText}>Start Live</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>

      <EndLiveModal visible={showEndModal} streamerName="Aayush" onConfirm={() => { setShowEndModal(false); confirmEndLive(); }} onCancel={() => setShowEndModal(false)} />
      <EffectsPanel visible={showEffects} selectedEffect={selectedEffect.id} onSelectEffect={(e) => setSelectedEffect(e)} onClose={() => setShowEffects(false)} />
    </View>
  );
}
