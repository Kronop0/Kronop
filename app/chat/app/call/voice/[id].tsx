// Powered by OnSpace.AI
import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StatusBar, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useChat } from '../../../hooks/useChat';
import { Colors, Radius, Spacing, FontSize } from '../../../constants/theme';

export default function VoiceCallScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getConversation } = useChat();
  const conversation = getConversation(id);
  const [elapsed, setElapsed] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(false);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setConnected(true), 2000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!connected) return;
    const iv = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(iv);
  }, [connected]);

  const fmt = (s: number) => {
    const h = Math.floor(s / 3600).toString().padStart(2, '0');
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${h}:${m}:${sec}`;
  };

  if (!conversation) return null;

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.topBtn} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </Pressable>
        <View style={styles.camOffBadge}>
          <Ionicons name="videocam-off" size={18} color="#fff" />
          <View style={styles.toggle} />
        </View>
      </View>

      {/* Center content */}
      <View style={styles.center}>
        {/* Glow blob behind avatar */}
        <View style={styles.glowBlob} />
        <View style={styles.avatarWrap}>
          <Image source={{ uri: conversation.participantAvatar }} style={styles.avatar} contentFit="cover" transition={200} />
        </View>
        <Ionicons name="heart" size={28} color="#fff" style={styles.heart} />
        <Text style={styles.timer}>{connected ? fmt(elapsed) : 'Calling...'}</Text>
      </View>

      {/* Bottom controls */}
      <View style={styles.bottomBar}>
        <Pressable style={styles.ctrlBtn}>
          <Ionicons name="person-add" size={22} color={Colors.textPrimary} />
        </Pressable>
        <Pressable
          style={[styles.ctrlBtn, speaker && styles.ctrlBtnActive]}
          onPress={() => setSpeaker(s => !s)}
        >
          <Ionicons name={speaker ? 'volume-high' : 'volume-medium'} size={22} color={speaker ? Colors.primary : Colors.textPrimary} />
        </Pressable>
        <Pressable
          style={[styles.ctrlBtn, muted && styles.ctrlBtnActive]}
          onPress={() => setMuted(m => !m)}
        >
          <Ionicons name={muted ? 'mic-off' : 'mic-off-outline'} size={22} color={muted ? Colors.primary : Colors.textPrimary} />
        </Pressable>
        <Pressable style={styles.endBtn} onPress={() => router.back()}>
          <MaterialIcons name="call-end" size={26} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#2a2d2e', justifyContent: 'space-between' },
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.md,
  },
  topBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  camOffBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(0,0,0,0.45)', paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: Radius.full,
  },
  toggle: { width: 28, height: 16, borderRadius: 8, backgroundColor: '#555' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: -40 },
  glowBlob: {
    position: 'absolute',
    width: 260, height: 320,
    borderRadius: 130,
    backgroundColor: 'rgba(100,105,105,0.35)',
  },
  avatarWrap: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: '#555', overflow: 'hidden',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.2)',
  },
  avatar: { width: '100%', height: '100%' },
  heart: { marginTop: Spacing.md },
  timer: { fontSize: FontSize.xl, color: '#fff', fontWeight: '400', marginTop: Spacing.sm, letterSpacing: 1 },
  bottomBar: {
    flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center',
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg,
    backgroundColor: '#1a1c1d', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)',
  },
  ctrlBtn: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  ctrlBtnActive: { backgroundColor: Colors.primary + '33' },
  endBtn: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: '#E53935',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#E53935', shadowOpacity: 0.5, shadowRadius: 10, elevation: 8,
  },
});
