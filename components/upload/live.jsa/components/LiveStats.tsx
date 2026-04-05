// Powered by OnSpace.AI
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, Radius, FontSize } from '@/constants/theme';

interface LiveStatsProps {
  liveSeconds: number;
  viewerCount: number;
  connectionStatus: string;
  connectionStatusColor: string;
  connectionStatusLabel: string;
}

function formatTime(secs: number) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function LiveStats({ liveSeconds, viewerCount, connectionStatus, connectionStatusColor, connectionStatusLabel }: LiveStatsProps) {
  return (
    <View style={styles.row}>
      <View style={styles.chip}>
        <Ionicons name="time-outline" size={12} color="#fff" />
        <Text style={styles.text}>{formatTime(liveSeconds)}</Text>
      </View>
      <View style={[styles.chip, styles.viewerChip]}>
        <Ionicons name="eye-outline" size={12} color="#fff" />
        <Text style={styles.text}>{viewerCount}</Text>
      </View>
      {connectionStatus !== 'idle' ? (
        <View style={[styles.chip, { backgroundColor: '#00000077' }]}>
          <Text style={[styles.text, { color: connectionStatusColor, fontSize: 10 }]}>{connectionStatusLabel}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.xs, flex: 1, justifyContent: 'center', flexWrap: 'wrap' },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#00000066', paddingHorizontal: Spacing.sm,
    paddingVertical: 4, borderRadius: Radius.full,
  },
  viewerChip: { backgroundColor: '#FF3B3B55' },
  text: { fontSize: FontSize.xs, fontWeight: '700', color: '#fff' },
});
