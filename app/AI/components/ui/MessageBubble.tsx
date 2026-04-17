// Powered by OnSpace.AI
import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { ChatMessage } from '../../services/aiService';
import { Colors, Spacing, FontSize, Radius } from '../../constants/theme';
import { TypingIndicator } from './TypingIndicator';

interface MessageBubbleProps {
  message: ChatMessage;
}

function formatContent(text: string): React.ReactNode {
  // Simple markdown-like bold formatting
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <Text key={i} style={styles.bold}>
          {part.slice(2, -2)}
        </Text>
      );
    }
    return <Text key={i}>{part}</Text>;
  });
}

export const MessageBubble = memo(function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <View style={styles.userRow}>
        <View style={styles.userBubble}>
          <Text style={styles.userText}>{message.content}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.aiRow}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>AI</Text>
        </View>
        <View style={styles.onlineDot} />
      </View>
      <View style={styles.aiContent}>
        <Text style={styles.aiName}>Kronop AI</Text>
        <View style={styles.aiBubble}>
          {message.isTyping && !message.content ? (
            <TypingIndicator />
          ) : (
            <Text style={styles.aiText}>
              {formatContent(message.content)}
            </Text>
          )}
        </View>
        <Text style={styles.timestamp}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  userRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  userBubble: {
    backgroundColor: Colors.userBubble,
    borderRadius: Radius.lg,
    borderBottomRightRadius: Radius.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    maxWidth: '78%',
    shadowColor: Colors.primaryGlow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },
  userText: {
    color: Colors.white,
    fontSize: FontSize.md,
    lineHeight: 22,
    includeFontPadding: false,
  },
  aiRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  avatarContainer: {
    position: 'relative',
    marginTop: 2,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: '600',
    includeFontPadding: false,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.background,
  },
  aiContent: {
    flex: 1,
  },
  aiName: {
    color: Colors.accent,
    fontSize: FontSize.xs,
    fontWeight: '600',
    marginBottom: 4,
    includeFontPadding: false,
  },
  aiBubble: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radius.lg,
    borderTopLeftRadius: Radius.xs,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    maxWidth: '90%',
  },
  aiText: {
    color: Colors.text,
    fontSize: FontSize.md,
    lineHeight: 22,
    includeFontPadding: false,
  },
  bold: {
    fontWeight: '700',
    color: Colors.accent,
  },
  timestamp: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    marginTop: 4,
    includeFontPadding: false,
  },
});

export default MessageBubble;
