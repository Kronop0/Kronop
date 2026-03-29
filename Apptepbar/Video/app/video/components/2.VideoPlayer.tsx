import { View, StyleSheet, Pressable, Image } from 'react-native';
import { VideoView } from 'expo-video';
import { VideoStatsOverlay } from '@/Apptepbar/Video/components/ui/VideoStatsOverlay';
import { colors, spacing } from '@/Apptepbar/Video/ThemeConstants';

interface VideoPlayerProps {
  player: any;
  duration: string;
  views: number;
  showStatsOverlay: boolean;
  onVideoPress: () => void;
  thumbnail?: string;
  isPlaying?: boolean;
}

export function VideoPlayer({ 
  player, 
  duration, 
  views, 
  showStatsOverlay, 
  onVideoPress, 
  thumbnail,
  isPlaying = false 
}: VideoPlayerProps) {
  return (
    <Pressable style={styles.playerContainer} onPress={onVideoPress}>
      <VideoStatsOverlay 
        duration={duration}
        views={views}
        visible={showStatsOverlay}
      />
      
      {/* Show thumbnail when video is not playing */}
      {!isPlaying && thumbnail && (
        <Image 
          source={{ uri: thumbnail }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
      )}
      
      {/* Show video only when playing */}
      {isPlaying && (
        <VideoView 
          style={styles.video}
          player={player}
          fullscreenOptions={{ enable: false }}
          allowsPictureInPicture={false}
          nativeControls={false}
        />
      )}
      
      {/* Play button overlay when not playing */}
      {!isPlaying && (
        <View style={styles.playButtonOverlay}>
          <View style={styles.playButton}>
            <View style={styles.playIcon} />
          </View>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  playerContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  playButtonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    width: 0,
    height: 0,
    borderLeftWidth: 20,
    borderLeftColor: '#fff',
    borderTopWidth: 12,
    borderTopColor: 'transparent',
    borderBottomWidth: 12,
    borderBottomColor: 'transparent',
    marginLeft: 4,
  },
});
