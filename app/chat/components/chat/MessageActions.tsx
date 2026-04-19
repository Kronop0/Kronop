// Powered by OnSpace.AI
import React from 'react';
import { View, Text, Pressable, StyleSheet, Modal } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize } from '../../constants/theme';

interface Action { icon: string; label: string; color?: string; onPress: () => void; }
interface Props {
  visible: boolean;
  isMine: boolean;
  messageText?: string;
  onDismiss: () => void;
  onDelete: () => void;
  onSelect: () => void;
  onCopy: () => void;
}

export function MessageActions({ visible, isMine, messageText, onDismiss, onDelete, onSelect, onCopy }: Props) {
  const handleCopy = async () => {
    if (messageText) await Clipboard.setStringAsync(messageText);
    onCopy();
    onDismiss();
  };

  const actions: Action[] = [
    { icon: 'copy-outline', label: 'Copy Text', onPress: handleCopy },
    { icon: 'checkbox-outline', label: 'Select', onPress: () => { onSelect(); onDismiss(); } },
    ...(isMine ? [{ icon: 'trash-outline', label: 'Delete', color: '#E53935', onPress: () => { onDelete(); onDismiss(); } } as Action] : []),
  ];

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onDismiss}>
      <Pressable style={styles.overlay} onPress={onDismiss}>
        <Pressable style={styles.menu} onPress={e => e.stopPropagation()}>
          {actions.map((action, i) => (
            <Pressable
              key={action.label}
              style={({ pressed }) => [
                styles.item,
                i < actions.length - 1 && styles.itemBorder,
                pressed && styles.itemPressed,
              ]}
              onPress={action.onPress}
            >
              <Ionicons name={action.icon as any} size={20} color={action.color ?? Colors.textPrimary} />
              <Text style={[styles.label, action.color ? { color: action.color } : {}]}>{action.label}</Text>
            </Pressable>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center', alignItems: 'center',
  },
  menu: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.md, overflow: 'hidden',
    minWidth: 180, borderWidth: 1, borderColor: Colors.border,
  },
  item: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
  },
  itemBorder: { borderBottomWidth: 1, borderBottomColor: Colors.separator },
  itemPressed: { backgroundColor: Colors.surfaceCard },
  label: { fontSize: FontSize.md, color: Colors.textPrimary, fontWeight: '500' },
});
