// Powered by OnSpace.AI
import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';
import { endLiveModalStyles as s } from '../constants/endLiveModalStyles';

interface EndLiveModalProps {
  visible: boolean;
  streamerName?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function EndLiveModal({
  visible,
  streamerName = 'Aayush',
  onConfirm,
  onCancel,
}: EndLiveModalProps) {
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const toValue = visible ? 1 : 0;
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: visible ? 1 : 0.85,
        tension: 100,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue,
        duration: visible ? 200 : 160,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent onRequestClose={onCancel}>
      <Animated.View style={[s.backdrop, { opacity: opacityAnim }]}>
        <Animated.View style={[s.card, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
          <View style={s.topRow}>
            <View style={s.iconWrap}>
              <Ionicons name="radio-outline" size={18} color={Colors.liveRed} />
            </View>
            <View style={s.livePill}>
              <View style={s.liveDot} />
              <Text style={s.livePillText}>LIVE</Text>
            </View>
          </View>
          <Text style={s.heading}>End stream?</Text>
          <Text style={s.subText}>
            {streamerName}, your live will end for all viewers.
          </Text>
          <View style={s.btnCol}>
            <TouchableOpacity style={s.endBtn} onPress={onConfirm} activeOpacity={0.8}>
              <Text style={s.endBtnText}>End Live</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.keepBtn} onPress={onCancel} activeOpacity={0.8}>
              <Text style={s.keepBtnText}>Keep Going</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
