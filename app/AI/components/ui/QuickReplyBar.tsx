// Powered by OnSpace.AI
import React, { memo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { QUICK_REPLIES } from '../../services/kronopKnowledge';
import { Colors, Spacing, FontSize, Radius } from '../../constants/theme';

interface QuickReplyBarProps {
  onSelect: (text: string) => void;
  visible: boolean;
}

export const QuickReplyBar = memo(function QuickReplyBar({ onSelect, visible }: QuickReplyBarProps) {
  if (!visible) return null;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>Quick Help</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {QUICK_REPLIES.map(item => (
          <Pressable
            key={item.id}
            onPress={() => onSelect(item.text)}
            style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
          >
            <MaterialIcons name={item.icon as any} size={14} color={Colors.accent} />
            <Text style={styles.chipText}>{item.text}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  label: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: '600',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xs,
    letterSpacing: 0.5,
    includeFontPadding: false,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.accentLight,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: 7,
  },
  chipPressed: {
    backgroundColor: Colors.primaryGlow,
    opacity: 0.8,
  },
  chipText: {
    color: Colors.text,
    fontSize: FontSize.xs,
    fontWeight: '500',
    includeFontPadding: false,
  },
});
