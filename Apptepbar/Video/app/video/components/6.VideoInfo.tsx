import { View, StyleSheet, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, typography } from '@/Apptepbar/Video/ThemeConstants';

interface VideoInfoProps {
  title: string;
  duration: string;
  views: string;
  metadataLoading: boolean;
  metadataError: string | null;
}

export function VideoInfo({ title, duration, views, metadataLoading, metadataError }: VideoInfoProps) {
  if (metadataLoading) {
    return (
      <View style={styles.info}>
        <Text style={styles.loadingText}>🌥️ Loading description from cloud...</Text>
      </View>
    );
  }

  if (metadataError) {
    return (
      <View style={styles.info}>
        <Text style={styles.errorText}>❌ Cloud connection failed - showing local description</Text>
      </View>
    );
  }

  return (
    <View style={styles.info}>
      <Text style={styles.title}>
        {title}
      </Text>
      
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <MaterialIcons name="visibility" size={16} color={colors.textMuted} />
          <Text style={styles.statText}>{views} views</Text>
        </View>
        
        <View style={styles.statItem}>
          <MaterialIcons name="schedule" size={16} color={colors.textMuted} />
          <Text style={styles.statText}>{duration}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  info: {
    padding: spacing.md,
  },
  title: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    ...typography.bodySmall,
    color: colors.textMuted,
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
