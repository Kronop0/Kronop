// Powered by OnSpace.AI
// Note card user header — name, handle, verified badge

import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Avatar } from '../../components/ui/Avatar';
import { NoteUser } from '../../services/noteService';
import { Colors, Typography, Spacing } from '../../constants/theme';

interface NoteHeaderProps {
  user: NoteUser;
  timestamp: string;
}

export const NoteHeader = memo(function NoteHeader({
  user,
  timestamp,
}: NoteHeaderProps) {
  return (
    <View style={styles.container}>
      <Avatar uri={user.avatarUri} size={50} showBorder />

      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {user.name}
          </Text>
          {user.isVerified ? (
            <MaterialIcons name="verified" size={16} color={Colors.primary} />
          ) : null}
        </View>
        <Text style={styles.handle} numberOfLines={1}>
          {user.handle}
        </Text>
        <Text style={styles.timestamp}>{timestamp}</Text>
      </View>

      <View style={styles.brandBadge}>
        <MaterialIcons name="notes" size={22} color={Colors.primary} />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  name: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    flexShrink: 1,
  },
  handle: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.regular,
    color: Colors.textSecondary,
  },
  timestamp: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  brandBadge: {
    marginTop: 2,
  },
});
