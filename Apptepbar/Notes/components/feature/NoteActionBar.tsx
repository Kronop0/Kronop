// Powered by OnSpace.AI
// Note action bar — star, comment, share, support all in one line

import React, { memo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ActionButton } from '../ui/ActionButton';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import { formatCount } from '../../services/noteService';

interface NoteActionBarProps {
  likes: number;
  comments: number;
  shares: number;
  supporters: number;
  isLiked: boolean;
  isSupported: boolean;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onSupport: () => void;
  isAnimating: Record<string, boolean>;
}

export const NoteActionBar = memo(function NoteActionBar({
  likes,
  comments,
  shares,
  supporters,
  isLiked,
  isSupported,
  onLike,
  onComment,
  onShare,
  onSupport,
  isAnimating,
}: NoteActionBarProps) {
  return (
    <View style={styles.container}>
      {/* Star / Like */}
      <ActionButton
        icon={
          <MaterialIcons
            name={isLiked ? 'star' : 'star-border'}
            size={20}
            color={isLiked ? Colors.like : Colors.textSecondary}
          />
        }
        count={formatCount(likes)}
        onPress={onLike}
        isActive={isLiked}
        activeColor={Colors.like}
        inactiveColor={Colors.textSecondary}
        isAnimating={isAnimating['like']}
        accessibilityLabel="Like note"
      />

      {/* Comment */}
      <ActionButton
        icon={
          <MaterialIcons
            name="chat-bubble-outline"
            size={19}
            color={Colors.textSecondary}
          />
        }
        count={formatCount(comments)}
        onPress={onComment}
        isActive={false}
        activeColor={Colors.comment}
        inactiveColor={Colors.textSecondary}
        isAnimating={isAnimating['comment']}
        accessibilityLabel="Comment on note"
      />

      {/* Share */}
      <ActionButton
        icon={
          <MaterialIcons
            name="share"
            size={19}
            color={Colors.textSecondary}
          />
        }
        count={formatCount(shares)}
        onPress={onShare}
        isActive={false}
        activeColor={Colors.share}
        inactiveColor={Colors.textSecondary}
        isAnimating={isAnimating['share']}
        accessibilityLabel="Share note"
      />

      {/* Support — compact inline version */}
      <Pressable
        onPress={onSupport}
        accessibilityLabel="Support this note"
        style={({ pressed }) => [
          styles.supportBtn,
          isSupported ? styles.supportActive : styles.supportDefault,
          pressed && styles.pressed,
          isAnimating['support'] && styles.animating,
        ]}
      >
        <MaterialIcons
          name={isSupported ? 'favorite' : 'volunteer-activism'}
          size={16}
          color={isSupported ? Colors.white : Colors.support}
        />
        <Text
          style={[
            styles.supportLabel,
            { color: isSupported ? Colors.white : Colors.support },
          ]}
        >
          {formatCount(supporters)}
        </Text>
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  supportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    minHeight: 36,
    borderWidth: 1.5,
  },
  supportDefault: {
    backgroundColor: Colors.supportMuted,
    borderColor: Colors.support,
  },
  supportActive: {
    backgroundColor: Colors.support,
    borderColor: Colors.support,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  animating: {
    transform: [{ scale: 1.06 }],
  },
  supportLabel: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.bold,
  },
});
