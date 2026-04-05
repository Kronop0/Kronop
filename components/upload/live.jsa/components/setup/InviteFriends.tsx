// Powered by OnSpace.AI
import React from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize } from '@/constants/theme';

interface InviteFriendsProps {
  enabled: boolean;
  onToggle: (val: boolean) => void;
}

export default function InviteFriends({ enabled, onToggle }: InviteFriendsProps) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.left}>
          <View style={styles.iconBg}>
            <Ionicons name="person-add" size={18} color={Colors.accent} />
          </View>
          <View>
            <Text style={styles.title}>Invite Friends to Live</Text>
            <Text style={styles.subtitle}>Let friends join as co-hosts</Text>
          </View>
        </View>
        <Switch
          value={enabled}
          onValueChange={onToggle}
          trackColor={{ false: Colors.border, true: Colors.primary }}
          thumbColor={Colors.textPrimary}
          ios_backgroundColor={Colors.border}
        />
      </View>
      {enabled ? (
        <TouchableOpacity style={styles.selectBtn} activeOpacity={0.75}>
          <Ionicons name="people-outline" size={16} color={Colors.accent} />
          <Text style={styles.selectBtnText}>Select Friends to Invite</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBg, borderRadius: Radius.lg,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, gap: Spacing.sm,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  left: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 },
  iconBg: {
    width: 38, height: 38, borderRadius: Radius.sm, backgroundColor: Colors.accentDim,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.accent + '33',
  },
  title: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textPrimary },
  subtitle: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  selectBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.accentDim, borderRadius: Radius.md, padding: Spacing.sm + 2,
    borderWidth: 1, borderColor: Colors.accent + '33', marginTop: Spacing.xs,
  },
  selectBtnText: { flex: 1, fontSize: FontSize.sm, fontWeight: '600', color: Colors.accent },
});
