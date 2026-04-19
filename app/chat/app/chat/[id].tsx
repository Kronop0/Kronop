// Powered by OnSpace.AI
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, KeyboardAvoidingView, Platform, StatusBar, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useChat } from '../../hooks/useChat';
import { Message } from '../../services/chatService';
import { Colors, Spacing } from '../../constants/theme';
import { MessageBubble } from '../../components/chat/MessageBubble';
import { TypingIndicator } from '../../components/chat/TypingIndicator';
import { ChatInputBar } from '../../components/chat/ChatInputBar';
import { ChatHeader } from '../../components/chat/ChatHeader';
import { SelectionBar } from '../../components/chat/SelectionBar';

export default function ChatWindowScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { getConversation, sendMessage, markAsRead, deleteMessages, blockUser } = useChat();
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const flatListRef = useRef<FlatList>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const conversation = getConversation(id);

  useEffect(() => { if (id) markAsRead(id); }, [id]);
  useEffect(() => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, [conversation?.messages.length]);

  const handleSend = useCallback(() => {
    const text = inputText.trim();
    if (!text || !id) return;
    setInputText('');
    sendMessage(id, text);
    setIsTyping(true);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      setIsTyping(false);
      const replies = ['Sure thing! 😊', 'Got it, understood', 'Alright! 👍', 'Wow, that is amazing!'];
      sendMessage(id, replies[Math.floor(Math.random() * replies.length)], conversation?.id ?? 'other');
    }, 1800);
  }, [inputText, id, sendMessage, conversation]);

  const handleEnterSelect = (msgId: string) => { setSelectMode(true); setSelectedIds([msgId]); };
  const handleToggleSelect = (msgId: string) => setSelectedIds(prev => prev.includes(msgId) ? prev.filter(i => i !== msgId) : [...prev, msgId]);
  const handleSelectAll = () => setSelectedIds(conversation?.messages.map(m => m.id) ?? []);
  const handleCancelSelect = () => { setSelectMode(false); setSelectedIds([]); };
  const handleDeleteSelected = () => { if (id) deleteMessages(id, selectedIds); handleCancelSelect(); };
  const handleDeleteOne = (msgId: string) => { if (id) deleteMessages(id, [msgId]); };

  if (!conversation) return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <Text style={{ color: Colors.textPrimary, textAlign: 'center', marginTop: 40 }}>Chat not found</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={0}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      {selectMode ? (
        <SelectionBar selectedCount={selectedIds.length} onDelete={handleDeleteSelected} onCancel={handleCancelSelect} onSelectAll={handleSelectAll} />
      ) : (
        <ChatHeader
          name={conversation.participantName} avatar={conversation.participantAvatar}
          online={conversation.online} paddingTop={insets.top} onBack={() => router.back()}
          onVoiceCall={() => router.push(`/call/voice/${id}` as any)}
          onVideoCall={() => router.push(`/call/video/${id}` as any)}
          onBlock={() => blockUser(id)} onBlockedList={() => router.push('/blocked' as any)}
        />
      )}
      <View style={styles.divider} />
      <FlatList
        ref={flatListRef}
        data={conversation.messages}
        keyExtractor={item => item.id}
        renderItem={({ item }: { item: Message }) => (
          <MessageBubble
            item={item} avatarUri={conversation.participantAvatar}
            selected={selectedIds.includes(item.id)} selectMode={selectMode}
            onLongPress={() => {}} onSelect={handleToggleSelect}
            onDelete={handleDeleteOne} onEnterSelect={handleEnterSelect}
          />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        ListFooterComponent={isTyping ? <TypingIndicator avatarUri={conversation.participantAvatar} /> : null}
      />
      {!selectMode && <ChatInputBar value={inputText} onChange={setInputText} onSend={handleSend} paddingBottom={insets.bottom + 8} />}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  divider: { height: 1, backgroundColor: Colors.separator },
  list: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, gap: Spacing.xs },
});
