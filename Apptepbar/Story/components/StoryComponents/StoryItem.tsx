// Simple Story Component
import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../../../constants/theme';
import AppColors from '../../../../appColor/AppColors';

// Simple Story interface
interface Story {
  id: string;
  imageUrl: string;
  fallbackUrl?: string; // Add fallback URL
  userAvatar: string;
  userName: string;
  duration?: number;
  timestamp?: Date;
  story_type?: 'image' | 'video';
}

interface StoryItemProps {
  story: Story;
  isAddStory?: boolean;
  onPress?: () => void;
  allStories?: Story[];
}

const { width, height } = Dimensions.get('window');

// Simple StoryItem Component
export function StoryItem({ 
  story, 
  isAddStory = false, 
  onPress,
  allStories = [] 
}: StoryItemProps) {
  const navigation = useNavigation();

  const [imageError, setImageError] = React.useState(false);
  const [avatarError, setAvatarError] = React.useState(false);

  const handlePress = () => {
    if (isAddStory && onPress) {
      onPress();
    } else {
      // Find current story index in allStories
      const storyIndex = allStories.findIndex(s => s.id === story.id);
      
      if (navigation && navigation.navigate) {
        (navigation.navigate as any)('StoryView', { 
          story, 
          stories: allStories,
          startIndex: storyIndex
        });
      }
    }
  };

  const getImageSource = () => {
    if (imageError && story.fallbackUrl) {
      return { uri: story.fallbackUrl };
    }
    // Return null if no image URL available
    if (!story.imageUrl) {
      return null;
    }
    return { uri: story.imageUrl };
  };

  const getAvatarSource = () => {
    if (avatarError && story.fallbackUrl) {
      return { uri: story.fallbackUrl };
    }
    // Return null if no avatar URL available
    if (!story.userAvatar) {
      return null;
    }
    return { uri: story.userAvatar };
  };

  if (isAddStory) {
    return (
      <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.7}>
        <View style={styles.addStoryContainer}>
          {getAvatarSource() ? (
            <Image 
              source={getAvatarSource()} 
              style={styles.image} 
              contentFit="cover"
              onError={() => setAvatarError(true)}
            />
          ) : (
            <View style={[styles.image, styles.placeholderAvatar]}>
              <MaterialIcons name="person" size={32} color={AppColors.textMuted} />
            </View>
          )}
          <View style={styles.addIcon}>
            <MaterialIcons name="add" size={20} color={theme.colors.text.primary} />
          </View>
        </View>
        <Text style={styles.name} numberOfLines={1}>Create</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.7}>
      <View style={styles.imageContainer}>
        {getImageSource() ? (
          <Image 
            source={getImageSource()} 
            style={styles.image} 
            contentFit="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={[styles.image, styles.placeholderImage]}>
            <MaterialIcons name="image" size={32} color={AppColors.textMuted} />
          </View>
        )}
        <View style={styles.avatarContainer}>
          {getAvatarSource() ? (
            <Image 
              source={getAvatarSource()} 
              style={styles.avatar} 
              contentFit="cover"
              onError={() => setAvatarError(true)}
            />
          ) : (
            <View style={[styles.avatar, styles.placeholderAvatar]}>
              <MaterialIcons name="person" size={12} color={AppColors.textMuted} />
            </View>
          )}
        </View>
      </View>
      <Text style={styles.name} numberOfLines={1}>{story.userName}</Text>
    </TouchableOpacity>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    width: 80,
    marginRight: theme.spacing.sm,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.full,
    borderWidth: 3,
    borderColor: theme.colors.primary.main,
    padding: 2,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.secondary,
  },
  avatarContainer: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    borderWidth: 2,
    borderColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.full,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: theme.borderRadius.full,
  },
  addStoryContainer: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.full,
    position: 'relative',
  },
  addIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.background.primary,
  },
  name: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.xs,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
  placeholderImage: {
    backgroundColor: theme.colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderAvatar: {
    backgroundColor: theme.colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
