// Powered by OnSpace.AI
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Modal } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize } from '../../constants/theme';

interface Props {
  name: string; avatar: string; online: boolean;
  paddingTop: number; onBack: () => void;
  onVoiceCall: () => void; onVideoCall: () => void; // video call
  onBlock: () => void; onBlockedList: () => void;
}

export function ChatHeader({ name, avatar, online, paddingTop, onBack, onVoiceCall, onVideoCall, onBlock, onBlockedList }: Props) {
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <View style={[styles.header, { paddingTop: paddingTop + 8 }]}>
      <Pressable onPress={onBack} style={styles.backBtn} hitSlop={10}>
        <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
      </Pressable>
      <View style={styles.user}>
        <View style={styles.avatarWrap}>
          <Image source={{ uri: avatar }} style={styles.avatar} contentFit="cover" transition={200} />
          {online && <View style={styles.dot} />}
        </View>
        <View>
          <Text style={styles.name}>{name}</Text>
          <Text style={[styles.status, { color: online ? Colors.online : Colors.textMuted }]}>
            {online ? 'Online' : 'Offline'}
          </Text>
        </View>
      </View>
      <View style={styles.right}>
        <Pressable style={styles.actionBtn} onPress={onVoiceCall}>
          <Ionicons name="call" size={20} color={Colors.primary} />
        </Pressable>
        <Pressable style={styles.actionBtn} onPress={onVideoCall}>
          <Ionicons name="videocam" size={20} color={Colors.primary} />
        </Pressable>
        <Pressable style={styles.actionBtn} onPress={() => setMenuVisible(true)}>
          <MaterialIcons name="more-vert" size={20} color={Colors.textSecondary} />
        </Pressable>
      </View>

      <Modal transparent visible={menuVisible} animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.dropdown}>
            {[
              { icon: 'ban-outline', label: 'Block User', action: () => { onBlock(); setMenuVisible(false); }, color: '#E53935' },
              { icon: 'list-outline', label: 'Blocked List', action: () => { onBlockedList(); setMenuVisible(false); } },
            ].map(item => (
              <Pressable key={item.label} style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]} onPress={item.action}>
                <Ionicons name={item.icon as any} size={18} color={item.color ?? Colors.textPrimary} />
                <Text style={[styles.menuLabel, item.color ? { color: item.color } : {}]}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingBottom: Spacing.md, backgroundColor: Colors.surface },
  backBtn: { padding: Spacing.xs, marginRight: Spacing.sm },
  user: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatarWrap: { position: 'relative' },
  avatar: { width: 42, height: 42, borderRadius: Radius.full, borderWidth: 2, borderColor: Colors.primary },
  dot: { position: 'absolute', bottom: 1, right: 1, width: 11, height: 11, borderRadius: Radius.full, backgroundColor: Colors.online, borderWidth: 2, borderColor: Colors.surface },
  name: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  status: { fontSize: FontSize.xs, fontWeight: '500' },
  right: { flexDirection: 'row', gap: 4 },
  actionBtn: { width: 36, height: 36, borderRadius: Radius.full, backgroundColor: Colors.surfaceElevated, justifyContent: 'center', alignItems: 'center' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  dropdown: { position: 'absolute', top: 60, right: 12, backgroundColor: Colors.surfaceElevated, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, minWidth: 170, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.separator },
  menuItemPressed: { backgroundColor: Colors.surfaceCard },
  menuLabel: { fontSize: FontSize.md, color: Colors.textPrimary, fontWeight: '500' },
});
