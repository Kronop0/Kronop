import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Comment } from '../../types';
import { spacing, typography, borderRadius } from '../../constants/theme';

const PURPLE = '#8B00FF';

interface CommentSectionProps {
  comments: Comment[];
  showComments: boolean;
  onToggle: () => void;
  onLike: (id: string) => void;
  onReply: (id: string, username: string) => void;
  formatNumber: (n: number) => string;
  formatTime: (t: number) => string;
  getAvatarColor: (id: string) => string;
}

export function CommentSection({
  comments, showComments, onToggle,
  onLike, onReply, formatNumber, formatTime, getAvatarColor,
}: CommentSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>Comments • {comments.length}</Text>
        <TouchableOpacity onPress={onToggle}>
          <Ionicons name={showComments ? 'chevron-up' : 'chevron-down'} size={22} color="#888888" />
        </TouchableOpacity>
      </View>
      {showComments && comments.map((c) => (
        <View key={c.id} style={styles.item}>
          <View style={[styles.avatar, { backgroundColor: getAvatarColor(c.userId) }]}>
            <Text style={styles.avatarText}>{c.username.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.content}>
            <View style={styles.commentHeader}>
              <Text style={styles.username}>{c.username}</Text>
              <Text style={styles.time}>{formatTime(c.timestamp)}</Text>
            </View>
            <Text style={styles.commentText}>{c.text}</Text>
            <View style={styles.actions}>
              <TouchableOpacity style={styles.action} onPress={() => onLike(c.id)}>
                <Ionicons name={c.isLiked ? 'star' : 'star-outline'} size={14} color={c.isLiked ? PURPLE : '#888888'} />
                <Text style={styles.actionText}>{formatNumber(c.likes)}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.action} onPress={() => onReply(c.id, c.username)}>
                <Ionicons name="chatbubble-outline" size={14} color="#888888" />
                <Text style={styles.actionText}>Reply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { padding: spacing.md, backgroundColor: '#000000' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  title: { fontSize: typography.body, fontWeight: '700', color: '#FFFFFF' },
  item: { flexDirection: 'row', marginBottom: spacing.lg, gap: spacing.sm },
  avatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: 'white', fontSize: 12, fontWeight: '700' },
  content: { flex: 1 },
  commentHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: 4 },
  username: { fontSize: typography.small, fontWeight: '700', color: '#FFFFFF' },
  time: { fontSize: typography.caption, color: '#555555' },
  commentText: { fontSize: typography.small, lineHeight: 18, marginBottom: 6, color: '#CCCCCC' },
  actions: { flexDirection: 'row', gap: spacing.md },
  action: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionText: { fontSize: 11, color: '#888888' },
});
