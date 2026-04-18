import React, { useState } from 'react';
import {
  Modal, View, Text, StyleSheet,
  TouchableOpacity, Dimensions, StatusBar,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

interface FullscreenVideoProps {
  visible: boolean;
  onClose: () => void;
  thumbnailUrl?: string;
  title: string;
  duration: string;
}

export function FullscreenVideo({ visible, onClose, thumbnailUrl, title, duration }: FullscreenVideoProps) {
  const { width: W, height: H } = Dimensions.get('window');
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress] = useState(0);

  // Landscape inside portrait modal:
  // The inner box is H wide × W tall, then rotated 90deg.
  // After rotation it visually occupies W wide × H tall = full screen.
  const boxW = H;
  const boxH = W;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      transparent
      onRequestClose={onClose}
    >
      <StatusBar hidden />
      <View style={[styles.backdrop, { width: W, height: H }]}>
        {/* rotated landscape box */}
        <View
          style={{
            width: boxW,
            height: boxH,
            transform: [{ rotate: '90deg' }],
            overflow: 'hidden',
            backgroundColor: '#000000',
          }}
        >
          {/* Thumbnail */}
          {thumbnailUrl ? (
            <Image
              source={{ uri: thumbnailUrl }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.placeholder]}>
              <Ionicons name="videocam" size={80} color="#333" />
            </View>
          )}

          {/* Dim overlay */}
          <View style={styles.dimOverlay} />

          {/* Top bar */}
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="chevron-down" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.titleText} numberOfLines={1}>{title}</Text>
            <View style={styles.spacer} />
          </View>

          {/* Center play/pause */}
          <View style={styles.centerControls}>
            <TouchableOpacity onPress={() => setIsPlaying(p => !p)} style={styles.playBtn}>
              <Ionicons
                name={isPlaying ? 'pause-circle' : 'play-circle'}
                size={70}
                color="rgba(255,255,255,0.95)"
              />
            </TouchableOpacity>
          </View>

          {/* Bottom bar */}
          <View style={styles.bottomBar}>
            <View style={styles.timeRow}>
              <Text style={styles.timeText}>0:00 / {duration}</Text>
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="contract-outline" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.progressBg}>
              <View style={[styles.progressFg, { width: `${progress}%` }]} />
              <View style={styles.progressDot} />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111111',
  },
  dimOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    gap: 10,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  closeBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spacer: { width: 36 },
  titleText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  centerControls: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  playBtn: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 40,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: 8,
    gap: 8,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeText: { color: '#CCCCCC', fontSize: 12 },
  progressBg: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 2,
    position: 'relative',
  },
  progressFg: {
    height: '100%',
    backgroundColor: '#8B00FF',
    borderRadius: 2,
  },
  progressDot: {
    position: 'absolute',
    left: 0,
    top: -3,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#8B00FF',
  },
});
