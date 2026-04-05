// Powered by OnSpace.AI
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize } from '@/constants/theme';
import { MOCK_FRIENDS, Friend } from '../constants/friendsData';

interface LiveCoHostProps {
  invitedIds: string[];
  isLive: boolean;
  topOffset: number;
}

interface CoHostState {
  friend: Friend;
  status: 'joining' | 'live';
  slideAnim: Animated.Value;
  opacityAnim: Animated.Value;
}

export default function LiveCoHost({ invitedIds, isLive, topOffset }: LiveCoHostProps) {
  const cohosts = useRef<CoHostState[]>([]);
  const [, forceUpdate] = React.useState(0);

  useEffect(() => {
    if (!isLive || invitedIds.length === 0) return;
    cohosts.current = invitedIds.map((id) => {
      const friend = MOCK_FRIENDS.find((f) => f.id === id)!;
      const slideAnim = new Animated.Value(-80);
      const opacityAnim = new Animated.Value(0);
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
      return { friend, status: 'joining' as const, slideAnim, opacityAnim };
    });
    forceUpdate((n) => n + 1);

    const timers = cohosts.current.map((_, i) =>
      setTimeout(() => {
        cohosts.current[i].status = 'live';
        forceUpdate((n) => n + 1);
      }, 2500 + i * 800)
    );
    return () => timers.forEach(clearTimeout);
  }, [isLive]);

  if (!isLive || cohosts.current.length === 0) return null;

  return (
    <View style={[s.container, { top: topOffset }]}>
      {cohosts.current.map((ch) => (
        <Animated.View
          key={ch.friend.id}
          style={[s.tile, { transform: [{ translateX: ch.slideAnim }], opacity: ch.opacityAnim }]}
        >
          <View style={s.videoArea}>
            <Image source={{ uri: ch.friend.avatarUrl }} style={s.avatar} contentFit="cover" />
            {ch.status === 'joining' ? (
              <View style={s.joiningOverlay}>
                <Text style={s.joiningText}>Joining...</Text>
              </View>
            ) : null}
          </View>
          <View style={s.footer}>
            {ch.status === 'live' ? (
              <View style={s.livePill}>
                <Ionicons name="radio" size={8} color="#fff" />
                <Text style={s.livePillText}>LIVE</Text>
              </View>
            ) : null}
            <Text style={s.name} numberOfLines={1}>{ch.friend.name.split(' ')[0]}</Text>
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

const TILE_W = 72;
const TILE_H = 96;

const s = StyleSheet.create({
  container: {
    position: 'absolute', left: Spacing.sm,
    gap: Spacing.sm, zIndex: 10,
  },
  tile: {
    width: TILE_W, backgroundColor: '#00000088',
    borderRadius: Radius.md, overflow: 'hidden',
    borderWidth: 1, borderColor: '#ffffff22',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5, shadowRadius: 8, elevation: 8,
  },
  videoArea: { width: TILE_W, height: TILE_H, backgroundColor: '#1A1A2A', alignItems: 'center', justifyContent: 'center' },
  avatar: { width: TILE_W, height: TILE_H },
  joiningOverlay: {
    ...StyleSheet.absoluteFillObject, backgroundColor: '#00000088',
    alignItems: 'center', justifyContent: 'center',
  },
  joiningText: { fontSize: 9, fontWeight: '700', color: '#fff', letterSpacing: 0.5 },
  footer: {
    paddingHorizontal: 5, paddingVertical: 4,
    backgroundColor: '#000000AA', alignItems: 'center', gap: 2,
  },
  livePill: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: Colors.liveRed, paddingHorizontal: 5,
    paddingVertical: 1, borderRadius: 6,
  },
  livePillText: { fontSize: 7, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  name: { fontSize: 9, fontWeight: '600', color: '#ffffffCC', textAlign: 'center' },
});
