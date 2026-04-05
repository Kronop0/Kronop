// Powered by OnSpace.AI
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize } from '@/constants/theme';

const OPTIONS = [
  { id: 'public', label: 'Public', desc: 'Anyone can watch', icon: 'globe' },
  { id: 'friends', label: 'Friends', desc: 'Only your friends', icon: 'people' },
  { id: 'private', label: 'Private', desc: 'Only selected people', icon: 'lock-closed' },
] as const;

interface AudienceSelectorProps {
  selected: string;
  onSelect: (id: string) => void;
}

export default function AudienceSelector({ selected, onSelect }: AudienceSelectorProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="eye-outline" size={16} color={Colors.primary} />
        <Text style={styles.title}>Who Can Watch</Text>
      </View>
      <View style={styles.row}>
        {OPTIONS.map((opt) => {
          const active = selected === opt.id;
          return (
            <TouchableOpacity
              key={opt.id}
              style={[styles.option, active && styles.optionActive]}
              activeOpacity={0.75}
              onPress={() => onSelect(opt.id)}
            >
              <Ionicons name={opt.icon as any} size={20} color={active ? Colors.primary : Colors.textMuted} />
              <Text style={[styles.label, active && styles.labelActive]}>{opt.label}</Text>
              <Text style={[styles.desc, active && styles.descActive]}>{opt.desc}</Text>
              {active ? (
                <View style={styles.check}>
                  <Ionicons name="checkmark-circle" size={14} color={Colors.primary} />
                </View>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBg, borderRadius: Radius.lg,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, gap: Spacing.sm,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  title: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  row: { flexDirection: 'row', gap: Spacing.sm },
  option: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: Radius.md,
    padding: Spacing.sm, alignItems: 'center', gap: 4,
    borderWidth: 1.5, borderColor: Colors.border,
    position: 'relative', minHeight: 80, justifyContent: 'center',
  },
  optionActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryDim },
  label: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textSecondary },
  labelActive: { color: Colors.textPrimary },
  desc: { fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'center', lineHeight: 14 },
  descActive: { color: Colors.textSecondary },
  check: { position: 'absolute', top: 6, right: 6 },
});
