// Powered by OnSpace.AI
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Animated } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/theme';
import { liveStyles as s } from '@/constants/liveStyles';
import LiveComments from '@/components/LiveComments';
import EffectsPanel, { CameraEffect, EFFECTS } from '@/components/EffectsPanel';
import EndLiveModal from '@/components/EndLiveModal';
import { uploadChunkToR2, UploadProgress } from '@/services/r2Upload';
import UploadProgressBar from '@/components/UploadProgressBar';
import MicButton from '@/components/controls/MicButton';
import FlipButton from '@/components/controls/FlipButton';
import EffectsButton from '@/components/controls/EffectsButton';
import ChatToggleButton from '@/components/controls/ChatToggleButton';
import EndLiveButton from '@/components/controls/EndLiveButton';
import LiveBadge from '@/components/LiveBadge';
import LiveStats from '@/components/LiveStats';
import LiveCoHost from '@/components/LiveCoHost';

type UploadStatus = 'idle' | 'recording' | 'uploading' | 'error';

export default function LiveScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ invitedIds?: string }>();
  const invitedIds = params.invitedIds ? params.invitedIds.split(',').filter(Boolean) : [];

  const [showEndModal, setShowEndModal] = useState(false);
  const [facing, setFacing] = useState<CameraType>('front');
  const [permission, requestPermission] = useCameraPermissions();
  const [isLive, setIsLive] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [liveSeconds, setLiveSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showEffects, setShowEffects] = useState(false);
  const [chatVisible, setChatVisible] = useState(true);
  const [selectedEffect, setSelectedEffect] = useState<CameraEffect>(EFFECTS[0]);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [chunksUploaded, setChunksUploaded] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({ uploaded: 0, total: 0 });

  const cameraRef = useRef<CameraView>(null);
  const chunkLoopActive = useRef(false);
  const chunkIndex = useRef(0);
  const sessionId = useRef('');
  const dotOpacity = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const viewerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    requestPermission();
    Animated.loop(Animated.sequence([
      Animated.timing(dotOpacity, { toValue: 0.2, duration: 600, useNativeDriver: true }),
      Animated.timing(dotOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
    ])).start();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (viewerRef.current) clearInterval(viewerRef.current);
    };
  }, []);

  const runChunkLoop = useCallback(async () => {
    while (chunkLoopActive.current) {
      try {
        setUploadStatus('recording');
        if (!cameraRef.current) break;
        const video = await cameraRef.current.recordAsync({ maxDuration: 2 });
        if (!video?.uri || !chunkLoopActive.current) break;
        const key = `live/${sessionId.current}/chunk_${chunkIndex.current}.mp4`;
        chunkIndex.current += 1;
        setUploadStatus('uploading');
        setUploadProgress({ uploaded: 0, total: 0 });
        uploadChunkToR2(video.uri, key, (p) => setUploadProgress(p))
          .then(() => { setChunksUploaded((n) => n + 1); setUploadError(null); setUploadStatus('recording'); setUploadProgress({ uploaded: 0, total: 0 }); })
          .catch((err) => { console.warn('[R2]', err); setUploadError('Upload failed'); setUploadStatus('error'); });
      } catch { break; }
    }
    setUploadStatus('idle');
  }, []);

  const handleGoLive = useCallback(() => {
    setIsLive(true);
    timerRef.current = setInterval(() => setLiveSeconds((prev) => prev + 1), 1000);
    viewerRef.current = setInterval(() => setViewerCount((v) => v + Math.floor(Math.random() * 3)), 2000);
    sessionId.current = `session_${Date.now()}`;
    chunkIndex.current = 0;
    chunkLoopActive.current = true;
    runChunkLoop();
  }, [runChunkLoop]);

  const confirmEndLive = useCallback(() => {
    chunkLoopActive.current = false;
    try { cameraRef.current?.stopRecording(); } catch (_) {}
    if (timerRef.current) clearInterval(timerRef.current);
    if (viewerRef.current) clearInterval(viewerRef.current);
    router.back();
  }, [router]);

  const statusColor = () => ({ recording: '#22C55E', uploading: Colors.gold, error: Colors.liveRed }[uploadStatus] ?? Colors.textMuted);
  const statusLabel = () => ({ recording: '● REC', uploading: '▲ Uploading', error: '✕ Error' }[uploadStatus] ?? '');
  const uploadPct = uploadProgress.total > 0 ? uploadProgress.uploaded / uploadProgress.total : (uploadStatus === 'recording' ? 1 : 0);
  const coHostTopOffset = insets.top + 72;

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <CameraView ref={cameraRef} style={s.camera} facing={facing} mode="video">
        {/* Top bar */}
        <View style={[s.topBar, { paddingTop: insets.top + 8 }]}>
          <LiveBadge isLive={isLive} dotOpacity={dotOpacity} />
          {isLive ? (
            <LiveStats
              liveSeconds={liveSeconds}
              viewerCount={viewerCount}
              uploadStatus={uploadStatus}
              uploadStatusColor={statusColor()}
              uploadStatusLabel={statusLabel()}
            />
          ) : null}
          <EndLiveButton onPress={() => setShowEndModal(true)} />
        </View>

        {/* Co-host overlays — left side below top bar */}
        <LiveCoHost invitedIds={invitedIds} isLive={isLive} topOffset={coHostTopOffset} />

        {/* Effect color overlay */}
        {selectedEffect.overlayOpacity > 0 ? (
          <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: selectedEffect.overlayColor, opacity: selectedEffect.overlayOpacity, zIndex: 1 }]} />
        ) : null}

        {/* Live comments */}
        <LiveComments isLive={isLive} chatVisible={chatVisible} />

        {/* Chunks saved indicator */}
        {isLive && chunksUploaded > 0 ? (
          <View style={s.chunksChip}>
            <Ionicons name="cloud-upload-outline" size={11} color={Colors.gold} />
            <Text style={s.chunksText}>{chunksUploaded} chunks saved</Text>
          </View>
        ) : null}

        {/* Upload error banner */}
        {uploadError ? (
          <View style={s.errorBanner}>
            <Ionicons name="warning-outline" size={13} color="#fff" />
            <Text style={s.errorBannerText}>{uploadError} — will retry</Text>
          </View>
        ) : null}

        {/* Right-side vertical controls */}
        <View style={[s.rightControls, { bottom: insets.bottom + 24 }]}>
          <MicButton isMuted={isMuted} onToggle={() => setIsMuted((m) => !m)} />
          <FlipButton onFlip={() => setFacing((f) => (f === 'back' ? 'front' : 'back'))} />
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
      </CameraView>

      <UploadProgressBar progress={uploadPct} status={uploadStatus} bytesUploaded={uploadProgress.uploaded} bytesTotal={uploadProgress.total} />
      <EndLiveModal visible={showEndModal} streamerName="Aayush" onConfirm={() => { setShowEndModal(false); confirmEndLive(); }} onCancel={() => setShowEndModal(false)} />
      <EffectsPanel visible={showEffects} selectedEffect={selectedEffect.id} onSelectEffect={(e) => setSelectedEffect(e)} onClose={() => setShowEffects(false)} />
    </View>
  );
}
