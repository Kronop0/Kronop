import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography } from '../../constants/theme';
import { ReportModal } from './ReportModal';
import { useAlert } from '../../template';

const PURPLE = '#8B00FF';

interface VideoActionsProps {
  isLiked: boolean;
  isSaved: boolean;
  likes: number;
  comments: number;
  onLike: () => void;
  onSave: () => void;
  formatNumber: (n: number) => string;
  videoTitle?: string;
}

export function VideoActions({ isLiked, isSaved, likes, comments, onLike, onSave, formatNumber, videoTitle }: VideoActionsProps) {
  const { showAlert } = useAlert();
  const [showReport, setShowReport] = useState(false);

  const handleShare = async () => {
    try {
      await Share.share({ message: videoTitle ? `Watch "${videoTitle}" on GreaterFloor!` : 'Check out this video on GreaterFloor!' });
    } catch {
      showAlert('Share', 'Could not open share dialog.');
    }
  };

  const handleReportSubmit = (reason: string, detail: string) => {
    // Report submitted - modal handles its own success state
  };

  return (
    <>
      <ReportModal
        visible={showReport}
        onClose={() => setShowReport(false)}
        onSubmit={handleReportSubmit}
      />
      <View style={styles.row}>
        <TouchableOpacity style={styles.btn} onPress={onLike} activeOpacity={0.7}>
          <Ionicons name={isLiked ? 'star' : 'star-outline'} size={26} color={isLiked ? PURPLE : '#888888'} />
          <Text style={styles.label}>{formatNumber(likes)}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} activeOpacity={0.7}>
          <Ionicons name="chatbubble-outline" size={26} color="#888888" />
          <Text style={styles.label}>{formatNumber(comments)}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={handleShare} activeOpacity={0.7}>
          <Ionicons name="share-social-outline" size={26} color="#888888" />
          <Text style={styles.label}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={onSave} activeOpacity={0.7}>
          <Ionicons name={isSaved ? 'bookmark' : 'bookmark-outline'} size={26} color={isSaved ? PURPLE : '#888888'} />
          <Text style={styles.label}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={() => setShowReport(true)} activeOpacity={0.7}>
          <Ionicons name="flag-outline" size={26} color="#888888" />
          <Text style={styles.label}>Report</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: spacing.md, paddingHorizontal: spacing.sm, borderBottomWidth: 1, borderColor: '#1A1A1A', backgroundColor: '#000000' },
  btn: { alignItems: 'center', gap: 4 },
  label: { fontSize: 10, fontWeight: '600', color: '#888888' },
});
