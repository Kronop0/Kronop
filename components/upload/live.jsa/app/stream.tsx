// Powered by OnSpace.AI - Agora Live Streaming
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AppColors as Colors } from '@/appColor/AppColors';
import { liveStyles as s } from '../constants/liveStyles';

// Agora SDK
import {
  createAgoraRtcEngine,
  ClientRoleType,
  ChannelProfileType,
  RtcConnection,
  IRtcEngine,
  VideoSourceType,
  RtcSurfaceView,
  VideoViewSetupMode,
  LocalVideoStreamReason,
  LocalVideoStreamState,
} from 'react-native-agora';

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

  // Agora Engine
  const agoraEngineRef = useRef<IRtcEngine | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const viewerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dotOpacity = useRef(new Animated.Value(1)).current;

  // Initialize Agora Engine
  useEffect(() => {
    initAgora();
    Animated.loop(Animated.sequence([
      Animated.timing(dotOpacity, { toValue: 0.2, duration: 600, useNativeDriver: true }),
      Animated.timing(dotOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
    ])).start();

    return () => {
      leaveChannel();
      if (timerRef.current) clearInterval(timerRef.current);
      if (viewerRef.current) clearInterval(viewerRef.current);
    };
  }, []);

  const initAgora = async () => {
    try {
      const engine = createAgoraRtcEngine();
      await engine.initialize({ appId: AGORA_APP_ID, channelProfile: ChannelProfileType.ChannelProfileLiveBroadcasting });
      
      // Enable video
      await engine.enableVideo();
      await engine.enableAudio();
      
      // Set client role as broadcaster
      await engine.setClientRole(ClientRoleType.ClientRoleBroadcaster);

      // Setup event handlers
      engine.registerEventHandler({
        onJoinChannelSuccess: (_connection: RtcConnection, elapsed: number) => {
          console.log('[Agora] Join channel success, uid:', _connection.localUid);
          setLocalUid(_connection.localUid);
          setIsLive(true);
        },
        onUserJoined: (_connection: RtcConnection, remoteUid: number, elapsed: number) => {
          console.log('[Agora] User joined:', remoteUid);
          setRemoteUsers((prev) => [...prev, remoteUid]);
        },
        onUserOffline: (_connection: RtcConnection, remoteUid: number, reason: number) => {
          console.log('[Agora] User offline:', remoteUid);
          setRemoteUsers((prev) => prev.filter((uid) => uid !== remoteUid));
        },
        onError: (err: number, msg: string) => {
          console.error('[Agora] Error:', err, msg);
        },
        onLocalVideoStateChanged: (
          source: VideoSourceType,
          state: LocalVideoStreamState,
          reason: LocalVideoStreamReason
        ) => {
          console.log('[Agora] Local video state changed:', state, reason);
        },
      });

      agoraEngineRef.current = engine;
      console.log('[Agora] Engine initialized');
    } catch (error) {
      console.error('[Agora] Init error:', error);
    }
  };

  const joinChannel = async () => {
    const engine = agoraEngineRef.current;
    if (!engine) return;

    try {
      // Start local video preview
      await engine.startPreview();

      // Join channel
      await engine.joinChannel(token, channelName, 0, {
        channelProfile: ChannelProfileType.ChannelProfileLiveBroadcasting,
        clientRoleType: ClientRoleType.ClientRoleBroadcaster,
        publishMicrophoneTrack: !isMuted,
        publishCameraTrack: true,
        autoSubscribeAudio: true,
        autoSubscribeVideo: true,
      });

      // Start timers
      timerRef.current = setInterval(() => setLiveSeconds((prev) => prev + 1), 1000);
      viewerRef.current = setInterval(() => setViewerCount((v) => v + Math.floor(Math.random() * 3)), 2000);

      console.log('[Agora] Joining channel:', channelName);
    } catch (error) {
      console.error('[Agora] Join error:', error);
    }
  };

  const leaveChannel = async () => {
    const engine = agoraEngineRef.current;
    if (!engine) return;

    try {
      await engine.stopPreview();
      await engine.leaveChannel();
      engine.unregisterEventHandler({} as any);
      engine.release();
      agoraEngineRef.current = null;
      console.log('[Agora] Left channel');
    } catch (error) {
      console.error('[Agora] Leave error:', error);
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
    const engine = agoraEngineRef.current;
    if (!engine) return;
    
    const newMuteState = !isMuted;
    engine.muteLocalAudioStream(newMuteState);
    setIsMuted(newMuteState);
  }, [isMuted]);

  const toggleCamera = useCallback(() => {
    const engine = agoraEngineRef.current;
    if (!engine) return;
    
    engine.switchCamera();
    setIsCameraFront((prev) => !prev);
  }, []);

  const coHostTopOffset = insets.top + 72;

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Agora Local Video View */}
      <View style={styles.videoContainer}>
        {isLive ? (
          <RtcSurfaceView
            style={styles.localVideo}
            canvas={{
              uid: 0,
              sourceType: VideoSourceType.VideoSourceCameraPrimary,
            }}
          />
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

        {/* Remote Users - Agora */}
        {isLive && remoteUsers.length > 0 && (
          <View style={[styles.remoteContainer, { top: coHostTopOffset }]}>
            {remoteUsers.map((uid) => (
              <View key={uid} style={styles.remoteVideo}>
                <RtcSurfaceView
                  style={styles.remoteVideoView}
                  canvas={{
                    uid: uid,
                    sourceType: VideoSourceType.VideoSourceRemote,
                  }}
                />
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
});
