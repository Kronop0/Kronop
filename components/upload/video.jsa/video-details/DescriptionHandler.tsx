import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

interface DescriptionHandlerProps {
  description: string;
  onDescriptionChange: (description: string) => void;
}

export default function DescriptionHandler({ description, onDescriptionChange }: DescriptionHandlerProps) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={onDescriptionChange}
        placeholder="Add description..."
        placeholderTextColor="#666"
        multiline
        numberOfLines={3}
        maxLength={500}
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
    paddingVertical: 12,
    fontSize: 14,
    color: '#FFFFFF',
  },
  textArea: {
    height: 80,
    paddingTop: 12,
  },
});