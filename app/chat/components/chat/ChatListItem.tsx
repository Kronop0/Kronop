// Powered by OnSpace.AI
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Conversation, formatTime } from '../../services/chatService';
import { Colors, Spacing, Radius, FontSize } from '../../constants/theme';

interface Props {
  item: Conversation;
  onPress: () => void;
}

export function ChatListItem({ item, onPress }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [styles.item, pressed && { opacity: 0.75 }]}
      onPress={onPress}
    >
      <View style={styles.avatarWrap}>
        <Image source={{ uri: item.participantAvatar }} style={styles.avatar} contentFit="cover" transition={200} />
        {item.online && <View style={styles.dot} />}
      </View>
      <View style={styles.info}>
        <View style={styles.row}>
          <Text style={styles.name} numberOfLines={1}>{item.participantName}</Text>
          <Text style={styles.time}>{formatTime(item.lastMessageTime)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.last, item.unreadCount > 0 && styles.lastUnread]} numberOfLines={1}>
            {item.lastMessage}
          </Text>
          {item.unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.separator,
  },
  avatarWrap: { position: 'relative', marginRight: Spacing.md },
  avatar: { width: 54, height: 54, borderRadius: Radius.full },
  dot: {
    position: 'absolute', bottom: 2, right: 2,
    width: 13, height: 13, borderRadius: Radius.full,
    backgroundColor: Colors.online, borderWidth: 2, borderColor: Colors.background,
  },
  info: { flex: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  name: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textPrimary, flex: 1, marginRight: Spacing.sm },
  time: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: '500' },
  last: { fontSize: FontSize.sm, color: Colors.textSecondary, flex: 1, marginRight: Spacing.sm },
  lastUnread: { color: Colors.textPrimary, fontWeight: '500' },
  badge: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    minWidth: 20, height: 20,
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 5,
  },
  badgeText: { fontSize: FontSize.xs, color: '#fff', fontWeight: '700' },
});
