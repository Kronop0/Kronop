// Powered by OnSpace.AI
import React, { useState } from 'react';
import { View, Pressable, StyleSheet, Text, Alert } from 'react-native';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, FontSize } from '../../constants/theme';

interface Props {
  onEnd: () => void;
  facing?: 'front' | 'back';
  onFlip?: () => void;
  camOff?: boolean;
  onToggleCam?: () => void;
}

export function VideoControls({ onEnd, facing, onFlip, camOff, onToggleCam }: Props) {
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(true);

  const Btn = ({ icon, lib, label, active, onPress, danger, size }: any) => (
    <Pressable
      style={({ pressed }) => [
        styles.btn,
        active && styles.btnActive,
        danger && styles.btnDanger,
        pressed && { opacity: 0.8 },
      ]}
      onPress={onPress}
    >
      {lib === 'community'
        ? <MaterialCommunityIcons name={icon} size={size ?? 26} color={danger ? '#fff' : active ? Colors.primary : '#fff'} />
        : lib === 'material'
          ? <MaterialIcons name={icon} size={size ?? 26} color={danger ? '#fff' : active ? Colors.primary : '#fff'} />
          : <Ionicons name={icon} size={size ?? 26} color={danger ? '#fff' : active ? Colors.primary : '#fff'} />
      }
      {label ? <Text style={[styles.label, active && { color: Colors.primary }]}>{label}</Text> : null}
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Btn icon={muted ? 'mic-off' : 'mic'} label={muted ? 'Unmute' : 'Mute'} active={muted} onPress={() => setMuted(m => !m)} />
        <Btn icon={camOff ? 'videocam-off' : 'videocam'} label={camOff ? 'Cam On' : 'Cam Off'} active={camOff} onPress={onToggleCam} />
        <Btn icon="call-end" lib="material" label="End" danger onPress={onEnd} />
        <Btn icon="camera-flip" lib="community" label="Flip" active={facing === 'back'} onPress={onFlip} />
        <Btn icon={speaker ? 'volume-up' : 'volume-off'} lib="material" label="Speaker" active={speaker} onPress={() => setSpeaker(s => !s)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.xl },
  row: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  btn: {
    alignItems: 'center', gap: 4, padding: Spacing.sm,
    width: 62, height: 62, borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center',
  },
  btnActive: { backgroundColor: Colors.primary + '44' },
  btnDanger: { backgroundColor: '#E53935', shadowColor: '#E53935', shadowOpacity: 0.6, shadowRadius: 12, elevation: 8 },
  label: { fontSize: 9, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
});
