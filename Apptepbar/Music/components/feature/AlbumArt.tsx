import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  withSpring,
} from 'react-native-reanimated';
import { colors, shadows, borderRadius } from '../../constants/theme';
import { ALBUM_ART_SIZE, ROTATION_DURATION } from '../../constants/config';

interface AlbumArtProps {
  imageUrl: string;
  isPlaying: boolean;
}

export function AlbumArt({ imageUrl, isPlaying }: AlbumArtProps) {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isPlaying) {
      rotation.value = withRepeat(
        withTiming(360, {
          duration: ROTATION_DURATION,
          easing: Easing.linear,
        }),
        -1,
        false
      );
      scale.value = withSpring(1.05);
    } else {
      scale.value = withSpring(1);
    }
  }, [isPlaying]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
  }));

  return (
    <View style={styles.container}>
      {/* Glow effect */}
      <View style={styles.glowOuter} />
      <View style={styles.glowInner} />
      
      {/* Album art */}
      <Animated.View style={[styles.artContainer, animatedStyle]}>
        <View style={styles.vinylRing}>
          <View style={styles.innerRing}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              contentFit="cover"
              transition={200}
            />
            {/* Center dot (vinyl hole) */}
            <View style={styles.centerDot} />
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: ALBUM_ART_SIZE,
    height: ALBUM_ART_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  glowOuter: {
    position: 'absolute',
    width: ALBUM_ART_SIZE + 60,
    height: ALBUM_ART_SIZE + 60,
    borderRadius: (ALBUM_ART_SIZE + 60) / 2,
    backgroundColor: colors.primary,
    opacity: 0.1,
  },
  
  glowInner: {
    position: 'absolute',
    width: ALBUM_ART_SIZE + 30,
    height: ALBUM_ART_SIZE + 30,
    borderRadius: (ALBUM_ART_SIZE + 30) / 2,
    backgroundColor: colors.primary,
    opacity: 0.15,
  },
  
  artContainer: {
    width: ALBUM_ART_SIZE,
    height: ALBUM_ART_SIZE,
    ...shadows.large,
  },
  
  vinylRing: {
    width: '100%',
    height: '100%',
    borderRadius: ALBUM_ART_SIZE / 2,
    backgroundColor: '#1a1a1a',
    padding: 8,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  
  innerRing: {
    width: '100%',
    height: '100%',
    borderRadius: ALBUM_ART_SIZE / 2,
    overflow: 'hidden',
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  
  image: {
    width: '100%',
    height: '100%',
    borderRadius: ALBUM_ART_SIZE / 2,
  },
  
  centerDot: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0a0a0a',
    borderWidth: 2,
    borderColor: colors.primary,
    transform: [{ translateX: -12 }, { translateY: -12 }],
    ...shadows.medium,
  },
});
