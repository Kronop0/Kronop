// Powered by OnSpace.AI
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize } from '../../constants/theme';

interface Props {
  selectedCount: number;
  onDelete: () => void;
  onCancel: () => void;
  onSelectAll: () => void;
}

export function SelectionBar({ selectedCount, onDelete, onCancel, onSelectAll }: Props) {
  return (
    <View style={styles.bar}>
      <Pressable onPress={onCancel} style={styles.iconBtn} hitSlop={8}>
        <Ionicons name="close" size={22} color={Colors.textPrimary} />
      </Pressable>

      <Text style={styles.count}>
        {selectedCount > 0 ? `${selectedCount} selected` : 'Select messages'}
      </Text>

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.7 }]}
          onPress={onSelectAll}
          hitSlop={8}
        >
          <Ionicons name="checkmark-done" size={22} color={Colors.primary} />
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.deleteBtn,
            selectedCount === 0 && styles.deleteBtnDisabled,
            pressed && { opacity: 0.8 },
          ]}
          onPress={onDelete}
          disabled={selectedCount === 0}
        >
          <Ionicons name="trash" size={18} color={selectedCount > 0 ? '#fff' : Colors.textMuted} />
          <Text style={[styles.deleteText, selectedCount === 0 && { color: Colors.textMuted }]}>
            Delete
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingTop: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: Radius.full,
    justifyContent: 'center', alignItems: 'center',
  },
  count: { flex: 1, fontSize: FontSize.md, fontWeight: '600', color: Colors.textPrimary },
  actions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#E53935', paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm, borderRadius: Radius.full,
  },
  deleteBtnDisabled: { backgroundColor: Colors.surfaceCard },
  deleteText: { fontSize: FontSize.sm, color: '#fff', fontWeight: '600' },
});
