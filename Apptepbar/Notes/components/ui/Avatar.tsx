// Powered by OnSpace.AI
// Reusable avatar component

import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Colors, Radius } from '@/constants/theme';

interface AvatarProps {
  uri: string;
  size?: number;
  borderColor?: string;
  showBorder?: boolean;
}

export const Avatar = memo(function Avatar({
  uri,
  size = 48,
  borderColor = Colors.primary,
  showBorder = false,
}: AvatarProps) {
  return (
    <View
      style={[
        styles.wrapper,
        {
          width: size + (showBorder ? 4 : 0),
          height: size + (showBorder ? 4 : 0),
          borderRadius: (size + 4) / 2,
          borderColor: showBorder ? borderColor : 'transparent',
          borderWidth: showBorder ? 2 : 0,
        },
      ]}
    >
      <Image
        source={{ uri }}
        style={[
          styles.image,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
        contentFit="cover"
        transition={200}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.border,
  },
  image: {
    backgroundColor: Colors.surfaceElevated,
  },
});
