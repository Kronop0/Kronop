// Category Bar Component - Horizontal scrollable category chips

import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Category } from '../../services/categoryService';
import { colors, spacing, typography } from '../../ThemeConstants';

interface CategoryBarProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export function CategoryBar({ categories, selectedCategory, onSelectCategory }: CategoryBarProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        nestedScrollEnabled={true}
        scrollEventThrottle={16}
      >
        {categories.map((category) => {
          const isSelected = category.id === selectedCategory;
          return (
            <Pressable
              key={category.id}
              onPress={() => onSelectCategory(category.id)}
              style={({ pressed }) => [
                styles.chip,
                isSelected && styles.chipSelected,
                pressed && styles.chipPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Select ${category.name} category`}
              accessibilityState={{ selected: isSelected }}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                {category.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceLight,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    elevation: 4,
  },
  chipPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
