// Powered by OnSpace.AI
// Reusable action button with press animation

import React, { memo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '@/constants/theme';

interface ActionButtonProps {
  icon: React.ReactNode;
  count?: number | string;
  onPress: () => void;
  isActive?: boolean;
  activeColor?: string;
  inactiveColor?: string;
  isAnimating?: boolean;
  accessibilityLabel?: string;
}

export const ActionButton = memo(function ActionButton({
  icon,
  count,
  onPress,
  isActive = false,
  activeColor = Colors.like,
  inactiveColor = Colors.textSecondary,
  isAnimating = false,
  accessibilityLabel,
}: ActionButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
        isAnimating && styles.animating,
      ]}
    >
      <View style={styles.iconWrap}>{icon}</View>
      {count !== undefined ? (
        <Text
          style={[
            styles.count,
            { color: isActive ? activeColor : inactiveColor },
          ]}
        >
          {count}
        </Text>
      ) : null}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: 20,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.65,
    transform: [{ scale: 0.93 }],
  },
  animating: {
    transform: [{ scale: 1.15 }],
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  count: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
});
