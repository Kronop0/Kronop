import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

interface TitleHandlerProps {
  title: string;
  onTitleChange: (title: string) => void;
}

export default function TitleHandler({ title, onTitleChange }: TitleHandlerProps) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>Title *</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={onTitleChange}
        placeholder="Enter reel title..."
        placeholderTextColor="#666"
        maxLength={100}
      />
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
  input: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6, // Half of original (12 -> 6)
    fontSize: 14,
    color: '#FFFFFF',
    height: 40, // Same as thumbnail button height
  },
});