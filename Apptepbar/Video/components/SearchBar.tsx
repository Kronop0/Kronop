import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography } from '../constants/theme';

const PURPLE = '#8B00FF';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
}

export function SearchBar({ value, onChangeText }: SearchBarProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={18} color="#666666" />
      <TextInput
        style={styles.input}
        placeholder="Search videos, channels..."
        placeholderTextColor="#555555"
        value={value}
        onChangeText={onChangeText}
        returnKeyType="search"
      />
      {value.length > 0 ? (
        <TouchableOpacity onPress={() => onChangeText('')}>
          <Ionicons name="close-circle" size={18} color="#555555" />
        </TouchableOpacity>
      ) : (
        <Ionicons name="options-outline" size={18} color={PURPLE} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    marginHorizontal: spacing.md,
    marginTop: spacing.xs,
    marginBottom: 4,
    borderRadius: 20,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    gap: 8,
    paddingVertical: 5,
    height: 36,
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: '#FFFFFF',
    paddingVertical: 0,
  },
});
