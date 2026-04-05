// Powered by OnSpace.AI
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, Animated, StyleSheet } from 'react-native';
import { Colors, Spacing, Radius, FontSize } from '../constants/theme';
import { LiveComment, MOCK_COMMENTS } from '../constants/commentsData';

export type { LiveComment } from '../constants/commentsData';

function CommentItem({ comment }: { comment: LiveComment }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.commentItem, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <View style={[styles.avatar, { backgroundColor: comment.avatarColor }]}>
        <Text style={styles.avatarLetter}>{comment.avatarLetter}</Text>
      </View>
      <View style={styles.commentContent}>
        <Text style={styles.channelName} numberOfLines={1}>{comment.channelName}</Text>
        <Text style={styles.commentText} numberOfLines={2}>{comment.text}</Text>
      </View>
    </Animated.View>
  );
}

interface LiveCommentsProps { isLive: boolean; chatVisible?: boolean; }

export default function LiveComments({ isLive, chatVisible = true }: LiveCommentsProps) {
  const [comments, setComments] = useState<LiveComment[]>([]);
  const flatListRef = useRef<FlatList>(null);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const indexRef = useRef(0);

  const addComment = () => {
    const mock = MOCK_COMMENTS[indexRef.current % MOCK_COMMENTS.length];
    indexRef.current += 1;
    const newComment: LiveComment = { ...mock, id: `${Date.now()}_${Math.random()}`, timestamp: Date.now() };
    setComments((prev) => [...prev, newComment].slice(-20));
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  useEffect(() => {
    if (!isLive) { setComments([]); if (intervalRef.current) clearTimeout(intervalRef.current); return; }
    addComment();
    const scheduleNext = () => {
      const delay = 1200 + Math.random() * 2000;
      intervalRef.current = setTimeout(() => { addComment(); scheduleNext(); }, delay);
    };
    scheduleNext();
    return () => { if (intervalRef.current) clearTimeout(intervalRef.current); };
  }, [isLive]);

  if (!isLive || comments.length === 0 || !chatVisible) return null;

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={comments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CommentItem comment={item} />}
        showsVerticalScrollIndicator={false}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', left: 0, bottom: 70, width: '72%', maxHeight: 240, paddingLeft: Spacing.md },
  list: { flex: 1 },
  listContent: { gap: Spacing.xs + 2, paddingVertical: Spacing.xs },
  commentItem: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.xs + 2, maxWidth: '100%' },
  avatar: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0, borderWidth: 1.5, borderColor: '#ffffff30' },
  avatarLetter: { fontSize: FontSize.xs, fontWeight: '800', color: '#fff' },
  commentContent: { backgroundColor: '#00000070', borderRadius: Radius.md, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, flexShrink: 1, maxWidth: '85%' },
  channelName: { fontSize: FontSize.xs, fontWeight: '700', color: '#FFD700', marginBottom: 1 },
  commentText: { fontSize: FontSize.xs + 1, color: '#ffffffEE', lineHeight: 16, fontWeight: '400' },
});
