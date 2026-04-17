// Powered by OnSpace.AI
import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize } from '@/constants/theme';

interface TitleInputProps {
  value: string;
  onChange: (text: string) => void;
}

export default function TitleInput({ value, onChange }: TitleInputProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Feather name="edit-3" size={16} color={Colors.primary.main} />
        <Text style={styles.title}>Live Title</Text>
      </View>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder="What's your live about? ..."
        placeholderTextColor={Colors.textMuted}
        maxLength={80}
        returnKeyType="done"
      />
      <Text style={styles.count}>{value.length}/80</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBg, borderRadius: Radius.lg,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.borderColor, gap: Spacing.sm,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  title: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  input: {
    backgroundColor: Colors.surface, borderRadius: Radius.md,
    paddingHorizontal: Spacing.md, paddingVertical: 2,
    fontSize: FontSize.md, color: Colors.textPrimary,
    borderWidth: 1, borderColor: Colors.borderColor, minHeight: 28,
  },
  count: { fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'right' },
});
