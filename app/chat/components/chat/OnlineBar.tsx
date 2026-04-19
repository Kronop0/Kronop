// Powered by OnSpace.AI
import React from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Conversation } from '../../services/chatService';
import { Colors, Spacing, Radius, FontSize } from '../../constants/theme';

interface Props {
  users: Conversation[];
  onPress: (id: string) => void;
}

export function OnlineBar({ users, onPress }: Props) {
  if (users.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.labelRow}>
        <View style={styles.greenPulse} />
        <Text style={styles.label}>{users.length} Online</Text>
      </View>
      <FlatList
        data={users}
        keyExtractor={i => `ob_${i.id}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.chip, pressed && { opacity: 0.7 }]}
            onPress={() => onPress(item.id)}
          >
            <Image
              source={{ uri: item.participantAvatar }}
              style={styles.chipAvatar}
              contentFit="cover"
              transition={200}
            />
            <View style={styles.onlineDot} />
            <Text style={styles.chipName} numberOfLines={1}>
              {item.participantName.split(' ')[0]}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: Colors.surfaceCard,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  greenPulse: {
    width: 8, height: 8, borderRadius: Radius.full,
    backgroundColor: Colors.online,
  },
  label: {
    fontSize: FontSize.xs,
    color: Colors.online,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  list: { gap: Spacing.md, paddingRight: Spacing.xs },
  chip: {
    alignItems: 'center',
    width: 52,
    position: 'relative',
  },
  chipAvatar: {
    width: 40,
    height: 40,
    borderRadius: 10,
    marginBottom: 4,
  },
  onlineDot: {
    position: 'absolute',
    top: 0,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: Radius.full,
    backgroundColor: Colors.online,
    borderWidth: 2,
    borderColor: Colors.surfaceCard,
  },
  chipName: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
