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
          <View style={s.iconRing}>
            <View style={s.iconInner}>
              <Ionicons name="stop-circle" size={32} color={Colors.liveRed} />
            </View>
          </View>
          <View style={s.livePill}>
            <View style={s.liveDot} />
            <Text style={s.livePillText}>LIVE</Text>
          </View>
          <Text style={s.heading}>
            Hey <Text style={s.nameHighlight}>{streamerName}</Text> 👋
          </Text>
          <Text style={s.subText}>
            Are you sure you want to{'\n'}
            <Text style={s.endHighlight}>end your live stream?</Text>
          </Text>
          <Text style={s.caption}>Your viewers will miss you 🥺</Text>
          <View style={s.divider} />
          <View style={s.btnRow}>
            <TouchableOpacity style={s.keepBtn} onPress={onCancel} activeOpacity={0.8}>
              <Ionicons name="heart" size={15} color={Colors.primary} />
              <Text style={s.keepBtnText}>Keep Going</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.endBtn} onPress={onConfirm} activeOpacity={0.8}>
              <Ionicons name="stop-circle-outline" size={15} color="#fff" />
              <Text style={s.endBtnText}>End Live</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
