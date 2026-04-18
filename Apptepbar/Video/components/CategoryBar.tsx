import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { spacing, typography, borderRadius } from '../constants/theme';

const PURPLE = '#8B00FF';

export const CATEGORIES = [
  'All',
  'Movies',
  'Gaming',
  'Vlogs',
  'Music',
  'Comedy',
  'News',
  'Sports',
  'Tech',
  'Education',
  'Lifestyle',
  'Motivation',
  'Crime',
  'Podcasts',
];

interface CategoryBarProps {
  selected: string;
  onSelect: (category: string) => void;
}

export function CategoryBar({ selected, onSelect }: CategoryBarProps) {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {CATEGORIES.map((cat) => {
          const isSelected = selected === cat;
          return (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, isSelected && styles.chipSelected]}
              onPress={() => onSelect(cat)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    gap: 6,
  },
  chip: {
    height: 28,
    paddingHorizontal: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  chipSelected: {
    backgroundColor: PURPLE,
    borderColor: PURPLE,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#AAAAAA',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
});
