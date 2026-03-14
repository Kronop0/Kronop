import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface CommentOverlayProps {
  username: string;
  comment: string;
  isVip?: boolean;
  isMod?: boolean;
}

export default function CommentOverlay({ 
  username, 
  comment, 
  isVip, 
  isMod 
}: CommentOverlayProps) {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade out animation
    Animated.sequence([
      Animated.delay(7000),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -20,
          duration: 3000,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const getUsernameColor = () => {
    if (isVip) return '#FFD700';
    if (isMod) return '#00FF00';
    return '#6A5ACD';
  };

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
        }
      ]}
    >
      <View style={styles.messageContainer}>
        {isVip && (
          <MaterialIcons name="star" size={14} color="#FFD700" />
        )}
        {isMod && !isVip && (
          <MaterialIcons name="security" size={14} color="#00FF00" />
        )}
        <Text style={[styles.username, { color: getUsernameColor() }]}>
          {username}
        </Text>
        <Text style={styles.comment}>{comment}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    maxWidth: width * 0.7,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  username: {
    fontWeight: 'bold',
    marginLeft: 4,
    marginRight: 6,
    fontSize: 13,
  },
  comment: {
    color: '#FFFFFF',
    fontSize: 13,
    flexShrink: 1,
  },
});