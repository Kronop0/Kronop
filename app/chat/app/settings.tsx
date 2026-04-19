// Powered by OnSpace.AI
import React from 'react';
import { View, Text, Switch, FlatList, Pressable, StyleSheet, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../hooks/useSettings';
import { SettingItem } from '../contexts/SettingsContext';
import { Colors, Spacing, Radius, FontSize } from '../constants/theme';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { settings, toggleSetting } = useSettings();

  const renderItem = ({ item }: { item: SettingItem }) => (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
      onPress={() => toggleSetting(item.key)}
      accessibilityRole="switch"
      accessibilityState={{ checked: item.enabled }}
    >
      <View style={[styles.iconWrap, item.enabled && styles.iconWrapActive]}>
        <Ionicons
          name={item.icon as any}
          size={20}
          color={item.enabled ? Colors.primary : Colors.textSecondary}
        />
      </View>
      <View style={styles.labelWrap}>
        <Text style={styles.label}>{item.label}</Text>
        <Text style={styles.subtitle} numberOfLines={1}>{item.subtitle}</Text>
      </View>
      <Switch
        value={item.enabled}
        onValueChange={() => toggleSetting(item.key)}
        trackColor={{ false: '#2e2e2e', true: Colors.primary + 'BB' }}
        thumbColor={item.enabled ? Colors.primary : '#666'}
        ios_backgroundColor="#2e2e2e"
      />
    </Pressable>
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>Privacy & Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <Text style={styles.sectionLabel}>CHAT PRIVACY</Text>

      <FlatList
        data={settings}
        keyExtractor={item => item.key}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.separator,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  sectionLabel: {
    fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: '700',
    letterSpacing: 1.2, paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl, paddingBottom: Spacing.sm,
  },
  list: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xxl },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radius.md, padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.border,
    gap: Spacing.md,
  },
  iconWrap: {
    width: 40, height: 40, borderRadius: Radius.full,
    backgroundColor: Colors.surfaceElevated,
    justifyContent: 'center', alignItems: 'center',
  },
  iconWrapActive: { backgroundColor: Colors.primary + '22' },
  labelWrap: { flex: 1 },
  label: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textPrimary },
  subtitle: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  sep: { height: Spacing.sm },
});
