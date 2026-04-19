// Powered by OnSpace.AI
import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { Message, formatFullTime } from '../../services/chatService';
import { Colors, Spacing, Radius, FontSize } from '../../constants/theme';
import { MessageActions } from './MessageActions';

interface Props {
  item: Message;
  avatarUri: string;
  selected?: boolean;
  selectMode?: boolean;
  onLongPress?: (id: string) => void;
  onSelect?: (id: string) => void;
  onDelete?: (id: string) => void;
  onEnterSelect?: (id: string) => void;
}

export function MessageBubble({ item, avatarUri, selected, selectMode, onLongPress, onSelect, onDelete, onEnterSelect }: Props) {
  const isMine = item.senderId === 'me';
  const [actionsVisible, setActionsVisible] = useState(false);

  const handleLongPress = () => {
    if (selectMode) return;
    setActionsVisible(true);
    onLongPress?.(item.id);
  };

  const handlePress = () => {
    if (selectMode) onSelect?.(item.id);
  };

  return (
    <>
      <Pressable
        onPress={handlePress}
        onLongPress={handleLongPress}
        delayLongPress={1000}
        style={[styles.row, isMine ? styles.rowRight : styles.rowLeft, selected && styles.rowSelected]}
      >
        {selectMode && (
          <View style={[styles.checkCircle, selected && styles.checkCircleActive]}>
            {selected ? <MaterialIcons name="check" size={14} color="#fff" /> : null}
          </View>
        )}
        {!isMine && <Image source={{ uri: avatarUri }} style={styles.avatar} contentFit="cover" transition={200} />}
        <View style={styles.column}>
          <View style={[styles.bubble, isMine ? styles.bubbleSent : styles.bubbleReceived]}>
            <Text style={[styles.text, isMine ? styles.textSent : styles.textReceived]}>{item.text}</Text>
            {isMine && (
              <View style={styles.readRow}>
                <MaterialIcons name={item.read ? 'done-all' : 'done'} size={13} color={item.read ? Colors.gold : 'rgba(255,255,255,0.5)'} />
              </View>
            )}
          </View>
          <Text style={[styles.time, isMine ? styles.timeRight : styles.timeLeft]}>{formatFullTime(item.timestamp)}</Text>
        </View>
        {isMine && <View style={styles.spacer} />}
      </Pressable>

      <MessageActions
        visible={actionsVisible}
        isMine={isMine}
        messageText={item.text}
        onDismiss={() => setActionsVisible(false)}
        onDelete={() => { onDelete?.(item.id); setActionsVisible(false); }}
        onSelect={() => { onEnterSelect?.(item.id); setActionsVisible(false); }}
        onCopy={() => setActionsVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', marginVertical: 3, gap: Spacing.sm },
  rowLeft: { justifyContent: 'flex-start', paddingRight: 64 },
  rowRight: { justifyContent: 'flex-end', paddingLeft: 64 },
  rowSelected: { backgroundColor: Colors.primary + '15', borderRadius: Radius.sm },
  checkCircle: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: Colors.textMuted, justifyContent: 'center', alignItems: 'center' },
  checkCircleActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  column: { maxWidth: '85%' },
  avatar: { width: 28, height: 28, borderRadius: Radius.full, marginBottom: 16 },
  spacer: { width: 4 },
  bubble: { paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, paddingBottom: Spacing.xs, borderRadius: Radius.lg },
  bubbleSent: { backgroundColor: Colors.bubbleSent, borderBottomRightRadius: 4 },
  bubbleReceived: { backgroundColor: Colors.bubbleReceived, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: Colors.border },
  text: { fontSize: FontSize.md, lineHeight: 22 },
  textSent: { color: '#FFFFFF' },
  textReceived: { color: Colors.textPrimary },
  readRow: { alignItems: 'flex-end', marginTop: 2 },
  time: { fontSize: 10, marginTop: 3, color: Colors.textMuted },
  timeLeft: { alignSelf: 'flex-start', marginLeft: 4 },
  timeRight: { alignSelf: 'flex-end', marginRight: 4 },
});
