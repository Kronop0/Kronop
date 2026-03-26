import { View, StyleSheet, Pressable, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, typography } from '@/Apptepbar/Video/ThemeConstants';

interface VideoActionsProps {
  isLiked: boolean;
  likes: number;
  comments: number;
  isSaved: boolean;
  onToggleLike: () => void;
  onComments: () => void;
  onShare: () => void;
  onReport: () => void;
  onSave: () => void;
}

export function VideoActions({ 
  isLiked, 
  likes, 
  comments, 
  isSaved, 
  onToggleLike, 
  onComments, 
  onShare, 
  onReport, 
  onSave 
}: VideoActionsProps) {
  return (
    <View style={styles.actions}>
      {/* Like Button */}
      <Pressable 
        style={styles.actionButton}
        onPress={onToggleLike}
      >
        <MaterialIcons 
          name={isLiked ? 'star' : 'star-border'} 
          size={22} 
          color={isLiked ? colors.primary : colors.textMuted} 
        />
        <Text style={[styles.actionText, isLiked && styles.likedText]}>
          {formatNumber(likes)}
        </Text>
      </Pressable>

      {/* Comment Button */}
      <Pressable 
        style={styles.actionButton}
        onPress={onComments}
      >
        <MaterialIcons name="comment" size={22} color={colors.textMuted} />
        <Text style={styles.actionText}>{formatNumber(comments)}</Text>
      </Pressable>

      {/* Share Button */}
      <Pressable 
        style={styles.actionButton}
        onPress={onShare}
      >
        <MaterialIcons name="share" size={22} color={colors.textMuted} />
        <Text style={styles.actionText}>Share</Text>
      </Pressable>

      {/* Save Button */}
      <Pressable 
        style={styles.actionButton}
        onPress={onSave}
      >
        <MaterialIcons 
          name={isSaved ? 'bookmark' : 'bookmark-border'} 
          size={22} 
          color={isSaved ? colors.primary : colors.textMuted} 
        />
        <Text style={[styles.actionText, isSaved && styles.savedText]}>
          {isSaved ? 'Saved' : 'Save'}
        </Text>
      </Pressable>

      {/* Report Button */}
      <Pressable 
        style={styles.actionButton}
        onPress={onReport}
      >
        <MaterialIcons name="flag" size={22} color={colors.textMuted} />
        <Text style={styles.actionText}>Report</Text>
      </Pressable>
    </View>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceLight,
  },
  actionButton: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
  },
  actionText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  likedText: {
    color: colors.primary,
  },
  savedText: {
    color: colors.primary,
  },
});
