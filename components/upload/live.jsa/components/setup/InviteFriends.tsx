// Powered by OnSpace.AI
import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize } from '@/constants/theme';

interface InviteFriendsProps {
  enabled: boolean;
  onToggle: (val: boolean) => void;
  invitedIds: string[];
  onInvitedChange: (ids: string[]) => void;
}

export default function InviteFriends({ enabled, onToggle, invitedIds, onInvitedChange }: InviteFriendsProps) {
  return (
    <View style={s.card}>
      <View style={s.row}>
        <View style={s.left}>
          <View style={s.iconBg}>
            <Ionicons name="person-add" size={18} color={Colors.accent} />
          </View>
          <View>
            <Text style={s.title}>Invite Friends to Live</Text>
            <Text style={s.subtitle}>Let friends join as co-hosts</Text>
          </View>
        </View>
        <Switch
          value={enabled}
          onValueChange={(v) => { onToggle(v); if (!v) onInvitedChange([]); }}
          trackColor={{ false: Colors.borderColor, true: Colors.primary.main }}
          thumbColor={Colors.textPrimary}
          ios_backgroundColor={Colors.borderColor}
        />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBg, borderRadius: Radius.lg,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.borderColor, gap: Spacing.sm,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  left: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 },
  iconBg: {
    width: 38, height: 38, borderRadius: Radius.sm, backgroundColor: Colors.accentDim,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.accent + '33',
  },
  title: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textPrimary },
  subtitle: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
});
