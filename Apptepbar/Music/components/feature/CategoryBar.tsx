import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { categories } from '../../data/categories';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';

interface CategoryBarProps {
  selected: string;
  onSelect: (id: string) => void;
}

export function CategoryBar({ selected, onSelect }: CategoryBarProps) {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {categories.map((cat) => {
          const isSelected = cat.id === selected;
          return (
            <Pressable
              key={cat.id}
              onPress={() => onSelect(cat.id)}
              style={[styles.chip, isSelected ? styles.chipSelected : styles.chipDefault]}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                {cat.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    height: 46,
    backgroundColor: colors.background,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    gap: 8,
  },
  chip: {
    height: 34,
    paddingHorizontal: 16,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipDefault: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderWidth: 0,
  },
  chipText: {
    fontSize: typography.caption,
    fontWeight: typography.medium,
    color: 'rgba(255,255,255,0.7)',
  },
  chipTextSelected: {
    color: colors.textPrimary,
    fontWeight: typography.semibold,
  },
});
