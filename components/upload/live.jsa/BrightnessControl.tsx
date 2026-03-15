import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  StatusBar,
  PanResponder,
  GestureResponderEvent,
  PanResponderInstance,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface BrightnessControlProps {
  visible: boolean;
  onClose: () => void;
  onBrightnessChange: (value: number) => void;
  currentBrightness: number;
}

export default function BrightnessControl({ 
  visible, 
  onClose, 
  onBrightnessChange, 
  currentBrightness 
}: BrightnessControlProps) {
  const [brightness, setBrightness] = useState(currentBrightness);
  const [showTouchArea, setShowTouchArea] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const touchAreaAnim = useRef(new Animated.Value(0)).current;
  const sliderHeight = 200;
  const brightnessTimeoutRef = useRef<any>(null);
  const autoHideTimeoutRef = useRef<any>(null);

  useEffect(() => {
    if (visible) {
      setShowTouchArea(true);
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      // Auto-hide after 5 seconds
      autoHideTimeoutRef.current = setTimeout(() => {
        onClose();
      }, 5000);
    } else {
      setShowTouchArea(false);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
      Animated.timing(touchAreaAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (brightnessTimeoutRef.current) {
        clearTimeout(brightnessTimeoutRef.current);
      }
      if (autoHideTimeoutRef.current) {
        clearTimeout(autoHideTimeoutRef.current);
      }
    };
  }, []);

  const handleBrightnessChange = (value: number) => {
    const clampedValue = Math.max(0, Math.min(1, value));
    setBrightness(clampedValue);
    
    // Clear existing timeout
    if (brightnessTimeoutRef.current) {
      clearTimeout(brightnessTimeoutRef.current);
    }
    
    // Debounce the brightness change to reduce frequency
    brightnessTimeoutRef.current = setTimeout(() => {
      onBrightnessChange(clampedValue);
    }, 16); // ~60fps update rate
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt: GestureResponderEvent) => {
        const { locationY } = evt.nativeEvent;
        const newValue = Math.max(0, Math.min(1, locationY / sliderHeight));
        handleBrightnessChange(newValue);
      },
      onPanResponderMove: (evt: GestureResponderEvent) => {
        const { locationY } = evt.nativeEvent;
        // Direct follow finger - no negative calculation
        const newValue = Math.max(0, Math.min(1, locationY / sliderHeight));
        handleBrightnessChange(newValue);
      },
      onPanResponderTerminationRequest: () => true, // Allow other gestures
      onPanResponderRelease: () => {
        // Optional: Add haptic feedback here
      },
      onPanResponderTerminate: () => {
        // Handle gesture termination
      },
    })
  ).current;

  if (!visible) return null;

  return (
    <View style={styles.inlineControl}>
      <View style={styles.sliderContainer}>
        <View
          style={styles.sliderTrack}
          {...panResponder.panHandlers}
        >
          <View 
            style={[
              styles.sliderFill, 
              { height: `${brightness * 100}%` }
            ]} 
          />
          
          <View 
            style={[
              styles.sliderThumb,
              { bottom: `${brightness * 100}%` }
            ]}
          >
            <View style={styles.thumbInner} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inlineControl: {
    position: 'absolute',
    right: 70, // Close to brightness button
    bottom: 50, // Same level as buttons
    zIndex: 100000000001,
  },
  sliderContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  sliderTrack: {
    width: 15, // Much thicker line like mobile
    height: 120, // Mobile-like height
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: '#ffffff', // Pure white
  },
  sliderFill: {
    width: 15,
    backgroundColor: '#ffffff', // Bright color when active
    borderRadius: 7,
    position: 'absolute',
    bottom: 0,
  },
  sliderThumb: {
    position: 'absolute',
    width: 25, // Much larger thumb
    height: 25,
    borderRadius: 12,
    backgroundColor: '#ffffff', // Pure white
    borderWidth: 3,
    borderColor: '#ff5900',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateX: 0 }], // Centered on line
  },
  thumbInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ff5900',
  },
});
