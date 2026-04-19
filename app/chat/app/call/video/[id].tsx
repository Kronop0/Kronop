// Powered by OnSpace.AI
import React, { useState, useEffect } from 'react';
import { View, Text, StatusBar, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useChat } from '../../../hooks/useChat';
import { Colors, Radius, FontSize, Spacing } from '../../../constants/theme';

export default function VideoCallScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getConversation } = useChat();
  const conversation = getConversation(id);

  const [facing, setFacing] = useState<CameraType>('front');
  const [camOff, setCamOff] = useState(false);
  const [muted, setMuted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    requestPermission();
    const iv = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(iv);
  }, []);

  const fmt = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  if (!conversation) return null;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Fullscreen local camera (self view) */}
      {permission?.granted && !camOff ? (
        <CameraView style={StyleSheet.absoluteFill} facing={facing} />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.camOffBg]}>
          <Ionicons name="videocam-off" size={48} color="rgba(255,255,255,0.4)" />
          <Text style={styles.camOffText}>Camera Off</Text>
        </View>
      )}

      {/* Timer overlay */}
      <View style={[styles.timerBadge, { top: insets.top + 12 }]}>
        <Text style={styles.timerText}>{fmt(elapsed)}</Text>
      </View>

      {/* Remote PiP — top right */}
      <View style={[styles.pip, { top: insets.top + 8 }]}>
        <Image
          source={{ uri: conversation.participantAvatar }}
          style={styles.pipImage}
          contentFit="cover"
          transition={200}
        />
        <View style={styles.pipLabel}>
          <Text style={styles.pipLabelText}>{conversation.participantName}</Text>
        </View>
      </View>

      {/* Bottom controls */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        {/* Cam toggle */}
        <Pressable
          style={({ pressed }) => [styles.btn, camOff && styles.btnActive, pressed && { opacity: 0.75 }]}
          onPress={() => setCamOff(c => !c)}
        >
          <Ionicons name={camOff ? 'videocam-off' : 'videocam'} size={26} color={camOff ? Colors.primary : '#fff'} />
        </Pressable>

        {/* Flip camera */}
        <Pressable
          style={({ pressed }) => [styles.btn, pressed && { opacity: 0.75 }]}
          onPress={() => setFacing(f => f === 'front' ? 'back' : 'front')}
        >
          <MaterialCommunityIcons name="camera-flip" size={26} color="#fff" />
        </Pressable>

        {/* Mute */}
        <Pressable
          style={({ pressed }) => [styles.btn, muted && styles.btnActive, pressed && { opacity: 0.75 }]}
          onPress={() => setMuted(m => !m)}
        >
          <Ionicons name={muted ? 'mic-off' : 'mic'} size={26} color={muted ? Colors.primary : '#fff'} />
        </Pressable>

        {/* End call */}
        <Pressable
          style={({ pressed }) => [styles.btn, styles.btnEnd, pressed && { opacity: 0.85 }]}
          onPress={() => router.back()}
        >
          <MaterialIcons name="call-end" size={28} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  camOffBg: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a1a', gap: 12 },
  camOffText: { color: 'rgba(255,255,255,0.5)', fontSize: FontSize.md },
  timerBadge: {
    position: 'absolute', left: 16, zIndex: 20,
    backgroundColor: 'rgba(0,0,0,0.45)', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: Radius.full,
  },
  timerText: { color: '#fff', fontSize: FontSize.sm, fontWeight: '600', letterSpacing: 1 },
  pip: {
    position: 'absolute', right: 12, zIndex: 20,
    width: 110, height: 160, borderRadius: Radius.md,
    overflow: 'hidden', borderWidth: 2, borderColor: '#fff',
    shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 8, elevation: 10,
  },
  pipImage: { width: '100%', height: '100%' },
  pipLabel: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.55)', paddingVertical: 4, alignItems: 'center',
  },
  pipLabelText: { color: '#fff', fontSize: 10, fontWeight: '600' },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center',
    backgroundColor: 'rgba(30,30,30,0.85)', paddingTop: Spacing.lg,
  },
  btn: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center', alignItems: 'center',
  },
  btnActive: { backgroundColor: Colors.primary + '44' },
  btnEnd: {
    backgroundColor: '#E53935',
    shadowColor: '#E53935', shadowOpacity: 0.6, shadowRadius: 12, elevation: 10,
  },
});
