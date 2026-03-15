import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BrightnessControl from './BrightnessControl';
import * as Brightness from 'expo-brightness';

const { width, height } = Dimensions.get('window');

interface CameraComponentProps {
  facing: CameraType;
  isLive: boolean;
  isMicOn: boolean;
  onToggleCamera: () => void;
  onToggleMic: () => void;
  onEndStream: () => void;
  children?: React.ReactNode;
}

export default function CameraComponent({ 
  facing, 
  isLive, 
  isMicOn,
  onToggleCamera, 
  onToggleMic,
  onEndStream, 
  children 
}: CameraComponentProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const insets = useSafeAreaInsets();
  const [showBrightness, setShowBrightness] = useState(false);
  const [brightness, setBrightness] = useState(0.7);
  const [originalBrightness, setOriginalBrightness] = useState(0.7);

  useEffect(() => {
    (async () => {
      if (!permission?.granted) {
        await requestPermission();
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      // Request brightness permission and get current brightness
      try {
        const { status } = await Brightness.requestPermissionsAsync();
        if (status === 'granted') {
          const currentBrightness = await Brightness.getBrightnessAsync();
          setBrightness(currentBrightness);
          setOriginalBrightness(currentBrightness); // Store original brightness
        }
      } catch (error) {
        console.log('Brightness permission not available:', error);
      }
    })();

    // Cleanup function to restore original brightness
    return () => {
      (async () => {
        try {
          const currentBrightness = await Brightness.getBrightnessAsync();
          if (currentBrightness > 0) {
            await Brightness.setBrightnessAsync(currentBrightness);
          }
        } catch (error) {
          console.log('Could not restore brightness:', error);
        }
      })();
    };
  }, []);

  const handleBrightnessChange = async (value: number) => {
    setBrightness(value);
    try {
      // Set system brightness
      await Brightness.setBrightnessAsync(value);
    } catch (error) {
      console.log('Could not set device brightness:', error);
    }
  };

  if (!permission?.granted) {
    return (
      <View style={styles.permissionContainer}>
        <MaterialIcons name="videocam-off" size={50} color="#FF4444" />
        <Text style={styles.permissionText}>Camera permission needed</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Allow Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} translucent={true} barStyle="light-content" />
      
      <CameraView 
        ref={null}
        style={[styles.camera, { marginTop: -insets.top - 30 }]}
        facing={facing}
        mode="video"
        autofocus="on"
        active={isLive}
      >
        {/* FLIP camera button - right side */}
        <TouchableOpacity onPress={onToggleCamera} style={styles.flipButton}>
          <MaterialIcons name="flip-camera-android" size={24} color="#FFF" />
        </TouchableOpacity>

        {/* MICROPHONE button - right side, adjusted spacing */}
        <TouchableOpacity onPress={onToggleMic} style={styles.micButton}>
          <MaterialIcons 
            name={isMicOn ? "mic" : "mic-off"} 
            size={20} 
            color={isMicOn ? "#FFF" : "#FF4444"} 
          />
        </TouchableOpacity>

        {/* BRIGHTNESS button - right side, at bottom */}
        <TouchableOpacity onPress={() => setShowBrightness(true)} style={styles.brightnessButton}>
          <MaterialIcons name="brightness-6" size={20} color="#FFF" />
        </TouchableOpacity>

        {/* END button - bilkul upar right me */}
        <TouchableOpacity onPress={onEndStream} style={styles.endButton}>
          <MaterialIcons name="stop" size={16} color="#FFF" />
        </TouchableOpacity>

        {/* Children components (comments, input, etc.) */}
        {children}

      </CameraView>
      
      {/* Brightness Control Overlay */}
      <BrightnessControl
        visible={showBrightness}
        onClose={() => setShowBrightness(false)}
        onBrightnessChange={handleBrightnessChange}
        currentBrightness={brightness}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  camera: {
    flex: 1,
    width: width,
    height: height + 100, // More extra height to push video further up
  },
  // END button - bilkul upar right me
  endButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#ff3c3c',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  // FLIP button - right side, adjusted spacing
  flipButton: {
    position: 'absolute',
    right: 10,
    bottom: 185, // More spacing
    backgroundColor: 'rgba(0,0,0,0.4)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  // MICROPHONE button - right side, adjusted spacing
  micButton: {
    position: 'absolute',
    right: 10,
    bottom: 130, // More spacing
    backgroundColor: 'rgba(0,0,0,0.4)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  // BRIGHTNESS button - right side, at bottom
  brightnessButton: {
    position: 'absolute',
    right: 10,
    bottom: 40, // More spacing
    backgroundColor: 'rgba(0,0,0,0.4)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    color: '#FFF',
    fontSize: 16,
    marginTop: 20,
    marginBottom: 30,
  },
  permissionButton: {
    backgroundColor: '#6A5ACD',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  permissionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
