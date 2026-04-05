// Powered by OnSpace.AI
import React from 'react';
import {
  View, Text, Modal, TouchableOpacity, FlatList, StyleSheet,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, FontSize } from '../../constants/theme';
import { MOCK_FRIENDS, Friend } from '../../constants/friendsData';

interface FriendPickerModalProps {
  visible: boolean;
  selected: string[];
  onConfirm: (ids: string[]) => void;
  onClose: () => void;
}

export default function FriendPickerModal({ visible, selected, onConfirm, onClose }: FriendPickerModalProps) {
  const insets = useSafeAreaInsets();
  const [localSelected, setLocalSelected] = React.useState<string[]>(selected);

  React.useEffect(() => {
    if (visible) setLocalSelected(selected);
  }, [visible]);

  // Only 1 co-host allowed — selecting another replaces the previous
  const toggle = (id: string) =>
    setLocalSelected((prev) => prev.includes(id) ? [] : [id]);

  const renderFriend = ({ item }: { item: Friend }) => {
    const isSelected = localSelected.includes(item.id);
    return (
      <TouchableOpacity style={[s.row, isSelected && s.rowActive]} onPress={() => toggle(item.id)} activeOpacity={0.75}>
        <View style={s.avatarWrap}>
          <Image source={{ uri: item.avatarUrl }} style={s.avatar} contentFit="cover" />
          <View style={[s.onlineDot, { backgroundColor: item.isOnline ? '#22C55E' : Colors.textMuted }]} />
        </View>
        <View style={s.info}>
          <Text style={s.name}>{item.name}</Text>
          <Text style={s.username}>{item.username} · {item.isOnline ? 'Online' : 'Offline'}</Text>
        </View>
        <View style={[s.check, isSelected && s.checkActive]}>
          {isSelected ? <Ionicons name="checkmark" size={14} color="#fff" /> : null}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={s.backdrop}>
        <TouchableOpacity style={s.dimArea} onPress={onClose} activeOpacity={1} />
        <View style={[s.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={s.handle} />
          <View style={s.header}>
            <Text style={s.title}>Invite to Live</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={22} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
          <Text style={s.subtitle}>Select 1 friend to join your stream as a co-host</Text>
          <FlatList
            data={MOCK_FRIENDS}
            keyExtractor={(i) => i.id}
            renderItem={renderFriend}
            style={s.list}
            showsVerticalScrollIndicator={false}
          />
          <TouchableOpacity
            style={[s.confirmBtn, localSelected.length === 0 && s.confirmDisabled]}
            onPress={() => onConfirm(localSelected)}
            activeOpacity={0.85}
          >
            <Ionicons name="people" size={16} color="#fff" />
            <Text style={s.confirmText}>
              {localSelected.length === 0 ? 'Select a friend' : `Invite ${MOCK_FRIENDS.find((f) => f.id === localSelected[0])?.name.split(' ')[0] ?? 'Friend'}`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  dimArea: { flex: 1, backgroundColor: '#00000077' },
  sheet: {
    backgroundColor: '#1A1A22', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: Spacing.md, paddingTop: 12, maxHeight: '80%',
    borderWidth: 1, borderColor: '#2A2A35',
  },
  handle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border,
    alignSelf: 'center', marginBottom: Spacing.md,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  title: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  subtitle: { fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: Spacing.md },
  list: { maxHeight: 340 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingVertical: Spacing.sm + 2, paddingHorizontal: Spacing.sm,
    borderRadius: Radius.md, marginBottom: 4,
  },
  rowActive: { backgroundColor: Colors.primaryDim },
  avatarWrap: { position: 'relative' },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: Colors.surface },
  onlineDot: {
    width: 11, height: 11, borderRadius: 6, position: 'absolute', bottom: 1, right: 1,
    borderWidth: 2, borderColor: '#1A1A22',
  },
  info: { flex: 1 },
  name: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textPrimary },
  username: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  check: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 1.5,
    borderColor: Colors.border, alignItems: 'center', justifyContent: 'center',
  },
  checkActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  confirmBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    backgroundColor: Colors.primary, borderRadius: Radius.md,
    paddingVertical: Spacing.sm + 4, marginTop: Spacing.md,
  },
  confirmDisabled: { backgroundColor: Colors.border },
  confirmText: { fontSize: FontSize.md, fontWeight: '700', color: '#fff' },
});
