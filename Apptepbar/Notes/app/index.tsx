
// Demo home screen — displays all note cards

import React from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  StatusBar,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { NoteCard } from '../components/feature/NoteCard';
import { useNotes } from '../hooks/useNote';
import { Colors, Typography, Spacing, Shadows } from '../constants/theme';

export default function HomeScreen() {
  const { notes, actions, isAnimating } = useNotes();

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <MaterialIcons name="notes" size={26} color={Colors.primary} />
        <Text style={styles.headerTitle}>Notes</Text>
      </View>

      {/* Feed */}
      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NoteCard
            note={item}
            actions={actions}
            isAnimating={isAnimating[item.id] ?? {}}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    ...Shadows.card,
    backgroundColor: Colors.surface,
  },
  headerTitle: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  list: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  separator: {
    height: Spacing.md,
  },
});
