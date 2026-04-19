// Powered by OnSpace.AI
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Modal, TextInput, Alert } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, FontSize } from '../../constants/theme';

interface Props { onEnd: () => void; }

const KEYPAD = ['1','2','3','4','5','6','7','8','9','*','0','#'];

export function VoiceControls({ onEnd }: Props) {
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(false);
  const [held, setHeld] = useState(false);
  const [keypad, setKeypad] = useState(false);
  const [dtmf, setDtmf] = useState('');

  const Btn = ({ icon, lib, label, active, onPress, danger, large }: any) => (
    <Pressable
      style={({ pressed }) => [
        styles.btn,
        large && styles.btnLarge,
        active && styles.btnActive,
        danger && styles.btnDanger,
        pressed && { opacity: 0.75 },
      ]}
      onPress={onPress}
    >
      {lib === 'material'
        ? <MaterialIcons name={icon} size={large ? 32 : 26} color={danger ? '#fff' : active ? Colors.primary : Colors.textPrimary} />
        : <Ionicons name={icon} size={large ? 32 : 26} color={danger ? '#fff' : active ? Colors.primary : Colors.textPrimary} />
      }
      {label ? <Text style={[styles.label, active && { color: Colors.primary }]}>{label}</Text> : null}
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Btn icon={muted ? 'mic-off' : 'mic'} label={muted ? 'Muted' : 'Mute'} active={muted} onPress={() => setMuted(m => !m)} />
        <Btn icon={speaker ? 'volume-high' : 'volume-medium'} label="Speaker" active={speaker} onPress={() => setSpeaker(s => !s)} />
        <Btn icon={held ? 'play' : 'pause'} label={held ? 'Resume' : 'Hold'} active={held} onPress={() => setHeld(h => !h)} />
      </View>
      <View style={styles.row}>
        <Btn icon="keypad" label="Keypad" onPress={() => setKeypad(true)} />
        <Btn icon="call" lib="material" label="" danger large onPress={onEnd} />
        <Btn icon="person-add" label="Add" onPress={() => Alert.alert('Add to Call', 'Conference calling is not available in this demo.')} />
      </View>

      <Modal visible={keypad} transparent animationType="slide" onRequestClose={() => setKeypad(false)}>
        <Pressable style={styles.overlay} onPress={() => setKeypad(false)}>
          <Pressable style={styles.keypadBox} onPress={e => e.stopPropagation()}>
            <Text style={styles.dtmfDisplay}>{dtmf || ' '}</Text>
            <View style={styles.keypadGrid}>
              {KEYPAD.map(k => (
                <Pressable key={k} style={({ pressed }) => [styles.key, pressed && { opacity: 0.6 }]} onPress={() => setDtmf(d => d + k)}>
                  <Text style={styles.keyText}>{k}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable style={styles.keypadClose} onPress={() => setKeypad(false)}>
              <Ionicons name="close" size={24} color={Colors.textPrimary} />
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.xl, paddingHorizontal: Spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', gap: Spacing.xs },
  btn: {
    alignItems: 'center', gap: 6, padding: Spacing.sm,
    width: 68, height: 68, borderRadius: Radius.full,
    backgroundColor: Colors.surfaceElevated, justifyContent: 'center',
  },
  btnLarge: { width: 68, height: 68, backgroundColor: '#E53935' },
  btnActive: { backgroundColor: Colors.primary + '22' },
  btnDanger: { backgroundColor: '#E53935', shadowColor: '#E53935', shadowOpacity: 0.5, shadowRadius: 12, elevation: 8 },
  label: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '500' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  keypadBox: { backgroundColor: Colors.surfaceCard, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: Spacing.xl, paddingBottom: Spacing.xxl },
  dtmfDisplay: { fontSize: FontSize.xxl, fontWeight: '300', color: Colors.textPrimary, textAlign: 'center', letterSpacing: 4, marginBottom: Spacing.lg, minHeight: 40 },
  keypadGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: Spacing.md },
  key: { width: 72, height: 72, borderRadius: Radius.full, backgroundColor: Colors.surfaceElevated, justifyContent: 'center', alignItems: 'center' },
  keyText: { fontSize: FontSize.xl, fontWeight: '500', color: Colors.textPrimary },
  keypadClose: { alignSelf: 'center', marginTop: Spacing.lg, width: 52, height: 52, borderRadius: Radius.full, backgroundColor: Colors.surfaceElevated, justifyContent: 'center', alignItems: 'center' },
});
