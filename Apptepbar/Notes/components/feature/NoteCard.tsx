// Powered by OnSpace.AI
// Main note card — compact framed box, 4-line truncation, single-row actions

import React, { memo, useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { NoteHeader } from './NoteHeader';
import { NoteActionBar } from './NoteActionBar';
import { NoteData } from '../../services/noteService';
import { NoteActions } from '../../hooks/useNote';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../constants/theme';

const MAX_LINES = 4;

interface NoteCardProps {
  note: NoteData;
  actions: NoteActions;
  isAnimating: Record<string, boolean>;
}

export const NoteCard = memo(function NoteCard({
  note,
  actions,
  isAnimating,
}: NoteCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [needsTruncation, setNeedsTruncation] = useState(false);

  const handleTextLayout = useCallback(
    (e: { nativeEvent: { lines: unknown[] } }) => {
      if (!needsTruncation && e.nativeEvent.lines.length > MAX_LINES) {
        setNeedsTruncation(true);
      }
    },
    [needsTruncation]
  );

  const toggleExpand = useCallback(() => setExpanded(prev => !prev), []);

  return (
    <View style={styles.card}>
      {/* User header — compact */}
      <NoteHeader user={note.user} timestamp={note.timestamp} />

      {/* Content box — framed inner area */}
      <View style={styles.contentBox}>
        <Text
          style={styles.content}
          numberOfLines={expanded ? undefined : MAX_LINES}
          onTextLayout={handleTextLayout}
        >
          {note.content}
        </Text>

        {needsTruncation ? (
          <Pressable
            onPress={toggleExpand}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Text style={styles.expandToggle}>
              {expanded ? 'Show less ↑' : '... Show more ↓'}
            </Text>
          </Pressable>
        ) : null}
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Actions row — all 4 in one line */}
      <NoteActionBar
        likes={note.likes}
        comments={note.comments}
        shares={note.shares}
        supporters={note.supporters}
        isLiked={note.isLiked}
        isSupported={note.isSupported}
        onLike={() => actions.onLike(note.id)}
        onComment={() => actions.onComment(note.id)}
        onShare={() => actions.onShare(note.id)}
        onSupport={() => actions.onSupport(note.id)}
        isAnimating={isAnimating}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    ...Shadows.card,
  },
  contentBox: {
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  content: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.regular,
    color: Colors.textPrimary,
    lineHeight: Typography.fontSizes.md * Typography.lineHeights.normal,
  },
  expandToggle: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semiBold,
    color: Colors.primary,
    marginTop: Spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: Spacing.xs,
  },
});
