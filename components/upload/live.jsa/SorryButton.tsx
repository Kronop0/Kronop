import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

interface SorryButtonProps {
  streamId?: string | null;
  onStreamEnd?: () => void;
}

export default function SorryButton({ streamId, onStreamEnd }: SorryButtonProps) {
  const [reason, setReason] = useState('');
  const [isEnding, setIsEnding] = useState(false);
  const insets = useSafeAreaInsets();

  const handleSorryPress = async () => {
    if (!streamId) {
      Alert.alert('Error', 'No active stream found');
      return;
    }

    if (!reason.trim()) {
      Alert.alert('Error', 'Please enter a reason for ending the stream');
      return;
    }

    setIsEnding(true);

    try {
      console.log('🛑 SORRY BUTTON PRESSED - Ending stream immediately...');
      
      // 1. Finalize stream in R2
      const r2Server = require('./r2Server');
      await r2Server.finalizeStream(streamId);
      console.log('🎯 Stream finalized in R2');
      
      // 2. Call parent callback
      if (onStreamEnd) {
        onStreamEnd();
      }
      
      console.log('✅ Stream ended successfully via Sorry button');
      
      // 3. Show success message
      Alert.alert(
        'Stream Ended',
        'Your live stream has been ended successfully.',
        [{ text: 'OK', onPress: () => {} }]
      );
      
    } catch (error) {
      console.error('Failed to end stream:', error);
      Alert.alert('Error', 'Failed to end stream. Please try again.');
    } finally {
      setIsEnding(false);
    }
  };

  return (
    <View style={[styles.container, { marginTop: insets.top + 10 }]}>
      {/* Input field on right side top */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter reason for ending stream..."
          value={reason}
          onChangeText={setReason}
          multiline
          maxLength={100}
        />
        <Text style={styles.charCount}>
          {reason.length}/100
        </Text>
      </View>

      {/* SORRY Button */}
      <TouchableOpacity 
        style={[styles.sorryButton, isEnding && styles.sorryButtonDisabled]}
        onPress={handleSorryPress}
        disabled={isEnding}
      >
        <MaterialIcons name="sentiment-very-dissatisfied" size={24} color="#FFF" />
        <Text style={styles.sorryButtonText}>
          {isEnding ? 'Ending...' : 'SORRY'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    right: 10,
    zIndex: 20,
    alignItems: 'flex-end',
  },
  inputContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    width: 200,
    borderWidth: 1,
    borderColor: '#FF4444',
  },
  input: {
    color: '#FFF',
    fontSize: 12,
    minHeight: 40,
    textAlignVertical: 'top',
  },
  charCount: {
    color: '#999',
    fontSize: 10,
    textAlign: 'right',
    marginTop: 4,
  },
  sorryButton: {
    backgroundColor: '#FF4444',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  sorryButtonDisabled: {
    backgroundColor: '#666',
  },
  sorryButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
