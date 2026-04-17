// Powered by OnSpace.AI
import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useChat } from '../hooks/useChat';
import { MessageBubble } from '../components/ui/MessageBubble';
import { QuickReplyBar } from '../components/ui/QuickReplyBar';
import { ChatInput } from '../components/ui/ChatInput';
import { Colors, Spacing, FontSize } from '@/constants/theme';
import { ChatMessage } from '../services/aiService';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const {
    messages,
    isLoading,
    inputText,
    setInputText,
    sendMessage,
    clearChat,
    voiceState,
    startRecording,
    stopRecording,
    stopSpeaking,
  } = useChat();
  const flatListRef = useRef<FlatList<ChatMessage>>(null);
  const [showQuickReplies, setShowQuickReplies] = useState(true);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSend = () => {
    if (inputText.trim()) {
      setShowQuickReplies(false);
      sendMessage(inputText);
    }
  };

  const handleQuickReply = (text: string) => {
    setShowQuickReplies(false);
    sendMessage(text);
  };

  const handleVoiceStart = () => {
    setShowQuickReplies(false);
    startRecording();
  };

  const renderItem = ({ item }: { item: ChatMessage }) => (
    <MessageBubble message={item} />
  );

  const keyExtractor = (item: ChatMessage) => item.id;

  const getVoiceStatusText = () => {
    if (voiceState === 'recording') return 'Recording... Tap stop when done';
    if (voiceState === 'processing') return 'Processing your voice...';
    if (voiceState === 'speaking') return 'AI is speaking... Tap mic to stop';
    return null;
  };

  const voiceStatus = getVoiceStatusText();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerAvatarContainer}>
            <Text style={styles.headerAvatarText}>K</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Kronop AI</Text>
            <Text style={styles.headerSubtitle}>Support Assistant</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            onPress={clearChat}
            style={({ pressed }) => [styles.headerBtn, pressed && { opacity: 0.6 }]}
            hitSlop={8}
          >
            <MaterialIcons name="refresh" size={20} color={Colors.textSecondary} />
          </Pressable>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          style={styles.messageList}
          contentContainerStyle={styles.messageContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }}
          ListHeaderComponent={
            <View style={styles.chatHeader}>
              <View style={styles.chatHeaderBadge}>
                <MaterialIcons name="support-agent" size={14} color={Colors.accent} />
                <Text style={styles.chatHeaderBadgeText}>Official Kronop Support</Text>
              </View>
            </View>
          }
        />

        {/* Voice Status Banner */}
        {voiceStatus ? (
          <View style={[
            styles.voiceBanner,
            voiceState === 'recording' && styles.voiceBannerRecording,
            voiceState === 'speaking' && styles.voiceBannerSpeaking,
            voiceState === 'processing' && styles.voiceBannerProcessing,
          ]}>
            <MaterialIcons
              name={
                voiceState === 'recording' ? 'fiber-manual-record' :
                voiceState === 'speaking' ? 'volume-up' : 'hourglass-empty'
              }
              size={14}
              color={
                voiceState === 'recording' ? Colors.error :
                voiceState === 'speaking' ? Colors.accent : Colors.warning
              }
            />
            <Text style={[
              styles.voiceBannerText,
              voiceState === 'recording' && { color: Colors.error },
              voiceState === 'speaking' && { color: Colors.accent },
              voiceState === 'processing' && { color: Colors.warning },
            ]}>
              {voiceStatus}
            </Text>
          </View>
        ) : null}

        {/* Quick Replies */}
        <QuickReplyBar onSelect={handleQuickReply} visible={showQuickReplies && messages.length <= 1} />

        {/* Input */}
        <View style={{ paddingBottom: insets.bottom }}>
          <ChatInput
            value={inputText}
            onChangeText={setInputText}
            onSend={handleSend}
            isLoading={isLoading}
            voiceState={voiceState}
            onVoiceStart={handleVoiceStart}
            onVoiceStop={stopRecording}
            onStopSpeaking={stopSpeaking}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    backgroundColor: '#0D0D0D',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerAvatarContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#7B2FBE',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#9B4FDE',
    shadowColor: 'rgba(123, 47, 190, 0.5)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  headerAvatarText: {
    color: '#FFFFFF',
    fontSize: FontSize.xl,
    fontWeight: '800' as const,
    includeFontPadding: false,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700' as const,
    includeFontPadding: false,
  },
  headerSubtitle: {
    color: '#666666',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
    includeFontPadding: false,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border.primary,
  },
  messageList: {
    flex: 1,
  },
  messageContent: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  chatHeader: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  chatHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    borderRadius: 20,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  chatHeaderBadgeText: {
    color: '#AAAAAA',
    fontSize: 11,
    fontWeight: '500',
    includeFontPadding: false,
  },
  voiceBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: Spacing.md,
    marginBottom: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  voiceBannerRecording: {
    borderColor: 'rgba(239, 68, 68, 0.4)',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  voiceBannerSpeaking: {
    borderColor: 'rgba(168, 85, 247, 0.4)',
    backgroundColor: 'rgba(168, 85, 247, 0.08)',
  },
  voiceBannerProcessing: {
    borderColor: 'rgba(245, 158, 11, 0.4)',
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
  },
  voiceBannerText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#AAAAAA',
    includeFontPadding: false,
  },
});
