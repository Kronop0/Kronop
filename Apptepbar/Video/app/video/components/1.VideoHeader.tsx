import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, typography } from '@/Apptepbar/Video/ThemeConstants';

interface VideoHeaderProps {
  title: string;
  metadataLoading: boolean;
  metadataError: string | null;
}

export function VideoHeader({ title, metadataLoading, metadataError }: VideoHeaderProps) {
  return (
    <View style={styles.titleStrip}>
      {metadataLoading ? (
        <Text style={styles.loadingText}>🌥️ Loading title from cloud...</Text>
      ) : metadataError ? (
        <Text style={styles.errorText}>❌ Cloud error - using local data</Text>
      ) : (
        <Text style={styles.stripTitle} numberOfLines={1} ellipsizeMode="tail">
          {title}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  titleStrip: {
    width: '100%',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceLight,
  },
  stripTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  loadingText: {
    ...typography.body,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  errorText: {
    ...typography.body,
    color: '#ff4444',
    fontWeight: '600',
  },
});
