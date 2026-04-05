// Powered by OnSpace.AI
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize } from '@/constants/theme';

interface ChatToggleButtonProps {
  chatVisible: boolean;
  onToggle: () => void;
}

export default function ChatToggleButton({ chatVisible, onToggle }: ChatToggleButtonProps) {
  return (
    <TouchableOpacity style={styles.btn} onPress={onToggle} activeOpacity={0.8}>
      <Ionicons
        name={chatVisible ? 'chatbubbles-outline' : 'chatbubbles'}
        size={24}
        color={chatVisible ? '#fff' : Colors.liveRed}
      />
      <Text style={[styles.label, !chatVisible && styles.labelOff]}>
        {chatVisible ? 'Chat' : 'Chat Off'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { alignItems: 'center', gap: 4, width: 52, minHeight: 44 },
  label: { fontSize: FontSize.xs, color: '#ffffffBB', fontWeight: '500' },
  labelOff: { color: Colors.liveRed },
});
