import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface UserAccountProps {
  viewerCount: number;
  liveDuration: number;
}

export default function UserAccount({ viewerCount, liveDuration }: UserAccountProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViewerCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <View style={styles.container}>
      {/* LIVE indicator with viewer count and duration */}
      <View style={styles.liveContainer}>
        <View style={styles.liveDot} />
        <Text style={styles.liveText}>LIVE {formatTime(liveDuration)}</Text>
        <View style={styles.viewerContainer}>
          <MaterialIcons name="visibility" size={12} color="#FFF" />
          <Text style={styles.viewerText}>{formatViewerCount(viewerCount)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 10,
  },
  liveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF0000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFF',
    marginRight: 4,
  },
  liveText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
    marginRight: 8,
  },
  viewerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  viewerText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 2,
  },
});
