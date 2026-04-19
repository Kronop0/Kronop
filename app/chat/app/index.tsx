// Powered by OnSpace.AI
import React from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useChat } from '../hooks/useChat';
import { Conversation } from '../services/chatService';
import { Colors, Spacing, Radius, FontSize } from '../constants/theme';
import { OnlineBar } from '../components/chat/OnlineBar';
import { ChatListItem } from '../components/chat/ChatListItem';

export default function ChatListScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { conversations } = useChat();
  const totalUnread = conversations.reduce((s, c) => s + c.unreadCount, 0);
  const onlineUsers = conversations.filter(c => c.online);

  const renderItem = ({ item }: { item: Conversation }) => (
    <ChatListItem item={item} onPress={() => router.push(`chat/${item.id}` as any)} />
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Messages</Text>
          {totalUnread > 0 && <Text style={styles.sub}>{totalUnread} unread</Text>}
        </View>
        <View style={styles.actions}>
          <Pressable style={styles.btn} onPress={() => router.push('/search' as any)}>
            <Ionicons name="search" size={22} color={Colors.primary} />
          </Pressable>
          <Pressable style={styles.btn} onPress={() => router.push('/settings' as any)}>
            <Ionicons name="settings-outline" size={22} color={Colors.textSecondary} />
          </Pressable>
        </View>
      </View>

      <OnlineBar users={onlineUsers} onPress={id => router.push(`/chat/${id}` as any)} />
      <View style={styles.divider} />

      <FlatList
        data={conversations}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="chatbubbles-outline" size={60} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No chats found</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  title: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.textPrimary, letterSpacing: 0.3 },
  sub: { fontSize: FontSize.xs, color: Colors.primary, marginTop: 2, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: Spacing.sm },
  btn: { width: 40, height: 40, borderRadius: Radius.full, backgroundColor: Colors.surfaceElevated, justifyContent: 'center', alignItems: 'center' },
  divider: { height: 1, backgroundColor: Colors.separator, marginBottom: Spacing.xs },
  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: Spacing.md },
  emptyText: { fontSize: FontSize.md, color: Colors.textMuted },
});
