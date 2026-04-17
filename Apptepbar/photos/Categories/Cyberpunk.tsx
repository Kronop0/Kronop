import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface TextStyles {
  titleFontSize: number;
  subtitleFontSize: number;
  categoryFontSize: number;
}

interface CyberpunkCategoryProps {
  textStyles?: TextStyles;
}

export const CyberpunkCategory = ({ textStyles }: CyberpunkCategoryProps) => {
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { fontSize: textStyles?.titleFontSize || 13 }]}>Cyberpunk Photos</Text>
      <Text style={[styles.subtitle, { fontSize: textStyles?.subtitleFontSize || 11 }]}>Futuristic cyberpunk art coming soon...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    padding: 20,
  },
  title: {
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 6,
  },
  subtitle: {
    color: '#999',
    textAlign: 'center',
  },
});
