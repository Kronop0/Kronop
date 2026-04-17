// Powered by OnSpace.AI
import React, { memo, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, Radius } from '../../constants/theme';
import { VoiceState } from '../../hooks/useChat';

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  isLoading: boolean;
  voiceState: VoiceState;
  onVoiceStart: () => void;
  onVoiceStop: () => void;
  onStopSpeaking: () => void;
}

const ChatInput = memo(function ChatInput({
  value,
  onChangeText,
  onSend,
  isLoading,
  voiceState,
  onVoiceStart,
  onVoiceStop,
  onStopSpeaking,
}: ChatInputProps) {
  const inputRef = useRef<TextInput>(null);
  const canSend = value.trim().length > 0 && !isLoading && voiceState === 'idle';

  // Pulse animation for recording
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (voiceState === 'recording') {
      pulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.25, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      );
      pulseLoop.current.start();
    } else {
      pulseLoop.current?.stop();
      pulseAnim.setValue(1);
    }
  }, [voiceState]);

  const handleVoicePress = () => {
    if (voiceState === 'speaking') {
      onStopSpeaking();
    } else if (voiceState === 'recording') {
      onVoiceStop();
    } else if (voiceState === 'idle') {
      onVoiceStart();
    }
  };

  const getMicIcon = () => {
    if (voiceState === 'speaking') return 'volume-off';
    if (voiceState === 'recording') return 'stop';
    if (voiceState === 'processing') return 'hourglass-empty';
    return 'mic';
  };

  const getMicColor = () => {
    if (voiceState === 'speaking') return Colors.accent;
    if (voiceState === 'recording') return Colors.error;
    if (voiceState === 'processing') return Colors.warning;
    return Colors.textSecondary;
  };

  const isMicBusy = voiceState === 'processing';

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        {/* Mic / Voice Button */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <Pressable
            onPress={handleVoicePress}
            disabled={isMicBusy}
            style={({ pressed }) => [
              styles.micBtn,
              voiceState === 'recording' && styles.micBtnRecording,
              voiceState === 'speaking' && styles.micBtnSpeaking,
              pressed && !isMicBusy && { opacity: 0.7, transform: [{ scale: 0.93 }] },
            ]}
            hitSlop={8}
          >
            {isMicBusy ? (
              <ActivityIndicator size="small" color={Colors.warning} />
            ) : (
              <MaterialIcons name={getMicIcon()} size={20} color={getMicColor()} />
            )}
          </Pressable>
        </Animated.View>

        {/* Text Input */}
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={
            voiceState === 'recording'
              ? 'Bol rahe hain...'
              : voiceState === 'processing'
              ? 'Samajh rahe hain...'
              : voiceState === 'speaking'
              ? 'AI bol raha hai...'
              : 'Apni problem likhein...'
          }
          placeholderTextColor={Colors.textMuted}
          multiline
          maxLength={1000}
          editable={voiceState === 'idle'}
          returnKeyType="send"
          blurOnSubmit={false}
        />

        {/* Send Button */}
        <Pressable
          onPress={onSend}
          disabled={!canSend}
          style={({ pressed }) => [
            styles.sendBtn,
            canSend ? styles.sendBtnActive : styles.sendBtnDisabled,
            pressed && canSend && styles.sendBtnPressed,
          ]}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <MaterialIcons
              name="send"
              size={20}
              color={canSend ? Colors.white : Colors.textDisabled}
            />
          )}
        </Pressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs + 2,
    minHeight: 48,
  },
  micBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceElevated,
    marginBottom: 2,
  },
  micBtnRecording: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  micBtnSpeaking: {
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
  },
  input: {
    flex: 1,
    color: Colors.text,
    fontSize: FontSize.md,
    maxHeight: 100,
    paddingVertical: Platform.OS === 'ios' ? 6 : 2,
    includeFontPadding: false,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  sendBtnActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primaryGlowStrong,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  sendBtnDisabled: {
    backgroundColor: Colors.surfaceElevated,
  },
  sendBtnPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
});

export default ChatInput;
