import React, { useState } from 'react';
import {
  Modal, View, Text, StyleSheet, TouchableOpacity,
  ScrollView, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography, borderRadius } from '../../constants/theme';

const PURPLE = '#8B00FF';

const REPORT_REASONS = [
  { id: '1', icon: 'alert-circle-outline', label: 'Spam or misleading' },
  { id: '2', icon: 'eye-off-outline', label: 'Sexual or adult content' },
  { id: '3', icon: 'warning-outline', label: 'Violence or dangerous acts' },
  { id: '4', icon: 'hand-left-outline', label: 'Harassment or bullying' },
  { id: '5', icon: 'ban-outline', label: 'Hate speech or discrimination' },
  { id: '6', icon: 'copy-outline', label: 'Copyright violation' },
  { id: '7', icon: 'information-circle-outline', label: 'Misinformation or fake news' },
  { id: '8', icon: 'flag-outline', label: 'Other reason' },
];

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: string, detail: string) => void;
}

export function ReportModal({ visible, onClose, onSubmit }: ReportModalProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!selected) return;
    const reason = REPORT_REASONS.find(r => r.id === selected)?.label || '';
    onSubmit(reason, detail);
    setSubmitted(true);
  };

  const handleClose = () => {
    setSelected(null);
    setDetail('');
    setSubmitted(false);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.headerRow}>
            <Text style={styles.title}>{submitted ? 'Report Submitted' : 'Report Video'}</Text>
            <TouchableOpacity onPress={handleClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={22} color="#888888" />
            </TouchableOpacity>
          </View>

          {submitted ? (
            <View style={styles.successView}>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark-circle" size={64} color={PURPLE} />
              </View>
              <Text style={styles.successTitle}>Thank you for your report</Text>
              <Text style={styles.successSub}>We will review this content and take appropriate action within 24-48 hours.</Text>
              <TouchableOpacity style={styles.doneBtn} onPress={handleClose}>
                <Text style={styles.doneBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={styles.subtitle}>Select a reason for reporting this video</Text>
              <View style={styles.reasons}>
                {REPORT_REASONS.map((r) => (
                  <TouchableOpacity
                    key={r.id}
                    style={[styles.reasonRow, selected === r.id && styles.reasonSelected]}
                    onPress={() => setSelected(r.id)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.reasonIcon, selected === r.id && styles.reasonIconSelected]}>
                      <Ionicons name={r.icon as any} size={18} color={selected === r.id ? '#FFFFFF' : '#888888'} />
                    </View>
                    <Text style={[styles.reasonText, selected === r.id && styles.reasonTextSelected]}>{r.label}</Text>
                    {selected === r.id && <Ionicons name="checkmark-circle" size={18} color={PURPLE} />}
                  </TouchableOpacity>
                ))}
              </View>
              {selected && (
                <View style={styles.detailWrap}>
                  <Text style={styles.detailLabel}>Additional details (optional)</Text>
                  <TextInput
                    style={styles.detailInput}
                    placeholder="Describe the issue in more detail..."
                    placeholderTextColor="#555555"
                    value={detail}
                    onChangeText={setDetail}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>
              )}
              <TouchableOpacity
                style={[styles.submitBtn, !selected && styles.submitDisabled]}
                onPress={handleSubmit}
                disabled={!selected}
              >
                <Ionicons name="flag" size={16} color="#FFFFFF" />
                <Text style={styles.submitText}>Submit Report</Text>
              </TouchableOpacity>
              <View style={{ height: spacing.xl }} />
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' },
  sheet: { backgroundColor: '#111111', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '85%', paddingHorizontal: spacing.md, paddingBottom: spacing.md },
  handle: { width: 40, height: 4, backgroundColor: '#333333', borderRadius: 2, alignSelf: 'center', marginTop: 10, marginBottom: spacing.sm },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: '#1A1A1A', marginBottom: spacing.sm },
  title: { fontSize: typography.h4, fontWeight: '700', color: '#FFFFFF' },
  subtitle: { fontSize: typography.small, color: '#888888', marginBottom: spacing.md },
  reasons: { gap: 8 },
  reasonRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, borderRadius: borderRadius.md, backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#2A2A2A' },
  reasonSelected: { borderColor: PURPLE, backgroundColor: 'rgba(139,0,255,0.1)' },
  reasonIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#2A2A2A', alignItems: 'center', justifyContent: 'center' },
  reasonIconSelected: { backgroundColor: PURPLE },
  reasonText: { flex: 1, fontSize: typography.small, color: '#CCCCCC', fontWeight: '500' },
  reasonTextSelected: { color: '#FFFFFF', fontWeight: '600' },
  detailWrap: { marginTop: spacing.md },
  detailLabel: { fontSize: typography.small, color: '#888888', marginBottom: 6 },
  detailInput: { backgroundColor: '#1A1A1A', borderRadius: borderRadius.md, borderWidth: 1, borderColor: '#2A2A2A', color: '#FFFFFF', fontSize: typography.small, padding: spacing.sm, minHeight: 80 },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#CC0000', borderRadius: borderRadius.lg, paddingVertical: 14, marginTop: spacing.md },
  submitDisabled: { opacity: 0.4 },
  submitText: { color: '#FFFFFF', fontSize: typography.body, fontWeight: '700' },
  successView: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.md },
  successIcon: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(139,0,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  successTitle: { fontSize: typography.h4, fontWeight: '700', color: '#FFFFFF', textAlign: 'center' },
  successSub: { fontSize: typography.small, color: '#888888', textAlign: 'center', lineHeight: 20, paddingHorizontal: spacing.md },
  doneBtn: { backgroundColor: PURPLE, borderRadius: borderRadius.lg, paddingHorizontal: spacing.xxl, paddingVertical: 12, marginTop: spacing.sm },
  doneBtnText: { color: '#FFFFFF', fontSize: typography.body, fontWeight: '700' },
});
