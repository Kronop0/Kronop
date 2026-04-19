// Powered by OnSpace.AI
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  Pressable,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useChat } from '../hooks/useChat';
import { formatTime, Conversation } from '../services/chatService';
import { Colors, Spacing, Radius, FontSize } from '../constants/theme';

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { conversations } = useChat();
  const [query, setQuery] = useState('');
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const filtered = query.trim().length === 0
    ? []
    : conversations.filter(c =>
        c.participantName.toLowerCase().includes(query.toLowerCase()) ||
        c.lastMessage.toLowerCase().includes(query.toLowerCase())
      );

  const renderItem = ({ item }: { item: Conversation }) => (
    <Pressable
      style={({ pressed }) => [styles.chatItem, pressed && { opacity: 0.7 }]}
      onPress={() => router.push(`/chat/${item.id}` as any)}
    >
      <View style={styles.avatarWrap}>
        <Image
          source={{ uri: item.participantAvatar }}
          style={styles.avatar}
          contentFit="cover"
          transition={200}
        />
        {item.online && <View style={styles.onlineDot} />}
      </View>
      <View style={styles.chatInfo}>
        <Text style={styles.chatName}>{item.participantName}</Text>
        <Text style={styles.chatLast} numberOfLines={1}>{item.lastMessage}</Text>
      </View>
      <Text style={styles.chatTime}>{formatTime(item.lastMessageTime)}</Text>
    </Pressable>
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </Pressable>
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={18} color={Colors.primary} style={styles.searchIcon} />
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            placeholder="Search by name or message..."
            placeholderTextColor={Colors.textMuted}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.divider} />

      {/* Results */}
      {query.trim().length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={56} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>Search conversations</Text>
          <Text style={styles.emptySubtitle}>Search by name or message</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="sad-outline" size={56} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>No results found</Text>
          <Text style={styles.emptySubtitle}>No chats matched "{query}"</Text>
        </View>
      ) : (
        <>
          <Text style={styles.resultsLabel}>{filtered.length} result{filtered.length !== 1 ? 's' : ''} found</Text>
          <FlatList
            data={filtered}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  backBtn: {
    padding: Spacing.xs,
  },
  searchWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBg,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    height: 44,
    borderWidth: 1,
    borderColor: Colors.primary + '55',
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: FontSize.md,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.separator,
  },
  resultsLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.separator,
  },
  avatarWrap: {
    position: 'relative',
    marginRight: Spacing.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: Radius.full,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: Radius.full,
    backgroundColor: Colors.online,
    borderWidth: 2,
    borderColor: Colors.background,
  },
  chatInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  chatName: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 3,
  },
  chatLast: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  chatTime: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingBottom: 80,
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  emptySubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
});
