import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface StreamInfoProps {
  isLive: boolean;
  duration: string;
  viewerCount: number;
  streamTitle: string;
  username: string;
}

export default function StreamInfo({
  isLive,
  duration,
  viewerCount,
  streamTitle,
  username,
}: StreamInfoProps) {
  return (
    <View style={styles.container}>
      {/* Top Left - Live Indicator and Timer */}
      <View style={styles.topLeft}>
        <View style={styles.liveContainer}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
        <View style={styles.timerContainer}>
          <MaterialIcons name="timer" size={14} color="#FFFFFF" />
          <Text style={styles.timerText}>{duration}</Text>
        </View>
      </View>

      {/* Top Center - Stream Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.streamTitle} numberOfLines={1}>
          {streamTitle}
        </Text>
      </View>

      {/* Top Right - Viewer Count */}
      <View style={styles.viewerContainer}>
        <MaterialIcons name="visibility" size={16} color="#FFFFFF" />
        <Text style={styles.viewerText}>{viewerCount}</Text>
      </View>

      {/* Bottom Info - Username and Category */}
      <View style={styles.bottomInfo}>
        <MaterialIcons name="person" size={16} color="#FFFFFF" />
        <Text style={styles.username}>{username}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 50,
    paddingHorizontal: 15,
    zIndex: 10,
  },
  topLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF0000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginRight: 4,
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timerText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginLeft: 4,
  },
  titleContainer: {
    position: 'absolute',
    top: 50,
    left: width / 2 - 100,
    width: 200,
    alignItems: 'center',
  },
  streamTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 15,
  },
  viewerContainer: {
    position: 'absolute',
    top: 50,
    right: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  viewerText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginLeft: 4,
  },
  bottomInfo: {
    position: 'absolute',
    bottom: -30,
    left: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  username: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
});