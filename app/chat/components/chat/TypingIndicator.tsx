// Powered by OnSpace.AI
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Colors, Spacing, Radius } from '../../constants/theme';

interface Props {
  avatarUri: string;
}

export function TypingIndicator({ avatarUri }: Props) {
  return (
    <View style={styles.wrap}>
      <Image source={{ uri: avatarUri }} style={styles.avatar} contentFit="cover" />
      <View style={styles.bubble}>
        <View style={styles.dots}>
          <View style={[styles.dot, { opacity: 1 }]} />
          <View style={[styles.dot, { opacity: 0.7 }]} />
          <View style={[styles.dot, { opacity: 0.4 }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    paddingTop: Spacing.sm,
    paddingLeft: Spacing.sm,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: Radius.full,
  },
  bubble: {
    backgroundColor: Colors.bubbleReceived,
    borderRadius: Radius.lg,
    borderBottomLeftRadius: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dots: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
    height: 14,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.textMuted,
  },
});
