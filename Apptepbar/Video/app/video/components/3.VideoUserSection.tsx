import { View, StyleSheet, Pressable, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { colors, spacing, typography } from '@/Apptepbar/Video/ThemeConstants';

interface UserInfo {
  name: string;
  avatar: string;
  isSupported: boolean;
  supporters: number;
}

interface VideoUserSectionProps {
  user: UserInfo;
  isSupported: boolean;
  supporters: number;
  onToggleSupport: () => void;
  onFullscreen: () => void;
  onQualitySelector: () => void;
  onStatsOverlay: () => void;
  showStatsOverlay: boolean;
}

export function VideoUserSection({ 
  user, 
  isSupported, 
  supporters, 
  onToggleSupport, 
  onFullscreen, 
  onQualitySelector, 
  onStatsOverlay,
  showStatsOverlay 
}: VideoUserSectionProps) {
  return (
    <View style={styles.userSection}>
      <View style={styles.userHeaderRow}>
        <View style={styles.ownerInfoCompact}>
          <Image 
            source={{ uri: user.avatar }}
            style={styles.avatarSmall}
            contentFit="cover"
          />
          <View style={styles.ownerTextCompact}>
            <Text style={styles.userNameCompact}>{user.name}</Text>
            <Text style={styles.supportersTextCompact}>{formatNumber(supporters)} supporters</Text>
          </View>
        </View>
        
        <View style={styles.headerIcons}>
          <Pressable 
            style={styles.iconButton}
            onPress={onFullscreen}
          >
            <MaterialIcons name="fullscreen" size={24} color={colors.text} />
          </Pressable>
          
          <Pressable 
            style={styles.iconButton}
            onPress={onQualitySelector}
          >
            <MaterialIcons name="hd" size={24} color={colors.text} />
          </Pressable>
          
          <Pressable 
            style={styles.iconButton}
            onPress={onStatsOverlay}
          >
            <MaterialIcons name="info-outline" size={24} color={colors.text} />
          </Pressable>
        </View>
      </View>
      
      <View style={styles.actionButtonsContainer}>
        <Pressable 
          style={[styles.largeButton, styles.supportLargeButton, isSupported && styles.supportedLargeButton]}
          onPress={onToggleSupport}
        >
          <MaterialIcons 
            name={isSupported ? 'check' : 'favorite'} 
            size={20} 
            color={isSupported ? colors.textMuted : colors.text} 
          />
          <Text style={[styles.largeButtonText, isSupported && styles.supportedLargeButtonText]}>
            {isSupported ? 'Supported' : 'Support'}
          </Text>
        </Pressable>
        
        <Pressable style={[styles.largeButton, styles.channelButton]}>
          <MaterialIcons name="play-circle-outline" size={20} color={colors.text} />
          <Text style={styles.largeButtonText}>Check Channel</Text>
        </Pressable>
      </View>
    </View>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

const styles = StyleSheet.create({
  userSection: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceLight,
  },
  userHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  ownerInfoCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginLeft: spacing.sm,
  },
  iconButton: {
    padding: spacing.xs,
  },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceLight,
  },
  ownerTextCompact: {
    marginLeft: spacing.sm,
  },
  userNameCompact: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '600',
  },
  supportersTextCompact: {
    fontSize: 11,
    color: colors.textMuted,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  largeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: spacing.sm,
  },
  supportLargeButton: {
    backgroundColor: colors.primary,
  },
  supportedLargeButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceLight,
  },
  channelButton: {
    backgroundColor: colors.surfaceLight,
  },
  largeButtonText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '600',
  },
  supportedLargeButtonText: {
    color: colors.textMuted,
  },
});
