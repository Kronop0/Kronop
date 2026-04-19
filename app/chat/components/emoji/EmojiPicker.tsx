// Powered by OnSpace.AI
import React, { useState } from 'react';
import { View, Text, Pressable, FlatList, StyleSheet, ScrollView } from 'react-native';
import { EMOJI_CATEGORIES } from './emojiData';
import { Colors, Spacing, Radius, FontSize } from '../../constants/theme';

interface Props {
  onSelect: (emoji: string) => void;
}

export function EmojiPicker({ onSelect }: Props) {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = EMOJI_CATEGORIES[activeIdx];

  return (
    <View style={styles.container}>
      {/* Category tabs */}
      <View style={styles.tabRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {EMOJI_CATEGORIES.map((cat, i) => (
            <Pressable
              key={cat.label}
              style={[styles.tab, activeIdx === i && styles.tabActive]}
              onPress={() => setActiveIdx(i)}
            >
              <Text style={styles.tabIcon}>{cat.icon}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Category label */}
      <Text style={styles.catLabel}>{active.label}</Text>

      {/* Emoji grid */}
      <FlatList
        data={active.emojis}
        keyExtractor={(item, idx) => `${activeIdx}_${idx}`}
        numColumns={8}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.emojiBtn, pressed && styles.emojiBtnPressed]}
            onPress={() => onSelect(item)}
          >
            <Text style={styles.emoji}>{item}</Text>
          </Pressable>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.grid}
        keyboardShouldPersistTaps="always"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surfaceCard,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    height: 280,
  },
  tabRow: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.separator,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    gap: 4,
  },
  tab: {
    width: 40,
    height: 36,
    borderRadius: Radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: Colors.primary + '33',
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabIcon: { fontSize: 20 },
  catLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
    paddingBottom: 4,
  },
  grid: {
    paddingHorizontal: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  emojiBtn: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: '12.5%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Radius.sm,
    padding: 4,
  },
  emojiBtnPressed: {
    backgroundColor: Colors.surfaceElevated,
    transform: [{ scale: 1.2 }],
  },
  emoji: { fontSize: 24 },
});
