// Powered by OnSpace.AI
import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { CameraEffect, EFFECTS } from '@/constants/effectsData';
import { effectsPanelStyles as s } from '@/constants/effectsPanelStyles';

export { CameraEffect, EFFECTS } from '@/constants/effectsData';

interface EffectsPanelProps {
  visible: boolean;
  selectedEffect: string;
  onSelectEffect: (effect: CameraEffect) => void;
  onClose: () => void;
}

export default function EffectsPanel({ visible, selectedEffect, onSelectEffect, onClose }: EffectsPanelProps) {
  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: visible ? 0 : 300,
        tension: 80, friction: 12, useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: visible ? 1 : 0,
        duration: visible ? 200 : 200, useNativeDriver: true,
      }),
    ]).start();
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[s.backdrop, { opacity: fadeAnim }]}>
      <Pressable style={s.backdropTouchable} onPress={onClose} />
      <Animated.View style={[s.panel, { transform: [{ translateY: slideAnim }] }]}>
        <View style={s.handle} />
        <View style={s.header}>
          <Ionicons name="color-filter-outline" size={18} color={Colors.primary} />
          <Text style={s.headerTitle}>Camera Effects</Text>
          <TouchableOpacity onPress={onClose} style={s.closeBtn} activeOpacity={0.7}>
            <Ionicons name="close" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.effectsRow}>
          {EFFECTS.map((effect) => {
            const isSelected = selectedEffect === effect.id;
            return (
              <TouchableOpacity
                key={effect.id}
                style={[s.effectCard, isSelected && s.effectCardSelected]}
                activeOpacity={0.8}
                onPress={() => { onSelectEffect(effect); onClose(); }}
              >
                <View style={[s.effectPreview, { backgroundColor: effect.previewGradient[0] }, isSelected && s.effectPreviewSelected]}>
                  <View style={[s.effectPreviewInner, { backgroundColor: effect.previewGradient[1] }]} />
                  {isSelected ? <View style={s.selectedCheck}><Ionicons name="checkmark-circle" size={18} color="#fff" /></View> : null}
                  <Ionicons name={effect.icon as any} size={22} color={effect.id === 'bw' || effect.id === 'none' ? '#ccc' : '#fff'} style={s.effectIcon} />
                </View>
                <Text style={[s.effectName, isSelected && s.effectNameSelected]}>{effect.name}</Text>
                <Text style={s.effectDesc} numberOfLines={1}>{effect.description}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <View style={s.infoBar}>
          <Ionicons name="information-circle-outline" size={13} color={Colors.textMuted} />
          <Text style={s.infoText}>Effects are applied in real-time during your live</Text>
        </View>
      </Animated.View>
    </Animated.View>
  );
}
