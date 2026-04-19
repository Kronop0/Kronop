// Powered by OnSpace.AI
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Colors, FontSize, Spacing, Radius } from '../../constants/theme';

interface Props {
  name: string;
  avatar: string;
  status: string;
}

export function CallInfo({ name, avatar, status }: Props) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (status !== 'Connected') return;
    const interval = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(interval);
  }, [status]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.avatarWrap}>
        <Image source={{ uri: avatar }} style={styles.avatar} contentFit="cover" transition={200} />
        <View style={styles.ripple} />
      </View>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.status}>
        {status === 'Connected' ? formatTime(elapsed) : status}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: Spacing.sm, paddingTop: Spacing.xl },
  avatarWrap: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  avatar: {
    width: 120, height: 120,
    borderRadius: Radius.full,
    borderWidth: 4, borderColor: Colors.primary,
  },
  ripple: {
    position: 'absolute',
    width: 150, height: 150,
    borderRadius: Radius.full,
    borderWidth: 2, borderColor: Colors.primary + '44',
  },
  name: {
    fontSize: FontSize.xxl + 4,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  status: { fontSize: FontSize.md, color: Colors.textSecondary, fontWeight: '500' },
});
