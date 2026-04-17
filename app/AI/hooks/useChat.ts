// Powered by OnSpace.AI
import { useState, useCallback, useRef } from 'react';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import * as FileSystem from 'expo-file-system';
import { ChatMessage, sendMessageToAI, transcribeAudio } from '../services/aiService';
import { WELCOME_MESSAGE } from '../services/kronopKnowledge';

const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

export type VoiceState = 'idle' | 'recording' | 'processing' | 'speaking';

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: WELCOME_MESSAGE,
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputText, setInputText] = useState('');
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const aiMessageIdRef = useRef<string | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const isSpeakingRef = useRef(false);

  const speakText = useCallback((text: string) => {
    // Strip markdown-like bold markers and emoji for clean speech
    const clean = text
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/[👋🚀]/g, '')
      .trim();

    if (!clean) return;
    setVoiceState('speaking');
    isSpeakingRef.current = true;

    Speech.speak(clean, {
      language: 'hi-IN',
      pitch: 1.0,
      rate: 0.95,
      onDone: () => {
        isSpeakingRef.current = false;
        setVoiceState('idle');
      },
      onStopped: () => {
        isSpeakingRef.current = false;
        setVoiceState('idle');
      },
      onError: () => {
        isSpeakingRef.current = false;
        setVoiceState('idle');
      },
    });
  }, []);

  const stopSpeaking = useCallback(() => {
    Speech.stop();
    isSpeakingRef.current = false;
    setVoiceState('idle');
  }, []);

  const sendMessage = useCallback(async (text: string, speakResponse = false) => {
    if (!text.trim() || isLoading) return;

    // Stop any ongoing speech
    if (isSpeakingRef.current) {
      Speech.stop();
      isSpeakingRef.current = false;
    }

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    const aiTypingId = generateId();
    aiMessageIdRef.current = aiTypingId;

    const typingMessage: ChatMessage = {
      id: aiTypingId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isTyping: true,
    };

    setMessages(prev => [...prev, userMessage, typingMessage]);
    setInputText('');
    setIsLoading(true);

    const allMessages = [...messages, userMessage];
    let fullResponse = '';

    await sendMessageToAI(
      allMessages,
      (chunk) => {
        fullResponse += chunk;
        setMessages(prev =>
          prev.map(m =>
            m.id === aiTypingId
              ? { ...m, content: m.content + chunk, isTyping: false }
              : m
          )
        );
      },
      () => {
        setIsLoading(false);
        setMessages(prev =>
          prev.map(m =>
            m.id === aiTypingId ? { ...m, isTyping: false } : m
          )
        );
        if (speakResponse && fullResponse) {
          speakText(fullResponse);
        }
      },
      (err) => {
        setIsLoading(false);
        setMessages(prev =>
          prev.map(m =>
            m.id === aiTypingId
              ? {
                  ...m,
                  content: `Sorry, kuch problem aayi: ${err}\n\nPlease dobara try karein.`,
                  isTyping: false,
                }
              : m
          )
        );
      }
    );
  }, [messages, isLoading, speakText]);

  const startRecording = useCallback(async () => {
    try {
      setVoiceState('recording');

      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        setVoiceState('idle');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = recording;
    } catch {
      setVoiceState('idle');
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (!recordingRef.current) {
      setVoiceState('idle');
      return;
    }

    setVoiceState('processing');

    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

      if (!uri) throw new Error('No recording URI');

      // Read file as base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64',
      });

      // Transcribe via Google Speech API
      const transcript = await transcribeAudio(base64);

      if (transcript.trim()) {
        setInputText(transcript);
        // Auto-send with voice response
        await sendMessage(transcript, true);
      }
    } catch {
      // If transcription fails, just reset
    } finally {
      setVoiceState('idle');
    }
  }, [sendMessage]);

  const clearChat = useCallback(() => {
    if (isSpeakingRef.current) Speech.stop();
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: WELCOME_MESSAGE,
        timestamp: new Date(),
      },
    ]);
    setVoiceState('idle');
  }, []);

  return {
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
  };
}
