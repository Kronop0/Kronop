import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography, borderRadius } from '../../constants/theme';

const PURPLE = '#8B00FF';

interface CommentInputProps {
  value: string;
  onChangeText: (t: string) => void;
  onSubmit: () => void;
  replyingTo: string | null;
  onCancelReply: () => void;
  bottomPad: number;
  getAvatarColor: (id: string) => string;
}

export function CommentInput({
  value, onChangeText, onSubmit, replyingTo, onCancelReply, bottomPad, getAvatarColor,
}: CommentInputProps) {
  const inputRef = useRef<TextInput>(null);

  const handleFocus = () => {
    inputRef.current?.focus();
  };

  return (
    <View style={[styles.container, { paddingBottom: bottomPad }]}>
      {replyingTo && (
        <View style={styles.replyBar}>
          <Text style={styles.replyText}>Replying to comment</Text>
          <TouchableOpacity onPress={onCancelReply}>
            <Ionicons name="close" size={18} color="#888888" />
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.row}>
        <View style={styles.inputContainer}>
          <View style={[styles.avatar, { backgroundColor: getAvatarColor('currentUser') }]}>
            <Text style={styles.avatarText}>Y</Text>
          </View>
          <TextInput
            ref={inputRef}
            style={[styles.input, { color: "#FFFFFF" }]}
            placeholder="Add a comment..."
            placeholderTextColor="#555555"
            value={value}
            onChangeText={onChangeText}
            multiline
            autoFocus={false}
            blurOnSubmit={false}
            returnKeyType="default"
            enablesReturnKeyAutomatically={false}
            keyboardAppearance="dark"
            selectTextOnFocus={true}
            clearButtonMode="never"
            autoComplete="off"
            autoCorrect={false}
            autoCapitalize="sentences"
            onFocus={handleFocus}
            textAlignVertical="top"
            maxLength={500}
          />
        </View>
        <TouchableOpacity
          style={[styles.send, !value.trim() && styles.sendDisabled]}
          onPress={onSubmit}
          disabled={!value.trim()}
        >
          <Ionicons name="send" size={20} color={value.trim() ? PURPLE : '#444444'} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#111111', borderTopWidth: 1, borderTopColor: '#222222', paddingTop: spacing.sm, paddingHorizontal: spacing.md },
  replyBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.xs, paddingHorizontal: spacing.sm, backgroundColor: '#1A1A1A', borderRadius: borderRadius.sm, marginBottom: spacing.xs },
  replyText: { fontSize: typography.small, color: '#888888' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  inputContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatar: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: 'white', fontSize: 12, fontWeight: '700' },
  input: { flex: 1, backgroundColor: '#1A1A1A', borderRadius: 20, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: typography.small, maxHeight: 100, borderWidth: 1, borderColor: '#2A2A2A' },
  send: { padding: spacing.sm },
  sendDisabled: { opacity: 0.4 },
});
