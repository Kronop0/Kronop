// Powered by OnSpace.AI
import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Text } from 'react-native';
import { Colors } from '@/constants/theme';

type UploadStatus = 'idle' | 'recording' | 'uploading' | 'error';

interface UploadProgressBarProps {
  progress: number; // 0 to 1
  status: UploadStatus;
  bytesUploaded: number;
  bytesTotal: number;
}

const STATUS_COLOR: Record<UploadStatus, string> = {
  idle: 'transparent',
  recording: '#22C55E',
  uploading: Colors.gold,
  error: Colors.liveRed,
};

function formatBytes(b: number) {
  if (b < 1024) return `${b}B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)}KB`;
  return `${(b / 1048576).toFixed(2)}MB`;
}

export default function UploadProgressBar({ progress, status, bytesUploaded, bytesTotal }: UploadProgressBarProps) {
  const widthAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: Math.min(1, Math.max(0, progress)),
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: status === 'idle' ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [status]);

  const barColor = STATUS_COLOR[status];
  const pct = Math.round(progress * 100);

  return (
    <Animated.View style={[styles.wrapper, { opacity: opacityAnim }]}>
      {status === 'uploading' && bytesTotal > 0 ? (
        <View style={styles.labelRow}>
          <Text style={styles.label}>Uploading chunk</Text>
          <Text style={[styles.label, { color: Colors.gold }]}>
            {formatBytes(bytesUploaded)} / {formatBytes(bytesTotal)} · {pct}%
          </Text>
        </View>
      ) : null}
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            {
              backgroundColor: barColor,
              width: widthAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
            },
          ]}
        />
        {status === 'uploading' ? <View style={[styles.glowDot, { backgroundColor: barColor }]} /> : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 14, paddingBottom: 4 },
  label: { fontSize: 10, color: '#ffffffAA', fontWeight: '600', letterSpacing: 0.3 },
  track: { height: 3, backgroundColor: '#ffffff22', flexDirection: 'row', alignItems: 'center' },
  fill: { height: '100%', borderTopRightRadius: 2, borderBottomRightRadius: 2 },
  glowDot: { width: 6, height: 6, borderRadius: 3, marginLeft: -3, shadowColor: Colors.gold, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 6, elevation: 4 },
});
