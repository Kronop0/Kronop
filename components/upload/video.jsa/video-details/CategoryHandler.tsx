import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

interface CategoryHandlerProps {
  category: string;
  onCategoryChange: (category: string) => void;
}

export default function CategoryHandler({ category, onCategoryChange }: CategoryHandlerProps) {
  const categories = [
    'Entertainment', 'Music', 'Gaming', 'Sports', 'Comedy', 
    'Education', 'Travel', 'Food', 'Fashion', 'Technology', 'Other'
  ];

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>Category *</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryChip,
              category === cat && styles.categoryChipSelected
            ]}
            onPress={() => onCategoryChange(cat)}
          >
            <Text style={[
              styles.categoryChipText,
              category === cat && styles.categoryChipTextSelected
            ]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  categoryScroll: {
    flexDirection: 'row',
  },
  categoryChip: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  categoryChipSelected: {
    backgroundColor: '#8B00FF',
    borderColor: '#8B00FF',
  },
  categoryChipText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  categoryChipTextSelected: {
    color: '#FFFFFF',
  },
});