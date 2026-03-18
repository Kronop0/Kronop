import React, { useState } from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { theme } from '../../../constants/theme';
import StoryViewCounter from './StoryViewCounter';

interface OwnerStoryBoxProps {
  onPress: () => void;
  onProfilePress: () => void;
  ownerId?: string;
  storyId?: string;
}

const STORY_BOX_WIDTH = 78;
const STORY_BOX_HEIGHT = 110;

export function OwnerStoryBox({ 
  onPress, 
  onProfilePress, 
  ownerId = 'owner123',
  storyId = 'owner-story'
}: OwnerStoryBoxProps) {
  const [viewCounterVisible, setViewCounterVisible] = useState(false);
  
  const handleStoryPress = () => {
    console.log('[KRONOP-DEBUG] 👑 Owner story box pressed');
    onPress();
  };

  const handleProfilePress = () => {
    console.log('[KRONOP-DEBUG] 👤 Owner profile pressed');
    onProfilePress();
  };

  return (
    <TouchableOpacity
      style={styles.ownerStoryBox}
      onPress={handleStoryPress}
      activeOpacity={0.8}
    >
      <View style={styles.ownerBoxContent}>
        {/* Story Thumbnail Image */}
        <Image
          source={{ uri: 'https://picsum.photos/78/110?random=owner' }}
          style={styles.ownerStoryImage}
          contentFit="cover"
          onLoad={() => console.log('[KRONOP-DEBUG] 🖼️ Owner story image loaded successfully')}
          onError={(error) => {
            console.log('[KRONOP-DEBUG] ❌ Owner story image failed to load:', error);
          }}
        />
        
        {/* User Avatar Overlay - Top Left (Profile pe click) */}
        <TouchableOpacity 
          style={styles.ownerAvatarContainer}
          onPress={handleProfilePress}
          activeOpacity={0.7}
        >
          <Image
            source={{ uri: 'https://picsum.photos/60/60?random=owner' }}
            style={styles.ownerAvatar}
            contentFit="cover"
          />
        </TouchableOpacity>
        
        {/* View Counter Arrow - Bottom Right */}
        <TouchableOpacity 
          style={styles.viewCounterButton}
          onPress={() => setViewCounterVisible(true)}
          activeOpacity={0.7}
        >
          <MaterialIcons 
            name="arrow-upward" 
            size={20} 
            color="#FFFFFF" 
          />
        </TouchableOpacity>
      </View>
      
      {/* Story View Counter Modal */}
      <StoryViewCounter
        visible={viewCounterVisible}
        onClose={() => setViewCounterVisible(false)}
        storyId={storyId}
        storyOwnerId={ownerId}
        currentUserId={ownerId}
        isStoryOwner={true}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  ownerStoryBox: {
    width: STORY_BOX_WIDTH,
    height: STORY_BOX_HEIGHT,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1A1A1A',
    borderWidth: 2,
    borderColor: '#8B00FF',
    position: 'relative',
    padding: 1,
  },
  ownerBoxContent: {
    flex: 1,
    position: 'relative',
  },
  ownerStoryImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  ownerAvatarContainer: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#000',
    borderWidth: 2,
    borderColor: '#8B00FF',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ownerAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  viewCounterButton: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
});

export default OwnerStoryBox;
