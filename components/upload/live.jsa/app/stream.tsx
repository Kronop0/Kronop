// Powered by OnSpace.AI - Agora Live Streaming
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AppColors as Colors } from '@/appColor/AppColors';
import { liveStyles as s } from '../constants/liveStyles';

// Agora SDK - commented out as package not installed
// import {
//   createAgoraRtcEngine,
//   ClientRoleType,
//   ChannelProfileType,
//   RtcConnection,
//   IRtcEngine,
//   VideoSourceType,
//   RtcSurfaceView,
//   VideoViewSetupMode,
//   LocalVideoStreamReason,
//   LocalVideoStreamState,
// } from 'react-native-agora';

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

// Agora App ID - Replace with your actual App ID from Agora Console
const AGORA_APP_ID = 'YOUR_AGORA_APP_ID';

export default function LiveScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ invitedIds?: string; channelName?: string; token?: string }>();
  const invitedIds = params.invitedIds ? params.invitedIds.split(',').filter(Boolean) : [];
  const channelName = params.channelName || `live_${Date.now()}`;
  const token = params.token || null;

  const [showEndModal, setShowEndModal] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [liveSeconds, setLiveSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraFront, setIsCameraFront] = useState(true);
  const [showEffects, setShowEffects] = useState(false);
  const [chatVisible, setChatVisible] = useState(true);
  const [selectedEffect, setSelectedEffect] = useState<CameraEffect>(EFFECTS[0]);
  const [remoteUsers, setRemoteUsers] = useState<number[]>([]);
  const [localUid, setLocalUid] = useState<number>(0);

  // Agora Engine - commented out as package not installed
  // const agoraEngineRef = useRef<IRtcEngine | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const viewerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dotOpacity = useRef(new Animated.Value(1)).current;

  // Initialize Agora Engine - commented out as package not installed
  useEffect(() => {
    // initAgora();
    Animated.loop(Animated.sequence([
      Animated.timing(dotOpacity, { toValue: 0.2, duration: 600, useNativeDriver: true }),
      Animated.timing(dotOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
    ])).start();

    return () => {
      // leaveChannel();
      if (timerRef.current) clearInterval(timerRef.current);
      if (viewerRef.current) clearInterval(viewerRef.current);
    };
  }, []);

  const initAgora = async () => {
    try {
      // Agora initialization commented out - package not installed
      console.log('[Agora] Skipped initialization - package not installed');
    } catch (error) {
      console.error('[Agora] Init error:', error);
    }
  };

  const joinChannel = async () => {
    try {
      // Simulate live streaming without Agora
      console.log('[Mock] Starting simulated live stream:', channelName);
      setIsLive(true);
      setLocalUid(Math.floor(Math.random() * 10000));
      
      // Start timers
      timerRef.current = setInterval(() => setLiveSeconds((prev) => prev + 1), 1000);
      viewerRef.current = setInterval(() => setViewerCount((v) => v + Math.floor(Math.random() * 3)), 2000);
    } catch (error) {
      console.error('[Mock] Join error:', error);
    }
  };

  const leaveChannel = async () => {
    try {
      // Mock leave channel
      console.log('[Mock] Leaving live stream');
      setIsLive(false);
      setRemoteUsers([]);
    } catch (error) {
      console.error('[Mock] Leave error:', error);
    }
  };

  const handleGoLive = useCallback(() => {
    joinChannel();
  }, [channelName, token]);

  const confirmEndLive = useCallback(() => {
    leaveChannel();
    if (timerRef.current) clearInterval(timerRef.current);
    if (viewerRef.current) clearInterval(viewerRef.current);
    setIsLive(false);
    router.back();
  }, [router]);

  const toggleMute = useCallback(() => {
    // Mock mute toggle
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    console.log('[Mock] Microphone:', newMuteState ? 'muted' : 'unmuted');
  }, [isMuted]);

  const toggleCamera = useCallback(() => {
    // Mock camera toggle
    setIsCameraFront((prev) => !prev);
    console.log('[Mock] Camera switched to:', !isCameraFront ? 'front' : 'back');
  }, []);

  const coHostTopOffset = insets.top + 72;

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Mock Video View */}
      <View style={styles.videoContainer}>
        {isLive ? (
          <View style={styles.mockVideoView}>
            <Ionicons name="videocam" size={48} color={Colors.textMuted} />
            <Text style={styles.mockVideoText}>LIVE (Mock Mode)</Text>
          </View>
        ) : (
          <View style={styles.previewPlaceholder}>
            <Ionicons name="videocam" size={48} color={Colors.textMuted} />
            <Text style={styles.previewText}>Camera Preview</Text>
          </View>
        )}

        {/* Effect color overlay */}
        {selectedEffect.overlayOpacity > 0 && isLive ? (
          <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: selectedEffect.overlayColor, opacity: selectedEffect.overlayOpacity, zIndex: 1 }]} />
        ) : null}

        {/* Top bar */}
        <View style={[s.topBar, { paddingTop: insets.top + 8 }]}>
          <LiveBadge isLive={isLive} dotOpacity={dotOpacity} />
          {isLive ? (
            <LiveStats
              liveSeconds={liveSeconds}
              viewerCount={viewerCount}
              uploadStatus="idle"
              uploadStatusColor={Colors.success}
              uploadStatusLabel="LIVE"
            />
          ) : null}
          <EndLiveButton onPress={() => setShowEndModal(true)} />
        </View>

        {/* Remote Users - Mock */}
        {isLive && remoteUsers.length > 0 && (
          <View style={[styles.remoteContainer, { top: coHostTopOffset }]}>
            {remoteUsers.map((uid) => (
              <View key={uid} style={styles.remoteVideo}>
                <View style={styles.mockRemoteView}>
                  <Ionicons name="person" size={24} color={Colors.textMuted} />
                  <Text style={styles.mockRemoteText}>User {uid}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Live comments */}
        <LiveComments isLive={isLive} chatVisible={chatVisible} />

        {/* Right-side vertical controls */}
        <View style={[s.rightControls, { bottom: insets.bottom + 24 }]}>
          <MicButton isMuted={isMuted} onToggle={toggleMute} />
          <FlipButton onFlip={toggleCamera} />
          <EffectsButton selectedEffect={selectedEffect} onPress={() => setShowEffects(true)} />
          <ChatToggleButton chatVisible={chatVisible} onToggle={() => setChatVisible((v) => !v)} />
        </View>

        {/* Start Live button */}
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

const styles = StyleSheet.create({
  videoContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  localVideo: {
    flex: 1,
  },
  mockVideoView: {
    flex: 1,
    backgroundColor: '#1A1A1F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mockVideoText: {
    marginTop: 12,
    color: Colors.textMuted,
    fontSize: 16,
    fontWeight: '600',
  },
  previewPlaceholder: {
    flex: 1,
    backgroundColor: '#1A1A1F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewText: {
    marginTop: 12,
    color: Colors.textMuted,
    fontSize: 14,
  },
  remoteContainer: {
    position: 'absolute',
    left: 8,
    flexDirection: 'column',
    gap: 8,
    zIndex: 10,
  },
  remoteVideo: {
    width: 90,
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#1A1A1F',
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  remoteVideoView: {
    width: 90,
    height: 120,
  },
  mockRemoteView: {
    width: 90,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2A2A2F',
  },
  mockRemoteText: {
    marginTop: 8,
    color: Colors.textMuted,
    fontSize: 10,
    textAlign: 'center',
  },
});
