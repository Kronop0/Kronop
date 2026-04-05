// Powered by OnSpace.AI
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize } from '@/constants/theme';

interface GoLiveButtonProps {
  canGoLive: boolean;
  onPress: () => void;
  paddingBottom: number;
}

export default function GoLiveButton({ canGoLive, onPress, paddingBottom }: GoLiveButtonProps) {
  return (
    <View style={[styles.bar, { paddingBottom }]}>
      <TouchableOpacity
        style={[styles.btn, canGoLive && styles.btnActive]}
        disabled={!canGoLive}
        activeOpacity={0.85}
        onPress={onPress}
      >
        <View style={styles.inner}>
          <View style={[styles.dot, canGoLive && styles.dotActive]} />
          <Text style={[styles.text, canGoLive && styles.textActive]}>Go Live</Text>
          <Ionicons name="radio-outline" size={20} color={canGoLive ? '#fff' : Colors.textMuted} />
        </View>
        {!canGoLive ? <Text style={styles.hint}>Enter a title to go live</Text> : null}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    paddingHorizontal: Spacing.md, paddingTop: Spacing.md,
    backgroundColor: Colors.bg, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  btn: {
    backgroundColor: Colors.surface, borderRadius: Radius.xl,
    paddingVertical: Spacing.sm, paddingHorizontal: Spacing.xl,
    borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center', opacity: 0.45,
  },
  btnActive: {
    backgroundColor: Colors.liveRed, borderColor: Colors.liveRed, opacity: 1,
    shadowColor: Colors.liveRed, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5, shadowRadius: 12, elevation: 8,
  },
  inner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.textMuted },
  dotActive: { backgroundColor: '#fff' },
  text: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.textMuted, letterSpacing: 0.5 },
  textActive: { color: '#fff' },
  hint: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 4, fontStyle: 'italic' },
});
