// Powered by OnSpace.AI
import React from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useChat } from '../hooks/useChat';
import { Colors, Spacing, Radius, FontSize } from '../constants/theme';

export default function BlockedScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { blockedUsers, unblockUser } = useChat();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>Blocked Users</Text>
        <View style={{ width: 40 }} />
      </View>

      {blockedUsers.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="ban-outline" size={64} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>No Blocked Users</Text>
          <Text style={styles.emptyText}>You have not blocked anyone yet</Text>
        </View>
      ) : (
        <FlatList
          data={blockedUsers}
          keyExtractor={u => u.id}
          contentContainerStyle={{ paddingHorizontal: Spacing.lg, paddingTop: Spacing.md }}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Image source={{ uri: item.avatar }} style={styles.avatar} contentFit="cover" />
              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.blocked}>Blocked</Text>
              </View>
              <Pressable
                style={({ pressed }) => [styles.unblockBtn, pressed && { opacity: 0.7 }]}
                onPress={() => unblockUser(item.id)}
              >
                <Text style={styles.unblockText}>Unblock</Text>
              </Pressable>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.separator },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary },
  emptyText: { fontSize: FontSize.md, color: Colors.textMuted, textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, gap: Spacing.md },
  avatar: { width: 50, height: 50, borderRadius: Radius.full } as any,
  info: { flex: 1 },
  name: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textPrimary },
  blocked: { fontSize: FontSize.xs, color: '#E53935', marginTop: 2, fontWeight: '500' },
  unblockBtn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.primary },
  unblockText: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: '600' },
  sep: { height: 1, backgroundColor: Colors.separator },
});
