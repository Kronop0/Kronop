// Powered by OnSpace.AI
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize } from '@/constants/theme';

const CATEGORIES = [
  { id: 'gaming', label: 'Gaming', icon: 'gamepad' },
  { id: 'music', label: 'Music', icon: 'musical-notes' },
  { id: 'education', label: 'Education', icon: 'book' },
  { id: 'fitness', label: 'Fitness', icon: 'fitness' },
  { id: 'cooking', label: 'Cooking', icon: 'restaurant' },
  { id: 'travel', label: 'Travel', icon: 'airplane' },
  { id: 'art', label: 'Art', icon: 'color-palette' },
  { id: 'tech', label: 'Tech', icon: 'laptop' },
] as const;

interface CategoryPickerProps {
  selected: string;
  onSelect: (id: string) => void;
}

export default function CategoryPicker({ selected, onSelect }: CategoryPickerProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <MaterialIcons name="category" size={16} color={Colors.primary.main} />
        <Text style={styles.title}>Category</Text>
      </View>
      <Text style={styles.subtitle}>Viewers browsing this category will see your live</Text>
      <View style={styles.scrollWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {CATEGORIES.map((cat) => {
            const active = selected === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.chip, active && styles.chipActive]}
                activeOpacity={0.75}
                onPress={() => onSelect(cat.id)}
              >
                <Ionicons name={cat.icon as any} size={14} color={active ? Colors.primary.main : Colors.textMuted} />
                <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{cat.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
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
  subtitle: { fontSize: FontSize.xs, color: Colors.textMuted, lineHeight: 16 },
  scrollWrap: { marginTop: Spacing.xs, minHeight: 40 },
  scrollContent: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingRight: Spacing.xs },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: Spacing.sm + 4, paddingVertical: Spacing.xs + 4,
    borderRadius: Radius.full, backgroundColor: Colors.surface,
    borderWidth: 1.5, borderColor: Colors.borderColor,
  },
  chipActive: { backgroundColor: Colors.primaryDim, borderColor: Colors.primary.main },
  chipLabel: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textMuted },
  chipLabelActive: { color: Colors.primary.main },
});
