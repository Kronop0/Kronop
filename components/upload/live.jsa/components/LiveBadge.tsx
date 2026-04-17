// Powered by OnSpace.AI
import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Spacing, Radius, FontSize } from '@/constants/theme';

interface LiveBadgeProps {
  isLive: boolean;
  dotOpacity: Animated.Value;
}

export default function LiveBadge({ isLive, dotOpacity }: LiveBadgeProps) {
  return (
    <View style={styles.badge}>
      <Animated.View style={[styles.dot, { opacity: dotOpacity }]} />
      <Text style={styles.label}>{isLive ? 'LIVE' : 'PREVIEW'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FF3B3Bcc',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: Radius.full,
  },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#fff' },
  label: { fontSize: FontSize.xs, fontWeight: '800', color: '#fff', letterSpacing: 1.5 },
});
