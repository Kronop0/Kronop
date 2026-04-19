// Powered by OnSpace.AI
import React, { useState } from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize } from '../../constants/theme';
import { EmojiPicker } from '../emoji/EmojiPicker';

interface Props {
  value: string;
  onChange: (t: string) => void;
  onSend: () => void;
  paddingBottom: number;
}

export function ChatInputBar({ value, onChange, onSend, paddingBottom }: Props) {
  const [showEmoji, setShowEmoji] = useState(false);
  const canSend = value.trim().length > 0;

  const handleEmojiSelect = (emoji: string) => {
    onChange(value + emoji);
  };

  const toggleEmoji = () => {
    setShowEmoji(prev => !prev);
  };

  return (
    <View>
      {showEmoji ? <EmojiPicker onSelect={handleEmojiSelect} /> : null}
      <View style={[styles.bar, { paddingBottom }]}>
        <Pressable style={styles.attach}>
          <Ionicons name="add-circle" size={28} color={Colors.primary} />
        </Pressable>
        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            placeholder="Message likho..."
            placeholderTextColor={Colors.textMuted}
            value={value}
            onChangeText={onChange}
            multiline
            maxLength={500}
            onFocus={() => setShowEmoji(false)}
          />
          <Pressable
            style={[styles.emojiBtn, showEmoji && styles.emojiBtnActive]}
            onPress={toggleEmoji}
          >
            <Ionicons
              name={showEmoji ? 'happy' : 'happy-outline'}
              size={22}
              color={showEmoji ? Colors.primary : Colors.textMuted}
            />
          </Pressable>
        </View>
        <Pressable
          style={[styles.sendBtn, !canSend && styles.sendDisabled]}
          onPress={onSend}
          disabled={!canSend}
        >
          <Ionicons name="send" size={20} color={canSend ? '#fff' : Colors.textMuted} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.separator,
    gap: Spacing.sm,
  },
  attach: { paddingBottom: 6 },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.inputBg,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    maxHeight: 120,
  },
  input: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    maxHeight: 100,
    paddingTop: 0,
    paddingBottom: 0,
  },
  emojiBtn: {
    paddingLeft: Spacing.sm,
    paddingBottom: 2,
    borderRadius: Radius.sm,
    padding: 4,
  },
  emojiBtnActive: {
    backgroundColor: Colors.primary + '22',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  sendDisabled: {
    backgroundColor: Colors.surfaceElevated,
    shadowOpacity: 0,
    elevation: 0,
  },
});
