// Powered by OnSpace.AI
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize } from '@/constants/theme';

interface MicButtonProps {
  isMuted: boolean;
  onToggle: () => void;
}

export default function MicButton({ isMuted, onToggle }: MicButtonProps) {
  return (
    <TouchableOpacity style={styles.btn} onPress={onToggle} activeOpacity={0.8}>
      <Ionicons
        name={isMuted ? 'mic-off' : 'mic-outline'}
        size={24}
        color={isMuted ? Colors.liveRed : '#fff'}
      />
      <Text style={[styles.label, isMuted && styles.labelMuted]}>
        {isMuted ? 'Muted' : 'Mic'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { alignItems: 'center', gap: 4, width: 52, minHeight: 44 },
  label: { fontSize: FontSize.xs, color: '#ffffffBB', fontWeight: '500' },
  labelMuted: { color: Colors.liveRed },
});
