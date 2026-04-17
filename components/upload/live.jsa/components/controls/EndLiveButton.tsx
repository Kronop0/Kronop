// Powered by OnSpace.AI
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize } from '@/constants/theme';

interface EndLiveButtonProps {
  onPress: () => void;
}

export default function EndLiveButton({ onPress }: EndLiveButtonProps) {
  return (
    <TouchableOpacity style={styles.btn} onPress={onPress} activeOpacity={0.85}>
      <Ionicons name="stop-circle" size={14} color="#fff" />
      <Text style={styles.text}>End Live</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.liveRed + 'DD',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#ffffff33',
  },
  text: { fontSize: FontSize.xs, fontWeight: '700', color: '#fff', letterSpacing: 0.5 },
});
