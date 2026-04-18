import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { spacing, typography } from '../../constants/theme';
import { FullscreenButton } from './FullscreenButton';

const PURPLE = '#8B00FF';

interface ChannelInfoProps {
  userId: string;
  username: string;
  isSupporting: boolean;
  onSupport: () => void;
  getAvatarColor: (id: string) => string;
  onFullscreen?: () => void;
}

export function ChannelInfo({ userId, username, isSupporting, onSupport, getAvatarColor, onFullscreen }: ChannelInfoProps) {
  const router = useRouter();
  return (
    <View style={styles.wrapper}>
      <View style={styles.topRow}>
        <View style={[styles.avatar, { backgroundColor: getAvatarColor(userId) }]}>
          <Text style={styles.avatarText}>{username.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.details}>
          <Text style={styles.name}>{username}</Text>
          <Text style={styles.stats}>0 supporters</Text>
        </View>
        <FullscreenButton color="#AAAAAA" size={20} onPress={() => onFullscreen?.()} />
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.supportBtn, isSupporting && styles.supporting]} onPress={onSupport}>
          <Ionicons name={isSupporting ? 'heart' : 'heart-outline'} size={16} color="#FFFFFF" />
          <Text style={styles.supportText}>{isSupporting ? 'Supporting' : 'Support'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.channelBtn}
          onPress={() => router.push(`/channel?userId=${userId}&username=${username}`)}
        >
          <Ionicons name="play-circle-outline" size={16} color="#FFFFFF" />
          <Text style={styles.channelBtnText}>Check Channel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { padding: spacing.md, borderBottomWidth: 1, borderColor: '#1A1A1A', backgroundColor: '#000000', gap: spacing.sm },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: 'white', fontSize: 18, fontWeight: '700' },
  details: { flex: 1 },
  name: { fontSize: typography.body, fontWeight: '700', color: '#FFFFFF' },
  stats: { fontSize: typography.small, color: '#888888' },
  actions: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center', flexWrap: 'wrap' },
  supportBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: PURPLE, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: 24, flex: 1, justifyContent: 'center' },
  supporting: { backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: PURPLE },
  supportText: { color: '#fff', fontSize: typography.small, fontWeight: '700' },
  channelBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#1A1A1A', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 24, flex: 1, justifyContent: 'center', borderWidth: 1, borderColor: '#333333' },
  channelBtnText: { color: '#fff', fontSize: typography.small, fontWeight: '600' },
});
